import { type Page, expect } from "@playwright/test";

import { BasePage } from "./base.page";

type EntityType =
  | "characters"
  | "locations"
  | "props"
  | "themes"
  | "timelines"
  | "wildcards";

export class KnowledgeBasePage extends BasePage {
  // Locators
  private readonly entityTabs = this.page.locator(
    '[data-testid="kb-entity-tabs"]',
  );
  private readonly entityList = this.page.locator(
    '[data-testid="entity-list"]',
  );
  private readonly searchInput = this.page.locator(
    'input[placeholder*="Search"]',
  );
  private readonly createButton = this.page.locator(
    'button:has-text("Create")',
  );
  private readonly entityCard = (name: string) =>
    this.page.locator(`[data-testid="entity-card"]:has-text("${name}")`);

  // Modal locators
  private readonly modal = this.page.locator('[role="dialog"]');
  private readonly nameInput = this.modal.locator('input[name="name"]');
  private readonly descriptionTextarea = this.modal.locator(
    'textarea[name="description"]',
  );
  private readonly saveButton = this.modal.locator('button:has-text("Save")');

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToKnowledgeBase(seriesId: string): Promise<void> {
    await this.goto(`/series/${seriesId}/knowledge-base`);
    await this.waitForNetworkIdle();
  }

  async switchTab(entityType: EntityType): Promise<void> {
    await this.entityTabs.locator(`[data-tab="${entityType}"]`).click();
  }

  // Actions
  async searchEntities(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300); // debounce
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click();
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
    await this.saveButton.click();
    await this.modal.waitFor({ state: "detached" });
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

  async expectEntityCount(count: number): Promise<void> {
    await expect(
      this.entityList.locator('[data-testid="entity-card"]'),
    ).toHaveCount(count);
  }

  async expectSearchResults(count: number): Promise<void> {
    await this.expectEntityCount(count);
  }
}
