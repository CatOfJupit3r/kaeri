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

  test("should navigate to script editor when clicking New Script", async ({
    seriesPage,
    page,
  }) => {
    await seriesPage.clickCreateScript();

    // Should be in script editor with valid script ID
    await expect(page).toHaveURL(/\/scripts\/[a-f0-9]+/);
  });

  test("should create script with default title 'Untitled Script'", async ({
    seriesPage,
    page,
  }) => {
    await seriesPage.clickCreateScript();

    // Should navigate to script editor
    await expect(page).toHaveURL(/\/scripts\/[a-f0-9]+/);

    // Script title should be visible in the page
    await expect(page.locator("text=Untitled Script")).toBeVisible();
  });

  test("should show new script in scripts list", async ({
    seriesPage,
    testSeries,
    page,
  }) => {
    // Create a script
    await seriesPage.clickCreateScript();
    await expect(page).toHaveURL(/\/scripts\/[a-f0-9]+/);

    // Go back to scripts list
    await seriesPage.navigateToSeries(testSeries.id);
    await seriesPage.goToScripts();

    // Script should be visible in the list
    await seriesPage.expectScriptVisible("Untitled Script");
  });

  test("should be able to open existing script", async ({
    seriesPage,
    testSeries,
    page,
  }) => {
    // Create a script
    await seriesPage.clickCreateScript();
    await expect(page).toHaveURL(/\/scripts\/[a-f0-9]+/);

    // Go back to scripts list
    await seriesPage.navigateToSeries(testSeries.id);
    await seriesPage.goToScripts();

    // Open the created script
    await seriesPage.openScript("Untitled Script");

    // Should be in script editor
    await expect(page).toHaveURL(/\/scripts\/[a-f0-9]+/);
  });
});
