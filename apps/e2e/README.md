# E2E Testing Guide

## Quick Start

```bash
# Install Playwright browsers
bunx playwright install

# Run all tests
bun run test

# Run tests with UI mode (recommended for development)
bun run test:ui

# Run specific test file
bunx playwright test src/tests/auth/login.spec.ts

# Debug a specific test
bunx playwright test src/tests/auth/login.spec.ts --debug
```

## Project Structure

```
apps/e2e/
├── src/
│   ├── fixtures/          # Test fixtures and setup
│   ├── helpers/           # Utility functions
│   ├── pages/             # Page Object Models
│   ├── tests/             # Test specifications
│   └── global.setup.ts    # Global test setup
└── playwright.config.ts
```

## Writing Tests

### Test File Naming

- Use `*.spec.ts` suffix
- Group by feature: `tests/<feature>/<action>.spec.ts`

### Page Object Pattern

Always use page objects for UI interactions:

```typescript
// ✅ Good - Using page objects
test("should create series", async ({ dashboardPage, seriesPage }) => {
  await dashboardPage.clickCreateSeries();
  await seriesPage.createSeries({ title: "My Series" });
  await dashboardPage.expectSeriesVisible("My Series");
});

// ❌ Bad - Direct locator usage in tests
test("should create series", async ({ page }) => {
  await page.click('button:has-text("Create Series")');
  await page.fill('input[name="title"]', "My Series");
  // ... more direct locator usage
});
```

### Fixtures

Use fixtures for test data setup:

```typescript
import { test, expect } from "../fixtures/series.fixture";

test("my test", async ({ testSeries, testScript }) => {
  // testSeries and testScript are pre-created
});
```

### Assertions

Use Playwright's auto-waiting assertions:

```typescript
// ✅ Auto-waiting (recommended)
await expect(page.locator(".item")).toBeVisible();

// ❌ Manual waiting (avoid)
await page.waitForSelector(".item");
expect(await page.locator(".item").isVisible()).toBe(true);
```

## Avoiding Flaky Tests

1. **Use auto-waiting locators**: Playwright auto-waits for elements
2. **Avoid `waitForTimeout`**: Use specific conditions instead
3. **Use test isolation**: Each test should be independent
4. **Clean up test data**: Use fixtures with automatic cleanup
5. **Wait for network**: Use `waitForLoadState('networkidle')` when needed

### Common Flaky Patterns to Avoid

```typescript
// ❌ Flaky - arbitrary timeout
await page.waitForTimeout(2000);

// ✅ Better - wait for specific condition
await expect(page.locator('[data-testid="save-indicator"]')).toContainText(
  "Saved",
);

// ❌ Flaky - race condition
await page.click("button");
await expect(page.locator(".result")).toBeVisible();

// ✅ Better - wait for network
await page.click("button");
await page.waitForLoadState("networkidle");
await expect(page.locator(".result")).toBeVisible();
```

## Debugging

### Trace Viewer

After a test failure, view the trace:

```bash
bunx playwright show-trace test-results/<test-name>/trace.zip
```

### Debug Mode

```bash
bunx playwright test --debug
```

### UI Mode

Best for development and debugging:

```bash
bun run test:ui
```

## Test Data

### Generators

Use `@faker-js/faker` for random test data:

```typescript
import { generateTestSeries } from "../helpers/test-data.helper";

test("my test", async () => {
  const series = generateTestSeries();
  // series.title, series.genre, etc.
});
```

### API Seeding

For faster tests, seed data via API:

```typescript
test.beforeEach(async ({ authenticatedPage }) => {
  const response = await authenticatedPage.request.post(
    "/api/rpc/series.create",
    {
      data: { title: "Test Series" },
    },
  );
  const series = await response.json();
  // Use series.id in your test
});
```

## Running in CI

Tests will run automatically on pull requests. For local CI simulation:

```bash
# Run with CI-like settings
CI=true bunx playwright test
```

## Reports

HTML reports are generated in `playwright-report/`. Open after test runs:

```bash
bunx playwright show-report
```
