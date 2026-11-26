import { Amplify } from 'aws-amplify';
import {
  confirmResetPassword, confirmSignIn, confirmUserAttribute, fetchMFAPreference,
  fetchUserAttributes, resetPassword, sendUserAttributeVerificationCode, setUpTOTP,
  signIn, signOut, updateMFAPreference, updateUserAttribute, verifyTOTPSetup,
  type SignInOutput,
} from 'aws-amplify/auth';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { sharedInMemoryStorage } from 'aws-amplify/utils';
import { toDataURL } from 'qrcode';

type View = 'sign-in' | 'new-password' | 'sign-in-code' | 'email' | 'email-code'
  | 'security' | 'totp' | 'complete' | 'reset' | 'reset-code';

const errors: Record<string, string> = {
  CodeMismatchException: 'That code was not accepted. Check it and try again.',
  ExpiredCodeException: 'That code expired. Request a new code or start again.',
  InvalidPasswordException: 'Choose a password that meets the stated requirements.',
  LimitExceededException: 'Too many attempts. Wait before trying again.',
  TooManyRequestsException: 'Too many attempts. Wait before trying again.',
  NotAuthorizedException: 'The sign-in was not accepted. Check your details or reset your password.',
  PasswordResetRequiredException: 'This account needs a new password. Use Reset password.',
  UserNotFoundException: 'The sign-in was not accepted. Check your details or reset your password.',
};

