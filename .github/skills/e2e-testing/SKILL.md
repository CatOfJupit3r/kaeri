---
name: e2e-testing
description: >
  Playwright E2E testing for Koneko monorepo. Use when writing e2e tests, page objects,
  fixtures, test assertions, or debugging flaky tests. Covers Page Object Model, custom
  fixtures with auto-cleanup, oRPC API seeding, locator strategies, and test isolation.
  Triggers on: test.describe, test.beforeEach, BasePage, AuthPage, seriesTest,
  createE2EClient, data-testid, waitForNetworkIdle, toBeVisible, authenticatedPage.
type: core
library: "@playwright/test"
library_version: "^1.59.1"
---

# Koneko E2E Testing with Playwright

## Timeout Configuration

**CRITICAL**: Keep timeouts short for fast feedback during development.

```typescript
// playwright.config.ts
timeout: 30_000, // 30 seconds per test (NOT 60s)
expect: {
  timeout: 5_000, // 5 seconds for assertions (NOT 10s)
}
```

**Philosophy**: If a test takes >30s, it's testing too much. Break it into smaller tests.

## Debugging Failing Tests

### Add Debug Logs to Page Objects

When tests fail mysteriously, add console.log to understand what's happening:

```typescript
async openMenu(name: string) {
  console.log(`[DEBUG] Opening menu for: "${name}"`);
  const card = this.findCard(name);
  
  const menuButton = card.locator('[data-testid="menu-button"]');
  const count = await menuButton.count();
  console.log(`[DEBUG] Found ${count} menu buttons`);
  
  if (count === 0) {
    throw new Error(`No menu button found for "${name}"`);
  }
  
  await menuButton.click();
  console.log('[DEBUG] Menu clicked');
}
```

### Run with UI Mode for Visual Debugging

```bash
pnpm run e2e:ui -- my-test.spec.ts
```

Shows browser state, DOM snapshots, and network activity at each step.

### Check Screenshots/Videos on Failure

Playwright auto-captures on failure:
- `test-results/playwright/<test-name>/test-failed-1.png`
- `test-results/playwright/<test-name>/video.webm`

### Common Issues

1. **Element not found**: Add `console.log` with `.count()` to verify element exists
2. **Timeout waiting**: Reduce timeout to 5-10s, fail fast, check what's actually rendered
3. **Hydration issues**: SSR apps need waits after `visible` before `click` (1-2s)
4. **Hidden elements**: Use `{ force: true }` for CSS-hidden but DOM-present elements

## Setup

```typescript
// apps/e2e/src/tests/feature/my-feature.spec.ts
import { expect, test, TEST_USERS } from "../../fixtures/auth.fixture";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.navigateToAuth();
  });

  test("should perform expected action", async ({ authPage, page }) => {
    await authPage.login(TEST_USERS.default.username, TEST_USERS.default.password);
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
```

For tests requiring authenticated state with data fixtures:

```typescript
// Use seriesTest for tests needing pre-created series/scripts
import { expect, test } from "../../fixtures/series.fixture";

test.describe("Series Feature", () => {
  test("should work with test data", async ({ 
    authenticatedPage,
    testSeries,
    testScript,
    seriesPage 
  }) => {
    await seriesPage.navigateToSeries(testSeries.id);
    await expect(seriesPage.page).toHaveURL(new RegExp(testSeries.id));
  });
});
```

## Core Patterns

### Page Object Model

Create page objects that extend `BasePage`. Declare locators as class properties using user-facing attributes:

```typescript
// apps/e2e/src/pages/feature.page.ts
import { type Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class FeaturePage extends BasePage {
  // Prefer role-based locators
  private readonly submitButton = this.page.getByRole("button", { name: "Submit" });
  private readonly titleInput = this.page.getByLabel("Title");
  
  // Use data-testid only when semantic locators aren't possible
  private readonly entityList = this.page.locator('[data-testid="entity-list"]');
  
  // Dynamic locators as methods
  private entityCard = (name: string) =>
    this.page.locator(`[data-testid="entity-card"]:has-text("${name}")`);

  constructor(page: Page) {
    super(page);
  }

  async navigateToFeature(id: string) {
    await this.goto(`/feature/${id}`);
    await this.waitForNetworkIdle();
  }

  async createEntity(data: { title: string }) {
    await this.titleInput.fill(data.title);
    await this.submitButton.click();
    await this.expectToast(/created successfully/i);
  }

  async expectEntityVisible(name: string) {
    await expect(this.entityCard(name)).toBeVisible();
  }
}
```

Export page objects from index:

