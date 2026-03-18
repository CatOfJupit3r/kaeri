import { expect, test } from "../../fixtures/series.fixture";

test.describe("Script Block Editing", () => {
  test.beforeEach(
    async ({
      authenticatedPage: _authenticatedPage,
      scriptEditorPage,
      testScript,
    }) => {
      await scriptEditorPage.navigateToScript(
        testScript.seriesId,
        testScript.id,
      );
    },
  );

  test("should display script editor", async ({ scriptEditorPage }) => {
    await scriptEditorPage.expectEditorVisible();
  });

  test("should change block type via keyboard shortcut", async ({
    scriptEditorPage,
    page,
  }) => {
    // First, create a block by typing
    await scriptEditorPage.focusEditor();
    await scriptEditorPage.typeInEditor("Test content");

    // Check that a block now exists
    await scriptEditorPage.expectBlockCount(1);

    // Change to dialogue with Ctrl+4
    await scriptEditorPage.changeBlockType(0, "dialogue");
    await scriptEditorPage.expectBlockType(0, "dialogue");

    // Change to scene-heading with Ctrl+1
    await scriptEditorPage.changeBlockType(0, "scene-heading");
    await scriptEditorPage.expectBlockType(0, "scene-heading");
  });

  test("should cycle block types with Tab key", async ({
    scriptEditorPage,
    page,
  }) => {
    await scriptEditorPage.focusEditor();
    // Set block to action first using Ctrl+2
    await page.keyboard.press("Control+2");
    await scriptEditorPage.typeInEditor("Some action text");

    await scriptEditorPage.expectBlockType(0, "action");

    // Press Tab to cycle to next type (action -> character)
    await scriptEditorPage.pressTab();
    await scriptEditorPage.expectBlockType(0, "character");
  });

  test("should create new block on Enter", async ({ scriptEditorPage }) => {
    await scriptEditorPage.focusEditor();
    await scriptEditorPage.typeInEditor("INT. COFFEE SHOP - DAY");
    await scriptEditorPage.pressEnter();

    // Should now have 2 blocks
    await scriptEditorPage.expectBlockCount(2);
  });

  // TODO: Investigate autosave timing - content saves but takes too long or doesn't persist correctly
  test.skip("should preserve content after reload (autosave)", async ({
    scriptEditorPage,
    page,
  }) => {
    const content = "INT. TEST LOCATION - DAY";

    await scriptEditorPage.focusEditor();
    // First set as scene-heading
    await page.keyboard.press("Control+1");
    await scriptEditorPage.typeInEditor(content);

    // Wait for autosave and network idle to ensure save is complete
    await scriptEditorPage.waitForAutosave();
    await scriptEditorPage.waitForNetworkIdle();

    // Extra wait to be safe
    await page.waitForTimeout(1000);

    // Reload page
    await page.reload();
    await scriptEditorPage.waitForNetworkIdle();

    // Wait for editor to be visible again
    await scriptEditorPage.expectEditorVisible();

    // Wait for content to load (TipTap takes a moment to hydrate)
    await page.waitForTimeout(500);

    // Check for content - first check if any block exists
    await scriptEditorPage.expectBlockCount(1);
    await scriptEditorPage.expectBlockType(0, "scene-heading");
    await scriptEditorPage.expectBlockText(0, content);
  });

  test("should show Knowledge tab alongside editor", async ({
    scriptEditorPage,
  }) => {
    await scriptEditorPage.expectKnowledgeBasePanelVisible();
  });
});
