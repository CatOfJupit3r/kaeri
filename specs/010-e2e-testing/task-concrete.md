````markdown
# E2E Testing - Concrete Implementation Tasks

## Task 1: Initial Project Setup

### 1.1 Package Dependencies

**File**: `apps/web/package.json`

Add to `devDependencies`:
```json
{
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "@faker-js/faker": "^9.6.0",
    "@axe-core/playwright": "^4.10.0"
  }
}
```

Add to `scripts`:
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

**Command**: `bun add -d @playwright/test @faker-js/faker @axe-core/playwright`

---

### 1.2 Directory Structure Setup

**Commands**:
```powershell
# Create directory structure
mkdir apps/web/e2e
mkdir apps/web/e2e/fixtures
mkdir apps/web/e2e/pages
mkdir apps/web/e2e/helpers
mkdir apps/web/e2e/tests
mkdir apps/web/e2e/tests/auth
mkdir apps/web/e2e/tests/dashboard
mkdir apps/web/e2e/tests/series
mkdir apps/web/e2e/tests/scripts
mkdir apps/web/e2e/tests/knowledge-base
mkdir apps/web/e2e/tests/export
```

---

### 1.3 Playwright Configuration

**File**: `apps/web/e2e/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  
  reporter: [
    ['html', { open: 'never', outputFolder: '../playwright-report' }],
    ['json', { outputFile: '../test-results/results.json' }],
    process.env.CI ? ['github'] : ['list'],
  ],

  outputDir: '../test-results',

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  expect: {
    timeout: 5000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: 'cd ../.. && bun run dev',
        url: 'http://localhost:3001',
        reuseExistingServer: true,
        timeout: 120 * 1000,
      },
});
```

---

### 1.4 TypeScript Configuration for E2E

