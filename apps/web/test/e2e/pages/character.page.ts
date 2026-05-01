import { type Page, expect } from '@playwright/test';

import { BasePage } from './base.page';

export class CharacterPage extends BasePage {
  private readonly overviewTab = this.page.getByRole('tab', { name: /^overview$/i });
  private readonly appearancesTab = this.page.getByRole('tab', { name: /^appearances(?:\s*\(\d+\))?$/i });
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

  async updateName(name: string) {
    await expect(this.editButton).toBeVisible({ timeout: 10_000 });
    await this.editButton.click();
    await expect(this.editDialog).toBeVisible({ timeout: 10_000 });
    await this.editDialog.getByLabel(/^name$/i).fill(name);
    await this.editDialog.getByRole('button', { name: /^update character$/i }).click();
    await expect(this.editDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectLoaded(name);
  }

  async addRelationship(data: { targetName: string; relationshipType: string; note?: string }) {
    await expect(this.editButton).toBeVisible({ timeout: 10_000 });
    await this.editButton.click();
    await expect(this.editDialog).toBeVisible({ timeout: 10_000 });

    const targetSelect = this.editDialog.getByRole('combobox', { name: /^character$/i });
    const typeSelect = this.editDialog.getByRole('combobox', { name: /^relationship type$/i });

    await targetSelect.click();
    await this.page.getByRole('option', { name: data.targetName, exact: true }).click();
    await typeSelect.click();
    await this.page.getByRole('option', { name: data.relationshipType, exact: true }).click();

    if (data.note != null) {
      await this.editDialog.getByLabel(/^note \(optional\)$/i).fill(data.note);
    }

    await this.editDialog.getByRole('button', { name: /^add relationship$/i }).click();
    await this.editDialog.getByRole('button', { name: /^update character$/i }).click();
    await expect(this.editDialog).not.toBeVisible({ timeout: 10_000 });
  }

  async expectRelationshipVisible(data: { targetName: string; relationshipType: string; note?: string }) {
    await expect(this.page.getByRole('link', { name: data.targetName, exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText(data.relationshipType, { exact: true })).toBeVisible({ timeout: 10_000 });

    if (data.note != null) {
      await expect(this.page.getByText(data.note, { exact: false })).toBeVisible({ timeout: 10_000 });
    }
  }

  async openRelationship(targetName: string) {
    await this.page.getByRole('link', { name: targetName, exact: true }).click();
  }

  async addAppearance(data: { sceneRef: string; locationName?: string }) {
    await expect(this.editButton).toBeVisible({ timeout: 10_000 });
    await this.editButton.click();
    await expect(this.editDialog).toBeVisible({ timeout: 10_000 });

    const scriptSelect = this.editDialog.getByRole('combobox', { name: /^script$/i });

    await scriptSelect.click();
    await this.page.getByRole('option').first().click();
    await this.editDialog.getByLabel(/^scene reference$/i).fill(data.sceneRef);

    if (data.locationName != null) {
      const locationSelect = this.editDialog.getByRole('combobox', { name: /^location \(optional\)$/i });

      await locationSelect.click();
      await this.page.getByRole('option', { name: data.locationName, exact: true }).click();
    }

    await this.editDialog.getByRole('button', { name: /^add appearance$/i }).click();
    await this.editDialog.getByRole('button', { name: /^update character$/i }).click();
    await expect(this.editDialog).not.toBeVisible({ timeout: 10_000 });
  }

  async openAppearancesTab() {
    await expect(this.appearancesTab).toBeVisible({ timeout: 10_000 });
    await this.appearancesTab.click();
  }

  async expectAppearanceVisible(data: { scriptTitle: string; sceneRef: string; locationName?: string }) {
    await expect(this.page.getByText(data.scriptTitle, { exact: true }).first()).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText(data.sceneRef, { exact: true }).first()).toBeVisible({ timeout: 10_000 });

    if (data.locationName != null) {
      await expect(this.page.getByText(data.locationName, { exact: true }).first()).toBeVisible({ timeout: 10_000 });
    }
  }

  async reloadAndExpectLoaded(name: string) {
    await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    await this.expectLoaded(name);
  }
}
