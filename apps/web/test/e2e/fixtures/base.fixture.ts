import { test as base } from '@playwright/test';

import { AuthPage, DashboardPage } from '../pages';
import { TEST_USERS, createTestUser } from '../test-users';

interface iPageFixtures {
  authPage: AuthPage;
  dashboardPage: DashboardPage;
}

export const test = base.extend<iPageFixtures>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from '@playwright/test';
export { TEST_USERS, createTestUser };
