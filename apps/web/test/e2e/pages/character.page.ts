import { type Page, expect } from '@playwright/test';

import { BasePage } from './base.page';

export class CharacterPage extends BasePage {
  private readonly overviewTab = this.page.getByRole('tab', { name: /^overview$/i });
  private readonly editButton = this.page.getByRole('button', { name: /^edit$/i }).first();
  private readonly editDialog = this.page.getByRole('dialog', { name: /^edit character$/i });

  constructor(page: Page) {
    super(page);
  }

  private getHeading(name: string) {
    return this.page.getByRole('heading', { name, exact: true }).first();
  }

  async expectLoaded(name: string) {
    await expect(this.getHeading(name)).toBeVisible({ timeout: 10_000 });
    await expect(this.overviewTab).toBeVisible({ timeout: 10_000 });
  }

  async expectDescription(text: string) {
    await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: 10_000 });
  }

  async updateDescription(text: string) {
    await expect(this.editButton).toBeVisible({ timeout: 10_000 });
    await this.editButton.click();
    await expect(this.editDialog).toBeVisible({ timeout: 10_000 });
    await this.editDialog.getByLabel(/^description$/i).fill(text);
    await this.editDialog.getByRole('button', { name: /^update character$/i }).click();
    await expect(this.editDialog).not.toBeVisible({ timeout: 10_000 });
  }

  async reloadAndExpectLoaded(name: string) {
    await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    await this.expectLoaded(name);
  }
}
