import { expect, test as setup } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import { AuthPage } from './pages';
import { TEST_USERS } from './test-users';

const authStatePath = path.resolve('test-results', '.auth', 'default-user.json');
const webBaseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:3030';
const apiBaseUrl = process.env.E2E_API_URL ?? 'http://localhost:5050';

setup('authenticate as default user', async ({ page }) => {
  setup.setTimeout(90_000);
  fs.mkdirSync(path.dirname(authStatePath), { recursive: true });

  await setup.step('wait for API readiness', async () => {
    await expect
      .poll(
        async () => {
          try {
            const response = await page.request.get(`${apiBaseUrl}/auth/get-session`);
            return response.status();
          } catch {
            return 0;
          }
        },
        { timeout: 60_000, intervals: [2_000] },
      )
      .toBe(200);
  });

  await setup.step('ensure default user exists', async () => {
    const response = await page.request.post(`${apiBaseUrl}/auth/sign-up/email`, {
      data: TEST_USERS.default,
      headers: {
        origin: webBaseUrl,
      },
      failOnStatusCode: false,
    });

    if (!response.ok() && response.status() !== 409) {
      throw new Error(`Failed to create the default E2E user: ${response.status()} ${await response.text()}`);
    }
  });

  await setup.step('login as default user', async () => {
    const authPage = new AuthPage(page);
    await authPage.loginAsDefaultUser(TEST_USERS.default);
  });

  await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await expect(page.getByRole('heading', { name: /my projects/i })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('user-menu-trigger')).toBeVisible({ timeout: 10_000 });

  await page.context().storageState({ path: authStatePath });
});
