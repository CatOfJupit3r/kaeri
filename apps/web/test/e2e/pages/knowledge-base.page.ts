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
  private readonly newThemeButton = this.page.getByRole('button', { name: /^new theme$/i }).first();
  private readonly createThemeDialog = this.page.getByRole('dialog', { name: /^create theme$/i });
  private readonly deleteThemeDialog = this.page.getByRole('alertdialog', { name: /^delete theme$/i });
  private readonly editThemeHeading = this.page.getByRole('heading', { name: /^edit theme$/i });
  private readonly editThemeBackButton = this.page.getByRole('button', { name: /^back$/i }).first();
  private readonly newWildcardButton = this.page.getByRole('button', { name: /^new wild card$/i }).first();
  private readonly createWildcardDialog = this.page.getByRole('dialog', { name: /^create wild card$/i });
  private readonly editWildcardDialog = this.page.getByRole('dialog', { name: /^edit wild card$/i });
  private readonly deleteWildcardDialog = this.page.getByRole('alertdialog', { name: /^delete wild card$/i });
  private readonly newTimelineButton = this.page.getByRole('button', { name: /^new timeline entry$/i }).first();
  private readonly createTimelineDialog = this.page.getByRole('dialog', { name: /^create timeline entry$/i });
  private readonly editTimelineDialog = this.page.getByRole('dialog', { name: /^edit timeline entry$/i });
  private readonly deleteTimelineDialog = this.page.getByRole('alertdialog', { name: /^delete timeline entry$/i });
  private readonly newResearchButton = this.page.getByRole('button', { name: /^new research$/i }).first();
  private readonly createResearchDialog = this.page.getByRole('dialog', { name: /^new research entry$/i });
  private readonly editResearchHeading = this.page.getByRole('heading', { name: /^edit research$/i });
  private readonly deleteResearchDialog = this.page.getByRole('alertdialog', { name: /^delete research entry$/i });

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

  private getThemeCard(name: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`^open theme ${escapeRegExp(name)}$`, 'i'),
    });
  }

  private getEditThemeButton(name: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`^edit ${escapeRegExp(name)}$`, 'i'),
    });
  }

  private getDeleteThemeButton(name: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`^delete ${escapeRegExp(name)}$`, 'i'),
    });
  }

  private getWildcardHeading(title: string) {
    return this.page.getByRole('heading', { name: title, exact: true }).first();
  }

  private getEditWildcardButton(title: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`^edit ${escapeRegExp(title)}$`, 'i'),
    });
  }

  private getDeleteWildcardButton(title: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`^delete ${escapeRegExp(title)}$`, 'i'),
    });
  }

  private getTimelineEntryCard(label: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`^open timeline entry ${escapeRegExp(label)}$`, 'i'),
    });
  }

  private getEditTimelineButton(label: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`^edit ${escapeRegExp(label)}$`, 'i'),
    });
  }

  private getDeleteTimelineButton(label: string) {
    return this.page.getByRole('button', {
      name: new RegExp(`^delete ${escapeRegExp(label)}$`, 'i'),
    });
  }

  private getResearchHeading(title: string) {
    return this.page.getByRole('heading', { name: title, exact: true }).first();
  }

  private getResearchCard(title: string) {
    return this.getResearchHeading(title).locator('xpath=ancestor::div[contains(@class,"flex flex-col gap-3")][1]');
  }

  private getDeleteResearchButton(title: string) {
    return this.getResearchCard(title).getByRole('button').nth(1);
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

  async createTheme(data: { name: string; description?: string }) {
    await expect(this.newThemeButton).toBeVisible({ timeout: 10_000 });
    await this.newThemeButton.click();
    await expect(this.createThemeDialog).toBeVisible({ timeout: 10_000 });
    await this.createThemeDialog.getByLabel(/^theme name$/i).fill(data.name);

    if (data.description != null) {
      await this.createThemeDialog.getByLabel(/^description$/i).fill(data.description);
    }

    await this.createThemeDialog.getByRole('button', { name: /^create theme$/i }).click();
    await expect(this.createThemeDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectThemeVisible(data.name);
  }

  async expectThemeVisible(name: string) {
    await expect(this.getThemeCard(name)).toBeVisible({ timeout: 10_000 });
  }

  async expectThemeNotVisible(name: string) {
    await expect(this.getThemeCard(name)).toHaveCount(0, { timeout: 10_000 });
  }

  async openThemeForEdit(name: string) {
    await this.getEditThemeButton(name).click();
    await expect(this.editThemeHeading).toBeVisible({ timeout: 10_000 });
  }

  async updateThemeDescription(text: string) {
    const descriptionField = this.page.getByLabel(/^description$/i);

    await expect(descriptionField).toBeVisible({ timeout: 10_000 });
    await descriptionField.fill(text);
    await descriptionField.press('Tab');
    await this.waitForNetworkIdle();
  }

  async closeThemeEditPanel() {
    await expect(this.editThemeBackButton).toBeVisible({ timeout: 10_000 });
    await this.editThemeBackButton.click();
    await expect(this.editThemeHeading).toHaveCount(0, { timeout: 10_000 });
  }

  async deleteTheme(name: string) {
    await this.getDeleteThemeButton(name).click();
    await expect(this.deleteThemeDialog).toBeVisible({ timeout: 10_000 });
    await this.deleteThemeDialog.getByRole('button', { name: /^delete$/i, exact: true }).click();
    await expect(this.deleteThemeDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectThemeNotVisible(name);
  }

  async createWildcard(data: { title: string; body?: string; tag?: string }) {
    await expect(this.newWildcardButton).toBeVisible({ timeout: 10_000 });
    await this.newWildcardButton.click();
    await expect(this.createWildcardDialog).toBeVisible({ timeout: 10_000 });
    await this.createWildcardDialog.getByLabel(/^title$/i).fill(data.title);

    if (data.tag != null) {
      await this.createWildcardDialog.getByLabel(/^tag$/i).fill(data.tag);
    }

    if (data.body != null) {
      await this.createWildcardDialog.getByLabel(/^content$/i).fill(data.body);
    }

    await this.createWildcardDialog.getByRole('button', { name: /^create wild card$/i }).click();
    await expect(this.createWildcardDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectWildcardVisible(data.title);
  }

  async expectWildcardVisible(title: string) {
    await expect(this.getWildcardHeading(title)).toBeVisible({ timeout: 10_000 });
  }

  async expectWildcardNotVisible(title: string) {
    await expect(this.getWildcardHeading(title)).toHaveCount(0, { timeout: 10_000 });
  }

  async openWildcardForEdit(title: string) {
    await this.getEditWildcardButton(title).click();
    await expect(this.editWildcardDialog).toBeVisible({ timeout: 10_000 });
  }

  async updateWildcardContent(text: string) {
    const contentField = this.editWildcardDialog.getByLabel(/^content$/i);

    await expect(contentField).toBeVisible({ timeout: 10_000 });
    await contentField.fill(text);
    await this.editWildcardDialog.getByRole('button', { name: /^update wild card$/i }).click();
    await expect(this.editWildcardDialog).not.toBeVisible({ timeout: 10_000 });
  }

  async deleteWildcard(title: string) {
    await this.getDeleteWildcardButton(title).click();
    await expect(this.deleteWildcardDialog).toBeVisible({ timeout: 10_000 });
    await this.deleteWildcardDialog.getByRole('button', { name: /^delete$/i, exact: true }).click();
    await expect(this.deleteWildcardDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectWildcardNotVisible(title);
  }

  async createTimelineEntry(data: { label: string; date?: string }) {
    await expect(this.newTimelineButton).toBeVisible({ timeout: 10_000 });
    await this.newTimelineButton.click();
    await expect(this.createTimelineDialog).toBeVisible({ timeout: 10_000 });
    await this.createTimelineDialog.getByLabel(/^label$/i).fill(data.label);

    if (data.date != null) {
      await this.createTimelineDialog.getByLabel(/^date$/i).fill(data.date);
    }

    await this.createTimelineDialog.getByRole('button', { name: /^create entry$/i }).click();
    await expect(this.createTimelineDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectTimelineEntryVisible(data.label);
  }

  async expectTimelineEntryVisible(label: string) {
    await expect(this.getTimelineEntryCard(label)).toBeVisible({ timeout: 10_000 });
  }

  async expectTimelineEntryNotVisible(label: string) {
    await expect(this.getTimelineEntryCard(label)).toHaveCount(0, { timeout: 10_000 });
  }

  async openTimelineEntryForEdit(label: string) {
    await this.getEditTimelineButton(label).click();
    await expect(this.editTimelineDialog).toBeVisible({ timeout: 10_000 });
  }

  async updateTimelineEntryLabel(text: string) {
    const labelField = this.editTimelineDialog.getByLabel(/^label$/i);

    await expect(labelField).toBeVisible({ timeout: 10_000 });
    await labelField.fill(text);
    await this.editTimelineDialog.getByRole('button', { name: /^update entry$/i }).click();
    await expect(this.editTimelineDialog).not.toBeVisible({ timeout: 10_000 });
  }

  async deleteTimelineEntry(label: string) {
    await this.getDeleteTimelineButton(label).click();
    await expect(this.deleteTimelineDialog).toBeVisible({ timeout: 10_000 });
    await this.deleteTimelineDialog.getByRole('button', { name: /^delete$/i, exact: true }).click();
    await expect(this.deleteTimelineDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectTimelineEntryNotVisible(label);
  }

  async createResearch(data: { title: string; content?: string; tags?: string }) {
    await expect(this.newResearchButton).toBeVisible({ timeout: 10_000 });
    await this.newResearchButton.click();
    await expect(this.createResearchDialog).toBeVisible({ timeout: 10_000 });
    await this.createResearchDialog.getByLabel(/^title$/i).fill(data.title);

    if (data.content != null) {
      await this.createResearchDialog.getByLabel(/^content \(markdown\)$/i).fill(data.content);
    }

    if (data.tags != null) {
      await this.createResearchDialog.getByLabel(/^tags \(comma-separated\)$/i).fill(data.tags);
    }

    await this.createResearchDialog.getByRole('button', { name: /^create$/i }).click();
    await expect(this.createResearchDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectResearchVisible(data.title);
  }

  async expectResearchVisible(title: string) {
    await expect(this.getResearchHeading(title)).toBeVisible({ timeout: 10_000 });
  }

  async expectResearchNotVisible(title: string) {
    await expect(this.getResearchHeading(title)).toHaveCount(0, { timeout: 10_000 });
  }

  async openResearchForEdit(title: string) {
    await this.getResearchHeading(title).click();
    await expect(this.editResearchHeading).toBeVisible({ timeout: 10_000 });
  }

  async updateResearchContent(text: string) {
    const contentField = this.page.getByLabel(/^content \(markdown\)$/i);

    await expect(contentField).toBeVisible({ timeout: 10_000 });
    await contentField.fill(text);
    await this.page.getByRole('button', { name: /^save changes$/i }).click();
    await expect(this.editResearchHeading).toHaveCount(0, { timeout: 10_000 });
  }

  async deleteResearch(title: string) {
    await this.getDeleteResearchButton(title).click();
    await expect(this.deleteResearchDialog).toBeVisible({ timeout: 10_000 });
    await this.deleteResearchDialog.getByRole('button', { name: /^delete$/i, exact: true }).click();
    await expect(this.deleteResearchDialog).not.toBeVisible({ timeout: 10_000 });
    await this.expectResearchNotVisible(title);
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
