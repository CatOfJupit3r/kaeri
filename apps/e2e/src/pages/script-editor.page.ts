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
  // Locators - TipTap editor uses .ProseMirror contenteditable
  private readonly editorContainer = this.page.locator(".ProseMirror");
  private readonly blocksList = this.editorContainer.locator("[data-block-type]");
  private readonly addBlockButtons = this.page.locator(
    'button:has-text("Add block:")',
  ).locator('..').locator('button');
  private readonly saveIndicator = this.page.locator(
    '[data-testid="save-indicator"], :text("Saved"), :text("saving")',
  );
  private readonly saveButton = this.page.locator('button:has-text("Save")');
  // KB panel is the "Knowledge" tab content in the right panel
  private readonly kbPanel = this.page.locator('[value="knowledge"]').locator('..').locator('..').locator('[role="tabpanel"]');
  private readonly knowledgeTab = this.page.getByRole("tab", { name: "Knowledge" });
  private readonly autocompleteDropdown = this.page.locator(
    '.tippy-content, [data-tippy-root]',
  );

  // Block locators
  private block(index: number): Locator {
    return this.blocksList.nth(index);
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
  async focusEditor(): Promise<void> {
    await this.editorContainer.click();
  }

  async focusBlock(index: number): Promise<void> {
    await this.block(index).click();
  }

  async typeInBlock(index: number, text: string): Promise<void> {
    await this.focusBlock(index);
    await this.page.keyboard.type(text);
  }

  async typeInEditor(text: string): Promise<void> {
    await this.editorContainer.pressSequentially(text);
  }

  async appendToBlock(index: number, text: string): Promise<void> {
    await this.focusBlock(index);
    await this.page.keyboard.press("End");
    await this.page.keyboard.type(text);
  }

  async changeBlockType(blockIndex: number, type: BlockType): Promise<void> {
    await this.focusBlock(blockIndex);
    // Use Ctrl+number shortcut for block type
    const typeMap: Record<BlockType, string> = {
      "scene-heading": "1",
      "action": "2",
      "character": "3",
      "dialogue": "4",
      "parenthetical": "5",
      "transition": "6",
    };
    await this.page.keyboard.press(`Control+${typeMap[type]}`);
  }

  async addBlock(type: BlockType = "action"): Promise<void> {
    // Click the specific block type button in the "Add block" strip
    const buttonSelector = this.page.locator(
      `button:has-text("${type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")}")`
    ).first();
    if (await buttonSelector.isVisible({ timeout: 1000 })) {
      await buttonSelector.click();
    } else {
      // Fallback: press Enter in editor to create new block
      await this.focusEditor();
      await this.page.keyboard.press("End");
      await this.page.keyboard.press("Enter");
    }
  }

  async deleteBlock(index: number): Promise<void> {
    await this.focusBlock(index);
    // Select all and delete
    await this.page.keyboard.press("Control+a");
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

  async pressShiftTab(): Promise<void> {
    await this.page.keyboard.press("Shift+Tab");
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
    // Look for "Saving..." then wait for it to become "Saved X ago"
    // First wait for any pending save to complete
    await this.page.locator('text=/Saved .* ago|Saving/').waitFor({ state: 'visible', timeout: 15000 });
    // Then wait for "Saved" state (not "Saving")
    await this.page.locator('text=/Saved .* ago/').waitFor({ state: 'visible', timeout: 15000 });
  }

  // Assertions
  async expectBlockCount(count: number): Promise<void> {
    await expect(this.blocksList).toHaveCount(count);
  }

  async expectBlockText(index: number, text: string | RegExp): Promise<void> {
    const blockText = await this.block(index).innerText();
    if (typeof text === "string") {
      expect(blockText.trim()).toBe(text);
    } else {
      expect(blockText).toMatch(text);
    }
  }

  async expectBlockType(index: number, type: BlockType): Promise<void> {
    await expect(this.block(index)).toHaveAttribute("data-block-type", type);
  }

  async expectAutocompleteVisible(): Promise<void> {
    await expect(this.autocompleteDropdown).toBeVisible();
  }

  async expectKnowledgeBasePanelVisible(): Promise<void> {
    // Check if Knowledge tab is active or visible
    await expect(this.knowledgeTab).toBeVisible();
  }

  async expectEditorVisible(): Promise<void> {
    await expect(this.editorContainer).toBeVisible();
  }
}
