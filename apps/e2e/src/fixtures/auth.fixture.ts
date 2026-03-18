import { type Page, test as base, expect } from "@playwright/test";

import { AuthPage, DashboardPage } from "../pages";

export const TEST_USERS = {
  default: {
    username: "e2etest",
    email: "e2etest@example.com",
    password: "TestPassword123!",
    name: "E2E Test User",
  },
  secondary: {
    username: "e2etest2",
    email: "e2etest2@example.com",
    password: "TestPassword456!",
    name: "E2E Test User 2",
  },
} as const;

type AuthFixtures = {
  authPage: AuthPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  authenticatedPage: async ({ page }, use) => {
    // Navigate to dashboard directly
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Check if we got redirected to auth (not logged in)
    const currentUrl = page.url();
    if (currentUrl.includes("/auth")) {
      // Need to login
      const authPage = new AuthPage(page);
      // Fill login form - wait for React hydration
      await page.waitForTimeout(500);
      await authPage.login(
        TEST_USERS.default.username,
        TEST_USERS.default.password,
      );
      await page.waitForURL("**/dashboard**", { timeout: 10000 });
    }

    // At this point we should be on dashboard
    await use(page);
  },
});

export { expect };
