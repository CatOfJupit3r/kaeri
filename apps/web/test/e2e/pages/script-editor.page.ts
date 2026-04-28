import { type Page, type Route, expect } from '@playwright/test';

import { BasePage } from './base.page';

const BLOCK_TYPE_LABELS = {
  action: 'Action',
  character: 'Character',
  dialogue: 'Dialogue',
  parenthetical: 'Parenthetical',
  'scene-heading': 'Scene Heading',
  transition: 'Transition',
} as const;

export class ScriptEditorPage extends BasePage {
  private readonly blockMenuTypeSelector = this.page.getByTestId('block-menu-type-selector');
  private readonly fileMenuButton = this.page.getByRole('button', { name: 'File' });
  private readonly breakdownMenuItem = this.page.getByRole('menuitem', { name: 'Breakdown...' });
  private readonly tableReadMenuItem = this.page.getByRole('menuitem', { name: 'Table Read...' });
  private readonly blockTypeSelector = this.page.getByTestId('block-type-selector');
  private readonly addBlockControls = this.page.getByTestId('add-block-controls');
  private readonly keyboardShortcutsToggle = this.page.getByTestId('keyboard-shortcuts-toggle');
  private readonly keyboardShortcutsPanel = this.page.getByTestId('keyboard-shortcuts-panel');
  private readonly keyboardShortcutsClose = this.page.getByTestId('keyboard-shortcuts-close');
  private readonly rightPanelToggle = this.page.getByTestId('right-panel-toggle');
  private readonly breakdownDialog = this.page.getByRole('dialog', { name: 'Script Breakdown' });
  private readonly exportDialog = this.page.getByRole('dialog', { name: 'Export Script' });
  private readonly settingsDialog = this.page.getByRole('dialog', { name: 'Script Settings' });
  private readonly tableReadDialog = this.page.getByRole('dialog', { name: 'Table Read' });
  private readonly backToCurrentButton = this.page.getByRole('button', { name: 'Back to current' });
  private readonly restorePreviewedVersionButton = this.page.getByRole('button', { name: 'Restore this version' });
  private readonly editorContainer = this.page.getByTestId('script-editor');
  private readonly editor = this.page.locator('.script-editor-content').first();
  private readonly scriptBlocks = this.page.getByTestId('block');
  private readonly canvasTab = this.page.getByRole('tab', { name: 'Canvas' });
  private readonly knowledgeTab = this.page.getByRole('tab', { name: 'Knowledge' });
  private readonly versionsTab = this.page.getByRole('tab', { name: 'Versions' });
  private readonly knowledgeBasePanel = this.page.getByTestId('knowledge-base-panel');
  private readonly canvasPanel = this.page.getByTestId('canvas-panel');
  private readonly versionsPanel = this.page.getByTestId('versions-panel');
  private readonly saveVersionButton = this.page.getByRole('button', { name: 'Save version' });
  private readonly knowledgeBaseSearchInput = this.page.getByRole('textbox', { name: /search knowledge base/i });
  private readonly saveIndicator = this.page.getByTestId('save-indicator');
  private readonly saveMenuItem = this.page.getByRole('menuitem', { name: /^save$/i });

  constructor(page: Page) {
    super(page);
  }

