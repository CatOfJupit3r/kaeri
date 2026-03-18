import { expect, test } from "../../fixtures/series.fixture";
import { ExportPage } from "../../pages/export.page";

test.describe("PDF Export", () => {
  test("should export script to PDF", async ({
    scriptEditorPage,
    testScript,
    page,
  }) => {
    // Add some content to the script
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    await scriptEditorPage.changeBlockType(0, "scene-heading");
    await scriptEditorPage.typeInBlock(0, "INT. COFFEE SHOP - DAY");
    await scriptEditorPage.pressEnter();
    await scriptEditorPage.typeInBlock(
      1,
      "A busy coffee shop with patrons chatting.",
    );
    await scriptEditorPage.save();
    await scriptEditorPage.waitForAutosave();

    // Export
    const exportPage = new ExportPage(page);
    const download = await exportPage.exportToPdf();

    await exportPage.expectDownloadStarted(download, ".pdf");
  });

  test("should include script title in filename", async ({
    scriptEditorPage,
    testScript,
    page,
  }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);

    const exportPage = new ExportPage(page);
    const download = await exportPage.exportToPdf();

    const filename = download.suggestedFilename();
    // Filename should contain part of the script title
    expect(filename.toLowerCase()).toMatch(/script|test/i);
  });

  test("should show export menu options", async ({
    scriptEditorPage,
    testScript,
    page,
  }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);

    const exportPage = new ExportPage(page);
    await exportPage.openExportMenu();
    await exportPage.expectExportMenuVisible();

    // Should show PDF option
    await expect(page.locator('[data-export-format="pdf"]')).toBeVisible();
  });

  test("should handle export of empty script", async ({
    scriptEditorPage,
    testScript,
    page,
  }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);

    // Clear any content
    await scriptEditorPage.focusBlock(0);
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Backspace");

    const exportPage = new ExportPage(page);
    const download = await exportPage.exportToPdf();

    // Should still produce a valid PDF (possibly with just header)
    await exportPage.expectDownloadStarted(download, ".pdf");
  });
});
