import { defineConfig } from '@playwright/test';

const previewPort = Number(process.env.PREVIEW_PORT || 4321);
const basePath = `/${(process.env.BASE_PATH ?? '/').replace(/^\/+|\/+$/g, '')}`.replace(/\/?$/, '/');
const previewURL = `http://127.0.0.1:${previewPort}${basePath}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  use: {
    baseURL: previewURL,
    launchOptions: { executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] },
  },
  webServer: {
    command: `ASTRO_TELEMETRY_DISABLED=1 npm run preview -- --port ${previewPort} --ignore-lock`,
    url: previewURL,
    reuseExistingServer: !process.env.CI,
  },
});