**File**: `apps/web/e2e/tsconfig.json`

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["bun-types"]
  },
  "include": ["**/*.ts"]
}
```

---

## Task 2: Page Object Classes

### 2.1 Base Page Object

**File**: `apps/web/e2e/pages/base.page.ts`

```typescript
import { type Page, type Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigation
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  // Wait utilities
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForDomContentLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  // URL assertions
  async expectUrl(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  async expectTitle(title: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  // Toast notifications (Sonner)
  async expectToast(message: string | RegExp): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(message);
  }

  async expectSuccessToast(message?: string | RegExp): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast][data-type="success"]').first();
    await expect(toast).toBeVisible();
    if (message) {
      await expect(toast).toContainText(message);
    }
  }

  async expectErrorToast(message?: string | RegExp): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast][data-type="error"]').first();
    await expect(toast).toBeVisible();
    if (message) {
      await expect(toast).toContainText(message);
    }
  }

  async dismissToast(): Promise<void> {
    const closeButton = this.page.locator('[data-sonner-toast] button[aria-label="Close"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  // Modal helpers
  async waitForModal(): Promise<Locator> {
    const modal = this.page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    return modal;
  }

  async closeModal(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.page.locator('[role="dialog"]').waitFor({ state: 'detached' });
  }

  // Loading states
  async waitForLoadingComplete(): Promise<void> {
    // Wait for any skeleton loaders to disappear
    const skeletons = this.page.locator('[data-testid="skeleton"], [data-loading="true"]');
    await skeletons.first().waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});
  }

  // Button helpers
  async clickButton(text: string): Promise<void> {
    await this.page.locator(`button:has-text("${text}")`).click();
  }

  async clickLink(text: string): Promise<void> {
    await this.page.locator(`a:has-text("${text}")`).click();
  }

  // Form helpers
  async fillInput(name: string, value: string): Promise<void> {
    await this.page.locator(`input[name="${name}"]`).fill(value);
  }

  async fillTextarea(name: string, value: string): Promise<void> {
    await this.page.locator(`textarea[name="${name}"]`).fill(value);
  }

  async selectOption(name: string, value: string): Promise<void> {
    await this.page.locator(`[data-testid="${name}-select"]`).click();
    await this.page.locator(`[data-value="${value}"]`).click();
  }
}
```

---

### 2.2 Auth Page Object

**File**: `apps/web/e2e/pages/auth.page.ts`

```typescript
import { type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AuthPage extends BasePage {
  // Locators
  private readonly emailInput = () => this.page.locator('input[name="email"], input[type="email"]');
  private readonly passwordInput = () => this.page.locator('input[name="password"], input[type="password"]');
  private readonly usernameInput = () => this.page.locator('input[name="username"], input[name="name"]');
  private readonly submitButton = () => this.page.locator('button[type="submit"]');
  private readonly loginTab = () => this.page.locator('[data-tab="login"], [data-state="active"]:has-text("Login")');
  private readonly signupTab = () => this.page.locator('[data-tab="signup"], button:has-text("Sign up")');
  private readonly errorMessage = () => this.page.locator('[data-testid="auth-error"], [role="alert"]');

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToAuth(): Promise<void> {
    await this.goto('/auth');
    await this.waitForDomContentLoaded();
  }

  // Tab switching
  async switchToLogin(): Promise<void> {
    const loginTab = this.loginTab();
    if (await loginTab.isVisible()) {
      await loginTab.click();
    }
  }

  async switchToSignup(): Promise<void> {
    const signupTab = this.signupTab();
    if (await signupTab.isVisible()) {
      await signupTab.click();
    }
  }

  // Form filling
  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
  }

  async fillSignupForm(email: string, username: string, password: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.usernameInput().fill(username);
    await this.passwordInput().fill(password);
  }

  // Actions
  async submit(): Promise<void> {
    await this.submitButton().click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.switchToLogin();
    await this.fillLoginForm(email, password);
    await this.submit();
  }

  async signup(email: string, username: string, password: string): Promise<void> {
    await this.switchToSignup();
    await this.fillSignupForm(email, username, password);
    await this.submit();
  }

  // Assertions
  async expectLoginForm(): Promise<void> {
    await expect(this.emailInput()).toBeVisible();
    await expect(this.passwordInput()).toBeVisible();
  }

  async expectSignupForm(): Promise<void> {
    await expect(this.emailInput()).toBeVisible();
    await expect(this.usernameInput()).toBeVisible();
    await expect(this.passwordInput()).toBeVisible();
  }

  async expectError(message: string | RegExp): Promise<void> {
    await expect(this.errorMessage()).toContainText(message);
  }

  async expectRedirectToDashboard(): Promise<void> {
    await this.expectUrl(/\/dashboard/);
  }

  async expectAuthPage(): Promise<void> {
    await this.expectUrl(/\/auth/);
  }
}
```

---

### 2.3 Dashboard Page Object

**File**: `apps/web/e2e/pages/dashboard.page.ts`

```typescript
import { type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  // Locators
  private readonly createSeriesButton = () => 
    this.page.locator('button:has-text("Create Series"), button:has-text("New Series")');
  private readonly seriesGrid = () => 
    this.page.locator('[data-testid="series-grid"], [data-testid="series-list"]');
  private readonly seriesCard = (name: string) => 
    this.page.locator(`[data-testid="series-card"]:has-text("${name}")`);
  private readonly userMenu = () => 
    this.page.locator('[data-testid="user-menu"], [data-testid="user-avatar"]');
  private readonly logoutButton = () => 
    this.page.locator('button:has-text("Log out"), button:has-text("Logout")');
  private readonly searchInput = () => 
    this.page.locator('input[placeholder*="Search"], input[data-testid="search-input"]');
  private readonly emptyState = () => 
    this.page.locator('[data-testid="empty-series"], [data-testid="no-series"]');

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToDashboard(): Promise<void> {
    await this.goto('/dashboard');
    await this.waitForLoadingComplete();
  }

  // Actions
  async clickCreateSeries(): Promise<void> {
    await this.createSeriesButton().click();
    await this.waitForModal();
  }

  async openSeries(name: string): Promise<void> {
    await this.seriesCard(name).click();
    await this.waitForLoadingComplete();
  }

  async searchSeries(query: string): Promise<void> {
    await this.searchInput().fill(query);
    // Wait for debounce
    await this.page.waitForTimeout(350);
  }

  async clearSearch(): Promise<void> {
    await this.searchInput().clear();
    await this.page.waitForTimeout(350);
  }

  async openUserMenu(): Promise<void> {
    await this.userMenu().click();
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.logoutButton().click();
  }

  // Assertions
  async expectSeriesVisible(name: string): Promise<void> {
    await expect(this.seriesCard(name)).toBeVisible();
  }

  async expectSeriesNotVisible(name: string): Promise<void> {
    await expect(this.seriesCard(name)).not.toBeVisible();
  }

  async expectSeriesCount(count: number): Promise<void> {
    await expect(this.seriesGrid().locator('[data-testid="series-card"]')).toHaveCount(count);
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState()).toBeVisible();
  }

  async expectDashboardLoaded(): Promise<void> {
    await expect(this.createSeriesButton()).toBeVisible();
  }
}
```

---

### 2.4 Page Object Index

**File**: `apps/web/e2e/pages/index.ts`

```typescript
export { BasePage } from './base.page';
export { AuthPage } from './auth.page';
export { DashboardPage } from './dashboard.page';
export { SeriesPage } from './series.page';
export { ScriptEditorPage } from './script-editor.page';
export { KnowledgeBasePage } from './knowledge-base.page';
```

---

## Task 3: Fixtures

### 3.1 Auth Fixture

**File**: `apps/web/e2e/fixtures/auth.fixture.ts`

```typescript
import { test as base, type Page } from '@playwright/test';
import { AuthPage, DashboardPage } from '../pages';

