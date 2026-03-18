import { expect, test } from "../../fixtures/series.fixture";

test.describe("Edit Series", () => {
  test("should open edit modal with existing data", async ({
    authenticatedPage: _authenticatedPage,
    seriesPage,
    testSeries,
    page,
  }) => {
    await seriesPage.navigateToSeries(testSeries.id);
    await seriesPage.editSeries();

    // Modal should be visible with the title input
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Title input should show current series title
    const titleInput = modal.getByLabel("Title");
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveValue(testSeries.title);
  });

  test("should update series title", async ({
    authenticatedPage: _authenticatedPage,
    seriesPage,
    testSeries,
    page,
  }) => {
    const newTitle = `Updated Series ${Date.now()}`;

    await seriesPage.navigateToSeries(testSeries.id);
    await seriesPage.editSeries();
    await seriesPage.fillSeriesForm({ title: newTitle });
    await seriesPage.submitSeriesForm();

    // Title should be updated
    await seriesPage.expectSeriesTitle(newTitle);

    // Verify persistence after reload
    await page.reload();
    await seriesPage.expectSeriesTitle(newTitle);
  });

  test("should update series genre", async ({
    authenticatedPage: _authenticatedPage,
    seriesPage,
    testSeries,
    page,
  }) => {
    await seriesPage.navigateToSeries(testSeries.id);
    await seriesPage.editSeries();

    // Update genre
    const modal = page.locator('[role="dialog"]');
    await modal.getByLabel("Genre").fill("COMEDY");
    await modal.getByRole("button", { name: "Save Changes" }).click();

    // Wait for modal to close
    await modal.waitFor({ state: "detached", timeout: 10000 });

    // Verify the update by re-opening the modal
    await page.waitForTimeout(500);
    await seriesPage.editSeries();
    const genreInput = page.locator('[role="dialog"]').getByLabel("Genre");
    await expect(genreInput).toHaveValue("COMEDY");
  });

  test("should cancel edit without saving", async ({
    authenticatedPage: _authenticatedPage,
    seriesPage,
    testSeries,
    page,
  }) => {
    await seriesPage.navigateToSeries(testSeries.id);
    await seriesPage.editSeries();

    // Type a different title but don't save
    const modal = page.locator('[role="dialog"]');
    await modal.getByLabel("Title").fill("Should Not Save");

    // Close modal by clicking X or pressing Escape
    await page.keyboard.press("Escape");
    await modal.waitFor({ state: "detached", timeout: 5000 });

    // Original title should remain in the header
    await seriesPage.expectSeriesTitle(testSeries.title);
  });
});
