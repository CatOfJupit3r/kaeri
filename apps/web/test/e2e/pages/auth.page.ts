import { type Page, expect } from '@playwright/test';

import type { iTestUser } from '../test-users';
import { BasePage } from './base.page';

function isImpersonateRequest(url: string) {
  try {
    return /\/(?:api\/)?dev-tools\/impersonate\/[^/]+\/?$/i.test(new URL(url).pathname);
  } catch {
    return /\/(?:api\/)?dev-tools\/impersonate\/[^/]+\/?$/i.test(url);
  }
}

export class AuthPage extends BasePage {
  private readonly welcomeBackHeading = this.page.getByRole('heading', { name: /welcome back/i });
  private readonly createAccountHeading = this.page.getByRole('heading', { name: /create account/i });
  private readonly usernameInput = this.page.getByLabel(/^username$/i);
  private readonly nameInput = this.page.getByLabel(/^name$/i);
  private readonly emailInput = this.page.getByLabel(/^email$/i);
  private readonly passwordInput = this.page.getByLabel(/^password$/i);
  private readonly confirmPasswordInput = this.page.getByLabel(/^confirm password$/i);
  private readonly signUpButton = this.page.getByRole('button', { name: /^sign up$/i });
  private readonly switchToSignUpButton = this.page.getByRole('button', { name: /need an account\? sign up/i });
  private readonly switchToSignInButton = this.page.getByRole('button', {
    name: /already have an account\? sign in/i,
  });
  private readonly quickSignInHeading = this.page.getByRole('heading', { name: /quick sign in/i });
  private readonly quickSignInCombobox = this.page.getByRole('combobox').first();
  private readonly signUpForm = this.page.locator('form').filter({ has: this.signUpButton }).first();

  constructor(page: Page) {
    super(page);
  }

  private async getAuthState(): Promise<'auth' | 'authenticated' | 'pending'> {
    if (
      (await this.welcomeBackHeading.isVisible({ timeout: 500 }).catch(() => false)) ||
      (await this.createAccountHeading.isVisible({ timeout: 500 }).catch(() => false))
    ) {
      return 'auth';
    }

    if (await this.isAuthenticated()) {
      return 'authenticated';
    }

    return 'pending';
  }

  private async isAuthenticated() {
    return this.getUserMenuTrigger()
      .isVisible({ timeout: 1_000 })
      .catch(() => false);
  }

  async navigateToAuth() {
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      await this.goto('/auth');
      await this.waitForNetworkIdle();

      const state = await this.getAuthState();
      if (state === 'auth' || state === 'authenticated') {
        return;
      }

      if (attempt < 4) {
        await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => null);
        await this.waitForNetworkIdle();
      }
    }

    await expect
      .poll(async () => await this.getAuthState(), {
        timeout: 8_000,
      })
      .not.toBe('pending');
  }

  async expectSignInVisible() {
    await expect(this.welcomeBackHeading).toBeVisible({ timeout: 10_000 });
  }

  async openSignUp() {
    await this.navigateToAuth();

    const isSignUpReady = async () => {
      return (
        (await this.createAccountHeading.isVisible({ timeout: 500 }).catch(() => false)) ||
        (await this.signUpButton.isVisible({ timeout: 500 }).catch(() => false))
      );
    };

    if (await isSignUpReady()) {
      return;
    }

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      if (await isSignUpReady()) {
        return;
      }

      if (!(await this.switchToSignUpButton.isVisible({ timeout: 1_000 }).catch(() => false))) {
        await this.navigateToAuth();
      }

      await expect(this.switchToSignUpButton).toBeVisible({ timeout: 5_000 });
      await this.page.waitForTimeout(500);
      await this.switchToSignUpButton.click({ force: true });
      await this.waitForNetworkIdle();

      if (await isSignUpReady()) {
        return;
      }

      if (attempt === 2) {
        await this.navigateToAuth();
      } else if (attempt < 3) {
        await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => null);
        await this.waitForNetworkIdle();
      }
    }

    await expect.poll(async () => await isSignUpReady(), { timeout: 5_000 }).toBe(true);
  }

  async loginAsDefaultUser(user: Pick<iTestUser, 'name'>) {
    await this.navigateToAuth();

    if (await this.isAuthenticated()) {
      return;
    }

    await expect(this.quickSignInHeading).toBeVisible({ timeout: 10_000 });

    await expect
      .poll(async () => await this.quickSignInCombobox.isEnabled().catch(() => false), {
        timeout: 10_000,
      })
      .toBe(true);

    const impersonateResponsePromise = this.page.waitForResponse(
      (response) => response.request().method() === 'GET' && isImpersonateRequest(response.url()),
      { timeout: 10_000 },
    );

    await this.quickSignInCombobox.click();
    await this.page.getByRole('option', { name: user.name, exact: true }).click();

    const impersonateResponse = await impersonateResponsePromise;
    if (!impersonateResponse.ok()) {
      throw new Error(
        `Quick sign in failed with status ${impersonateResponse.status()}: ${await impersonateResponse.text()}`,
      );
    }

    await this.goto('/dashboard');
    await this.expectAuthenticatedUI();
  }

  async registerUser(user: iTestUser) {
    await this.openSignUp();

    await this.usernameInput.fill(user.username);
    await this.usernameInput.press('Tab');
    await this.nameInput.fill(user.name);
    await this.nameInput.press('Tab');
    await this.emailInput.fill(user.email);
    await this.emailInput.press('Tab');
    await this.passwordInput.fill(user.password);
    await this.passwordInput.press('Tab');
    await this.confirmPasswordInput.fill(user.password);
    await this.confirmPasswordInput.press('Tab');

    await expect(this.signUpButton).toBeEnabled({ timeout: 10_000 });
    await this.signUpForm.evaluate((form: HTMLFormElement) => form.requestSubmit());

    await expect(this.page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    await this.expectAuthenticatedUI();
  }
}
