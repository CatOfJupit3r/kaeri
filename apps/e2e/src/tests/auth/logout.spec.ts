import { expect, test } from "../../fixtures/auth.fixture";

test.describe("Logout Flow", () => {
  test("should logout and redirect to auth", async ({
    authenticatedPage: _authenticatedPage,
    dashboardPage,
    page,
  }) => {
    // authenticatedPage fixture ensures we're logged in
    // Navigate to dashboard (should work since we're authenticated)
    await dashboardPage.navigateToDashboard();
    await dashboardPage.logout();

    // Should be redirected to auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test("should clear session on logout", async ({
    authenticatedPage: _authenticatedPage,
    dashboardPage,
    page,
  }) => {
    await dashboardPage.navigateToDashboard();
    await dashboardPage.logout();

    // Wait for logout to complete
    await page.waitForURL(/\/auth/);

    // Try to access protected route
    await page.goto("/dashboard");

    // Should redirect to auth since session is cleared
    await expect(page).toHaveURL(/\/auth/);
  });

  test("should show user menu before logout", async ({
    authenticatedPage: _authenticatedPage,
    dashboardPage,
  }) => {
    await dashboardPage.navigateToDashboard();
    await dashboardPage.openUserMenu();

    // User menu should show sign out option
    await expect(
      dashboardPage["page"].getByRole("menuitem", { name: /sign out/i }),
    ).toBeVisible();
  });
});
