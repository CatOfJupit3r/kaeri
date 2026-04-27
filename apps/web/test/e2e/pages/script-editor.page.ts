import { type Page, expect } from '@playwright/test';

import { BasePage } from './base.page';

export class ScriptEditorPage extends BasePage {
  private readonly fileMenuButton = this.page.getByRole('button', { name: 'File' });
  private readonly editor = this.page.locator('.script-editor-content').first();
  private readonly knowledgeBaseSearchInput = this.page.getByRole('textbox', { name: /search knowledge base/i });
  private readonly saveIndicator = this.page.getByTestId('save-indicator');
  private readonly saveMenuItem = this.page.getByRole('menuitem', { name: /^save$/i });

  constructor(page: Page) {
    super(page);
  }

  async expectLoaded() {
    await expect(this.fileMenuButton).toBeVisible({ timeout: 20_000 });
    await expect(this.editor).toBeVisible({ timeout: 20_000 });
    await expect(this.knowledgeBaseSearchInput).toBeVisible({ timeout: 20_000 });
  }

  async typeAndSave(text: string) {
    await expect(this.editor).toBeVisible({ timeout: 10_000 });

    await this.editor.click();
    await this.page.keyboard.type(text);

    await this.fileMenuButton.click();
    await expect(this.saveMenuItem).toBeVisible({ timeout: 5_000 });
    await this.saveMenuItem.click();
    await this.page.waitForTimeout(4_000);
    await this.reloadAndExpectLoaded();
    await this.expectContent(text);
    await expect(this.saveIndicator).toContainText(/saved/i, { timeout: 10_000 });
  }

  async expectContent(text: string) {
    await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: 10_000 });
  }

  async goToLibrary() {
    const match = /\/series\/([^/]+)\/scripts\/[^/]+$/.exec(this.page.url());

    if (match == null) {
      throw new Error(`Cannot derive seriesId from current editor URL: ${this.page.url()}`);
    }

    await this.goto(`/series/${match[1]}/scripts`);
  }

  async reloadAndExpectLoaded() {
    await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    await this.expectLoaded();
  }
}
