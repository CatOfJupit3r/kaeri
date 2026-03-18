import { test } from "../../fixtures/series.fixture";

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

  test("should display editor with initial block", async ({
    scriptEditorPage,
  }) => {
    await scriptEditorPage.expectBlockCount(1);
  });

  test("should change block type via selector", async ({
    scriptEditorPage,
  }) => {
    await scriptEditorPage.changeBlockType(0, "scene-heading");
    await scriptEditorPage.expectBlockType(0, "scene-heading");
  });

  test("should cycle block types with Tab key", async ({
    scriptEditorPage,
  }) => {
    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.pressTab();
    // Assuming default is action, Tab should change to next type
    await scriptEditorPage.expectBlockType(0, "character");
  });

  test("should create new block on Enter", async ({ scriptEditorPage }) => {
    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.typeInBlock(0, "INT. COFFEE SHOP - DAY");
    await scriptEditorPage.pressEnter();

    await scriptEditorPage.expectBlockCount(2);
    // After scene heading, next block should be action
    await scriptEditorPage.expectBlockType(1, "action");
  });

  test("should preserve content after save and reload", async ({
    scriptEditorPage,
    page,
  }) => {
    const content = "INT. TEST LOCATION - DAY";

    await scriptEditorPage.changeBlockType(0, "scene-heading");
    await scriptEditorPage.typeInBlock(0, content);
    await scriptEditorPage.save();
    await scriptEditorPage.waitForAutosave();

    // Reload page
    await page.reload();
    await scriptEditorPage.waitForNetworkIdle();

    await scriptEditorPage.expectBlockType(0, "scene-heading");
    await scriptEditorPage.expectBlockText(0, content);
  });

  test("should show KB panel alongside editor", async ({
    scriptEditorPage,
  }) => {
    await scriptEditorPage.expectKnowledgeBasePanelVisible();
  });
});
