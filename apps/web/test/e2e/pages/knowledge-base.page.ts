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
