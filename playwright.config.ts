import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

const WEB_BASE_URL = 'http://localhost:3030';
const API_BASE_URL = 'http://localhost:5050';

const AUTH_STATE_PATH = path.join(process.cwd(), 'test-results', '.auth', 'default-user.json');

export default defineConfig({
  testDir: './apps/web/test/e2e',
  outputDir: 'test-results/playwright',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 3,
  timeout: 20_000,
  expect: {
    timeout: 3_000,
  },

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: WEB_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  globalTeardown: './scripts/e2e/global-teardown.ts',

  webServer: {
    command: 'pnpm run e2e:stack',
    url: WEB_BASE_URL,
    timeout: 180_000,
    reuseExistingServer: false,
    name: 'Kaeri E2E Stack',
    env: {
      ...process.env,
      E2E_BASE_URL: WEB_BASE_URL,
      E2E_API_URL: API_BASE_URL,
      NODE_ENV: 'development',
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? 'kaeri-e2e-secret-0123456789abcdef',
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? API_BASE_URL,
      CORS_ORIGIN: process.env.CORS_ORIGIN ?? WEB_BASE_URL,
      AUTH_COOKIE_SECURE: process.env.AUTH_COOKIE_SECURE ?? 'false',
      AUTH_COOKIE_SAME_SITE: process.env.AUTH_COOKIE_SAME_SITE ?? 'lax',
      MONGO_URI: process.env.MONGO_URI ?? 'mongodb://localhost:6061/kaeri',
      MONGO_USER: process.env.MONGO_USER ?? 'username',
      MONGO_PASSWORD: process.env.MONGO_PASSWORD ?? 'password',
      MONGO_DATABASE_NAME: process.env.MONGO_DATABASE_NAME ?? 'kaeri',
      VALKEY_HOST: process.env.VALKEY_HOST ?? 'localhost',
      VALKEY_PORT: process.env.VALKEY_PORT ?? '6380',
      VITE_SERVER_URL: API_BASE_URL,
      VITE_PORT: '3030',
      SERVER_PORT: '5050',
    },
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE_PATH,
      },
    },
  ],
});