export function startAccountPage(root: HTMLElement) {
  const { pool, client } = root.dataset;
  if (!pool || !client) return;
  Amplify.configure({ Auth: { Cognito: { userPoolId: pool, userPoolClientId: client } } });
  cognitoUserPoolsTokenProvider.setKeyValueStorage(sharedInMemoryStorage);

  const views = [...root.querySelectorAll<HTMLElement>('[data-view]')];
  const message = root.querySelector<HTMLElement>('[data-message]')!;
  const startOver = root.querySelector<HTMLButtonElement>('[data-action="start-over"]')!;
  const qr = root.querySelector<HTMLImageElement>('[data-totp-qr]')!;
  const key = root.querySelector<HTMLElement>('[data-totp-key]')!;
  const input = (form: HTMLFormElement, name: string) => form.elements.namedItem(name) as HTMLInputElement;
  let view: View = 'sign-in';
  let busy = false;
  let username = '';
  let resetUser = '';
  let email = '';
  let totpVerified = false;
  let totpDuringSignIn = false;

  function status(text: string) {
    message.textContent = text;
    message.hidden = !text;
  }

  function show(next: View, focus = true) {
    view = next;
    for (const panel of views) panel.hidden = panel.dataset.view !== next;
    startOver.hidden = next === 'sign-in';
    status('');
    if (focus) root.querySelector<HTMLElement>(`[data-view="${next}"] h2`)?.focus();
  }

  function clearSetupKey() {
    qr.removeAttribute('src');
    key.textContent = '';
    totpVerified = false;
    totpDuringSignIn = false;
  }

  async function finish() {
    clearSetupKey();
    await signOut();
    show('complete');
  }

  async function chooseAuthenticator() {
    const preference = await fetchMFAPreference();
    if (preference.enabled?.includes('TOTP')) await finish();
    else show('security');
  }

  async function afterSignIn() {
    const attributes = await fetchUserAttributes();
    if (attributes.email_verified === 'true') {
      await chooseAuthenticator();
      return;
    }
    email = attributes.email ?? '';
    const form = root.querySelector<HTMLFormElement>('[data-step="email"]')!;
    input(form, 'email').value = email;
    show('email');
  }

  async function showTotp(details: Awaited<ReturnType<typeof setUpTOTP>>, duringSignIn = false) {
    clearSetupKey();
    // Render the secret locally. The QR image never leaves this page.
    qr.src = await toDataURL(details.getSetupUri('Theia Online', username).toString(), { width: 180 });
    key.textContent = details.sharedSecret;
    totpDuringSignIn = duringSignIn;
    show('totp');
  }

  async function continueSignIn(result: SignInOutput) {
    const step = result.nextStep;
    switch (step.signInStep) {
      case 'DONE': await afterSignIn(); break;
      case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED': show('new-password'); break;
      case 'CONFIRM_SIGN_IN_WITH_TOTP_CODE': show('sign-in-code'); break;
      case 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP': await showTotp(step.totpSetupDetails, true); break;
      case 'RESET_PASSWORD': show('reset'); break;
      default: status('This sign-in needs help from the playtest administrator.');
    }
  }

  async function sendReset() {
    const result = await resetPassword({ username: resetUser });
    if (result.nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
      show('reset-code');
      status('If the account has a verified recovery email, a reset code will arrive there.');
    } else {
      show('sign-in');
    }
  }

  const submissions: Record<string, (form: HTMLFormElement) => Promise<void>> = {
    'sign-in': async (form) => {
      username = input(form, 'username').value.trim();
      const secret = input(form, 'password');
      const password = secret.value;
      secret.value = '';
      await continueSignIn(await signIn({ username, password, options: { authFlowType: 'USER_SRP_AUTH' } }));
    },
    'new-password': async (form) => {
      const secret = input(form, 'password');
      const password = secret.value;
      secret.value = '';
      await continueSignIn(await confirmSignIn({ challengeResponse: password }));
    },
    'sign-in-code': async (form) => {
      const code = input(form, 'code').value;
      form.reset();
      await continueSignIn(await confirmSignIn({ challengeResponse: code }));
    },
    email: async (form) => {
      const address = input(form, 'email').value.trim();
      if (address === email) {
        await sendUserAttributeVerificationCode({ userAttributeKey: 'email' });
      } else {
        const updated = await updateUserAttribute({ userAttribute: { attributeKey: 'email', value: address } });
        email = address;
        if (updated.nextStep.updateAttributeStep === 'DONE') {
          const attributes = await fetchUserAttributes();
          if (attributes.email_verified === 'true') {
            await chooseAuthenticator();
            return;
          }
          await sendUserAttributeVerificationCode({ userAttributeKey: 'email' });
        }
      }
      show('email-code');
    },
    'email-code': async (form) => {
      const confirmationCode = input(form, 'code').value;
      form.reset();
      await confirmUserAttribute({ userAttributeKey: 'email', confirmationCode });
      await chooseAuthenticator();
    },
    totp: async (form) => {
      const code = input(form, 'code').value;
      form.reset();
      if (totpDuringSignIn) {
        const result = await confirmSignIn({ challengeResponse: code });
        clearSetupKey();
        await continueSignIn(result);
        return;
      }
      if (!totpVerified) {
        await verifyTOTPSetup({ code });
        totpVerified = true;
      }
      await updateMFAPreference({ totp: 'PREFERRED' });
      await finish();
    },
    reset: async (form) => {
      resetUser = input(form, 'username').value.trim();
      await sendReset();
    },
    'reset-code': async (form) => {
      const confirmationCode = input(form, 'code').value;
      const newPassword = input(form, 'password').value;
      form.reset();
      await confirmResetPassword({ username: resetUser, confirmationCode, newPassword });
      resetUser = '';
      show('sign-in');
      status('Password reset complete. Use your new password in the launcher.');
    },
  };

  const actions: Record<string, () => void | Promise<void>> = {
    'show-reset': () => show('reset'),
    'resend-reset': sendReset,
    'resend-email': async () => {
      await sendUserAttributeVerificationCode({ userAttributeKey: 'email' });
      status('A new verification code was sent.');
    },
    'setup-totp': async () => showTotp(await setUpTOTP()),
    finish,
    'start-over': async () => {
      clearSetupKey();
      username = resetUser = email = '';
      for (const form of root.querySelectorAll<HTMLFormElement>('form')) form.reset();
      await signOut();
      show('sign-in');
    },
  };

  async function run(operation: () => void | Promise<void>) {
    if (busy) return;
    busy = true;
    const buttons = [...root.querySelectorAll<HTMLButtonElement>('button')];
    for (const button of buttons) button.disabled = true;
    status('');
    try {
      await operation();
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      const expiredAuthenticator = name === 'ExpiredCodeException' && (view === 'sign-in-code' || view === 'totp');
      status(expiredAuthenticator ? 'Wait for a new code in your authenticator and try again.'
        : errors[name] ?? 'The request could not be completed. Try again or contact the playtest administrator.');
    } finally {
      busy = false;
      for (const button of buttons) button.disabled = false;
    }
  }

  root.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.dataset.step !== view) return;
    const submit = submissions[view];
    if (submit) void run(() => submit(form));
  });
  root.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-action]');
    const action = button?.dataset.action;
    if (action && actions[action]) void run(actions[action]);
  });
  root.querySelector<HTMLElement>('[data-unavailable]')!.hidden = true;
  show('sign-in', false);
}
