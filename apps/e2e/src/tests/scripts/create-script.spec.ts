import { expect, test } from "../../fixtures/series.fixture";

test.describe("Create Script", () => {
  test.beforeEach(
    async ({
      authenticatedPage: _authenticatedPage,
      seriesPage,
      testSeries,
    }) => {
      await seriesPage.navigateToSeries(testSeries.id);
      await seriesPage.goToScripts();
    },
  );

  test("should open create script modal", async ({ seriesPage }) => {
    await seriesPage.clickCreateScript();
    // Modal assertion is handled in the method
  });

  test("should create script with title", async ({ seriesPage }) => {
    const scriptTitle = `New Script ${Date.now()}`;

    await seriesPage.clickCreateScript();

    // Fill in script form
    const modal = await seriesPage.waitForModal();
    await modal.locator('input[name="title"]').fill(scriptTitle);
    await modal
      .locator('button:has-text("Create"), button:has-text("Save")')
      .click();

    await seriesPage.expectScriptVisible(scriptTitle);
  });

  test("should navigate to script editor after creation", async ({
    seriesPage,
    page,
  }) => {
    const scriptTitle = `Editor Test ${Date.now()}`;

    await seriesPage.clickCreateScript();

    const modal = await seriesPage.waitForModal();
    await modal.locator('input[name="title"]').fill(scriptTitle);
    await modal
      .locator('button:has-text("Create"), button:has-text("Save")')
      .click();

    // Click on the created script
    await seriesPage.openScript(scriptTitle);

    // Should be in script editor
    await expect(page).toHaveURL(/\/scripts\/[a-z0-9]+/);
  });

  test("should show validation error for empty title", async ({
    seriesPage,
    page: _page,
  }) => {
    await seriesPage.clickCreateScript();

    const modal = await seriesPage.waitForModal();
    await modal
      .locator('button:has-text("Create"), button:has-text("Save")')
      .click();

    // Modal should still be open with validation error
    await expect(modal).toBeVisible();
  });
});
