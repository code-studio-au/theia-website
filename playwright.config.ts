import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:4321/theia-website/',
    launchOptions: { executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] },
  },
  webServer: {
    command: 'ASTRO_TELEMETRY_DISABLED=1 npm run preview -- --port 4321 --ignore-lock',
    url: 'http://127.0.0.1:4321/theia-website/',
    reuseExistingServer: !process.env.CI,
  },
});
