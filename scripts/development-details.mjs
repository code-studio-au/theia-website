// Older notes and server releases that are outside the signed client archive.
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
    'Add website account setup, email recovery and optional authenticator MFA for invited players.',
  ] },
];