```typescript
// apps/e2e/src/pages/index.ts
export { BasePage } from "./base.page";
export { AuthPage } from "./auth.page";
export { FeaturePage } from "./feature.page";
```

### Custom Fixtures with Auto-Cleanup

Extend base fixtures to provide page objects and test data with automatic cleanup:

```typescript
// apps/e2e/src/fixtures/feature.fixture.ts
import { FeaturePage } from "../pages";
import { test as authTest } from "./auth.fixture";
import { type E2EClient, createE2EClient } from "../utils/orpc";

type FeatureFixtures = {
  featurePage: FeaturePage;
  apiClient: E2EClient;
  testEntity: { id: string; title: string };
};

export const test = authTest.extend<FeatureFixtures>({
  featurePage: async ({ page }, use) => {
    await use(new FeaturePage(page));
  },

  apiClient: async ({ authenticatedPage }, use) => {
    const client = createE2EClient(authenticatedPage);
    await use(client);
  },

  testEntity: async ({ apiClient }, use) => {
    // Setup: Create via API for speed
    const entity = await apiClient.feature.create({
      title: `Test Entity ${Date.now()}`,
    });

    await use({ id: entity._id, title: entity.title });

    // Teardown: Auto-cleanup
    try {
      await apiClient.feature.delete({ id: entity._id });
    } catch {
      // Entity may already be deleted by the test
    }
  },
});

export { expect } from "@playwright/test";
```

### API Seeding with oRPC Client

Use the oRPC client for fast, type-safe test data setup:

```typescript
// apps/e2e/src/utils/orpc.ts usage
import { test } from "../fixtures/series.fixture";

test("should delete entity", async ({ apiClient, testSeries }) => {
  // Create additional data via API
  const character = await apiClient.knowledgeBase.characters.create({
    seriesId: testSeries.id,
    name: "Test Character",
    description: "A test character",
  });

  // Now test the UI behavior
  await knowledgeBasePage.navigateToCharacters(testSeries.id);
  await knowledgeBasePage.deleteCharacter(character.name);
  await knowledgeBasePage.expectCharacterNotVisible(character.name);
});
```

### Web-First Assertions

Use Playwright's auto-waiting assertions:

```typescript
// ✅ Auto-waiting (recommended)
await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
await expect(page.locator('[data-testid="series-grid"]')).toHaveCount(3);
await expect(page).toHaveURL(/\/series\/[\w-]+/);

// ✅ Toast assertions using BasePage helper
await dashboardPage.expectToast(/series created/i);

// ✅ Wait for network operations to complete
await dashboardPage.waitForNetworkIdle();
await seriesPage.waitForSkeleton(); // Wait for loading state to clear
```

## Common Mistakes

### CRITICAL: Using manual waits instead of auto-waiting assertions

Wrong:
```typescript
await page.waitForTimeout(2000);
expect(await page.locator(".item").isVisible()).toBe(true);
```

Correct:
```typescript
await expect(page.locator(".item")).toBeVisible();
```

Manual waits cause flaky tests and slow execution. Playwright's auto-waiting handles timing automatically.

Source: playwright.dev/docs/best-practices#use-web-first-assertions

### HIGH: Direct locator usage in test files instead of page objects

Wrong:
```typescript
test("should create series", async ({ page }) => {
  await page.click('button:has-text("Create Series")');
  await page.fill('input[name="title"]', "My Series");
  await page.click('button:has-text("Submit")');
});
```

Correct:
```typescript
test("should create series", async ({ dashboardPage, seriesPage }) => {
  await dashboardPage.clickCreateSeries();
  await seriesPage.createSeries({ title: "My Series" });
  await dashboardPage.expectSeriesVisible("My Series");
});
```

Direct locators scatter selectors across test files. Page objects centralize them for maintainability.

### HIGH: Using CSS classes or implementation details as locators

Wrong:
```typescript
page.locator("button.btn-primary.submit-form");
page.locator("div.card-container > div:nth-child(2)");
```

Correct:
```typescript
page.getByRole("button", { name: "Submit" });
page.getByLabel("Title");
page.locator('[data-testid="series-card"]');
```

CSS classes change frequently. Role-based and data-testid locators are resilient to UI changes.

Source: playwright.dev/docs/best-practices#prefer-user-facing-attributes-to-xpath-or-css-selectors

### HIGH: Missing cleanup in fixtures causing test pollution

Wrong:
```typescript
export const test = base.extend<{ testEntity: Entity }>({
  testEntity: async ({ apiClient }, use) => {
    const entity = await apiClient.create({ title: "Test" });
    await use(entity);
    // No cleanup - data persists between tests!
  },
});
```

