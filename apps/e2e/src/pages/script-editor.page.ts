import { type Locator, type Page, expect } from "@playwright/test";

import { BasePage } from "./base.page";

type BlockType =
  | "scene-heading"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition";

export class ScriptEditorPage extends BasePage {
  // Locators
  private readonly editorContainer = this.page.locator(
    '[data-testid="script-editor"]',
  );
  private readonly blocksList = this.editorContainer.locator(
    '[data-testid="block"]',
  );
  private readonly addBlockButton = this.page.locator(
    'button:has-text("Add Block")',
  );
  private readonly saveIndicator = this.page.locator(
    '[data-testid="save-indicator"]',
  );
  private readonly saveButton = this.page.locator('button:has-text("Save")');
  private readonly kbPanel = this.page.locator(
    '[data-testid="knowledge-base-panel"]',
  );
  private readonly autocompleteDropdown = this.page.locator(
    '[data-testid="autocomplete-dropdown"]',
  );

  // Block locators
  private block(index: number): Locator {
    return this.blocksList.nth(index);
  }

  private blockTextarea(index: number): Locator {
    return this.block(index).locator("textarea");
  }

  private blockTypeSelector(index: number): Locator {
    return this.block(index).locator('[data-testid="block-type-selector"]');
  }

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToScript(seriesId: string, scriptId: string): Promise<void> {
    await this.goto(`/series/${seriesId}/scripts/${scriptId}`);
    await this.waitForNetworkIdle();
  }

  // Block Actions
  async focusBlock(index: number): Promise<void> {
    await this.blockTextarea(index).click();
  }

  async typeInBlock(index: number, text: string): Promise<void> {
    await this.blockTextarea(index).fill(text);
  }

  async appendToBlock(index: number, text: string): Promise<void> {
    await this.blockTextarea(index).press("End");
    await this.blockTextarea(index).type(text);
  }

  async changeBlockType(index: number, type: BlockType): Promise<void> {
    await this.blockTypeSelector(index).click();
    await this.page.locator(`[data-block-type="${type}"]`).click();
  }

  async addBlock(): Promise<void> {
    await this.addBlockButton.click();
  }

  async deleteBlock(index: number): Promise<void> {
    await this.focusBlock(index);
    await this.blockTextarea(index).selectText();
    await this.page.keyboard.press("Backspace");
    await this.page.keyboard.press("Backspace"); // Second backspace deletes empty block
  }

  // Keyboard shortcuts
  async pressEnter(): Promise<void> {
    await this.page.keyboard.press("Enter");
  }

  async pressTab(): Promise<void> {
    await this.page.keyboard.press("Tab");
  }

  async pressShortcut(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  // Autocomplete
  async triggerAutocomplete(): Promise<void> {
    await this.page.keyboard.type("@");
  }

  async selectAutocompleteOption(name: string): Promise<void> {
    await this.autocompleteDropdown.locator(`text="${name}"`).click();
  }

  // Save
  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async waitForAutosave(): Promise<void> {
    await expect(this.saveIndicator).toContainText(/saved/i);
  }

  // Assertions
  async expectBlockCount(count: number): Promise<void> {
    await expect(this.blocksList).toHaveCount(count);
  }

  async expectBlockText(index: number, text: string | RegExp): Promise<void> {
    if (typeof text === "string") {
      await expect(this.blockTextarea(index)).toHaveValue(text);
    } else {
      const value = await this.blockTextarea(index).inputValue();
      expect(value).toMatch(text);
    }
  }

  async expectBlockType(index: number, type: BlockType): Promise<void> {
    await expect(this.block(index)).toHaveAttribute("data-block-type", type);
  }

  async expectAutocompleteVisible(): Promise<void> {
    await expect(this.autocompleteDropdown).toBeVisible();
  }

  async expectKnowledgeBasePanelVisible(): Promise<void> {
    await expect(this.kbPanel).toBeVisible();
  }
}
