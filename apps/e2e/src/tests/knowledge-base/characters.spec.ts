import { expect, test } from "../../fixtures/series.fixture";

test.describe("Knowledge Base - Characters", () => {
  test.beforeEach(async ({ knowledgeBasePage, testSeries }) => {
    await knowledgeBasePage.navigateToKnowledgeBase(testSeries.id);
    await knowledgeBasePage.switchTab("characters");
  });

  test("should create a new character", async ({ knowledgeBasePage }) => {
    const characterName = `Character ${Date.now()}`;

    await knowledgeBasePage.createEntity({
      name: characterName,
      description: "A test character",
    });

    await knowledgeBasePage.expectEntityVisible(characterName);
  });

  // TODO: Investigate search filtering behavior - may need debounce/refresh
  test.skip("should search characters", async ({ knowledgeBasePage }) => {
    // Create multiple characters
    await knowledgeBasePage.createEntity({ name: "Alice" });
    await knowledgeBasePage.createEntity({ name: "Bob" });
    await knowledgeBasePage.createEntity({ name: "Charlie" });

    await knowledgeBasePage.searchEntities("Alice");
    await knowledgeBasePage.expectSearchResults(1);
    await knowledgeBasePage.expectEntityVisible("Alice");
    await knowledgeBasePage.expectEntityNotVisible("Bob");
  });

  test("should open character detail page", async ({
    knowledgeBasePage,
    page,
  }) => {
    const characterName = `Detail Test ${Date.now()}`;

    await knowledgeBasePage.createEntity({ name: characterName });
    await knowledgeBasePage.openEntity(characterName);

    await expect(page).toHaveURL(/characters\/[a-z0-9]+/);
  });
});
