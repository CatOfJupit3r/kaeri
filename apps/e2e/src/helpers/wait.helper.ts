import { type Locator, type Page, expect } from "@playwright/test";

/**
 * Wait utilities for handling async UI states
 */
export class WaitHelper {
  constructor(private page: Page) {}

  /**
   * Wait for a specific number of elements to be present
   */
  async waitForCount(
    locator: Locator,
    count: number,
    timeout = 10000,
  ): Promise<void> {
    await expect(locator).toHaveCount(count, { timeout });
  }

  /**
   * Wait for loading skeleton to disappear
   */
  async waitForSkeletonToDisappear(): Promise<void> {
    const skeleton = this.page.locator(
      '[data-testid="skeleton"], [data-loading="true"]',
    );
    await skeleton.waitFor({ state: "detached", timeout: 30000 }).catch(() => {
      // Skeleton may not exist, which is fine
    });
  }

  /**
   * Wait for mutation to complete (network idle + no loading states)
   */
  async waitForMutation(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
    await this.waitForSkeletonToDisappear();
  }

  /**
   * Wait for toast notification and optionally dismiss it
   */
  async waitForToast(message?: string | RegExp, dismiss = true): Promise<void> {
    const toast = this.page.locator("[data-sonner-toast]");
    await expect(toast).toBeVisible({ timeout: 10000 });

    if (message) {
      await expect(toast).toContainText(message);
    }

    if (dismiss) {
      // Wait a moment for user to see, then dismiss
      await this.page.waitForTimeout(500);
      const closeButton = toast.locator('button[aria-label="Close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  }

  /**
   * Wait for URL to match pattern
   */
  async waitForUrl(pattern: string | RegExp, timeout = 10000): Promise<void> {
    await this.page.waitForURL(pattern, { timeout });
  }

  /**
   * Wait for element to be stable (no layout shifts)
   */
  async waitForStable(locator: Locator): Promise<void> {
    await locator.waitFor({ state: "visible" });
    // Wait for any animations to complete
    await this.page.waitForTimeout(100);
  }

  /**
   * Retry an action until it succeeds or times out
   */
  async retry<T>(
    action: () => Promise<T>,
    options: { maxAttempts?: number; delay?: number } = {},
  ): Promise<T> {
    const { maxAttempts = 3, delay = 1000 } = options;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          await this.page.waitForTimeout(delay);
        }
      }
    }

    throw lastError;
  }
}

export function createWaitHelper(page: Page): WaitHelper {
  return new WaitHelper(page);
}
