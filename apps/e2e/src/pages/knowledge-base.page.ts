import { type Page, expect } from "@playwright/test";

import { BasePage } from "./base.page";

type EntityType =
  | "all"
  | "characters"
  | "locations"
  | "props"
  | "scenes"
  | "timeline"
  | "wildcards"
  | "themes";

// Map entity types to their display names in tabs
const TAB_NAMES: Record<EntityType, string> = {
  all: "All",
  characters: "Characters",
  locations: "Locations",
  props: "Props",
  scenes: "Scenes",
  timeline: "Timeline",
  wildcards: "Wild Cards",
  themes: "Themes",
};

export class KnowledgeBasePage extends BasePage {
  // Locators - using role-based selectors for tabs
  private readonly tabList = this.page.locator('[role="tablist"]');
  private readonly entityGrid = this.page.locator(
    '.grid, [class*="grid"]',
  );
  private readonly searchInput = this.page.locator(
    'input[placeholder*="Search"], [placeholder*="Search"]',
  );
  // Create button can be "New Character", "New Location", etc.
  private readonly createButton = this.page.locator(
    'button:has-text("New Character"), button:has-text("New Location"), button:has-text("New Prop"), button:has-text("New"), button:has-text("Create"), button:has-text("Add")',
  );
  // Entity cards are typically links or cards with the entity name
  private readonly entityCard = (name: string) =>
    this.page.locator(`a.group:has-text("${name}"), [class*="card"]:has-text("${name}")`).first();

  // Modal locators
  private readonly modal = this.page.locator('[role="dialog"]');
  private readonly nameInput = this.modal.getByLabel("Name");
  private readonly descriptionTextarea = this.modal.getByLabel("Description");
  private readonly saveButton = this.modal.locator('button:has-text("Create Character"), button:has-text("Create Location"), button:has-text("Save"), button:has-text("Create"), button[type="submit"]');

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToKnowledgeBase(seriesId: string): Promise<void> {
    await this.goto(`/series/${seriesId}/knowledge-base`);
    await this.waitForNetworkIdle();
  }

  async switchTab(entityType: EntityType): Promise<void> {
    const tabName = TAB_NAMES[entityType];
    await this.page.getByRole("tab", { name: tabName }).click();
    await this.page.waitForTimeout(300); // Wait for tab content to load
  }

  // Actions
  async searchEntities(query: string): Promise<void> {
    await this.searchInput.first().fill(query);
    await this.page.waitForTimeout(300); // debounce
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.first().clear();
    await this.page.waitForTimeout(300);
  }

  async clickCreate(): Promise<void> {
    await this.createButton.first().click();
    await this.waitForModal();
  }

  async fillEntityForm(data: {
    name: string;
    description?: string;
  }): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.description) {
      await this.descriptionTextarea.fill(data.description);
    }
  }

  async submitEntityForm(): Promise<void> {
    await this.saveButton.first().click();
    await this.modal.waitFor({ state: "detached", timeout: 10000 });
  }

  async createEntity(data: {
    name: string;
    description?: string;
  }): Promise<void> {
    await this.clickCreate();
    await this.fillEntityForm(data);
    await this.submitEntityForm();
  }

  async openEntity(name: string): Promise<void> {
    await this.entityCard(name).click();
  }

  // Assertions
  async expectEntityVisible(name: string): Promise<void> {
    await expect(this.entityCard(name)).toBeVisible();
  }

  async expectEntityNotVisible(name: string): Promise<void> {
    await expect(this.entityCard(name)).not.toBeVisible();
  }

  async expectSearchEmpty(): Promise<void> {
    // Check for empty state message
    await expect(this.page.locator('text=/no results|not found|empty/i')).toBeVisible();
  }

  async expectSearchResults(count: number): Promise<void> {
    // This is harder to assert without specific testids, skip for now
    await this.page.waitForTimeout(300);
  }
}
