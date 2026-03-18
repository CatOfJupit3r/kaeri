import { test, expect } from "@playwright/test";

test("should switch from sign-in to sign-up form (direct playwright)", async ({
  page,
}) => {
  // Go to auth page
  await page.goto("/auth");

  // Wait for network to be idle (ensures all JS/React has loaded)
  await page.waitForLoadState("networkidle");

  // Verify we're on sign-in form
  await expect(
    page.getByRole("heading", { name: "Welcome Back" }),
  ).toBeVisible();

  // Find the switch button and wait for it to be stable
  const switchButton = page.getByRole("button", { name: /need an account/i });
  await expect(switchButton).toBeVisible();
  await switchButton.scrollIntoViewIfNeeded();

  console.log("Before switch URL:", page.url());

  // Wait a bit for any React hydration to complete
  await page.waitForTimeout(1000);

  // Try keyboard interaction - focus and press Enter
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
