import { type Page, expect } from "@playwright/test";

import { BasePage } from "./base.page";

export class SeriesPage extends BasePage {
  // Locators - Create/Edit Modal
  private readonly modal = this.page.locator('[role="dialog"]');
  private readonly titleInput = this.modal.getByLabel("Title");
  private readonly genreInput = this.modal.getByLabel("Genre");
  private readonly loglineTextarea = this.modal.getByLabel("Logline");
  private readonly createProjectButton = this.modal.getByRole("button", {
    name: "Create Project",
  });
  private readonly saveChangesButton = this.modal.getByRole("button", {
    name: "Save Changes",
  });

  // Locators - Series View
  private readonly seriesHeader = this.page.locator(
    'div.border-b-4.bg-card, [class*="border-b-4"][class*="bg-card"]',
  );
  // Tab navigation is via links, not data-tab attributes
  private readonly scriptsTab = this.page.getByRole("link", {
    name: "Scripts",
  });
  private readonly knowledgeBaseTab = this.page.getByRole("link", {
    name: "Knowledge Base",
  });
  private readonly canvasTab = this.page.getByRole("link", { name: "Canvas" });
  private readonly analyticsTab = this.page.getByRole("link", {
    name: "Analytics",
  });
  private readonly createScriptButton = this.page.getByRole("button", {
    name: "New Script",
  });
  private readonly scriptsList = this.page.locator(
    '[data-testid="scripts-list"]',
  );
  // Script cards are Links with h3 titles - use the group class as card container
  private readonly scriptCard = (name: string) =>
    this.page.locator(`a.group:has(h3:text-is("${name}"))`);

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToSeries(seriesId: string): Promise<void> {
    await this.goto(`/series/${seriesId}`);
    await this.waitForNetworkIdle();
  }

  // Modal Actions
  async fillSeriesForm(data: {
    title: string;
    genre?: string;
    logline?: string;
  }): Promise<void> {
    await this.titleInput.fill(data.title);
    if (data.genre) {
      await this.genreInput.fill(data.genre);
    }
    if (data.logline) {
      await this.loglineTextarea.fill(data.logline);
    }
  }

  async submitSeriesForm(): Promise<void> {
    // Wait for any form validation to settle
    await this.page.waitForTimeout(500);

    // Try Create Project button first, then Save Changes
    const createButton = this.createProjectButton;
    const saveButton = this.saveChangesButton;

    let targetButton = createButton;
    if (!(await createButton.isVisible())) {
      targetButton = saveButton;
    }

    // Ensure the button is visible and scroll into view
    await targetButton.scrollIntoViewIfNeeded();

    // Wait for button to be ready
    await expect(targetButton).toBeEnabled({ timeout: 5000 });

    // Set up waiting for the network request
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes("/rpc/series"),
      { timeout: 10000 },
    );

    // Click the submit button multiple times with different approaches
    await targetButton.dispatchEvent("click");

    try {
      // Wait for response
      const response = await responsePromise;
      console.log("Got response:", response.status(), await response.text());
    } catch {
      console.log("No network request made, trying different click");
      await targetButton.click({ force: true });
    }

    await this.modal.waitFor({ state: "detached", timeout: 15000 });
  }

  async clickSubmitButton(): Promise<void> {
    // Just click the submit button without waiting for modal to close
    const createButton = this.createProjectButton;
    const saveButton = this.saveChangesButton;

    if (await createButton.isVisible()) {
      await createButton.focus();
      await this.page.keyboard.press("Enter");
    } else {
      await saveButton.focus();
      await this.page.keyboard.press("Enter");
    }
    // Wait briefly for any validation to trigger
    await this.page.waitForTimeout(500);
  }

  async createSeries(data: {
    title: string;
    genre?: string;
    logline?: string;
  }): Promise<void> {
    await this.fillSeriesForm(data);
    await this.submitSeriesForm();
  }

  // Tab Navigation
  async goToScripts(): Promise<void> {
    await this.scriptsTab.click();
    await this.page.waitForURL(/\/scripts/);
  }

  async goToKnowledgeBase(): Promise<void> {
    await this.knowledgeBaseTab.click();
    await this.page.waitForURL(/\/knowledge-base/);
  }

  async goToCanvas(): Promise<void> {
    await this.canvasTab.click();
    await this.page.waitForURL(/\/canvas/);
  }

  async goToAnalytics(): Promise<void> {
    await this.analyticsTab.click();
    await this.page.waitForURL(/\/analytics/);
  }

  // Script Actions
  async clickCreateScript(): Promise<void> {
    await this.createScriptButton.click();
    // Creating a script navigates directly to the editor (no modal)
    await this.page.waitForURL(/\/scripts\/[a-f0-9]+/);
  }

  async openScript(name: string): Promise<void> {
    await this.scriptCard(name).click();
  }

  // Series Actions
  async editSeries(): Promise<void> {
    // Wait for the page to be fully loaded
    await this.page.waitForLoadState("networkidle");

    // The series header is a div with class containing "border-b-4" and "bg-card"
    // The settings button is the only dropdown inside the series header
    // Look for the button that triggers the dropdown with "Project Settings" menuitem

    // Target the series header specifically (has border-b-4 class and contains Projects button)
    const seriesHeader = this.page.locator(
      'div.border-b-4.bg-card, [class*="border-b-4"][class*="bg-card"]',
    );

    // Find the settings dropdown trigger within the series header
    const settingsButton = seriesHeader.locator(
      'button[data-slot="dropdown-menu-trigger"]:has(svg)',
    );

    if (await settingsButton.isVisible({ timeout: 5000 })) {
      await settingsButton.click();
    } else {
      // Fallback: look for a dropdown with specific class attributes
      const fallback = this.page.locator(
        'button.brutalist-shadow-sm[data-slot="dropdown-menu-trigger"]',
      );
      await fallback.click();
    }

    // Wait for dropdown menu to appear
    await this.page.waitForTimeout(300);

    // Click "Project Settings" menu item
    await this.page.getByRole("menuitem", { name: "Project Settings" }).click();
    await this.waitForModal();
  }

  // Assertions
  async expectSeriesTitle(title: string): Promise<void> {
    await expect(this.seriesHeader).toContainText(title);
  }

  async expectScriptVisible(name: string): Promise<void> {
    await expect(this.scriptCard(name)).toBeVisible();
  }

  async expectScriptCount(count: number): Promise<void> {
    await expect(
      this.scriptsList.locator('[data-testid="script-card"]'),
    ).toHaveCount(count);
  }
}