  async expectLoaded() {
    await expect(this.fileMenuButton).toBeVisible({ timeout: 20_000 });
    await expect(this.addBlockControls).toBeVisible({ timeout: 20_000 });
    await expect(this.rightPanelToggle).toBeVisible({ timeout: 20_000 });
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

  async expectToolbarCurrentBlockType(expectedLabel: string) {
    await expect(this.blockTypeSelector).toContainText(expectedLabel, { timeout: 10_000 });
  }

  async expectBlockCount(expectedCount: number) {
    await expect(this.scriptBlocks).toHaveCount(expectedCount, { timeout: 10_000 });
  }

  async expectBlockTypeAt(index: number, expectedBlockType: string) {
    await expect(this.scriptBlocks.nth(index)).toHaveAttribute('data-block-type', expectedBlockType, {
      timeout: 10_000,
    });
  }

  async expectBlockTextAt(index: number, text: string) {
    await expect(this.scriptBlocks.nth(index)).toContainText(text, { timeout: 10_000 });
  }

  async expectBlockDoesNotContainTextAt(index: number, text: string) {
    await expect(this.scriptBlocks.nth(index)).not.toContainText(text, { timeout: 10_000 });
  }

  async focusBlock(index: number) {
    await this.scriptBlocks.nth(index).click();
  }

  async focusBlockStart(index: number) {
    await this.focusBlock(index);
    await this.page.keyboard.press('Home');
  }

  async focusBlockEnd(index: number) {
    await this.focusBlock(index);
    await this.page.keyboard.press('End');
  }

  async type(text: string) {
    await expect(this.editor).toBeVisible({ timeout: 10_000 });

    await this.editor.click();
    await this.page.keyboard.type(text);
  }

  async typeAtCurrentSelection(text: string) {
    await this.page.keyboard.type(text);
  }

  async changeCurrentBlockTypeFromToolbar(
    nextBlockType: 'action' | 'character' | 'dialogue' | 'parenthetical' | 'scene-heading' | 'transition',
  ) {
    await this.editor.click();
    await expect(this.blockTypeSelector).toBeVisible({ timeout: 5_000 });
    await this.blockTypeSelector.click();
    await this.page.getByTestId(`block-type-option-${nextBlockType}`).click();
    await this.expectToolbarCurrentBlockType(BLOCK_TYPE_LABELS[nextBlockType]);
  }

  async changeCurrentBlockTypeFromBlockMenu(
    nextBlockType: 'action' | 'character' | 'dialogue' | 'parenthetical' | 'scene-heading' | 'transition',
  ) {
    await this.editor.click();
    await expect(this.blockMenuTypeSelector).toBeVisible({ timeout: 5_000 });
    await this.blockMenuTypeSelector.focus();
    await this.page.keyboard.press('Enter');
    await this.page.getByTestId(`block-menu-type-option-${nextBlockType}`).click();
    await this.expectToolbarCurrentBlockType(BLOCK_TYPE_LABELS[nextBlockType]);
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

  async pressBackspaceOnCurrentBlock() {
    await this.page.keyboard.press('Backspace');
  }

  async pressArrowUpAndExpectToolbarBlockType(expectedLabel: string) {
    await this.page.keyboard.press('ArrowUp');
    await this.expectToolbarCurrentBlockType(expectedLabel);
  }

  async pressArrowDownAndExpectToolbarBlockType(expectedLabel: string) {
    await this.page.keyboard.press('ArrowDown');
    await this.expectToolbarCurrentBlockType(expectedLabel);
  }

  async addBlockFromControls(
    blockType: 'action' | 'character' | 'dialogue' | 'parenthetical' | 'scene-heading' | 'transition',
  ) {
    await expect(this.addBlockControls).toBeVisible({ timeout: 5_000 });
    await this.page.getByTestId(`add-block-${blockType}`).click();
  }

  async openKeyboardShortcutsPanel() {
    await expect(this.keyboardShortcutsToggle).toBeVisible({ timeout: 5_000 });
    await this.keyboardShortcutsToggle.click();
    await expect(this.keyboardShortcutsPanel).toBeVisible({ timeout: 10_000 });
  }

  async closeKeyboardShortcutsPanel() {
    await expect(this.keyboardShortcutsClose).toBeVisible({ timeout: 5_000 });
    await this.keyboardShortcutsClose.click();
    await expect(this.keyboardShortcutsPanel).not.toBeVisible({ timeout: 10_000 });
  }

  async openExportWithShortcut() {
    await this.editor.click();
    await this.page.keyboard.press('Control+e');
    await expect(this.exportDialog).toBeVisible({ timeout: 10_000 });
  }

  async openSettingsWithShortcut() {
    await this.editor.click();
    await this.page.keyboard.press('Control+,');
    await expect(this.settingsDialog).toBeVisible({ timeout: 10_000 });
  }

  async closeOpenDialog() {
    await this.page.keyboard.press('Escape');
    await expect(
      this.exportDialog.or(this.settingsDialog).or(this.breakdownDialog).or(this.tableReadDialog),
    ).not.toBeVisible({ timeout: 10_000 });
  }

  async openBreakdownFromFileMenu() {
    await this.fileMenuButton.click();
    await expect(this.breakdownMenuItem).toBeVisible({ timeout: 5_000 });
    await this.breakdownMenuItem.click();
    await expect(this.breakdownDialog).toBeVisible({ timeout: 10_000 });
  }

  async openTableReadFromFileMenu() {
    await this.fileMenuButton.click();
    await expect(this.tableReadMenuItem).toBeVisible({ timeout: 5_000 });
    await this.tableReadMenuItem.click();
    await expect(this.tableReadDialog).toBeVisible({ timeout: 10_000 });
  }

  async collapseRightPanel() {
    await expect(this.rightPanelToggle).toBeVisible({ timeout: 5_000 });
    await this.rightPanelToggle.click();
    await expect(this.knowledgeBasePanel).not.toBeVisible({ timeout: 10_000 });
  }

  async expandRightPanel() {
    await expect(this.rightPanelToggle).toBeVisible({ timeout: 5_000 });
    await this.rightPanelToggle.click();
    await expect(this.knowledgeBasePanel).toBeVisible({ timeout: 10_000 });
  }

  async switchToCanvasPanel() {
    await this.canvasTab.click();
    await expect(this.canvasPanel).toBeVisible({ timeout: 10_000 });
  }

  async switchToKnowledgePanel() {
    await this.knowledgeTab.click();
    await expect(this.knowledgeBasePanel).toBeVisible({ timeout: 10_000 });
  }

  async switchToVersionsPanel() {
    await this.versionsTab.click();
    await expect(this.versionsPanel).toBeVisible({ timeout: 10_000 });
  }

  async saveVersion() {
    await expect(this.saveVersionButton).toBeVisible({ timeout: 10_000 });
    await this.saveVersionButton.click();
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
  }

  async expectVersionVisible(versionLabel: string) {
    const versionButton = this.page.getByRole('button', { name: new RegExp(versionLabel, 'i') }).first();

    await expect(versionButton).toBeVisible({ timeout: 10_000 });
  }

  async previewVersion(versionLabel: string) {
    const versionButton = this.page.getByRole('button', { name: new RegExp(versionLabel, 'i') }).first();

    await versionButton.click();
    await expect(this.backToCurrentButton).toBeVisible({ timeout: 10_000 });
  }

  async dismissVersionPreview() {
    await expect(this.backToCurrentButton).toBeVisible({ timeout: 10_000 });
    await this.backToCurrentButton.click();
    await expect(this.backToCurrentButton).not.toBeVisible({ timeout: 10_000 });
  }

  async restorePreviewedVersion() {
    await expect(this.restorePreviewedVersionButton).toBeVisible({ timeout: 10_000 });
    await this.restorePreviewedVersionButton.click();
    await expect(this.restorePreviewedVersionButton).not.toBeVisible({ timeout: 10_000 });
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
