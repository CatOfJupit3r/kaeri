import { expect, test, TEST_USERS } from '../fixtures/base.fixture';

test.describe('Authentication - login', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('redirects protected routes to auth', async ({ authPage, page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/auth/);
    await authPage.expectSignInVisible();
  });

  test('allows quick sign in for the default user', async ({ authPage, page }) => {
    await authPage.loginAsDefaultUser(TEST_USERS.default);

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
