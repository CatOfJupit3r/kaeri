import { expect, test } from "../../fixtures/series.fixture";

test.describe("Knowledge Base - Locations", () => {
  test.beforeEach(async ({ knowledgeBasePage, testSeries }) => {
    await knowledgeBasePage.navigateToKnowledgeBase(testSeries.id);
    await knowledgeBasePage.switchTab("locations");
  });

  test("should create a new location", async ({ knowledgeBasePage }) => {
    const locationName = `Location ${Date.now()}`;

    await knowledgeBasePage.createEntity({
      name: locationName,
      description: "A test location",
    });

    await knowledgeBasePage.expectEntityVisible(locationName);
  });

  test("should edit location details", async ({ knowledgeBasePage, page }) => {
    const locationName = `Edit Location ${Date.now()}`;

    await knowledgeBasePage.createEntity({ name: locationName });
    await knowledgeBasePage.openEntity(locationName);

    // Should navigate to detail page
    await expect(page).toHaveURL(/locations\/[a-z0-9]+/);

    // Edit description
    const descriptionField = page.locator('textarea[name="description"]');
    await descriptionField.fill("Updated description");

    // Save
    await page.locator('button:has-text("Save")').click();

    await expect(page.locator("[data-sonner-toast]")).toContainText(
      /saved|updated/i,
    );
  });

  test("should delete location", async ({ knowledgeBasePage, page }) => {
    const locationName = `Delete Location ${Date.now()}`;

    await knowledgeBasePage.createEntity({ name: locationName });
    await knowledgeBasePage.openEntity(locationName);

    // Delete
    await page.locator('button:has-text("Delete")').click();
    await page
      .locator('button:has-text("Confirm"), button:has-text("Delete")')
      .last()
      .click();

    // Should redirect back to list
    await expect(page).toHaveURL(/knowledge-base/);
    await knowledgeBasePage.expectEntityNotVisible(locationName);
  });
});
