import { type Page, type Route, expect } from '@playwright/test';

import { BasePage } from './base.page';

export class ScriptEditorPage extends BasePage {
  private readonly fileMenuButton = this.page.getByRole('button', { name: 'File' });
  private readonly blockTypeSelector = this.page.getByTestId('block-type-selector');
  private readonly editorContainer = this.page.getByTestId('script-editor');
  private readonly editor = this.page.locator('.script-editor-content').first();
  private readonly scriptBlocks = this.page.getByTestId('block');
  private readonly knowledgeBasePanel = this.page.getByTestId('knowledge-base-panel');
  private readonly knowledgeBaseSearchInput = this.page.getByRole('textbox', { name: /search knowledge base/i });
  private readonly saveIndicator = this.page.getByTestId('save-indicator');
  private readonly saveMenuItem = this.page.getByRole('menuitem', { name: /^save$/i });

  constructor(page: Page) {
    super(page);
  }

  async expectLoaded() {
    await expect(this.fileMenuButton).toBeVisible({ timeout: 20_000 });
    await expect(this.editorContainer).toBeVisible({ timeout: 20_000 });
    await expect(this.editor).toBeVisible({ timeout: 20_000 });
    await expect(this.knowledgeBaseSearchInput).toBeVisible({ timeout: 20_000 });
    await expect(this.saveIndicator).toBeVisible({ timeout: 20_000 });
  }

  async expectSplitLayout() {
    await expect(this.editorContainer).toBeVisible({ timeout: 10_000 });
    await expect(this.knowledgeBasePanel).toBeVisible({ timeout: 10_000 });
  }

  async expectDefaultBlock(expectedBlockType = 'scene-heading') {
    await this.expectCurrentBlockType(expectedBlockType);
  }

  async expectCurrentBlockType(expectedBlockType: string) {
    const blockCount = await this.scriptBlocks.count();

    expect(blockCount).toBeGreaterThan(0);
    await expect(this.scriptBlocks.first()).toHaveAttribute('data-block-type', expectedBlockType, { timeout: 10_000 });
  }

  async expectBlockCount(expectedCount: number) {
    await expect(this.scriptBlocks).toHaveCount(expectedCount, { timeout: 10_000 });
  }

  async expectBlockTypeAt(index: number, expectedBlockType: string) {
    await expect(this.scriptBlocks.nth(index)).toHaveAttribute('data-block-type', expectedBlockType, {
      timeout: 10_000,
    });
  }

  async type(text: string) {
    await expect(this.editor).toBeVisible({ timeout: 10_000 });

    await this.editor.click();
    await this.page.keyboard.type(text);
  }

  async changeCurrentBlockTypeFromToolbar(
    nextBlockType: 'action' | 'character' | 'dialogue' | 'parenthetical' | 'scene-heading' | 'transition',
  ) {
    await this.editor.click();
    await expect(this.blockTypeSelector).toBeVisible({ timeout: 5_000 });
    await this.blockTypeSelector.click();
    await this.page.getByTestId(`block-type-option-${nextBlockType}`).click();
    await this.expectCurrentBlockType(nextBlockType);
  }

  async cycleCurrentBlockTypeWithTab(
    nextBlockType: 'action' | 'character' | 'dialogue' | 'parenthetical' | 'scene-heading' | 'transition',
  ) {
    await this.editor.click();
    await this.page.keyboard.press('Tab');
    await this.expectCurrentBlockType(nextBlockType);
  }

  async pressEnterAndExpectNextBlock(nextBlockType: string) {
    await this.editor.click();
    await this.page.keyboard.press('Enter');
    await this.expectBlockCount(2);
    await this.expectBlockTypeAt(1, nextBlockType);
  }

  async saveAndExpectIndicatorCycle() {
    let delayedRequest = false;
    const delaySaveRequest = async (route: Route) => {
      const request = route.request();

      if (!delayedRequest && request.method() === 'POST' && ['fetch', 'xhr'].includes(request.resourceType())) {
        delayedRequest = true;
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(undefined);
          }, 750);
        });
      }

      await route.continue();
    };

    await this.page.route('**', delaySaveRequest);

    try {
      await this.fileMenuButton.click();
      await expect(this.saveMenuItem).toBeVisible({ timeout: 5_000 });

      await this.saveMenuItem.click();
      await expect(this.saveIndicator).toContainText(/saving/i, { timeout: 5_000 });
      await expect(this.saveIndicator).toContainText(/saved/i, { timeout: 10_000 });
    } finally {
      await this.page.unroute('**', delaySaveRequest);
    }
  }

  async typeAndSave(text: string) {
    await this.type(text);
    await this.saveAndExpectIndicatorCycle();
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
