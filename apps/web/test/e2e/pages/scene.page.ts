import { type Page, expect } from '@playwright/test';

import { BasePage } from './base.page';

export class ScenePage extends BasePage {
  private readonly editButton = this.page.getByRole('button', { name: /^edit scene$/i });
  private readonly editDialog = this.page.getByRole('dialog', { name: /^edit scene$/i });

  constructor(page: Page) {
    super(page);
  }

  private getHeading(heading: string) {
    return this.page.getByRole('heading', { name: heading, exact: true }).first();
  }

  private getSection(title: string) {
    return this.page
      .getByRole('heading', { name: new RegExp(`^${title}$`, 'i') })
      .locator('xpath=ancestor::*[contains(@class,"border-border") and contains(@class,"bg-card")][1]');
  }

  private async selectOption(fieldName: RegExp, optionLabel: string) {
    const select = this.editDialog.getByRole('combobox', { name: fieldName });

    await select.click({ force: true });
    await this.page.getByRole('option', { name: optionLabel, exact: true }).click();
  }

  private async selectOptionAfterLabel(label: string, optionLabel: string) {
    const select = this.editDialog
      .getByText(new RegExp(`^${label}$`, 'i'))
      .locator('xpath=following::*[@role="combobox"][1]');

    await select.click({ force: true });
    await this.page.getByRole('option', { name: optionLabel, exact: true }).click();
  }

  private async addMultiSelectOption(fieldName: RegExp, optionLabel: string) {
    const select = this.editDialog.getByRole('combobox', { name: fieldName });

    await select.click({ force: true });
    await this.page.getByRole('option', { name: optionLabel, exact: true }).click({ force: true });
  }

  async expectLoaded(data: { heading: string; sceneNumber: number; scriptName?: string }) {
    await expect(this.getHeading(data.heading)).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText(`Scene #${data.sceneNumber}`, { exact: true })).toBeVisible({ timeout: 10_000 });

    if (data.scriptName != null) {
      await expect(this.page.getByText(data.scriptName, { exact: true })).toBeVisible({ timeout: 10_000 });
    }
  }

  async updateLinkedEntities(data: {
    locationName: string;
    beatDescription: string;
    characterName: string;
    propName: string;
  }) {
    await expect(this.editButton).toBeVisible({ timeout: 10_000 });
    await this.editButton.click();
    await expect(this.editDialog).toBeVisible({ timeout: 10_000 });

    await this.selectOptionAfterLabel('Location', data.locationName);
    await this.editDialog.getByLabel(/^scene beats$/i).fill(data.beatDescription);
    await this.editDialog.getByRole('button', { name: /^add$/i }).click();
    await this.addMultiSelectOption(/^characters in scene$/i, data.characterName);
    await this.addMultiSelectOption(/^props in scene$/i, data.propName);

    await this.editDialog.getByRole('button', { name: /^update scene$/i }).click();
    await expect(this.editDialog).not.toBeVisible({ timeout: 10_000 });
  }

  async expectLocationVisible(locationName: string) {
    const locationCard = this.getSection('Location');

    await expect(locationCard.getByText(locationName, { exact: true })).toBeVisible({ timeout: 10_000 });
  }

  async expectBeatVisible(beatDescription: string) {
    const beatsCard = this.getSection('Scene Beats');

    await expect(beatsCard.getByText(beatDescription, { exact: true })).toBeVisible({ timeout: 10_000 });
  }

  async expectCharacterVisible(characterName: string) {
    const charactersCard = this.getSection('Characters Present');

    await expect(charactersCard.getByText(characterName, { exact: true })).toBeVisible({ timeout: 10_000 });
  }

  async expectPropVisible(propName: string) {
    const productionCard = this.getSection('Production Details');

    await expect(productionCard.getByText(propName, { exact: true })).toBeVisible({ timeout: 10_000 });
  }

  async expectStoryNotes(text: string) {
    const notesCard = this.getSection("Director's Notes");

    await expect(notesCard.getByText(text, { exact: false })).toBeVisible({ timeout: 10_000 });
  }
}
