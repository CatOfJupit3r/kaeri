import { test, expect } from "../../fixtures/auth.fixture";

test("should switch from sign-in to sign-up form using fixture", async ({
  page,
}) => {
  // Go to auth page directly using page.goto
  await page.goto("/auth");
  await page.waitForLoadState("networkidle");

  // Verify we're on sign-in form
  await expect(
    page.getByRole("heading", { name: "Welcome Back" }),
  ).toBeVisible();

  // Find the switch button
  const switchButton = page.getByRole("button", { name: /need an account/i });
  await expect(switchButton).toBeVisible();

  console.log("Before switch URL:", page.url());

  // Wait for React hydration
  await page.waitForTimeout(1000);

  // Try keyboard interaction
  await switchButton.focus();
  await page.waitForTimeout(100);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);

  // Check state
  const headings = await page.getByRole("heading").allTextContents();
  console.log("After Enter key headings:", headings);

  // Check if sign-up heading appears
  const signUpHeading = page.getByRole("heading", { name: "Create Account" });
  await expect(signUpHeading).toBeVisible({ timeout: 5000 });
});
