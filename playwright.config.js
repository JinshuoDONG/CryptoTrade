import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test',
  testMatch: '**/*.spec.js',
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        headless: true,
        viewport: { width: 1280, height: 720 },
        actionTimeout: 10000,
      },
    },
  ],
  timeout: 30000,
});
