import { expect, test, createTestUser } from '../fixtures/base.fixture';

test.describe('Authentication - signup', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('allows a new user to register', async ({ authPage, page }) => {
    const user = createTestUser('signup');

    await authPage.registerUser(user);

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /my projects/i })).toBeVisible();
  });
});
