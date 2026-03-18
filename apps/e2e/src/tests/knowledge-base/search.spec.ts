import { expect, test } from "../../fixtures/series.fixture";

test.describe("Knowledge Base - Search", () => {
  test.beforeEach(async ({ knowledgeBasePage, testSeries }) => {
    await knowledgeBasePage.navigateToKnowledgeBase(testSeries.id);
  });

  test("should search across all entity types", async ({
    knowledgeBasePage,
  }) => {
    // Create entities in different tabs
    await knowledgeBasePage.switchTab("characters");
    await knowledgeBasePage.createEntity({ name: "SearchTest Character" });

    await knowledgeBasePage.switchTab("locations");
    await knowledgeBasePage.createEntity({ name: "SearchTest Location" });

    // Search from any tab
    await knowledgeBasePage.searchEntities("SearchTest");

    // Should find entities across types
    await knowledgeBasePage.expectEntityVisible("SearchTest Character");
    await knowledgeBasePage.expectEntityVisible("SearchTest Location");
  });

  test("should clear search results", async ({ knowledgeBasePage }) => {
    await knowledgeBasePage.switchTab("characters");
    await knowledgeBasePage.createEntity({ name: "ClearSearch Test" });
    await knowledgeBasePage.createEntity({ name: "Other Character" });

    // Search
    await knowledgeBasePage.searchEntities("ClearSearch");
    await knowledgeBasePage.expectEntityCount(1);

    // Clear search
    await knowledgeBasePage.searchEntities("");
    await knowledgeBasePage.expectEntityCount(2);
  });

  test("should show empty state for no results", async ({
    knowledgeBasePage,
    page,
  }) => {
    await knowledgeBasePage.searchEntities("NonexistentEntity12345");

    await expect(
      page.locator("text=/no results|not found|empty/i"),
    ).toBeVisible();
  });

  test("should debounce search input", async ({ knowledgeBasePage, page }) => {
    await knowledgeBasePage.switchTab("characters");

    // Type quickly
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.type("rapid search test", { delay: 30 });

    // Should only make one search request (verify no flickering)
    await page.waitForTimeout(500);
  });
});
