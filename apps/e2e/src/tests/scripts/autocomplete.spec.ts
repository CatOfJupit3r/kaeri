import { expect, test } from "../../fixtures/series.fixture";

// TODO: These tests require fixing the knowledge-base page object first
// The selectors for KB entity tabs and autocomplete dropdown need to match actual UI
test.describe.skip("Script Editor Autocomplete", () => {
  test("should show character suggestions on @ trigger", async ({
    scriptEditorPage,
    knowledgeBasePage,
    testScript,
    testSeries,
  }) => {
    // First, create a character in KB
    await knowledgeBasePage.navigateToKnowledgeBase(testSeries.id);
    await knowledgeBasePage.switchTab("characters");
    await knowledgeBasePage.createEntity({ name: "AutocompleteTestChar" });

    // Navigate to script
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    await scriptEditorPage.focusBlock(0);

    // Trigger autocomplete
    await scriptEditorPage.triggerAutocomplete();

    await scriptEditorPage.expectAutocompleteVisible();
  });

  test("should filter suggestions while typing", async ({
    scriptEditorPage,
    knowledgeBasePage,
    testScript,
    testSeries,
    page,
  }) => {
    // Create multiple characters
    await knowledgeBasePage.navigateToKnowledgeBase(testSeries.id);
    await knowledgeBasePage.switchTab("characters");
    await knowledgeBasePage.createEntity({ name: "Alice" });
    await knowledgeBasePage.createEntity({ name: "Bob" });

    // Navigate to script and trigger autocomplete
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    await scriptEditorPage.focusBlock(0);
    await page.keyboard.type("@Ali");

    // Should show Alice, not Bob
    const dropdown = page.locator('[data-testid="autocomplete-dropdown"]');
    await expect(dropdown.locator("text=Alice")).toBeVisible();
    await expect(dropdown.locator("text=Bob")).not.toBeVisible();
  });

  test("should insert selected character name", async ({
    scriptEditorPage,
    knowledgeBasePage,
    testScript,
    testSeries,
  }) => {
    await knowledgeBasePage.navigateToKnowledgeBase(testSeries.id);
    await knowledgeBasePage.switchTab("characters");
    await knowledgeBasePage.createEntity({ name: "InsertTestChar" });

    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.triggerAutocomplete();
    await scriptEditorPage.selectAutocompleteOption("InsertTestChar");

    await scriptEditorPage.expectBlockText(0, /InsertTestChar/);
  });

  test("should close autocomplete on Escape", async ({
    scriptEditorPage,
    testScript,
    page,
  }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.triggerAutocomplete();
    await scriptEditorPage.expectAutocompleteVisible();

    await page.keyboard.press("Escape");

    const dropdown = page.locator('[data-testid="autocomplete-dropdown"]');
    await expect(dropdown).not.toBeVisible();
  });
});