Correct:
```typescript
export const test = base.extend<{ testEntity: Entity }>({
  testEntity: async ({ apiClient }, use) => {
    const entity = await apiClient.create({ title: "Test" });
    await use(entity);
    try {
      await apiClient.delete({ id: entity._id });
    } catch {
      // Entity may already be deleted by the test
    }
  },
});
```

Test data must be cleaned up to ensure test isolation. Wrap cleanup in try-catch for delete tests.

### MEDIUM: Using beforeEach for data setup instead of fixtures

Wrong:
```typescript
test.describe("Series tests", () => {
  let series: Series;

  test.beforeEach(async ({ apiClient }) => {
    series = await apiClient.series.create({ title: "Test" });
  });

  test.afterEach(async ({ apiClient }) => {
    await apiClient.series.delete({ id: series._id });
  });

  test("should edit series", async ({ seriesPage }) => {
    // Uses series from beforeEach
  });
});
```

Correct:
```typescript
import { test } from "../../fixtures/series.fixture";

test.describe("Series tests", () => {
  test("should edit series", async ({ testSeries, seriesPage }) => {
    // testSeries is provided by fixture with auto-cleanup
  });
});
```

Fixtures provide better isolation, automatic cleanup, and are reusable across test files.

### MEDIUM: Not waiting for React hydration on page load

Wrong:
```typescript
async navigateToAuth() {
  await this.goto("/auth");
  // Immediately interact - may fail before hydration
  await this.usernameInput.fill("user");
}
```

Correct:
```typescript
async navigateToAuth() {
  await this.goto("/auth");
  await this.page.waitForLoadState("networkidle");
  await this.signInHeading.or(this.signUpHeading).waitFor();
}
```

React apps need hydration time. Wait for network idle and a key element before interacting.

### MEDIUM: Using click() when keyboard interaction is more reliable

Wrong:
```typescript
// Button click doesn't trigger React handler
await this.switchToSignupButton.click();
```

Correct:
```typescript
// Keyboard interaction is more reliable for React components
await this.switchToSignupButton.focus();
await this.page.keyboard.press("Enter");
await this.signUpHeading.waitFor({ timeout: 5000 });
```

Some React event handlers respond better to keyboard events than programmatic clicks.

## Test Organization

### File Naming and Structure

```
apps/e2e/src/tests/
├── auth/
│   ├── login.spec.ts
│   ├── signup.spec.ts
│   └── logout.spec.ts
├── series/
│   ├── create-series.spec.ts
│   ├── edit-series.spec.ts
│   └── delete-series.spec.ts
└── knowledge-base/
    ├── characters.spec.ts
    └── locations.spec.ts
```

### Test ID Contract

Required `data-testid` attributes for E2E tests:

| Component | Test ID | Usage |
|-----------|---------|-------|
| Series grid | `data-testid="series-grid"` | Dashboard series list |
| Series card | `data-testid="series-card"` | Individual series item |
| Scripts list | `data-testid="scripts-list"` | Series scripts container |
| Script editor | `data-testid="script-editor"` | Block editor container |
| Entity list | `data-testid="entity-list"` | KB entity container |
| Loading skeleton | `data-testid="skeleton"` | Loading placeholders |

### Running Tests

```bash
bun run test              # All tests
bun run test:ui           # Interactive UI mode
bun run test:chromium     # Single browser
bun run test:debug        # Debug mode with inspector
bunx playwright test src/tests/auth/login.spec.ts  # Single file
```


## Troubleshooting

### React Hydration Issues

**Symptom**: Button clicks don't trigger actions, forms don't accept input, or mutations aren't called.

**Cause**: TanStack Start uses SSR. Elements are visible in HTML before React hydrates and attaches event handlers.

**Solution**: Wait for hydration before interacting:

```typescript
// ❌ Wrong - clicks before handlers attached
await button.waitFor({ state: 'visible' });
await button.click();

// ✅ Correct - wait for hydration
await button.waitFor({ state: 'visible' });
await this.page.waitForTimeout(2000); // Allow React to hydrate
await button.click();
```

**Why 2 seconds?** TanStack Start loads React, routes, and data fetchers. 2s is conservative but reliable. Use `networkidle` for dynamic wait (but it's slower).

**When is this needed?**
- Auth buttons ("Continue as Default User", "Sign In")
- Form submissions (create character, edit story)
- Interactive editor buttons (Tiptap)
- Navigation after page transitions

**Where NOT needed:**
- Elements rendered client-side after initial load
- Actions triggered by already-hydrated components

## References

- [Required data-testid attributes](../../specs/010-e2e-testing/test-id-reference.md)
- [E2E testing specification](../../specs/010-e2e-testing/spec.md)