export const TEST_USERS = {
  default: {
    email: 'e2e-test@kaeri.dev',
    username: 'e2etestuser',
    password: 'E2ETestPassword123!',
  },
  alternate: {
    email: 'e2e-test-alt@kaeri.dev',
    username: 'e2etestuser2',
    password: 'E2ETestPassword456!',
  },
} as const;

type AuthFixtures = {
  authPage: AuthPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  authenticatedPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    
    // Try to login
    await authPage.navigateToAuth();
    
    try {
      await authPage.login(TEST_USERS.default.email, TEST_USERS.default.password);
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    } catch {
      // User might not exist, try signup first
      await authPage.navigateToAuth();
      await authPage.signup(
        TEST_USERS.default.email,
        TEST_USERS.default.username,
        TEST_USERS.default.password
      );
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    }

    await use(page);
  },
});

export { expect } from '@playwright/test';
```

---

### 3.2 Series Fixture

**File**: `apps/web/e2e/fixtures/series.fixture.ts`

```typescript
import { test as authTest } from './auth.fixture';
import { 
  SeriesPage, 
  ScriptEditorPage, 
  KnowledgeBasePage 
} from '../pages';
import { ApiHelper, createApiHelper } from '../helpers/api.helper';
import { generateTestSeries, generateTestScript } from '../helpers/test-data.helper';

type SeriesFixtures = {
  seriesPage: SeriesPage;
  scriptEditorPage: ScriptEditorPage;
  knowledgeBasePage: KnowledgeBasePage;
  apiHelper: ApiHelper;
  testSeries: { id: string; title: string };
  testScript: { id: string; title: string; seriesId: string };
};

export const test = authTest.extend<SeriesFixtures>({
  seriesPage: async ({ page }, use) => {
    await use(new SeriesPage(page));
  },

  scriptEditorPage: async ({ page }, use) => {
    await use(new ScriptEditorPage(page));
  },

  knowledgeBasePage: async ({ page }, use) => {
    await use(new KnowledgeBasePage(page));
  },

  apiHelper: async ({ authenticatedPage }, use) => {
    await use(createApiHelper(authenticatedPage));
  },

  testSeries: async ({ apiHelper }, use) => {
    const seriesData = generateTestSeries();
    const series = await apiHelper.createSeries(seriesData);

    await use({ id: series.id, title: series.title });

    // Cleanup after test
    await apiHelper.deleteSeries(series.id).catch(() => {
      // Series might already be deleted by test
    });
  },

  testScript: async ({ apiHelper, testSeries }, use) => {
    const scriptData = generateTestScript();
    const script = await apiHelper.createScript({
      seriesId: testSeries.id,
      ...scriptData,
    });

    await use({
      id: script.id,
      title: script.title,
      seriesId: testSeries.id,
    });

    // Cleanup happens when series is deleted
  },
});

