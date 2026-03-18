import { expect, test, TEST_USERS } from "../../fixtures/auth.fixture";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.navigateToAuth();
  });

  test("should display login form", async ({ authPage }) => {
    await authPage.expectLoginForm();
  });

  test("should login with valid credentials", async ({ authPage }) => {
    await authPage.login(
      TEST_USERS.default.username,
      TEST_USERS.default.password,
    );
    await authPage.expectRedirectToDashboard();
  });

  test("should show error with invalid credentials", async ({ authPage }) => {
    await authPage.login("wronguser", "wrongpassword");
    await authPage.expectError(/invalid/i);
  });

  test("should redirect to auth when accessing protected route unauthenticated", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth/);
  });
});
