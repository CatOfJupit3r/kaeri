import { expect, test } from "../../fixtures/series.fixture";

test.describe("Create Series", () => {
  test.beforeEach(
    async ({ authenticatedPage: _authenticatedPage, dashboardPage }) => {
      await dashboardPage.navigateToDashboard();
    },
  );

  test("should open create series modal", async ({ dashboardPage }) => {
    await dashboardPage.clickCreateSeries();
    // Modal is automatically waited for in the method
  });

  test("should create series with required fields", async ({
    dashboardPage,
    seriesPage,
  }) => {
    const title = `New Series ${Date.now()}`;

    await dashboardPage.clickCreateSeries();
    await seriesPage.createSeries({ title });

    await dashboardPage.expectSeriesVisible(title);
  });

  test("should create series with all fields", async ({
    dashboardPage,
    seriesPage,
  }) => {
    const seriesData = {
      title: `Full Series ${Date.now()}`,
      genre: "COMEDY",
      logline: "A hilarious adventure through testing",
    };

    await dashboardPage.clickCreateSeries();
    await seriesPage.createSeries(seriesData);

    await dashboardPage.expectSeriesVisible(seriesData.title);
  });

  test("should show validation error for empty title", async ({
    dashboardPage,
    seriesPage,
    page,
  }) => {
    await dashboardPage.clickCreateSeries();
    await seriesPage.fillSeriesForm({ title: "" });
    await seriesPage.clickSubmitButton();

    // Form should still be visible (not submitted)
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });
});
