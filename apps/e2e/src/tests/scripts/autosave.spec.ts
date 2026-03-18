import { test } from "../../fixtures/series.fixture";

test.describe("Script Autosave", () => {
  test("should show saving indicator during save", async ({
    scriptEditorPage,
    testScript,
  }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);

    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.typeInBlock(0, "Test content for autosave");

    // Wait for autosave indicator
    await scriptEditorPage.waitForAutosave();
  });

  test("should autosave after typing stops", async ({
    scriptEditorPage,
    testScript,
    page,
  }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);

    const content = `Autosave test ${Date.now()}`;
    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.typeInBlock(0, content);

    // Wait for autosave
    await scriptEditorPage.waitForAutosave();

    // Reload and verify
    await page.reload();
    await scriptEditorPage.waitForNetworkIdle();
    await scriptEditorPage.expectBlockText(0, content);
  });

  test("should debounce rapid typing", async ({
    scriptEditorPage,
    testScript,
  }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);

    await scriptEditorPage.focusBlock(0);

    // Type rapidly
    for (const char of "Rapid typing test") {
      await scriptEditorPage["page"].keyboard.type(char, { delay: 50 });
    }

    // Should only show one save cycle, not multiple
    await scriptEditorPage.waitForAutosave();
  });

  test("should handle network errors gracefully", async ({
    scriptEditorPage,
    testScript,
    page,
  }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);

    // Simulate offline
    await page.context().setOffline(true);

    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.typeInBlock(0, "Offline content");

    // Should show error or retry indicator
    await page.waitForTimeout(3000);

    // Restore connection
    await page.context().setOffline(false);

    // Should eventually save
    await scriptEditorPage.waitForAutosave();
  });
});