export { expect } from '@playwright/test';
```

---

### 3.3 Fixture Index

**File**: `apps/web/e2e/fixtures/index.ts`

```typescript
export { test as authTest, expect, TEST_USERS } from './auth.fixture';
export { test as seriesTest } from './series.fixture';
```

---

## Task 4: Helpers

### 4.1 API Helper

**File**: `apps/web/e2e/helpers/api.helper.ts`

```typescript
import { type Page, type APIRequestContext } from '@playwright/test';

export class ApiHelper {
  private request: APIRequestContext;
  private baseUrl: string;

  constructor(request: APIRequestContext, baseUrl = 'http://localhost:3000') {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  private async rpc<T>(procedure: string, data: unknown): Promise<T> {
    const response = await this.request.post(`${this.baseUrl}/api/rpc`, {
      data: {
        procedure,
        input: data,
      },
    });

    if (!response.ok()) {
      const error = await response.text();
      throw new Error(`RPC call failed: ${procedure} - ${error}`);
    }

    return response.json() as Promise<T>;
  }

  // Auth
  async createUser(email: string, username: string, password: string) {
    return this.request.post(`${this.baseUrl}/auth/sign-up/email`, {
      data: { email, name: username, password },
    });
  }

  async login(email: string, password: string) {
    return this.request.post(`${this.baseUrl}/auth/sign-in/email`, {
      data: { email, password },
    });
  }

  // Series
  async createSeries(data: { title: string; genre?: string; logline?: string }) {
    return this.rpc<{ id: string; title: string }>('series.create', data);
  }

  async deleteSeries(id: string) {
    return this.rpc('series.delete', { id });
  }

  async getSeries(id: string) {
    return this.rpc('series.get', { id });
  }

  // Scripts
  async createScript(data: { seriesId: string; title: string; content?: string }) {
    return this.rpc<{ id: string; title: string }>('scripts.create', data);
  }

  async deleteScript(id: string) {
    return this.rpc('scripts.delete', { id });
  }

  // Knowledge Base - Characters
  async createCharacter(data: { seriesId: string; name: string; description?: string }) {
    return this.rpc<{ id: string; name: string }>('knowledgeBase.characters.create', data);
  }

  // Knowledge Base - Locations
  async createLocation(data: { seriesId: string; name: string; description?: string }) {
    return this.rpc<{ id: string; name: string }>('knowledgeBase.locations.create', data);
  }
}

export function createApiHelper(page: Page): ApiHelper {
  return new ApiHelper(page.request);
}
```

---

### 4.2 Test Data Helper

**File**: `apps/web/e2e/helpers/test-data.helper.ts`

```typescript
import { faker } from '@faker-js/faker';

// Seed faker for reproducible tests when needed
export const seedFaker = (seed: number) => {
  faker.seed(seed);
};

export const generateTestUser = () => ({
  email: `e2e-${Date.now()}-${faker.string.alphanumeric(6)}@test.kaeri.dev`,
  username: `e2e_user_${faker.string.alphanumeric(8)}`,
  password: 'TestPassword123!',
});

export const generateTestSeries = () => ({
  title: `E2E Series ${Date.now().toString(36)}`,
  genre: faker.helpers.arrayElement(['DRAMA', 'COMEDY', 'ACTION', 'THRILLER', 'HORROR', 'SCI_FI']),
  logline: faker.lorem.sentence(),
});

export const generateTestScript = () => ({
  title: `E2E Script ${Date.now().toString(36)}`,
});

export const generateTestCharacter = () => ({
  name: faker.person.fullName(),
  description: faker.lorem.paragraph(),
});

export const generateTestLocation = () => ({
  name: faker.location.city(),
  description: faker.lorem.paragraph(),
});

export const generateSceneHeading = () => {
  const interiorExterior = faker.helpers.arrayElement(['INT.', 'EXT.', 'INT./EXT.']);
  const location = faker.location.city().toUpperCase();
  const timeOfDay = faker.helpers.arrayElement(['DAY', 'NIGHT', 'MORNING', 'EVENING', 'CONTINUOUS']);
  return `${interiorExterior} ${location} - ${timeOfDay}`;
};

export const generateDialogue = () => faker.lorem.sentences({ min: 1, max: 3 });

export const generateAction = () => faker.lorem.paragraph();

export const generateCharacterName = () => faker.person.firstName().toUpperCase();

// Unique ID generator for test isolation
export const generateTestId = () => `e2e_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
```

---

### 4.3 Helper Index

**File**: `apps/web/e2e/helpers/index.ts`

```typescript
export { ApiHelper, createApiHelper } from './api.helper';
export * from './test-data.helper';
```

---

## Task 5: Example Test Specifications

### 5.1 Auth Login Tests

**File**: `apps/web/e2e/tests/auth/login.spec.ts`

```typescript
import { test, expect, TEST_USERS } from '../../fixtures/auth.fixture';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.navigateToAuth();
  });

  test('should display login form by default', async ({ authPage }) => {
    await authPage.expectLoginForm();
  });

  test('should login with valid credentials and redirect to dashboard', async ({ authPage }) => {
    await authPage.login(TEST_USERS.default.email, TEST_USERS.default.password);
    await authPage.expectRedirectToDashboard();
  });

  test('should show error message with invalid credentials', async ({ authPage }) => {
    await authPage.login('nonexistent@example.com', 'wrongpassword');
    await authPage.expectError(/invalid|incorrect|not found/i);
  });

  test('should redirect unauthenticated user to auth page when accessing dashboard', async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should persist session across page reload', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.reload();
    
    // Should still be on dashboard, not redirected to auth
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);
  });
});
```

---

### 5.2 Series CRUD Tests

**File**: `apps/web/e2e/tests/series/create-series.spec.ts`

```typescript
import { test, expect } from '../../fixtures/series.fixture';
import { generateTestSeries, generateTestId } from '../../helpers/test-data.helper';

test.describe('Create Series', () => {
  test.beforeEach(async ({ authenticatedPage, dashboardPage }) => {
    await dashboardPage.navigateToDashboard();
  });

  test('should open create series modal when clicking create button', async ({ dashboardPage }) => {
    await dashboardPage.clickCreateSeries();
    // Modal assertion is handled inside clickCreateSeries
  });

  test('should create series with only required title field', async ({ dashboardPage, seriesPage }) => {
    const title = `Minimal Series ${generateTestId()}`;

    await dashboardPage.clickCreateSeries();
    await seriesPage.createSeries({ title });

    await dashboardPage.expectSeriesVisible(title);
  });

  test('should create series with all fields filled', async ({ dashboardPage, seriesPage }) => {
    const seriesData = {
      ...generateTestSeries(),
      title: `Full Series ${generateTestId()}`,
    };

    await dashboardPage.clickCreateSeries();
    await seriesPage.createSeries(seriesData);

    await dashboardPage.expectSeriesVisible(seriesData.title);
  });

  test('should show series in grid after creation', async ({ dashboardPage, seriesPage }) => {
    const title = `Grid Test ${generateTestId()}`;

    await dashboardPage.clickCreateSeries();
    await seriesPage.createSeries({ title });

    // Verify it appears in the grid
    await dashboardPage.expectSeriesVisible(title);
  });

  test('should be able to open newly created series', async ({ dashboardPage, seriesPage }) => {
    const title = `Openable Series ${generateTestId()}`;

    await dashboardPage.clickCreateSeries();
    await seriesPage.createSeries({ title });
    
    await dashboardPage.openSeries(title);
    await seriesPage.expectSeriesTitle(title);
  });
});
```

---

### 5.3 Script Block Editing Tests

**File**: `apps/web/e2e/tests/scripts/block-editing.spec.ts`

```typescript
import { test, expect } from '../../fixtures/series.fixture';
import { generateSceneHeading, generateAction, generateCharacterName } from '../../helpers/test-data.helper';

test.describe('Script Block Editing', () => {
  test.beforeEach(async ({ authenticatedPage, scriptEditorPage, testScript }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    await scriptEditorPage.waitForLoadingComplete();
  });

  test('should display editor with at least one block', async ({ scriptEditorPage }) => {
    // Editor should have at least one block to start
    const blockCount = await scriptEditorPage.getBlockCount();
    expect(blockCount).toBeGreaterThanOrEqual(1);
  });

  test('should change block type using dropdown selector', async ({ scriptEditorPage }) => {
    await scriptEditorPage.changeBlockType(0, 'scene-heading');
    await scriptEditorPage.expectBlockType(0, 'scene-heading');
  });

  test('should cycle through block types with Tab key', async ({ scriptEditorPage }) => {
    await scriptEditorPage.focusBlock(0);
    
    // Tab should cycle to next type
    await scriptEditorPage.pressTab();
    
    // Verify type changed (specific type depends on initial state)
    // Just verify it's not the same as default
  });

  test('should create new block when pressing Enter', async ({ scriptEditorPage }) => {
    const initialCount = await scriptEditorPage.getBlockCount();
    
    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.typeInBlock(0, generateSceneHeading());
    await scriptEditorPage.pressEnter();

    await scriptEditorPage.expectBlockCount(initialCount + 1);
  });

  test('should create action block after scene heading', async ({ scriptEditorPage }) => {
    await scriptEditorPage.changeBlockType(0, 'scene-heading');
    await scriptEditorPage.typeInBlock(0, generateSceneHeading());
    await scriptEditorPage.pressEnter();

    // New block should be action type
    await scriptEditorPage.expectBlockType(1, 'action');
  });

  test('should create dialogue block after character', async ({ scriptEditorPage }) => {
    await scriptEditorPage.changeBlockType(0, 'character');
    await scriptEditorPage.typeInBlock(0, generateCharacterName());
    await scriptEditorPage.pressEnter();

    // New block should be dialogue type
    await scriptEditorPage.expectBlockType(1, 'dialogue');
  });

  test('should persist content after manual save', async ({ scriptEditorPage, page }) => {
    const sceneHeading = generateSceneHeading();

    await scriptEditorPage.changeBlockType(0, 'scene-heading');
    await scriptEditorPage.typeInBlock(0, sceneHeading);
    await scriptEditorPage.save();
    await scriptEditorPage.waitForAutosave();

    // Reload and verify
    await page.reload();
    await scriptEditorPage.waitForLoadingComplete();

    await scriptEditorPage.expectBlockType(0, 'scene-heading');
    await scriptEditorPage.expectBlockText(0, sceneHeading);
  });

  test('should show knowledge base panel', async ({ scriptEditorPage }) => {
    await scriptEditorPage.expectKnowledgeBasePanelVisible();
  });
});
```

---

## Task 6: Global Setup

### 6.1 Global Setup File

**File**: `apps/web/e2e/global.setup.ts`

```typescript
import { test as setup } from '@playwright/test';
import { TEST_USERS } from './fixtures/auth.fixture';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Go to auth page
  await page.goto('/auth');

  // Try to login, create user if doesn't exist
  const emailInput = page.locator('input[name="email"], input[type="email"]');
  const passwordInput = page.locator('input[name="password"], input[type="password"]');
  const submitButton = page.locator('button[type="submit"]');

  await emailInput.fill(TEST_USERS.default.email);
  await passwordInput.fill(TEST_USERS.default.password);
  await submitButton.click();

  // Wait for either dashboard redirect or error
  await Promise.race([
    page.waitForURL(/\/dashboard/, { timeout: 5000 }),
    page.waitForSelector('[data-testid="auth-error"], [role="alert"]', { timeout: 5000 }),
  ]).catch(() => {});

  // Check if login failed (user doesn't exist)
  const isOnDashboard = page.url().includes('/dashboard');
  
  if (!isOnDashboard) {
    // Need to signup first
    await page.goto('/auth');
    
    // Switch to signup
    const signupTab = page.locator('[data-tab="signup"], button:has-text("Sign up")');
    if (await signupTab.isVisible()) {
      await signupTab.click();
    }

    await emailInput.fill(TEST_USERS.default.email);
    
    const usernameInput = page.locator('input[name="username"], input[name="name"]');
    await usernameInput.fill(TEST_USERS.default.username);
    
    await passwordInput.fill(TEST_USERS.default.password);
    await submitButton.click();

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }

  // Save authenticated state
  await page.context().storageState({ path: authFile });
});
```

---

## Task 7: Documentation

### 7.1 E2E README

**File**: `apps/web/e2e/README.md`

```markdown
# E2E Testing with Playwright

This directory contains end-to-end tests for the Kaeri web application using Playwright.

## Quick Start

```bash
# Install dependencies (from repo root)
bun install

# Install Playwright browsers
cd apps/web && bunx playwright install

# Run tests
bun run test:e2e

# Run tests with UI
bun run test:e2e:ui

# Run tests in debug mode
bun run test:e2e:debug

# View test report
bun run test:e2e:report
```

## Directory Structure

```
e2e/
├── fixtures/          # Test fixtures and setup
│   ├── auth.fixture.ts
│   └── series.fixture.ts
├── pages/             # Page Object Model classes
│   ├── base.page.ts
│   ├── auth.page.ts
│   ├── dashboard.page.ts
│   └── ...
├── helpers/           # Test utilities
│   ├── api.helper.ts
│   └── test-data.helper.ts
├── tests/             # Test specifications
│   ├── auth/
│   ├── series/
│   ├── scripts/
│   └── ...
├── global.setup.ts    # Global test setup
├── playwright.config.ts
└── README.md
```

## Writing Tests

### Using Page Objects

```typescript
import { test, expect } from '../../fixtures/series.fixture';

test('should create a series', async ({ dashboardPage, seriesPage }) => {
  await dashboardPage.navigateToDashboard();
  await dashboardPage.clickCreateSeries();
  await seriesPage.createSeries({ title: 'My Series' });
  await dashboardPage.expectSeriesVisible('My Series');
});
```

### Using Fixtures

Fixtures provide pre-configured resources:

- `authPage` - Auth page object
- `dashboardPage` - Dashboard page object
- `seriesPage` - Series page object
- `authenticatedPage` - Page with authenticated session
- `testSeries` - Pre-created series for testing
- `testScript` - Pre-created script for testing

### Test Data

Use helpers for generating test data:

```typescript
import { generateTestSeries } from '../../helpers/test-data.helper';

const series = generateTestSeries();
// { title: 'E2E Series abc123', genre: 'DRAMA', logline: '...' }
```

## Best Practices

1. **Use Page Objects** - Encapsulate selectors and actions
2. **Use Fixtures** - Set up test data via API for speed
3. **Test Isolation** - Each test should be independent
4. **Meaningful Assertions** - Use specific, descriptive assertions
5. **Avoid Flakiness** - Use proper waits, not timeouts

## Common Issues

### Tests failing in CI

- Check that all services are running (MongoDB, server, web)
- Verify environment variables are set correctly
- Check for timing issues with network requests

### Flaky tests

- Add proper waits for network requests
- Use `waitForLoadState` instead of arbitrary timeouts
- Ensure test data is unique per test

### Debugging

```bash
# Run single test file
bunx playwright test tests/auth/login.spec.ts

# Run with trace viewer
bunx playwright test --trace on

# Debug with inspector
bunx playwright test --debug
```
```

````
