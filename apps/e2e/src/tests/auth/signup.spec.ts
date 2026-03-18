import { expect, test } from "../../fixtures/auth.fixture";
import { generateTestUser } from "../../helpers/test-data.helper";

test.describe("Signup Flow", () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.navigateToAuth();
    await authPage.switchToSignup();
  });

  test("should display signup form", async ({ authPage }) => {
    await authPage.expectSignupForm();
  });

  test("should create account and redirect to dashboard", async ({
    authPage,
  }) => {
    const user = generateTestUser();
    // Don't call signup() as it includes switchToSignup which was already done in beforeEach
    await authPage.fillSignupForm(
      user.username,
      user.name,
      user.email,
      user.password,
    );
    await authPage.submitSignUp();
    await authPage.expectRedirectToDashboard();
  });

  test("should show error for existing email", async ({ authPage }) => {
    // Using default test user which already exists
    await authPage.fillSignupForm(
      "newusername",
      "Test User",
      "e2etest@example.com", // This email exists from global setup
      "TestPassword123!",
    );
    await authPage.submitSignUp();
    await authPage.expectError(/already exists|already registered/i);
  });

  test("should show validation error for weak password", async ({
    authPage,
    page,
  }) => {
    const user = generateTestUser();
    await authPage.fillSignupForm(user.username, user.name, user.email, "weak");
    await authPage.submitSignUp();

    // Form should show password validation error (appears twice for password and confirm)
    await expect(
      page.getByText("Password must be at least 8 characters").first(),
    ).toBeVisible();
  });

  test("should show validation error for invalid email", async ({
    authPage,
    page,
  }) => {
    await authPage.fillSignupForm(
      "username",
      "Test User",
      "invalid-email",
      "TestPassword123!",
    );
    await authPage.submitSignUp();

    // Form should show email validation error
    await expect(page.getByText("Invalid email address")).toBeVisible();
  });
});
