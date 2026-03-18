import { expect, test } from "../../fixtures/series.fixture";

test.describe("Script Editor Keyboard Shortcuts", () => {
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
      await scriptEditorPage.focusBlock(0);
    },
  );

  test("Tab should cycle through block types", async ({ scriptEditorPage }) => {
    // Start with default action block
    await scriptEditorPage.expectBlockType(0, "action");

    await scriptEditorPage.pressTab();
    await scriptEditorPage.expectBlockType(0, "character");

    await scriptEditorPage.pressTab();
    await scriptEditorPage.expectBlockType(0, "dialogue");
  });

  test("Enter should create contextual next block", async ({
    scriptEditorPage,
  }) => {
    // Character block followed by Enter should create dialogue
    await scriptEditorPage.changeBlockType(0, "character");
    await scriptEditorPage.typeInBlock(0, "JOHN");
    await scriptEditorPage.pressEnter();

    await scriptEditorPage.expectBlockCount(2);
    await scriptEditorPage.expectBlockType(1, "dialogue");
  });

  test("Ctrl+S should trigger manual save", async ({
    scriptEditorPage,
    page,
  }) => {
    await scriptEditorPage.typeInBlock(0, "Save with shortcut");

    await page.keyboard.press("Control+s");

    await scriptEditorPage.waitForAutosave();
  });

  test("Escape should blur the editor", async ({ scriptEditorPage, page }) => {
    await scriptEditorPage.typeInBlock(0, "Test content");

    await page.keyboard.press("Escape");

    // Block should no longer be focused
    const activeElement = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(activeElement).not.toBe("TEXTAREA");
  });

  test("Arrow keys should navigate between blocks", async ({
    scriptEditorPage,
    page,
  }) => {
    // Create multiple blocks
    await scriptEditorPage.typeInBlock(0, "Block 1");
    await scriptEditorPage.pressEnter();
    await scriptEditorPage.typeInBlock(1, "Block 2");

    // Navigate up
    await page.keyboard.press("ArrowUp");

    // Should be in first block
    const focusedBlock = await page.evaluate(() => {
      const active = document.activeElement;
      return active
        ?.closest('[data-testid="block"]')
        ?.getAttribute("data-block-index");
    });
    expect(focusedBlock).toBe("0");
  });
});
