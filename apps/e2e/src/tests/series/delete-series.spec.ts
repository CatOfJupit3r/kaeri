import { expect, test } from "../../fixtures/series.fixture";

test.describe("Delete Series", () => {
  test("should show confirmation dialog before deletion", async ({
    authenticatedPage: _authenticatedPage,
    dashboardPage,
    testSeries,
    page,
  }) => {
    // Navigate to dashboard where delete is available
    await dashboardPage.navigateToDashboard();

    // Open dropdown for the test series
    await dashboardPage.openSeriesDropdown(testSeries.title);

    // Click delete option
    await page.getByRole("menuitem", { name: "Delete" }).click();

    // Confirmation dialog should appear
    const dialog = page.locator('[role="alertdialog"]');
    await expect(dialog).toBeVisible();

    // Dialog should have title "Delete Project"
    await expect(dialog.getByRole("heading")).toContainText("Delete");
  });

  test("should delete series and redirect to dashboard", async ({
    authenticatedPage: _authenticatedPage,
    dashboardPage,
    testSeries,
    page,
  }) => {
    await dashboardPage.navigateToDashboard();

    // Delete series from dashboard
    await dashboardPage.openSeriesDropdown(testSeries.title);
    await page.getByRole("menuitem", { name: "Delete" }).click();

    // Confirm deletion
    await page.getByRole("button", { name: "Delete" }).click();

    // Wait for deletion to complete
    await page.waitForTimeout(500);

    // Series should not be visible
    await dashboardPage.expectSeriesNotVisible(testSeries.title);
  });

  test("should cancel deletion", async ({
    authenticatedPage: _authenticatedPage,
    dashboardPage,
    testSeries,
    page,
  }) => {
    await dashboardPage.navigateToDashboard();

    // Open dropdown and click delete
    await dashboardPage.openSeriesDropdown(testSeries.title);
    await page.getByRole("menuitem", { name: "Delete" }).click();

    // Cancel the dialog
    await page.getByRole("button", { name: "Cancel" }).click();

    // Series should still be visible
    await dashboardPage.expectSeriesVisible(testSeries.title);
  });
});
