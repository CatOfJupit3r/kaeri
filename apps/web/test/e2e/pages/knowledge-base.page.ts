import { type Page, expect } from '@playwright/test';

import { BasePage } from './base.page';

function escapeRegExp(value: string) {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class KnowledgeBasePage extends BasePage {
  private readonly pageHeading = this.page.getByRole('heading', { name: /^knowledge base$/i });
  private readonly searchInput = this.page.getByPlaceholder('Search all knowledge base entities...');
  private readonly viewModeToggle = this.page.getByRole('button', { name: /toggle view mode/i });
  private readonly newCharacterButton = this.page.getByRole('button', { name: /^new character$/i }).first();
  private readonly createCharacterDialog = this.page.getByRole('dialog', { name: /^create character$/i });
  private readonly deleteCharacterDialog = this.page.getByRole('alertdialog', { name: /^delete character$/i });
  private readonly newLocationButton = this.page.getByRole('button', { name: /^new location$/i }).first();
  private readonly createLocationDialog = this.page.getByRole('dialog', { name: /^create location$/i });
  private readonly deleteLocationDialog = this.page.getByRole('alertdialog', { name: /^delete location$/i });
  private readonly editLocationHeading = this.page.getByRole('heading', { name: /^edit location$/i });
  private readonly editLocationBackButton = this.page.getByRole('button', { name: /^back$/i }).first();
  private readonly newPropButton = this.page.getByRole('button', { name: /^new prop$/i }).first();
  private readonly createPropDialog = this.page.getByRole('dialog', { name: /^create prop$/i });
  private readonly deletePropDialog = this.page.getByRole('alertdialog', { name: /^delete prop$/i });
  private readonly editPropHeading = this.page.getByRole('heading', { name: /^edit prop$/i });
  private readonly editPropBackButton = this.page.getByRole('button', { name: /^back$/i }).first();

  constructor(page: Page) {
    super(page);
  }

  private getTab(label: string) {
    return this.page.getByRole('tab', { name: new RegExp(`^${escapeRegExp(label)}$`, 'i') }).first();
  }

  private getCharacterCard(name: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`^open character ${escapeRegExp(name)}$`, 'i'),
    });
  }

  private getDeleteCharacterButton(name: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`^delete ${escapeRegExp(name)}$`, 'i'),
    });
  }

  private getSearchResult(name: string) {
    return this.page.getByRole('button', { name: new RegExp(escapeRegExp(name), 'i') }).first();
  }

  private getLocationHeading(name: string) {
    return this.page.getByRole('heading', { name, exact: true }).first();
  }

  private getEditLocationButton(name: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`^edit ${escapeRegExp(name)}$`, 'i'),
    });
  }

  private getDeleteLocationButton(name: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`^delete ${escapeRegExp(name)}$`, 'i'),
    });
  }

  private getPropHeading(name: string) {
    return this.page.getByRole('heading', { name, exact: true }).first();
  }

  private getEditPropButton(name: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`^edit ${escapeRegExp(name)}$`, 'i'),
    });
  }

  private getDeletePropButton(name: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`^delete ${escapeRegExp(name)}$`, 'i'),
    });
  }

  async navigateToKnowledgeBase(seriesId: string, search = '') {
    await this.goto(`/series/${seriesId}/knowledge-base${search}`);
    await this.expectLoaded();
  }

  async navigateToKnowledgeBaseFromCurrentSeries(search = '') {
    const match = /\/series\/([^/]+)/.exec(this.page.url());

    if (match == null) {
      throw new Error(`Cannot derive seriesId from current URL: ${this.page.url()}`);
    }

    await this.navigateToKnowledgeBase(match[1], search);
  }

  async expectLoaded() {
    await this.waitForNetworkIdle();
    await expect(this.pageHeading).toBeVisible({ timeout: 10_000 });
    await expect(this.searchInput).toBeVisible({ timeout: 10_000 });
    await expect(this.getTab('All')).toBeVisible({ timeout: 10_000 });
  }

  async switchTab(label: string) {
    await this.getTab(label).click();
    await this.expectActiveTab(label);
  }

  async expectActiveTab(label: string) {
    await expect(this.getTab(label)).toHaveAttribute('data-state', 'active', { timeout: 10_000 });
  }

  async expectViewModePressed(pressed: boolean) {
    await expect(this.viewModeToggle).toHaveAttribute('aria-pressed', pressed ? 'true' : 'false', {
      timeout: 10_000,
    });
  }

  async toggleViewMode() {
    await expect(this.viewModeToggle).toBeVisible({ timeout: 10_000 });
    await this.viewModeToggle.click();
  }

  async createCharacter(data: { name: string; description?: string }) {
    await expect(this.newCharacterButton).toBeVisible({ timeout: 10_000 });
    await this.newCharacterButton.click();
    await expect(this.createCharacterDialog).toBeVisible({ timeout: 10_000 });
    await this.createCharacterDialog.getByLabel(/^name$/i).fill(data.name);

    if (data.description != null) {
      await this.createCharacterDialog.getByLabel(/^description$/i).fill(data.description);
    }

    await this.createCharacterDialog.getByRole('button', { name: /^create character$/i }).click();
    await expect(this.createCharacterDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectCharacterVisible(data.name);
  }

  async expectCharacterVisible(name: string) {
    await expect(this.getCharacterCard(name)).toBeVisible({ timeout: 10_000 });
  }

  async expectCharacterNotVisible(name: string) {
    await expect(this.getCharacterCard(name)).toHaveCount(0, { timeout: 10_000 });
  }

  async openCharacter(name: string) {
    await this.getCharacterCard(name).focus();
    await this.page.keyboard.press('Enter');
    await expect(this.page).toHaveURL(/\/knowledge-base\/characters\/[^/]+(?:\?.*)?$/, { timeout: 10_000 });
  }

  async deleteCharacter(name: string) {
    await this.getDeleteCharacterButton(name).click();
    await expect(this.deleteCharacterDialog).toBeVisible({ timeout: 10_000 });
    await this.deleteCharacterDialog.getByRole('button', { name: /^delete$/i, exact: true }).click();
    await expect(this.deleteCharacterDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectCharacterNotVisible(name);
  }

  async createLocation(data: { name: string; description?: string }) {
    await expect(this.newLocationButton).toBeVisible({ timeout: 10_000 });
    await this.newLocationButton.click();
    await expect(this.createLocationDialog).toBeVisible({ timeout: 10_000 });
    await this.createLocationDialog.getByLabel(/^name$/i).fill(data.name);

    if (data.description != null) {
      await this.createLocationDialog.getByLabel(/^description$/i).fill(data.description);
    }

    await this.createLocationDialog.getByRole('button', { name: /^create location$/i }).click();
    await expect(this.createLocationDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectLocationVisible(data.name);
  }

  async expectLocationVisible(name: string) {
    await expect(this.getLocationHeading(name)).toBeVisible({ timeout: 10_000 });
  }

  async expectLocationNotVisible(name: string) {
    await expect(this.getLocationHeading(name)).toHaveCount(0, { timeout: 10_000 });
  }

  async openLocationForEdit(name: string) {
    await this.getEditLocationButton(name).click();
    await expect(this.editLocationHeading).toBeVisible({ timeout: 10_000 });
  }

  async updateLocationDescription(text: string) {
    const descriptionField = this.page.getByLabel(/^description$/i);

    await expect(descriptionField).toBeVisible({ timeout: 10_000 });
    await descriptionField.fill(text);
    await descriptionField.press('Tab');
    await this.waitForNetworkIdle();
  }

  async closeLocationEditPanel() {
    await expect(this.editLocationBackButton).toBeVisible({ timeout: 10_000 });
    await this.editLocationBackButton.click();
    await expect(this.editLocationHeading).toHaveCount(0, { timeout: 10_000 });
  }

  async deleteLocation(name: string) {
    await this.getDeleteLocationButton(name).click();
    await expect(this.deleteLocationDialog).toBeVisible({ timeout: 10_000 });
    await this.deleteLocationDialog.getByRole('button', { name: /^delete$/i, exact: true }).click();
    await expect(this.deleteLocationDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectLocationNotVisible(name);
  }

  async createProp(data: { name: string; description?: string }) {
    await expect(this.newPropButton).toBeVisible({ timeout: 10_000 });
    await this.newPropButton.click();
    await expect(this.createPropDialog).toBeVisible({ timeout: 10_000 });
    await this.createPropDialog.getByLabel(/^name$/i).fill(data.name);

    if (data.description != null) {
      await this.createPropDialog.getByLabel(/^description$/i).fill(data.description);
    }

    await this.createPropDialog.getByRole('button', { name: /^create prop$/i }).click();
    await expect(this.createPropDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectPropVisible(data.name);
  }

  async expectPropVisible(name: string) {
    await expect(this.getPropHeading(name)).toBeVisible({ timeout: 10_000 });
  }

  async expectPropNotVisible(name: string) {
    await expect(this.getPropHeading(name)).toHaveCount(0, { timeout: 10_000 });
  }

  async openPropForEdit(name: string) {
    await this.getEditPropButton(name).click();
    await expect(this.editPropHeading).toBeVisible({ timeout: 10_000 });
  }

  async updatePropDescription(text: string) {
    const descriptionField = this.page.getByLabel(/^description$/i);

    await expect(descriptionField).toBeVisible({ timeout: 10_000 });
    await descriptionField.fill(text);
    await descriptionField.press('Tab');
    await this.waitForNetworkIdle();
  }

  async closePropEditPanel() {
    await expect(this.editPropBackButton).toBeVisible({ timeout: 10_000 });
    await this.editPropBackButton.click();
    await expect(this.editPropHeading).toHaveCount(0, { timeout: 10_000 });
  }

  async deleteProp(name: string) {
    await this.getDeletePropButton(name).click();
    await expect(this.deletePropDialog).toBeVisible({ timeout: 10_000 });
    await this.deletePropDialog.getByRole('button', { name: /^delete$/i, exact: true }).click();
    await expect(this.deletePropDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectPropNotVisible(name);
  }

  async searchForEntity(query: string) {
    await expect(this.searchInput).toBeVisible({ timeout: 10_000 });
    await this.searchInput.fill(query);
  }

  async expectSearchResultVisible(name: string) {
    await expect(this.getSearchResult(name)).toBeVisible({ timeout: 10_000 });
  }

  async clickSearchResult(name: string) {
    await this.getSearchResult(name).click();
  }
}
