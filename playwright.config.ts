import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './my-documents/rls_testing',
  testMatch: '**/*.specs.ts',
  timeout: 60000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
});
