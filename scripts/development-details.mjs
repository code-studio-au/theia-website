// Historical notes and deployed builds outside the signed download archive.
export const developmentDetails = [
  { product: 'launcher', version: '0.1.3', date: '2026-11-24T00:00:00Z', notes: [
    'Separate launcher updates from client updates and preserve the installed game and settings through restart.',
    'Install launcher updates through the desktop package installer and offer to restart when the upgrade finishes.',
    'Verify installed files and retain the previous release. Introduce the harbour artwork and gold launcher frame.',
  ] },
  { product: 'client', version: '0.1.0.11', date: '2026-11-24T00:00:00Z', notes: [
    'Bring the Graphics styling to the Interface, Support and Developer settings panels.',
    'Offer Windowed, Borderless and Fullscreen modes. Restore the previous mode if Keep Changes expires.',
    'Update the HUD with new unit frames, portrait choices, minimap, world map, skill bar and experience display.',
    'Improve chat history wrapping and nearby speech bubbles.',
  ] },
  { product: 'launcher', version: '0.1.9', date: '2026-11-25T10:40:52Z', notes: [
    'Publish the signed Linux downloads on GitHub Pages and verify the live installer and executable.',
    'Import signed release notes into the website news and RSS feed.',
  ] },
  { product: 'client', version: '0.1.0.13', date: '2026-11-25T10:40:52Z', corrections: {
    'Includes the seven-zone Millhaven development world with modular player characters and the wolf.':
      'Includes the seven-zone Covenant map, including Millhaven, with modular player characters and the wolf.',
  }, notes: [
    'Pin the approved runtime asset set and qualify the exported client before publishing.',
    'Check release packaging, signed updates and retention of the previous release in CI.',
    'Parallelise Rust test builds and reduce CI cache uploads.',
  ] },
  { product: 'launcher', version: '0.1.10', date: '2026-11-25T22:27:30Z', notes: [
    'Verify the signed bundle index and both archive hashes after deploying downloads.',
    'Retain the previous downloads so installations already in progress can finish.',
  ] },
  { product: 'server', version: '0.1.0-main.43b891f4-r2', date: '2026-11-24T00:00:00Z', notes: [
    'Deploy the hosted Theia development realm and save characters, inventory and supported quest progress between sessions.',
    'Qualify hosted sign-in and character entry for invited testers in the Millhaven zone.',
  ] },
  { product: 'server', version: '0.1.0-main.d9af39d9', date: '2026-11-26T01:54:43Z', notes: [
    'Start Theia on demand and shut it down after idle time, with a persistence flush before shutdown.',
    'Scope deployment permissions to the realm gateway and validate build compatibility before accepting a join.',
    'Activate the full Theia playtest profile with NPC contacts, enemy loot, quests, inventory, progression, chat and parties.',
    'Configure Cognito for invite-only accounts, verified email recovery and optional authenticator MFA.',
  ] },
  { product: 'website', version: '59ac2cd', date: '2026-11-24T01:19:42Z', notes: [
    'Publish Theia Online on its own HTTPS domain with illustrated world and faction pages, a media gallery, and news.',
  ] },
  { product: 'website', version: '25c61f6', date: '2026-11-24T09:58:40Z', notes: [
    'Add a Release Notes category for development builds.',
  ] },
  { product: 'website', version: '5d8e9fd', date: '2026-11-25T10:30:40Z', notes: [
    'Link the Linux download to the verified installer and import signed release notes into News and RSS.',
  ] },
  { product: 'website', version: '95389cf', date: '2026-11-25T22:35:13Z', notes: [
    'Use concise changelogs that cover player-facing, infrastructure and release workflow changes.',
  ] },
  { product: 'website', version: '374bf3b', date: '2026-11-26T04:00:24Z', notes: [
    'Combine recent releases into one weekly Development Update.',
    'Add a themed account flow for playtest invitations, recovery email verification, password resets and optional authenticator setup.',
  ] },
  { product: 'website', version: 'b83393f', date: '2026-11-26T05:08:52Z', notes: [
    'Show account setup completion once. Send returning testers to an account overview with their setup and game approval status.',
  ] },
  { product: 'website', version: '53382db', date: '2026-11-26T05:17:27Z', notes: [
    'Use the gold action style for account submissions and themed text links for Reset password, Back, Skip and Sign out.',
  ] },
];
