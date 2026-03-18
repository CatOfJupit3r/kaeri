import { type Locator, type Page, expect } from "@playwright/test";

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Common navigation
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  // Common waits
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  async waitForDomContentLoaded(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
  }

  // Common assertions
  async expectUrl(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  async expectTitle(title: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  // Toast notifications
  async expectToast(message: string | RegExp): Promise<void> {
    const toast = this.page.locator("[data-sonner-toast]");
    await expect(toast).toContainText(message);
  }

  async dismissToast(): Promise<void> {
    await this.page
      .locator('[data-sonner-toast] button[aria-label="Close"]')
      .click();
  }

  // Modal helpers
  async waitForModal(): Promise<Locator> {
    const modal = this.page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    return modal;
  }

  async closeModal(): Promise<void> {
    await this.page.keyboard.press("Escape");
  }

  // Loading states
  async waitForSkeleton(): Promise<void> {
    await this.page
      .locator('[data-testid="skeleton"]')
      .waitFor({ state: "detached" });
  }
}
