import { type Page, expect } from "@playwright/test";

import { BasePage } from "./base.page";

export class AuthPage extends BasePage {
  // Form headings to detect which form is active
  private readonly signInHeading = this.page.getByRole("heading", {
    name: "Welcome Back",
  });
  private readonly signUpHeading = this.page.getByRole("heading", {
    name: "Create Account",
  });

  // Sign In form fields (using label association)
  private readonly usernameInput = this.page.getByLabel("Username");
  private readonly passwordInput = this.page.getByLabel("Password", {
    exact: true,
  });
  private readonly signInButton = this.page.getByRole("button", {
    name: "Sign In",
    exact: true,
  });

  // Sign Up form additional fields
  private readonly nameInput = this.page.getByLabel("Name", { exact: true });
  private readonly emailInput = this.page.getByLabel("Email");
  private readonly confirmPasswordInput =
    this.page.getByLabel("Confirm password");
  private readonly signUpButton = this.page.getByRole("button", {
    name: "Sign Up",
    exact: true,
  });

  // Switch form buttons
  private readonly switchToSignupButton = this.page.getByRole("button", {
    name: /need an account/i,
  });
  private readonly switchToSigninButton = this.page.getByRole("button", {
    name: /already have an account/i,
  });

  // Error messages - in form alerts or toasts
  private readonly formError = this.page.locator('[role="alert"]');
  private readonly toastError = this.page.locator("[data-sonner-toast]");

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToAuth(): Promise<void> {
    await this.goto("/auth");
    // Wait for network to be idle (ensures React hydration is complete)
    await this.page.waitForLoadState("networkidle");
    // Wait for form to be ready
    await this.signInHeading.or(this.signUpHeading).waitFor();
  }

  // Detect which form is currently visible
  async isSignInForm(): Promise<boolean> {
    return this.signInHeading.isVisible();
  }

  async isSignUpForm(): Promise<boolean> {
    return this.signUpHeading.isVisible();
  }

  // Actions
  async switchToLogin(): Promise<void> {
    if (await this.isSignUpForm()) {
      // Use keyboard interaction (focus + Enter) as click doesn't trigger React handler
      await this.switchToSigninButton.focus();
      await this.page.keyboard.press("Enter");
      await this.signInHeading.waitFor({ timeout: 5000 });
    }
  }

  async switchToSignup(): Promise<void> {
    if (await this.isSignInForm()) {
      // Use keyboard interaction (focus + Enter) as click doesn't trigger React handler
      await this.switchToSignupButton.focus();
      await this.page.keyboard.press("Enter");
      await this.signUpHeading.waitFor({ timeout: 5000 });
    }
  }

  async fillLoginForm(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async fillSignupForm(
    username: string,
    name: string,
    email: string,
    password: string,
  ): Promise<void> {
    await this.usernameInput.fill(username);
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
  }

  async submitSignIn(): Promise<void> {
    await this.signInButton.click();
  }

  async submitSignUp(): Promise<void> {
    await this.signUpButton.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillLoginForm(username, password);
    await this.submitSignIn();
    // Wait for either redirect or error response
    await this.page.waitForTimeout(1000);
  }

  async signup(
    username: string,
    name: string,
    email: string,
    password: string,
  ): Promise<void> {
    await this.switchToSignup();
    await this.fillSignupForm(username, name, email, password);
    await this.submitSignUp();
  }

  // Assertions
  async expectLoginForm(): Promise<void> {
    await expect(this.signInHeading).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }

  async expectSignupForm(): Promise<void> {
    await expect(this.signUpHeading).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.signUpButton).toBeVisible();
  }

  async expectError(message: string | RegExp): Promise<void> {
    // Error can appear in form alert or as a toast
    const errorLocator = this.formError
      .filter({ hasText: message })
      .or(this.toastError.filter({ hasText: message }));
    await expect(errorLocator.first()).toBeVisible({ timeout: 5000 });
  }

  async expectRedirectToDashboard(): Promise<void> {
    // Wait for React Query to refresh and redirect to happen
    await this.page.waitForURL("**/dashboard**", { timeout: 15000 });
  }
}
