import { type Page, expect } from '@playwright/test';

import { BasePage } from './base.page';

export class ScriptLibraryPage extends BasePage {
  private readonly pageHeading = this.page.getByRole('heading', { name: /^scripts$/i });
  private readonly scriptsList = this.page.getByTestId('scripts-list');
  private readonly createScriptButton = this.page.getByTestId('create-script-button');
  private readonly emptyStateHeading = this.page.getByRole('heading', { name: /no scripts yet/i });

  constructor(page: Page) {
    super(page);
  }

  private getScriptCard(title: string) {
    return this.page.getByTestId('script-card').filter({
      has: this.page.getByRole('heading', { name: title, exact: true }),
    });
  }

  async navigateToScripts(seriesId: string) {
    await this.goto(`/series/${seriesId}/scripts`);
    await this.expectLoaded();
  }

  async expectLoaded() {
    await expect(this.pageHeading).toBeVisible({ timeout: 10_000 });
    await expect(this.scriptsList).toBeVisible({ timeout: 10_000 });
  }

  async expectEmptyState() {
    await expect(this.emptyStateHeading).toBeVisible({ timeout: 10_000 });
  }

  async createScript() {
    await expect(this.createScriptButton).toBeVisible({ timeout: 10_000 });
    await this.createScriptButton.click();
    await expect(this.page).toHaveURL(/\/series\/[^/]+\/scripts\/[^/]+$/, { timeout: 20_000 });
  }

  async expectScriptVisible(title: string) {
    await expect(this.getScriptCard(title)).toBeVisible({ timeout: 10_000 });
  }

  async expectScriptMetadataVisible(title: string) {
    const card = this.getScriptCard(title);

    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(card.getByRole('heading', { name: title, exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(card.getByText(/ago/i)).toBeVisible({ timeout: 10_000 });
  }

  async openScript(title: string) {
    const card = this.getScriptCard(title);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await card.click();
    await expect(this.page).toHaveURL(/\/series\/[^/]+\/scripts\/[^/]+$/, { timeout: 10_000 });
  }
}
