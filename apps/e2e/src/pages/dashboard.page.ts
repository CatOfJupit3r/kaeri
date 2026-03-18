import { type Page, expect } from "@playwright/test";

import { BasePage } from "./base.page";

export class DashboardPage extends BasePage {
  // Locators
  private readonly createSeriesButton = this.page.getByRole("button", {
    name: "New Project",
  });
  private readonly seriesGrid = this.page.locator(".grid");
  private readonly seriesCard = (name: string) =>
    this.page.locator(`h3:has-text("${name}")`).first();
  // User menu trigger button with data-testid
  private readonly userMenuButton = this.page.locator(
    '[data-testid="user-menu-trigger"]',
  );
  private readonly signOutButton = this.page.getByRole("menuitem", {
    name: /sign out/i,
  });
  private readonly searchInput = this.page.locator(
    'input[placeholder*="Search"]',
  );

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToDashboard(): Promise<void> {
    await this.goto("/dashboard");
    await this.waitForNetworkIdle();
  }

  // Actions
  async clickCreateSeries(): Promise<void> {
    await this.createSeriesButton.click();
    await this.waitForModal();
  }

  async openSeries(name: string): Promise<void> {
    await this.seriesCard(name).click();
  }

  async searchSeries(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300); // debounce
  }

  async openUserMenu(): Promise<void> {
    await this.userMenuButton.click();
  }

  async openSeriesDropdown(seriesTitle: string): Promise<void> {
    // Find the series card by title and then click its dropdown trigger
    // Dashboard shows series in cards with dropdown menus for actions
    await this.page.waitForLoadState("networkidle");

    // Find the card that contains the series title
    // The dropdown trigger is the ellipsis button (3 vertical dots)
    const seriesCard = this.page
      .locator("h3")
      .filter({ hasText: seriesTitle })
      .locator(
        "xpath=ancestor::article | ancestor::div[contains(@class, 'card')]",
      )
      .first();

    // Within the card's header area, find the dropdown trigger button
    // It's a button with an ellipsis icon (sr-only text "Open menu")
    const dropdownTrigger = seriesCard
      .locator('button:has(svg), button:has-text("Open menu")')
      .first();

    if (await dropdownTrigger.isVisible({ timeout: 3000 })) {
      await dropdownTrigger.click();
    } else {
      // Fallback: find any button near the title
      const fallbackTrigger = this.page
        .locator(`h3:has-text("${seriesTitle}")`)
        .locator("..")
        .locator("..")
        .locator("button")
        .first();
      await fallbackTrigger.click();
    }

    // Wait for dropdown to appear
    await this.page.waitForTimeout(300);
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    // Wait for dropdown to appear
    await this.signOutButton.waitFor({ timeout: 3000 });
    await this.signOutButton.click();
  }

  // Assertions
  async expectSeriesVisible(name: string): Promise<void> {
    await expect(this.seriesCard(name)).toBeVisible();
  }

  async expectSeriesNotVisible(name: string): Promise<void> {
    await expect(this.seriesCard(name)).not.toBeVisible();
  }

  async expectSeriesCount(count: number): Promise<void> {
    await expect(
      this.seriesGrid.locator('[data-testid="series-card"]'),
    ).toHaveCount(count);
  }

  async expectEmptyState(): Promise<void> {
    await expect(
      this.page.locator('[data-testid="empty-series"]'),
    ).toBeVisible();
  }
}
