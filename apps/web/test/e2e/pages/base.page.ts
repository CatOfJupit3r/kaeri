import { type Page, expect } from '@playwright/test';

export class BasePage {
  constructor(public readonly page: Page) {}

  private getDialogLocator() {
    return this.page.locator(
      '[role="dialog"]:not([data-state="closed"]), [role="alertdialog"]:not([data-state="closed"])',
    );
  }

  protected getUserMenuTrigger() {
    return this.page.getByTestId('user-menu-trigger');
  }

  async goto(path: string, options: { waitForNetworkIdle?: boolean } = {}) {
    const { waitForNetworkIdle = false } = options;

    await this.page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    if (waitForNetworkIdle) {
      await this.waitForNetworkIdle();
    }
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle', { timeout: 1_500 }).catch(() => null);
  }

  async waitForSkeleton() {
    const skeleton = this.page.locator('[data-testid="skeleton"]');

    if (
      await skeleton
        .first()
        .isVisible({ timeout: 1_000 })
        .catch(() => false)
    ) {
      await expect(skeleton.first()).not.toBeVisible({ timeout: 3_000 });
    }
  }

  async expectToast(pattern: string | RegExp) {
    await expect(this.page.locator('[data-sonner-toast]').first()).toContainText(pattern, { timeout: 5_000 });
  }

  async waitForDialog() {
    const dialog = this.getDialogLocator().first();
    await expect(dialog).toBeVisible({ timeout: 5_000 });
    return dialog;
  }

  async waitForDialogClose() {
    await expect(this.getDialogLocator()).not.toBeVisible({ timeout: 5_000 });
  }

  async expectAuthenticatedUI() {
    await expect(this.getUserMenuTrigger()).toBeVisible({ timeout: 10_000 });
  }
}
