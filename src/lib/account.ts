import { Amplify } from 'aws-amplify';
import {
  confirmResetPassword, confirmSignIn, confirmUserAttribute, fetchAuthSession, fetchMFAPreference,
  fetchUserAttributes, resetPassword, sendUserAttributeVerificationCode, setUpTOTP,
  signIn, signOut, updateMFAPreference, updateUserAttribute, verifyTOTPSetup,
  type SignInOutput,
} from 'aws-amplify/auth';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { sharedInMemoryStorage } from 'aws-amplify/utils';
import { toDataURL } from 'qrcode';

type View = 'sign-in' | 'new-password' | 'sign-in-code' | 'email' | 'email-code'
  | 'security' | 'totp' | 'complete' | 'profile' | 'reset' | 'reset-code';

type RosterCharacter = {
  name: string;
  level: number | null;
  total_xp: number | null;
  last_saved_unix: number;
};

function isRosterCharacter(entry: unknown): entry is RosterCharacter {
  if (!entry || typeof entry !== 'object') return false;
  const { name, level, total_xp, last_saved_unix } = entry as Partial<RosterCharacter>;
  return typeof name === 'string' && name.length >= 3 && name.length <= 20
    && ((level === null && total_xp === null)
      || (typeof level === 'number' && Number.isSafeInteger(level) && level > 0
        && typeof total_xp === 'number' && Number.isSafeInteger(total_xp) && total_xp >= 0))
    && typeof last_saved_unix === 'number' && Number.isSafeInteger(last_saved_unix)
    && Number.isFinite(new Date(last_saved_unix * 1000).getTime());
}

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
  const { pool, client, accountUrl, profileUrl, rosterUrl } = root.dataset;
  if (!pool || !client || !accountUrl || !profileUrl) return;
  Amplify.configure({ Auth: { Cognito: { userPoolId: pool, userPoolClientId: client } } });
  cognitoUserPoolsTokenProvider.setKeyValueStorage(sharedInMemoryStorage);

  const views = [...root.querySelectorAll<HTMLElement>('[data-view]')];
  const message = root.querySelector<HTMLElement>('[data-message]')!;
  const startOver = root.querySelector<HTMLButtonElement>('[data-action="start-over"]')!;
  const qr = root.querySelector<HTMLImageElement>('[data-totp-qr]')!;
  const key = root.querySelector<HTMLElement>('[data-totp-key]')!;
  const profileName = root.querySelector<HTMLElement>('[data-profile-name]')!;
  const profileSetup = root.querySelector<HTMLElement>('[data-account-setup]')!;
  const profileAccess = root.querySelector<HTMLElement>('[data-game-access]')!;
  const profileAuthenticator = root.querySelector<HTMLElement>('[data-profile-authenticator]')!;
  const profileMfa = root.querySelector<HTMLElement>('[data-mfa-status]')!;
  const profileDownload = root.querySelector<HTMLElement>('[data-profile-download]')!;
  const downloadOptions = profileDownload.querySelector<HTMLElement>('[data-profile-download-options]')!;
  const platformCards = profileDownload.querySelector<HTMLTemplateElement>('[data-profile-platforms]')!.content;
  const pageTitle = document.querySelector<HTMLHeadingElement>('.inner-hero h1')!;
  const signInTitle = pageTitle.textContent;
  const rosterStatus = root.querySelector<HTMLElement>('[data-roster-status]')!;
  const rosterLayout = root.querySelector<HTMLElement>('[data-roster-layout]')!;
  const roster = root.querySelector<HTMLUListElement>('[data-roster]')!;
  const characterName = root.querySelector<HTMLElement>('[data-selected-character]')!;
  const characterLevel = root.querySelector<HTMLElement>('[data-character-level]')!;
  const characterXp = root.querySelector<HTMLElement>('[data-character-xp]')!;
  const characterSaved = root.querySelector<HTMLTimeElement>('[data-character-saved]')!;
  const statNumber = new Intl.NumberFormat('en-AU');
  const savedDate = new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' });
  const input = (form: HTMLFormElement, name: string) => form.elements.namedItem(name) as HTMLInputElement;
  let view: View = 'sign-in';
  let busy = false;
  let username = '';
  let resetUser = '';
  let email = '';
  let completingSetup = false;
  let totpVerified = false;
  let totpDuringSignIn = false;
  let rosterRequest: AbortController | undefined;

  function status(text: string) {
    message.textContent = text;
    message.hidden = !text;
  }

  function show(next: View, focus = true) {
    view = next;
    const viewingProfile = next === 'profile';
    root.classList.toggle('is-profile', viewingProfile);
    pageTitle.textContent = viewingProfile ? 'Account overview' : signInTitle;
    for (const panel of views) panel.hidden = panel.dataset.view !== next;
    startOver.hidden = next === 'sign-in' || next === 'complete' || next === 'profile';
    startOver.textContent = location.pathname === profileUrl ? 'Back to account' : 'Back to account setup';
    status('');
    if (focus) {
      if (viewingProfile) {
        pageTitle.tabIndex = -1;
        pageTitle.focus();
      } else {
        root.querySelector<HTMLElement>(`[data-view="${next}"] h2`)?.focus();
      }
    }
  }

  function clearSetupKey() {
    qr.removeAttribute('src');
    key.textContent = '';
    totpVerified = false;
    totpDuringSignIn = false;
  }

  function finish() {
    clearSetupKey();
    completingSetup = false;
    show('complete');
  }

  async function leaveAccount() {
    clearSetupKey();
    completingSetup = false;
    username = resetUser = email = '';
    profileName.textContent = profileSetup.textContent = profileAccess.textContent = profileMfa.textContent = '';
    profileAuthenticator.hidden = true;
    profileDownload.hidden = true;
    downloadOptions.replaceChildren();
    clearRoster();
    for (const form of root.querySelectorAll<HTMLFormElement>('form')) form.reset();
    await signOut();
    if (location.pathname === profileUrl) history.replaceState(null, '', accountUrl);
    show('sign-in');
  }

  function clearRoster() {
    rosterRequest?.abort();
    rosterRequest = undefined;
    roster.replaceChildren();
    rosterLayout.hidden = true;
    characterName.textContent = '';
    characterLevel.textContent = '';
    characterXp.textContent = '';
    characterSaved.textContent = '';
    characterSaved.removeAttribute('datetime');
    rosterStatus.textContent = '';
  }

  function showCharacter(character: RosterCharacter) {
    characterName.textContent = character.name;
    characterLevel.textContent = character.level === null ? 'Unavailable' : statNumber.format(character.level);
    characterXp.textContent = character.total_xp === null ? 'Unavailable' : statNumber.format(character.total_xp);
    const lastSaved = new Date(character.last_saved_unix * 1000);
    characterSaved.dateTime = lastSaved.toISOString();
    characterSaved.textContent = savedDate.format(lastSaved);
  }

  function showCharacters(characters: RosterCharacter[]) {
    const choices = characters.map((character, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = character.name;
      button.setAttribute('aria-pressed', String(index === 0));
      button.addEventListener('click', () => {
        for (const choice of choices) choice.setAttribute('aria-pressed', String(choice === button));
        showCharacter(character);
      });
      item.append(button);
      roster.append(item);
      return button;
    });
    showCharacter(characters[0]);
    rosterLayout.hidden = false;
    rosterStatus.textContent = '';
  }

  async function loadRoster(approved: boolean, token: string) {
    clearRoster();
    const offline = 'Characters are available when Theia is online.';
    if (!approved || !rosterUrl) {
      rosterStatus.textContent = approved ? offline : 'Characters are available to approved playtesters.';
      return;
    }
    const request = new AbortController();
    rosterRequest = request;
    const timeout = setTimeout(() => request.abort(), 5000);
    rosterStatus.textContent = 'Loading characters…';
    try {
      const response = await fetch(rosterUrl, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'omit', cache: 'no-store', redirect: 'error', signal: request.signal,
      });
      if (!response.ok) throw new Error('Character roster unavailable');
      const { characters } = await response.json();
      if (!Array.isArray(characters) || characters.length > 8 || !characters.every(isRosterCharacter)) {
        throw new Error('Invalid character roster');
      }
      if (rosterRequest !== request) return;
      if (!characters.length) {
        rosterStatus.textContent = 'Create your first character in Theia.';
        return;
      }
      showCharacters(characters);
    } catch {
      if (rosterRequest === request) rosterStatus.textContent = offline;
    } finally {
      clearTimeout(timeout);
      if (rosterRequest === request) rosterRequest = undefined;
    }
  }

  async function showProfile() {
    const { tokens } = await fetchAuthSession();
    if (!tokens) {
      await leaveAccount();
      status('Sign in again to view your account.');
      return;
    }
    const claims = tokens.accessToken.payload;
    const groups = claims['cognito:groups'];
    const approved = Array.isArray(groups) && groups.includes('theia-testers');
    const preference = await fetchMFAPreference();
    profileName.textContent = typeof claims.username === 'string' ? claims.username : username;
    profileSetup.textContent = 'Complete';
    profileAccess.textContent = approved ? 'Approved' : 'Unapproved';
    const mfaEnabled = preference.enabled?.includes('TOTP') ?? false;
    profileMfa.textContent = mfaEnabled ? 'Enabled' : 'Off';
    profileAuthenticator.hidden = mfaEnabled;
    downloadOptions.replaceChildren();
    if (approved) downloadOptions.append(platformCards.cloneNode(true));
    profileDownload.hidden = !approved;
    history.replaceState(null, '', profileUrl);
    show('profile');
    void loadRoster(approved, tokens.accessToken.toString());
  }

  async function chooseAuthenticator() {
    const preference = await fetchMFAPreference();
    if (preference.enabled?.includes('TOTP')) finish();
    else show('security');
  }

  async function afterSignIn() {
    const attributes = await fetchUserAttributes();
    if (attributes.email_verified === 'true') {
      if (completingSetup) await chooseAuthenticator();
      else await showProfile();
      return;
    }
    completingSetup = true;
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
      completingSetup = true;
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
      clearSetupKey();
      if (completingSetup) finish();
      else await showProfile();
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
    'view-account': showProfile,
    'sign-out': leaveAccount,
    'start-over': async () => {
      if (location.pathname === profileUrl) {
        clearSetupKey();
        await showProfile();
      } else {
        await leaveAccount();
      }
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
  if (location.pathname === profileUrl) history.replaceState(null, '', accountUrl);
  root.querySelector<HTMLElement>('[data-unavailable]')!.hidden = true;
  show('sign-in', false);
}
