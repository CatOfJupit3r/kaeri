````markdown
# Feature Specification: End-to-End Testing with Playwright

**Feature Branch**: `[010-e2e-testing]`  
**Created**: 2026-03-17  
**Last Updated**: 2026-03-17  
**Status**: Ready for Implementation  
**Input**: E2E testing infrastructure for Kaeri monorepo

## Overview

This specification defines the end-to-end (E2E) testing strategy using Playwright for the Kaeri application. E2E tests validate that the entire application works correctly from the user's perspective, covering critical user flows across authentication, series management, script authoring, knowledge base, canvas, and export features.

## Goals

1. **Confidence in Deployments**: Catch regressions before they reach production
2. **User Flow Validation**: Ensure all critical paths work as expected
3. **Cross-Browser Support**: Validate functionality across Chrome, Firefox, and Safari
4. **Local Development First**: Tests run locally during development for fast feedback
5. **Developer Experience**: Easy-to-write, maintain, and debug tests

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authentication Flow (Priority: P1)
A user can sign up, log in, and log out while being correctly redirected between protected and public routes.

**Why this priority**: Authentication gates all other features.

**Independent Test**: User can complete full auth cycle (signup → dashboard → logout → login → dashboard).

**Acceptance Scenarios**:
1. Given an unauthenticated user, when visiting a protected route, then redirect to `/auth`.
2. Given valid credentials, when logging in, then redirect to dashboard with user session cookie set.
3. Given an authenticated user, when logging out, then session is cleared and user is redirected to home.
4. Given invalid credentials, when attempting login, then appropriate error message is displayed.

---

### User Story 2 - Series CRUD Operations (Priority: P1)
A writer can create, read, update, and delete series from their dashboard.

**Why this priority**: Series is the container for all downstream features.

**Independent Test**: User can create a series, view it in the library, edit metadata, and delete it.

**Acceptance Scenarios**:
1. Given dashboard view, when clicking "Create Series", then modal opens with required fields.
2. Given valid series data, when submitting the form, then series appears in library with correct metadata.
3. Given existing series, when editing title/genre/logline, then changes persist on page refresh.
4. Given existing series, when deleting, then series is removed and no longer visible in library.

---

### User Story 3 - Script Authoring Flow (Priority: P1)
A writer can create scripts within a series and write content using the block-based editor.

**Why this priority**: Core authoring experience.

**Independent Test**: User can create a script, add multiple block types, save, and reload with content intact.

**Acceptance Scenarios**:
1. Given a series, when creating a new script, then script appears in series scripts list.
2. Given script editor, when adding scene heading block (pressing S), then block type changes with blue border.
3. Given script with content, when saving and reloading, then all blocks preserve type and content.
4. Given Editor, when pressing Enter on character block, then new dialogue block is created.
5. Given Editor, when pressing Tab, then block type cycles through available types.

---

### User Story 4 - Knowledge Base Management (Priority: P1)
A writer can create and manage knowledge base entities (characters, locations, props, etc.) within a series.

**Why this priority**: Knowledge base supports continuity and script references.

**Independent Test**: User can create character with traits, view detail page, and search across entities.

**Acceptance Scenarios**:
1. Given series KB view, when creating a character, then character appears in entity list.
2. Given character detail, when adding traits/relationships, then data persists on refresh.
3. Given multiple entities, when searching, then results filter correctly across all entity types.
4. Given character in KB, when typing `@` in script editor, then autocomplete suggests the character.

---

### User Story 5 - Canvas Operations (Priority: P3 - Deferred)
A writer can use the canvas for story structuring with nodes and connections.

**Why this priority**: Supports brainstorming workflow. Deferred due to complexity of testing React Flow interactions.

**Independent Test**: User can add nodes, connect them, pan/zoom, and state persists per series.

**Acceptance Scenarios**:
1. Given series canvas, when adding text/shape nodes, then nodes appear at specified positions.
2. Given placed nodes, when creating connections, then edges are drawn between nodes.
3. Given canvas state, when navigating away and returning, then all nodes/edges are preserved.

> **Note**: Canvas E2E tests are deferred to a future phase due to complexity of testing drag-and-drop and React Flow interactions.

---

### User Story 6 - Export Functionality (Priority: P3)
A writer can export scripts to PDF format.

**Why this priority**: Enables sharing and external use.

**Independent Test**: Export produces valid PDF with preserved screenplay formatting.

**Acceptance Scenarios**:
1. Given a saved script, when triggering export, then PDF downloads within 5 seconds.
2. Given exported PDF, then scene headings, dialogue, and action blocks maintain formatting.

---

### Edge Cases

- **Session Expiry**: What happens when session expires mid-action? → Graceful redirect to auth with pending action queued.
- **Network Failures**: How do mutations handle network errors? → Toast notification with retry option.
- **Concurrent Edits**: How does autosave handle rapid changes? → Debounced saves with conflict indication.
- **Large Data Sets**: How does UI perform with 100+ entities/scripts? → Virtualized lists and pagination.
- **Browser Back/Forward**: Navigation history preserves expected state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: E2E test suite MUST validate authentication flows (signup, login, logout, session persistence).
- **FR-002**: E2E test suite MUST validate series CRUD operations and library display.
- **FR-003**: E2E test suite MUST validate script creation, block-based editing, and autosave.
- **FR-004**: E2E test suite MUST validate knowledge base entity management and search.
- **FR-005**: E2E test suite MUST validate canvas operations (nodes, edges, persistence).
- **FR-006**: E2E test suite MUST validate export functionality and PDF generation.
- **FR-007**: E2E tests MUST support parallel execution for faster feedback.
- **FR-008**: E2E tests MUST generate reports with screenshots/videos on failure.
- **FR-009**: E2E tests MUST use Page Object Model for maintainability.

### Non-Functional Requirements

- **NFR-001**: Full E2E suite MUST complete in under 10 minutes locally.
- **NFR-002**: Tests MUST be deterministic with no flaky tests (>99% pass rate on retries).
- **NFR-003**: Tests MUST support running against local dev environment.
- **NFR-004**: Test code MUST follow same quality standards as production code (linting, typing).

### Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Playwright | Cross-browser support, auto-wait, trace viewer, API testing |
| Pattern | Page Object Model | Encapsulation, reusability, maintainability |
| Test Data | API seeding + Fixtures | Fast setup, isolated tests, deterministic state |
| Parallelization | Per-worker isolation | Independent test execution, faster CI |
| Reporting | HTML + JSON | Human-readable + machine-parseable |

## Architecture & Design

### Directory Structure

```
apps/web/
├── e2e/
│   ├── fixtures/
│   │   ├── auth.fixture.ts          # Authentication setup
│   │   ├── series.fixture.ts        # Series data factories
│   │   ├── script.fixture.ts        # Script data factories
│   │   └── index.ts                 # Fixture exports
│   ├── pages/
│   │   ├── base.page.ts             # Base page object
│   │   ├── auth.page.ts             # Auth page object
│   │   ├── dashboard.page.ts        # Dashboard page object
│   │   ├── series.page.ts           # Series page object
│   │   ├── script-editor.page.ts    # Script editor page object
│   │   ├── knowledge-base.page.ts   # KB page object
│   │   └── index.ts                 # Page exports
│   ├── helpers/
│   │   ├── api.helper.ts            # Direct API calls for seeding
│   │   ├── auth.helper.ts           # Auth utilities
│   │   ├── test-data.helper.ts      # Test data generators
│   │   └── wait.helper.ts           # Custom wait utilities
│   ├── tests/
│   │   ├── auth/
│   │   │   ├── login.spec.ts
│   │   │   ├── signup.spec.ts
│   │   │   └── logout.spec.ts
│   │   ├── series/
│   │   │   ├── create-series.spec.ts
│   │   │   ├── edit-series.spec.ts
│   │   │   └── delete-series.spec.ts
│   │   ├── scripts/
│   │   │   ├── create-script.spec.ts
│   │   │   ├── block-editing.spec.ts
│   │   │   └── autosave.spec.ts
│   │   ├── knowledge-base/
│   │   │   ├── characters.spec.ts
│   │   │   ├── locations.spec.ts
│   │   │   └── search.spec.ts
│   │   └── export/
│   │       └── pdf-export.spec.ts
│   └── playwright.config.ts
└── package.json
```

### Index Exports

```typescript
// e2e/pages/index.ts
export { BasePage } from './base.page';
export { AuthPage } from './auth.page';
export { DashboardPage } from './dashboard.page';
export { SeriesPage } from './series.page';
export { ScriptEditorPage } from './script-editor.page';
export { KnowledgeBasePage } from './knowledge-base.page';
export { ExportPage } from './export.page';
```

```typescript
// e2e/fixtures/index.ts
export { test, expect, TEST_USERS } from './auth.fixture';
export { test as seriesTest } from './series.fixture';
```

```typescript
// e2e/helpers/index.ts
export { ApiHelper, createApiHelper } from './api.helper';
export { WaitHelper, createWaitHelper } from './wait.helper';
export { CleanupHelper, createCleanupHelper } from './cleanup.helper';
export * from './test-data.helper';
```

### Required Data Test IDs

The following `data-testid` attributes **must be added** to the corresponding components for E2E tests to function. This serves as a contract between E2E tests and the UI implementation.

#### Dashboard Components
| Component | Test ID | File Location |
|-----------|---------|---------------|
| Series grid container | `data-testid="series-grid"` | `features/series/components/series-grid.tsx` |
| Individual series card | `data-testid="series-card"` | `features/series/components/series-card.tsx` |
| Empty series state | `data-testid="empty-series"` | `features/series/components/series-empty-state.tsx` |
| User menu trigger | `data-testid="user-menu"` | `components/layout/user-menu.tsx` |

#### Series Components
| Component | Test ID | File Location |
|-----------|---------|---------------|
| Series header | `data-testid="series-header"` | `features/series/components/series-header.tsx` |
| Scripts list container | `data-testid="scripts-list"` | `features/scripts/components/scripts-list.tsx` |
| Script card | `data-testid="script-card"` | `features/scripts/components/script-card.tsx` |
| Genre select dropdown | `data-testid="genre-select"` | `features/series/components/series-form.tsx` |

#### Script Editor Components
| Component | Test ID | File Location |
|-----------|---------|---------------|
| Editor container | `data-testid="script-editor"` | `features/scripts/components/script-editor.tsx` |
| Individual block | `data-testid="block"` + `data-block-type="<type>"` | `features/scripts/components/script-block.tsx` |
| Block type selector | `data-testid="block-type-selector"` | `features/scripts/components/block-type-selector.tsx` |
| Save indicator | `data-testid="save-indicator"` | `features/scripts/components/save-indicator.tsx` |
| Autocomplete dropdown | `data-testid="autocomplete-dropdown"` | `features/scripts/components/autocomplete-dropdown.tsx` |
| KB side panel | `data-testid="knowledge-base-panel"` | `features/scripts/components/kb-panel.tsx` |

#### Knowledge Base Components
| Component | Test ID | File Location |
|-----------|---------|---------------|
| Entity tabs container | `data-testid="kb-entity-tabs"` | `features/knowledge-base/components/entity-tabs.tsx` |
| Entity list container | `data-testid="entity-list"` | `features/knowledge-base/components/entity-list.tsx` |
| Entity card | `data-testid="entity-card"` | `features/knowledge-base/components/entity-card.tsx` |

#### Auth Components
| Component | Test ID | File Location |
|-----------|---------|---------------|
| Auth error message | `data-testid="auth-error"` | `features/auth/components/auth-form.tsx` |
| Login tab | `data-tab="login"` | `features/auth/components/auth-tabs.tsx` |
| Signup tab | `data-tab="signup"` | `features/auth/components/auth-tabs.tsx` |

#### Common Components
| Component | Test ID | File Location |
|-----------|---------|---------------|
| Loading skeleton | `data-testid="skeleton"` | `components/ui/skeleton.tsx` |
| Tab items | `data-tab="<tab-name>"` | Various tab components |
| Select option values | `data-value="<value>"` | Select/dropdown components |

> **Implementation Note**: Add these test IDs during Phase 1 setup. Create a separate task to audit existing components and add missing test IDs before writing E2E tests.

### Page Object Model Classes

#### Base Page Object

```typescript
// e2e/pages/base.page.ts
import { type Page, type Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Common navigation
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  // Common waits
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForDomContentLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Common assertions
  async expectUrl(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  async expectTitle(title: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  // Toast notifications
  async expectToast(message: string | RegExp): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    await expect(toast).toContainText(message);
  }

  async dismissToast(): Promise<void> {
    await this.page.locator('[data-sonner-toast] button[aria-label="Close"]').click();
  }

  // Modal helpers
  async waitForModal(): Promise<Locator> {
    const modal = this.page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    return modal;
  }

  async closeModal(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  // Loading states
  async waitForSkeleton(): Promise<void> {
    await this.page.locator('[data-testid="skeleton"]').waitFor({ state: 'detached' });
  }
}
```

#### Auth Page Object

```typescript
// e2e/pages/auth.page.ts
import { type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AuthPage extends BasePage {
  // Locators
  private readonly emailInput = this.page.locator('input[name="email"]');
  private readonly passwordInput = this.page.locator('input[name="password"]');
  private readonly usernameInput = this.page.locator('input[name="username"]');
  private readonly submitButton = this.page.locator('button[type="submit"]');
  private readonly loginTab = this.page.locator('[data-tab="login"]');
  private readonly signupTab = this.page.locator('[data-tab="signup"]');
  private readonly errorMessage = this.page.locator('[data-testid="auth-error"]');
  private readonly googleButton = this.page.locator('button:has-text("Continue with Google")');

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToAuth(): Promise<void> {
    await this.goto('/auth');
    await this.waitForDomContentLoaded();
  }

  // Actions
  async switchToLogin(): Promise<void> {
    await this.loginTab.click();
  }

  async switchToSignup(): Promise<void> {
    await this.signupTab.click();
  }

  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async fillSignupForm(email: string, username: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
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
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async expectError(message: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectRedirectToDashboard(): Promise<void> {
    await this.expectUrl('/dashboard');
  }
}
```

#### Dashboard Page Object

```typescript
// e2e/pages/dashboard.page.ts
import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  // Locators
  private readonly createSeriesButton = this.page.locator('button:has-text("Create Series")');
  private readonly seriesGrid = this.page.locator('[data-testid="series-grid"]');
  private readonly seriesCard = (name: string) => this.page.locator(`[data-testid="series-card"]:has-text("${name}")`);
  private readonly userMenu = this.page.locator('[data-testid="user-menu"]');
  private readonly logoutButton = this.page.locator('button:has-text("Log out")');
  private readonly searchInput = this.page.locator('input[placeholder*="Search"]');

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToDashboard(): Promise<void> {
    await this.goto('/dashboard');
    await this.waitForNetworkIdle();
  }

  // Actions
  async clickCreateSeries(): Promise<void> {
    await this.createSeriesButton.click();
    await this.waitForModal();
  }

  async openSeries(name: string): Promise<void> {
    await this.seriesCard(name).click();
  }

  async searchSeries(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300); // debounce
  }

  async openUserMenu(): Promise<void> {
    await this.userMenu.click();
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.logoutButton.click();
  }

  // Assertions
  async expectSeriesVisible(name: string): Promise<void> {
    await expect(this.seriesCard(name)).toBeVisible();
  }

  async expectSeriesNotVisible(name: string): Promise<void> {
    await expect(this.seriesCard(name)).not.toBeVisible();
  }

  async expectSeriesCount(count: number): Promise<void> {
    await expect(this.seriesGrid.locator('[data-testid="series-card"]')).toHaveCount(count);
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.page.locator('[data-testid="empty-series"]')).toBeVisible();
  }
}
```

#### Series Page Object

```typescript
// e2e/pages/series.page.ts
import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class SeriesPage extends BasePage {
  // Locators - Create/Edit Modal
  private readonly modal = this.page.locator('[role="dialog"]');
  private readonly titleInput = this.modal.locator('input[name="title"]');
  private readonly genreSelect = this.modal.locator('[data-testid="genre-select"]');
  private readonly loglineTextarea = this.modal.locator('textarea[name="logline"]');
  private readonly coverUpload = this.modal.locator('input[type="file"]');
  private readonly saveButton = this.modal.locator('button:has-text("Save")');
  private readonly cancelButton = this.modal.locator('button:has-text("Cancel")');

  // Locators - Series View
  private readonly seriesHeader = this.page.locator('[data-testid="series-header"]');
  private readonly scriptsTab = this.page.locator('[data-tab="scripts"]');
  private readonly knowledgeBaseTab = this.page.locator('[data-tab="knowledge-base"]');
  private readonly canvasTab = this.page.locator('[data-tab="canvas"]');
  private readonly settingsTab = this.page.locator('[data-tab="settings"]');
  private readonly createScriptButton = this.page.locator('button:has-text("Create Script")');
  private readonly scriptsList = this.page.locator('[data-testid="scripts-list"]');
  private readonly scriptCard = (name: string) => this.page.locator(`[data-testid="script-card"]:has-text("${name}")`);
  private readonly editSeriesButton = this.page.locator('button[aria-label="Edit series"]');
  private readonly deleteSeriesButton = this.page.locator('button[aria-label="Delete series"]');

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToSeries(seriesId: string): Promise<void> {
    await this.goto(`/series/${seriesId}`);
    await this.waitForNetworkIdle();
  }

  // Modal Actions
  async fillSeriesForm(data: { title: string; genre?: string; logline?: string }): Promise<void> {
    await this.titleInput.fill(data.title);
    if (data.genre) {
      await this.genreSelect.click();
      await this.page.locator(`[data-value="${data.genre}"]`).click();
    }
    if (data.logline) {
      await this.loglineTextarea.fill(data.logline);
    }
  }

  async submitSeriesForm(): Promise<void> {
    await this.saveButton.click();
    await this.modal.waitFor({ state: 'detached' });
  }

  async createSeries(data: { title: string; genre?: string; logline?: string }): Promise<void> {
    await this.fillSeriesForm(data);
    await this.submitSeriesForm();
  }

  // Tab Navigation
  async goToScripts(): Promise<void> {
    await this.scriptsTab.click();
  }

  async goToKnowledgeBase(): Promise<void> {
    await this.knowledgeBaseTab.click();
  }

  async goToCanvas(): Promise<void> {
    await this.canvasTab.click();
  }

  async goToSettings(): Promise<void> {
    await this.settingsTab.click();
  }

  // Script Actions
  async clickCreateScript(): Promise<void> {
    await this.createScriptButton.click();
    await this.waitForModal();
  }

  async openScript(name: string): Promise<void> {
    await this.scriptCard(name).click();
  }

  // Series Actions
  async editSeries(): Promise<void> {
    await this.editSeriesButton.click();
    await this.waitForModal();
  }

  async deleteSeries(): Promise<void> {
    await this.deleteSeriesButton.click();
    // Confirm deletion dialog
    await this.page.locator('button:has-text("Delete")').click();
  }

  // Assertions
  async expectSeriesTitle(title: string): Promise<void> {
    await expect(this.seriesHeader).toContainText(title);
  }

  async expectScriptVisible(name: string): Promise<void> {
    await expect(this.scriptCard(name)).toBeVisible();
  }

  async expectScriptCount(count: number): Promise<void> {
    await expect(this.scriptsList.locator('[data-testid="script-card"]')).toHaveCount(count);
  }
}
```

#### Script Editor Page Object

```typescript
// e2e/pages/script-editor.page.ts
import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

type BlockType = 'scene-heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition';

export class ScriptEditorPage extends BasePage {
  // Locators
  private readonly editorContainer = this.page.locator('[data-testid="script-editor"]');
  private readonly blocksList = this.editorContainer.locator('[data-testid="block"]');
  private readonly addBlockButton = this.page.locator('button:has-text("Add Block")');
  private readonly saveIndicator = this.page.locator('[data-testid="save-indicator"]');
  private readonly saveButton = this.page.locator('button:has-text("Save")');
  private readonly kbPanel = this.page.locator('[data-testid="knowledge-base-panel"]');
  private readonly autocompleteDropdown = this.page.locator('[data-testid="autocomplete-dropdown"]');

  // Block locators
  private block(index: number): Locator {
    return this.blocksList.nth(index);
  }

  private blockTextarea(index: number): Locator {
    return this.block(index).locator('textarea');
  }

  private blockTypeSelector(index: number): Locator {
    return this.block(index).locator('[data-testid="block-type-selector"]');
  }

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToScript(seriesId: string, scriptId: string): Promise<void> {
    await this.goto(`/series/${seriesId}/scripts/${scriptId}`);
    await this.waitForNetworkIdle();
  }

  // Block Actions
  async focusBlock(index: number): Promise<void> {
    await this.blockTextarea(index).click();
  }

  async typeInBlock(index: number, text: string): Promise<void> {
    await this.blockTextarea(index).fill(text);
  }

  async appendToBlock(index: number, text: string): Promise<void> {
    await this.blockTextarea(index).press('End');
    await this.blockTextarea(index).type(text);
  }

  async changeBlockType(index: number, type: BlockType): Promise<void> {
    await this.blockTypeSelector(index).click();
    await this.page.locator(`[data-block-type="${type}"]`).click();
  }

  async addBlock(): Promise<void> {
    await this.addBlockButton.click();
  }

  async deleteBlock(index: number): Promise<void> {
    await this.focusBlock(index);
    await this.blockTextarea(index).selectText();
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.press('Backspace'); // Second backspace deletes empty block
  }

  // Keyboard shortcuts
  async pressEnter(): Promise<void> {
    await this.page.keyboard.press('Enter');
  }

  async pressTab(): Promise<void> {
    await this.page.keyboard.press('Tab');
  }

  async pressShortcut(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  // Autocomplete
  async triggerAutocomplete(): Promise<void> {
    await this.page.keyboard.type('@');
  }

  async selectAutocompleteOption(name: string): Promise<void> {
    await this.autocompleteDropdown.locator(`text="${name}"`).click();
  }

  // Save
  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async waitForAutosave(): Promise<void> {
    await expect(this.saveIndicator).toContainText(/saved/i);
  }

  // Assertions
  async expectBlockCount(count: number): Promise<void> {
    await expect(this.blocksList).toHaveCount(count);
  }

  async expectBlockText(index: number, text: string): Promise<void> {
    await expect(this.blockTextarea(index)).toHaveValue(text);
  }

  async expectBlockType(index: number, type: BlockType): Promise<void> {
    await expect(this.block(index)).toHaveAttribute('data-block-type', type);
  }

  async expectAutocompleteVisible(): Promise<void> {
    await expect(this.autocompleteDropdown).toBeVisible();
  }

  async expectKnowledgeBasePanelVisible(): Promise<void> {
    await expect(this.kbPanel).toBeVisible();
  }
}
```

#### Knowledge Base Page Object

```typescript
// e2e/pages/knowledge-base.page.ts
import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

type EntityType = 'characters' | 'locations' | 'props' | 'themes' | 'timelines' | 'wildcards';

export class KnowledgeBasePage extends BasePage {
  // Locators
  private readonly entityTabs = this.page.locator('[data-testid="kb-entity-tabs"]');
  private readonly entityList = this.page.locator('[data-testid="entity-list"]');
  private readonly searchInput = this.page.locator('input[placeholder*="Search"]');
  private readonly createButton = this.page.locator('button:has-text("Create")');
  private readonly entityCard = (name: string) => this.page.locator(`[data-testid="entity-card"]:has-text("${name}")`);

  // Modal locators
  private readonly modal = this.page.locator('[role="dialog"]');
  private readonly nameInput = this.modal.locator('input[name="name"]');
  private readonly descriptionTextarea = this.modal.locator('textarea[name="description"]');
  private readonly saveButton = this.modal.locator('button:has-text("Save")');

  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigateToKnowledgeBase(seriesId: string): Promise<void> {
    await this.goto(`/series/${seriesId}/knowledge-base`);
    await this.waitForNetworkIdle();
  }

  async switchTab(entityType: EntityType): Promise<void> {
    await this.entityTabs.locator(`[data-tab="${entityType}"]`).click();
  }

  // Actions
  async searchEntities(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300); // debounce
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click();
    await this.waitForModal();
  }

  async fillEntityForm(data: { name: string; description?: string }): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.description) {
      await this.descriptionTextarea.fill(data.description);
    }
  }

  async submitEntityForm(): Promise<void> {
    await this.saveButton.click();
    await this.modal.waitFor({ state: 'detached' });
  }

  async createEntity(data: { name: string; description?: string }): Promise<void> {
    await this.clickCreate();
    await this.fillEntityForm(data);
    await this.submitEntityForm();
  }

  async openEntity(name: string): Promise<void> {
    await this.entityCard(name).click();
  }

  // Assertions
  async expectEntityVisible(name: string): Promise<void> {
    await expect(this.entityCard(name)).toBeVisible();
  }

  async expectEntityNotVisible(name: string): Promise<void> {
    await expect(this.entityCard(name)).not.toBeVisible();
  }

  async expectEntityCount(count: number): Promise<void> {
    await expect(this.entityList.locator('[data-testid="entity-card"]')).toHaveCount(count);
  }

  async expectSearchResults(count: number): Promise<void> {
    await this.expectEntityCount(count);
  }
}
```

#### Export Page Object

```typescript
// e2e/pages/export.page.ts
import { type Page, type Download, expect } from '@playwright/test';
import { BasePage } from './base.page';

type ExportFormat = 'pdf' | 'fdx' | 'fountain';

export class ExportPage extends BasePage {
  // Locators
  private readonly exportButton = this.page.locator('button:has-text("Export")');
  private readonly exportMenu = this.page.locator('[data-testid="export-menu"]');
  private readonly formatOption = (format: ExportFormat) => 
    this.exportMenu.locator(`[data-export-format="${format}"]`);
  private readonly exportDialog = this.page.locator('[role="dialog"][data-testid="export-dialog"]');
  private readonly exportProgress = this.page.locator('[data-testid="export-progress"]');
  private readonly downloadButton = this.page.locator('button:has-text("Download")');

  constructor(page: Page) {
    super(page);
  }

  // Actions
  async openExportMenu(): Promise<void> {
    await this.exportButton.click();
    await expect(this.exportMenu).toBeVisible();
  }

  async selectFormat(format: ExportFormat): Promise<void> {
    await this.formatOption(format).click();
  }

  async waitForExportComplete(timeout = 30000): Promise<void> {
    // Wait for progress to appear and then disappear
    await this.exportProgress.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await this.exportProgress.waitFor({ state: 'detached', timeout });
  }

  async exportToPdf(): Promise<Download> {
    // Start waiting for download before triggering export
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });

    await this.openExportMenu();
    await this.selectFormat('pdf');
    await this.waitForExportComplete();

    // If there's a download button, click it
    if (await this.downloadButton.isVisible()) {
      await this.downloadButton.click();
    }

    return downloadPromise;
  }

  async exportToFdx(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });

    await this.openExportMenu();
    await this.selectFormat('fdx');
    await this.waitForExportComplete();

    if (await this.downloadButton.isVisible()) {
      await this.downloadButton.click();
    }

    return downloadPromise;
  }

  async exportToFountain(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });

    await this.openExportMenu();
    await this.selectFormat('fountain');
    await this.waitForExportComplete();

    if (await this.downloadButton.isVisible()) {
      await this.downloadButton.click();
    }

    return downloadPromise;
  }

  // Assertions
  async expectExportMenuVisible(): Promise<void> {
    await expect(this.exportMenu).toBeVisible();
  }

  async expectExportDialogVisible(): Promise<void> {
    await expect(this.exportDialog).toBeVisible();
  }

  async expectDownloadStarted(download: Download, expectedFilename?: string | RegExp): Promise<void> {
    const filename = download.suggestedFilename();
    
    if (expectedFilename) {
      if (typeof expectedFilename === 'string') {
        expect(filename).toContain(expectedFilename);
      } else {
        expect(filename).toMatch(expectedFilename);
      }
    }
  }

  /**
   * Helper to verify downloaded file size is reasonable
   */
  async expectDownloadSize(download: Download, minBytes = 1000): Promise<void> {
    const path = await download.path();
    if (path) {
      const fs = await import('fs');
      const stats = fs.statSync(path);
      expect(stats.size).toBeGreaterThan(minBytes);
    }
  }
}
```

### Fixtures Implementation

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base, type Page } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { DashboardPage } from '../pages/dashboard.page';

// Test user credentials
export const TEST_USERS = {
  default: {
    email: 'test@example.com',
    username: 'testuser',
    password: 'TestPassword123!',
  },
  alternate: {
    email: 'test2@example.com',
    username: 'testuser2',
    password: 'TestPassword456!',
  },
} as const;

type AuthFixtures = {
  authPage: AuthPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  authenticatedPage: async ({ page, context }, use) => {
    // Login via API for faster setup
    const response = await page.request.post('/api/auth/sign-in/email', {
      data: {
        email: TEST_USERS.default.email,
        password: TEST_USERS.default.password,
      },
    });

    if (!response.ok()) {
      // User doesn't exist, create first
      await page.request.post('/api/auth/sign-up/email', {
        data: {
          email: TEST_USERS.default.email,
          name: TEST_USERS.default.username,
          password: TEST_USERS.default.password,
        },
      });

      // Then login
      await page.request.post('/api/auth/sign-in/email', {
        data: {
          email: TEST_USERS.default.email,
          password: TEST_USERS.default.password,
        },
      });
    }

    await use(page);
  },
});

export { expect } from '@playwright/test';
```

```typescript
// e2e/fixtures/series.fixture.ts
import { test as authTest, TEST_USERS } from './auth.fixture';
import { SeriesPage } from '../pages/series.page';
import { ScriptEditorPage } from '../pages/script-editor.page';
import { KnowledgeBasePage } from '../pages/knowledge-base.page';
import { CanvasPage } from '../pages/canvas.page';

type SeriesFixtures = {
  seriesPage: SeriesPage;
  scriptEditorPage: ScriptEditorPage;
  knowledgeBasePage: KnowledgeBasePage;
  canvasPage: CanvasPage;
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

  canvasPage: async ({ page }, use) => {
    await use(new CanvasPage(page));
  },

  testSeries: async ({ authenticatedPage }, use) => {
    // Create series via API
    const response = await authenticatedPage.request.post('/api/rpc/series.create', {
      data: {
        title: `Test Series ${Date.now()}`,
        genre: 'DRAMA',
        logline: 'A test series for E2E testing',
      },
    });

    const series = await response.json();

    await use({ id: series.id, title: series.title });

    // Cleanup
    await authenticatedPage.request.post('/api/rpc/series.delete', {
      data: { id: series.id },
    });
  },

  testScript: async ({ authenticatedPage, testSeries }, use) => {
    // Create script via API
    const response = await authenticatedPage.request.post('/api/rpc/scripts.create', {
      data: {
        seriesId: testSeries.id,
        title: `Test Script ${Date.now()}`,
      },
    });

    const script = await response.json();

    await use({ id: script.id, title: script.title, seriesId: testSeries.id });

    // Cleanup handled by series deletion
  },
});

export { expect } from '@playwright/test';
```

### Playwright Configuration

```typescript
// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    process.env.CI ? ['github'] : ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
  },

  projects: [
    // Setup project for authentication state
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

    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
  ],

  // Local dev server
  webServer: process.env.CI
    ? undefined
    : {
        command: 'bun run dev',
        url: 'http://localhost:3001',
        reuseExistingServer: true,
        timeout: 120 * 1000,
      },
});
```

### Global Setup

```typescript
// e2e/global.setup.ts
import { chromium, type FullConfig } from '@playwright/test';
import { TEST_USERS } from './fixtures/auth.fixture';

const STORAGE_STATE_PATH = 'e2e/.auth/user.json';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Ensure test user exists
  const signupResponse = await page.request.post(`${baseURL}/api/auth/sign-up/email`, {
    data: {
      email: TEST_USERS.default.email,
      name: TEST_USERS.default.username,
      password: TEST_USERS.default.password,
    },
    failOnStatusCode: false,
  });

  // Login (works whether user was just created or already existed)
  const loginResponse = await page.request.post(`${baseURL}/api/auth/sign-in/email`, {
    data: {
      email: TEST_USERS.default.email,
      password: TEST_USERS.default.password,
    },
  });

  if (!loginResponse.ok()) {
    throw new Error(`Failed to login test user: ${await loginResponse.text()}`);
  }

  // Save storage state for reuse across tests
  await context.storageState({ path: STORAGE_STATE_PATH });

  await browser.close();
}

export default globalSetup;
```

### Example Test Specifications

```typescript
// e2e/tests/auth/login.spec.ts
import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.navigateToAuth();
  });

  test('should display login form', async ({ authPage }) => {
    await authPage.expectLoginForm();
  });

  test('should login with valid credentials', async ({ authPage }) => {
    await authPage.login('test@example.com', 'TestPassword123!');
    await authPage.expectRedirectToDashboard();
  });

  test('should show error with invalid credentials', async ({ authPage }) => {
    await authPage.login('wrong@example.com', 'wrongpassword');
    await authPage.expectError(/invalid credentials/i);
  });

  test('should redirect to auth when accessing protected route unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth/);
  });
});
```

```typescript
// e2e/tests/series/create-series.spec.ts
import { test, expect } from '../../fixtures/series.fixture';

test.describe('Create Series', () => {
  test.beforeEach(async ({ authenticatedPage, dashboardPage }) => {
    await dashboardPage.navigateToDashboard();
  });

  test('should open create series modal', async ({ dashboardPage }) => {
    await dashboardPage.clickCreateSeries();
    // Modal is automatically waited for in the method
  });

  test('should create series with required fields', async ({ dashboardPage, seriesPage }) => {
    const title = `New Series ${Date.now()}`;

    await dashboardPage.clickCreateSeries();
    await seriesPage.createSeries({ title });

    await dashboardPage.expectSeriesVisible(title);
  });

  test('should create series with all fields', async ({ dashboardPage, seriesPage }) => {
    const seriesData = {
      title: `Full Series ${Date.now()}`,
      genre: 'COMEDY',
      logline: 'A hilarious adventure through testing',
    };

    await dashboardPage.clickCreateSeries();
    await seriesPage.createSeries(seriesData);

    await dashboardPage.expectSeriesVisible(seriesData.title);
  });

  test('should show validation error for empty title', async ({ dashboardPage, seriesPage, page }) => {
    await dashboardPage.clickCreateSeries();
    await seriesPage.fillSeriesForm({ title: '' });
    await seriesPage.submitSeriesForm();

    // Form should still be visible (not submitted)
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });
});
```

```typescript
// e2e/tests/scripts/block-editing.spec.ts
import { test, expect } from '../../fixtures/series.fixture';

test.describe('Script Block Editing', () => {
  test.beforeEach(async ({ authenticatedPage, scriptEditorPage, testScript }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
  });

  test('should display editor with initial block', async ({ scriptEditorPage }) => {
    await scriptEditorPage.expectBlockCount(1);
  });

  test('should change block type via selector', async ({ scriptEditorPage }) => {
    await scriptEditorPage.changeBlockType(0, 'scene-heading');
    await scriptEditorPage.expectBlockType(0, 'scene-heading');
  });

  test('should cycle block types with Tab key', async ({ scriptEditorPage }) => {
    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.pressTab();
    // Assuming default is action, Tab should change to next type
    await scriptEditorPage.expectBlockType(0, 'character');
  });

  test('should create new block on Enter', async ({ scriptEditorPage }) => {
    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.typeInBlock(0, 'INT. COFFEE SHOP - DAY');
    await scriptEditorPage.pressEnter();

    await scriptEditorPage.expectBlockCount(2);
    // After scene heading, next block should be action
    await scriptEditorPage.expectBlockType(1, 'action');
  });

  test('should preserve content after save and reload', async ({ scriptEditorPage, page, testScript }) => {
    const content = 'INT. TEST LOCATION - DAY';

    await scriptEditorPage.changeBlockType(0, 'scene-heading');
    await scriptEditorPage.typeInBlock(0, content);
    await scriptEditorPage.save();
    await scriptEditorPage.waitForAutosave();

    // Reload page
    await page.reload();
    await scriptEditorPage.waitForNetworkIdle();

    await scriptEditorPage.expectBlockType(0, 'scene-heading');
    await scriptEditorPage.expectBlockText(0, content);
  });

  test('should show KB panel alongside editor', async ({ scriptEditorPage }) => {
    await scriptEditorPage.expectKnowledgeBasePanelVisible();
  });
});
```

```typescript
// e2e/tests/knowledge-base/characters.spec.ts
import { test, expect } from '../../fixtures/series.fixture';

test.describe('Knowledge Base - Characters', () => {
  test.beforeEach(async ({ authenticatedPage, knowledgeBasePage, testSeries }) => {
    await knowledgeBasePage.navigateToKnowledgeBase(testSeries.id);
    await knowledgeBasePage.switchTab('characters');
  });

  test('should create a new character', async ({ knowledgeBasePage }) => {
    const characterName = `Character ${Date.now()}`;

    await knowledgeBasePage.createEntity({
      name: characterName,
      description: 'A test character',
    });

    await knowledgeBasePage.expectEntityVisible(characterName);
  });

  test('should search characters', async ({ knowledgeBasePage }) => {
    // Create multiple characters
    await knowledgeBasePage.createEntity({ name: 'Alice' });
    await knowledgeBasePage.createEntity({ name: 'Bob' });
    await knowledgeBasePage.createEntity({ name: 'Charlie' });

    await knowledgeBasePage.searchEntities('Alice');
    await knowledgeBasePage.expectSearchResults(1);
    await knowledgeBasePage.expectEntityVisible('Alice');
    await knowledgeBasePage.expectEntityNotVisible('Bob');
  });

  test('should open character detail page', async ({ knowledgeBasePage, page }) => {
    const characterName = `Detail Test ${Date.now()}`;

    await knowledgeBasePage.createEntity({ name: characterName });
    await knowledgeBasePage.openEntity(characterName);

    await expect(page).toHaveURL(/characters\/[a-z0-9]+/);
  });
});
```

```typescript
// e2e/tests/auth/signup.spec.ts
import { test, expect } from '../../fixtures/auth.fixture';
import { generateTestUser } from '../../helpers/test-data.helper';

test.describe('Signup Flow', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.navigateToAuth();
    await authPage.switchToSignup();
  });

  test('should display signup form', async ({ page }) => {
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should create account and redirect to dashboard', async ({ authPage }) => {
    const user = generateTestUser();
    await authPage.signup(user.email, user.username, user.password);
    await authPage.expectRedirectToDashboard();
  });

  test('should show error for existing email', async ({ authPage }) => {
    // Using default test user which already exists
    await authPage.signup('test@example.com', 'newusername', 'TestPassword123!');
    await authPage.expectError(/already exists|already registered/i);
  });

  test('should show validation error for weak password', async ({ authPage, page }) => {
    const user = generateTestUser();
    await authPage.fillSignupForm(user.email, user.username, 'weak');
    await authPage.submit();
    
    // Form should show password validation error
    await expect(page.locator('text=/password|characters/i')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ authPage, page }) => {
    await authPage.fillSignupForm('invalid-email', 'username', 'TestPassword123!');
    await authPage.submit();
    
    // Form should show email validation error
    await expect(page.locator('text=/email|valid/i')).toBeVisible();
  });
});
```

```typescript
// e2e/tests/auth/logout.spec.ts
import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Logout Flow', () => {
  test('should logout and redirect to home', async ({ authenticatedPage, dashboardPage, page }) => {
    await dashboardPage.navigateToDashboard();
    await dashboardPage.logout();
    
    // Should be redirected to home or auth page
    await expect(page).toHaveURL(/^\/$|\/auth/);
  });

  test('should clear session on logout', async ({ authenticatedPage, dashboardPage, page }) => {
    await dashboardPage.navigateToDashboard();
    await dashboardPage.logout();
    
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should redirect to auth
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should show user menu before logout', async ({ authenticatedPage, dashboardPage }) => {
    await dashboardPage.navigateToDashboard();
    await dashboardPage.openUserMenu();
    
    // User menu should show logout option
    await expect(dashboardPage['page'].locator('button:has-text("Log out")')).toBeVisible();
  });
});
```

```typescript
// e2e/tests/series/edit-series.spec.ts
import { test, expect } from '../../fixtures/series.fixture';

test.describe('Edit Series', () => {
  test('should open edit modal with existing data', async ({ authenticatedPage, seriesPage, testSeries }) => {
    await seriesPage.navigateToSeries(testSeries.id);
    await seriesPage.editSeries();
    
    // Modal should show current title
    const titleInput = seriesPage['modal'].locator('input[name="title"]');
    await expect(titleInput).toHaveValue(testSeries.title);
  });

  test('should update series title', async ({ authenticatedPage, seriesPage, testSeries, page }) => {
    const newTitle = `Updated Series ${Date.now()}`;
    
    await seriesPage.navigateToSeries(testSeries.id);
    await seriesPage.editSeries();
    await seriesPage.fillSeriesForm({ title: newTitle });
    await seriesPage.submitSeriesForm();
    
    // Title should be updated
    await seriesPage.expectSeriesTitle(newTitle);
    
    // Verify persistence after reload
    await page.reload();
    await seriesPage.expectSeriesTitle(newTitle);
  });

  test('should update series genre', async ({ authenticatedPage, seriesPage, testSeries }) => {
    await seriesPage.navigateToSeries(testSeries.id);
    await seriesPage.editSeries();
    await seriesPage.fillSeriesForm({ title: testSeries.title, genre: 'COMEDY' });
    await seriesPage.submitSeriesForm();
    
    await seriesPage.expectToast(/updated|saved/i);
  });

  test('should cancel edit without saving', async ({ authenticatedPage, seriesPage, testSeries }) => {
    await seriesPage.navigateToSeries(testSeries.id);
    await seriesPage.editSeries();
    await seriesPage.fillSeriesForm({ title: 'Should Not Save' });
    await seriesPage.closeModal();
    
    // Original title should remain
    await seriesPage.expectSeriesTitle(testSeries.title);
  });
});
```

```typescript
// e2e/tests/series/delete-series.spec.ts
import { test, expect } from '../../fixtures/series.fixture';

test.describe('Delete Series', () => {
  test('should show confirmation dialog before deletion', async ({ authenticatedPage, seriesPage, testSeries, page }) => {
    await seriesPage.navigateToSeries(testSeries.id);
    
    // Click delete but don't confirm yet
    await seriesPage['deleteSeriesButton'].click();
    
    // Confirmation dialog should appear
    await expect(page.locator('[role="alertdialog"], [role="dialog"]')).toBeVisible();
    await expect(page.locator('text=/delete|confirm|sure/i')).toBeVisible();
  });

  test('should delete series and redirect to dashboard', async ({ authenticatedPage, seriesPage, dashboardPage, testSeries, page }) => {
    await seriesPage.navigateToSeries(testSeries.id);
    await seriesPage.deleteSeries();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Series should not be visible
    await dashboardPage.expectSeriesNotVisible(testSeries.title);
  });

  test('should cancel deletion', async ({ authenticatedPage, seriesPage, testSeries, page }) => {
    await seriesPage.navigateToSeries(testSeries.id);
    
    // Click delete
    await seriesPage['deleteSeriesButton'].click();
    
    // Cancel the dialog
    await page.locator('button:has-text("Cancel")').click();
    
    // Should still be on series page
    await seriesPage.expectSeriesTitle(testSeries.title);
  });
});
```

```typescript
// e2e/tests/scripts/create-script.spec.ts
import { test, expect } from '../../fixtures/series.fixture';

test.describe('Create Script', () => {
  test.beforeEach(async ({ authenticatedPage, seriesPage, testSeries }) => {
    await seriesPage.navigateToSeries(testSeries.id);
    await seriesPage.goToScripts();
  });

  test('should open create script modal', async ({ seriesPage }) => {
    await seriesPage.clickCreateScript();
    // Modal assertion is handled in the method
  });

  test('should create script with title', async ({ seriesPage }) => {
    const scriptTitle = `New Script ${Date.now()}`;
    
    await seriesPage.clickCreateScript();
    
    // Fill in script form
    const modal = await seriesPage.waitForModal();
    await modal.locator('input[name="title"]').fill(scriptTitle);
    await modal.locator('button:has-text("Create"), button:has-text("Save")').click();
    
    await seriesPage.expectScriptVisible(scriptTitle);
  });

  test('should navigate to script editor after creation', async ({ seriesPage, page }) => {
    const scriptTitle = `Editor Test ${Date.now()}`;
    
    await seriesPage.clickCreateScript();
    
    const modal = await seriesPage.waitForModal();
    await modal.locator('input[name="title"]').fill(scriptTitle);
    await modal.locator('button:has-text("Create"), button:has-text("Save")').click();
    
    // Click on the created script
    await seriesPage.openScript(scriptTitle);
    
    // Should be in script editor
    await expect(page).toHaveURL(/\/scripts\/[a-z0-9]+/);
  });

  test('should show validation error for empty title', async ({ seriesPage, page }) => {
    await seriesPage.clickCreateScript();
    
    const modal = await seriesPage.waitForModal();
    await modal.locator('button:has-text("Create"), button:has-text("Save")').click();
    
    // Modal should still be open with validation error
    await expect(modal).toBeVisible();
  });
});
```

```typescript
// e2e/tests/scripts/autosave.spec.ts
import { test, expect } from '../../fixtures/series.fixture';

test.describe('Script Autosave', () => {
  test('should show saving indicator during save', async ({ authenticatedPage, scriptEditorPage, testScript }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    
    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.typeInBlock(0, 'Test content for autosave');
    
    // Wait for autosave indicator
    const saveIndicator = scriptEditorPage['saveIndicator'];
    await expect(saveIndicator).toContainText(/saving|saved/i, { timeout: 10000 });
  });

  test('should autosave after typing stops', async ({ authenticatedPage, scriptEditorPage, testScript, page }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    
    const content = `Autosave test ${Date.now()}`;
    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.typeInBlock(0, content);
    
    // Wait for autosave
    await scriptEditorPage.waitForAutosave();
    
    // Reload and verify
    await page.reload();
    await scriptEditorPage.waitForNetworkIdle();
    await scriptEditorPage.expectBlockText(0, content);
  });

  test('should debounce rapid typing', async ({ authenticatedPage, scriptEditorPage, testScript }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    
    await scriptEditorPage.focusBlock(0);
    
    // Type rapidly
    for (const char of 'Rapid typing test') {
      await scriptEditorPage['page'].keyboard.type(char, { delay: 50 });
    }
    
    // Should only show one save cycle, not multiple
    await scriptEditorPage.waitForAutosave();
  });

  test('should handle network errors gracefully', async ({ authenticatedPage, scriptEditorPage, testScript, page }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    
    // Simulate offline
    await page.context().setOffline(true);
    
    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.typeInBlock(0, 'Offline content');
    
    // Should show error or retry indicator
    await page.waitForTimeout(3000);
    
    // Restore connection
    await page.context().setOffline(false);
    
    // Should eventually save
    await scriptEditorPage.waitForAutosave();
  });
});
```

```typescript
// e2e/tests/scripts/keyboard-shortcuts.spec.ts
import { test, expect } from '../../fixtures/series.fixture';

test.describe('Script Editor Keyboard Shortcuts', () => {
  test.beforeEach(async ({ authenticatedPage, scriptEditorPage, testScript }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    await scriptEditorPage.focusBlock(0);
  });

  test('Tab should cycle through block types', async ({ scriptEditorPage }) => {
    // Start with default action block
    await scriptEditorPage.expectBlockType(0, 'action');
    
    await scriptEditorPage.pressTab();
    await scriptEditorPage.expectBlockType(0, 'character');
    
    await scriptEditorPage.pressTab();
    await scriptEditorPage.expectBlockType(0, 'dialogue');
  });

  test('Enter should create contextual next block', async ({ scriptEditorPage }) => {
    // Character block followed by Enter should create dialogue
    await scriptEditorPage.changeBlockType(0, 'character');
    await scriptEditorPage.typeInBlock(0, 'JOHN');
    await scriptEditorPage.pressEnter();
    
    await scriptEditorPage.expectBlockCount(2);
    await scriptEditorPage.expectBlockType(1, 'dialogue');
  });

  test('Ctrl+S should trigger manual save', async ({ scriptEditorPage, page }) => {
    await scriptEditorPage.typeInBlock(0, 'Save with shortcut');
    
    await page.keyboard.press('Control+s');
    
    await scriptEditorPage.waitForAutosave();
  });

  test('Escape should blur the editor', async ({ scriptEditorPage, page }) => {
    await scriptEditorPage.typeInBlock(0, 'Test content');
    
    await page.keyboard.press('Escape');
    
    // Block should no longer be focused
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).not.toBe('TEXTAREA');
  });

  test('Arrow keys should navigate between blocks', async ({ scriptEditorPage, page }) => {
    // Create multiple blocks
    await scriptEditorPage.typeInBlock(0, 'Block 1');
    await scriptEditorPage.pressEnter();
    await scriptEditorPage.typeInBlock(1, 'Block 2');
    
    // Navigate up
    await page.keyboard.press('ArrowUp');
    
    // Should be in first block
    const focusedBlock = await page.evaluate(() => {
      const active = document.activeElement;
      return active?.closest('[data-testid="block"]')?.getAttribute('data-block-index');
    });
    expect(focusedBlock).toBe('0');
  });
});
```

```typescript
// e2e/tests/knowledge-base/locations.spec.ts
import { test, expect } from '../../fixtures/series.fixture';

test.describe('Knowledge Base - Locations', () => {
  test.beforeEach(async ({ authenticatedPage, knowledgeBasePage, testSeries }) => {
    await knowledgeBasePage.navigateToKnowledgeBase(testSeries.id);
    await knowledgeBasePage.switchTab('locations');
  });

  test('should create a new location', async ({ knowledgeBasePage }) => {
    const locationName = `Location ${Date.now()}`;

    await knowledgeBasePage.createEntity({
      name: locationName,
      description: 'A test location',
    });

    await knowledgeBasePage.expectEntityVisible(locationName);
  });

  test('should edit location details', async ({ knowledgeBasePage, page }) => {
    const locationName = `Edit Location ${Date.now()}`;
    
    await knowledgeBasePage.createEntity({ name: locationName });
    await knowledgeBasePage.openEntity(locationName);
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/locations\/[a-z0-9]+/);
    
    // Edit description
    const descriptionField = page.locator('textarea[name="description"]');
    await descriptionField.fill('Updated description');
    
    // Save
    await page.locator('button:has-text("Save")').click();
    
    await expect(page.locator('[data-sonner-toast]')).toContainText(/saved|updated/i);
  });

  test('should delete location', async ({ knowledgeBasePage, page }) => {
    const locationName = `Delete Location ${Date.now()}`;
    
    await knowledgeBasePage.createEntity({ name: locationName });
    await knowledgeBasePage.openEntity(locationName);
    
    // Delete
    await page.locator('button:has-text("Delete")').click();
    await page.locator('button:has-text("Confirm"), button:has-text("Delete")').last().click();
    
    // Should redirect back to list
    await expect(page).toHaveURL(/knowledge-base/);
    await knowledgeBasePage.expectEntityNotVisible(locationName);
  });
});
```

```typescript
// e2e/tests/knowledge-base/search.spec.ts
import { test, expect } from '../../fixtures/series.fixture';

test.describe('Knowledge Base - Search', () => {
  test.beforeEach(async ({ authenticatedPage, knowledgeBasePage, testSeries }) => {
    await knowledgeBasePage.navigateToKnowledgeBase(testSeries.id);
  });

  test('should search across all entity types', async ({ knowledgeBasePage }) => {
    // Create entities in different tabs
    await knowledgeBasePage.switchTab('characters');
    await knowledgeBasePage.createEntity({ name: 'SearchTest Character' });
    
    await knowledgeBasePage.switchTab('locations');
    await knowledgeBasePage.createEntity({ name: 'SearchTest Location' });
    
    // Search from any tab
    await knowledgeBasePage.searchEntities('SearchTest');
    
    // Should find entities across types
    await knowledgeBasePage.expectEntityVisible('SearchTest Character');
    await knowledgeBasePage.expectEntityVisible('SearchTest Location');
  });

  test('should clear search results', async ({ knowledgeBasePage }) => {
    await knowledgeBasePage.switchTab('characters');
    await knowledgeBasePage.createEntity({ name: 'ClearSearch Test' });
    await knowledgeBasePage.createEntity({ name: 'Other Character' });
    
    // Search
    await knowledgeBasePage.searchEntities('ClearSearch');
    await knowledgeBasePage.expectEntityCount(1);
    
    // Clear search
    await knowledgeBasePage.searchEntities('');
    await knowledgeBasePage.expectEntityCount(2);
  });

  test('should show empty state for no results', async ({ knowledgeBasePage, page }) => {
    await knowledgeBasePage.searchEntities('NonexistentEntity12345');
    
    await expect(page.locator('text=/no results|not found|empty/i')).toBeVisible();
  });

  test('should debounce search input', async ({ knowledgeBasePage, page }) => {
    await knowledgeBasePage.switchTab('characters');
    
    // Type quickly
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.type('rapid search test', { delay: 30 });
    
    // Should only make one search request (verify no flickering)
    await page.waitForTimeout(500);
  });
});
```

```typescript
// e2e/tests/scripts/autocomplete.spec.ts
import { test, expect } from '../../fixtures/series.fixture';

test.describe('Script Editor Autocomplete', () => {
  test('should show character suggestions on @ trigger', async ({ 
    authenticatedPage, 
    scriptEditorPage, 
    knowledgeBasePage,
    testScript,
    testSeries 
  }) => {
    // First, create a character in KB
    await knowledgeBasePage.navigateToKnowledgeBase(testSeries.id);
    await knowledgeBasePage.switchTab('characters');
    await knowledgeBasePage.createEntity({ name: 'AutocompleteTestChar' });
    
    // Navigate to script
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    await scriptEditorPage.focusBlock(0);
    
    // Trigger autocomplete
    await scriptEditorPage.triggerAutocomplete();
    
    await scriptEditorPage.expectAutocompleteVisible();
  });

  test('should filter suggestions while typing', async ({ 
    authenticatedPage, 
    scriptEditorPage, 
    knowledgeBasePage,
    testScript,
    testSeries,
    page
  }) => {
    // Create multiple characters
    await knowledgeBasePage.navigateToKnowledgeBase(testSeries.id);
    await knowledgeBasePage.switchTab('characters');
    await knowledgeBasePage.createEntity({ name: 'Alice' });
    await knowledgeBasePage.createEntity({ name: 'Bob' });
    
    // Navigate to script and trigger autocomplete
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    await scriptEditorPage.focusBlock(0);
    await page.keyboard.type('@Ali');
    
    // Should show Alice, not Bob
    const dropdown = page.locator('[data-testid="autocomplete-dropdown"]');
    await expect(dropdown.locator('text=Alice')).toBeVisible();
    await expect(dropdown.locator('text=Bob')).not.toBeVisible();
  });

  test('should insert selected character name', async ({ 
    authenticatedPage, 
    scriptEditorPage, 
    knowledgeBasePage,
    testScript,
    testSeries
  }) => {
    await knowledgeBasePage.navigateToKnowledgeBase(testSeries.id);
    await knowledgeBasePage.switchTab('characters');
    await knowledgeBasePage.createEntity({ name: 'InsertTestChar' });
    
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.triggerAutocomplete();
    await scriptEditorPage.selectAutocompleteOption('InsertTestChar');
    
    await scriptEditorPage.expectBlockText(0, /InsertTestChar/);
  });

  test('should close autocomplete on Escape', async ({ 
    authenticatedPage, 
    scriptEditorPage, 
    testScript,
    page
  }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    await scriptEditorPage.focusBlock(0);
    await scriptEditorPage.triggerAutocomplete();
    await scriptEditorPage.expectAutocompleteVisible();
    
    await page.keyboard.press('Escape');
    
    const dropdown = page.locator('[data-testid="autocomplete-dropdown"]');
    await expect(dropdown).not.toBeVisible();
  });
});
```

```typescript
// e2e/tests/export/pdf-export.spec.ts
import { test, expect } from '../../fixtures/series.fixture';
import { ExportPage } from '../../pages/export.page';

test.describe('PDF Export', () => {
  test('should export script to PDF', async ({ authenticatedPage, scriptEditorPage, testScript, page }) => {
    // Add some content to the script
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    await scriptEditorPage.changeBlockType(0, 'scene-heading');
    await scriptEditorPage.typeInBlock(0, 'INT. COFFEE SHOP - DAY');
    await scriptEditorPage.pressEnter();
    await scriptEditorPage.typeInBlock(1, 'A busy coffee shop with patrons chatting.');
    await scriptEditorPage.save();
    await scriptEditorPage.waitForAutosave();
    
    // Export
    const exportPage = new ExportPage(page);
    const download = await exportPage.exportToPdf();
    
    await exportPage.expectDownloadStarted(download, '.pdf');
  });

  test('should include script title in filename', async ({ authenticatedPage, scriptEditorPage, testScript, page }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    
    const exportPage = new ExportPage(page);
    const download = await exportPage.exportToPdf();
    
    const filename = download.suggestedFilename();
    // Filename should contain part of the script title
    expect(filename.toLowerCase()).toMatch(/script|test/i);
  });

  test('should show export menu options', async ({ authenticatedPage, scriptEditorPage, testScript, page }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    
    const exportPage = new ExportPage(page);
    await exportPage.openExportMenu();
    await exportPage.expectExportMenuVisible();
    
    // Should show PDF option
    await expect(page.locator('[data-export-format="pdf"]')).toBeVisible();
  });

  test('should handle export of empty script', async ({ authenticatedPage, scriptEditorPage, testScript, page }) => {
    await scriptEditorPage.navigateToScript(testScript.seriesId, testScript.id);
    
    // Clear any content
    await scriptEditorPage.focusBlock(0);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    
    const exportPage = new ExportPage(page);
    const download = await exportPage.exportToPdf();
    
    // Should still produce a valid PDF (possibly with just header)
    await exportPage.expectDownloadStarted(download, '.pdf');
  });
});
```

## Data Seeding Helpers

```typescript
// e2e/helpers/api.helper.ts
import { type Page, type APIRequestContext } from '@playwright/test';

export class ApiHelper {
  private request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  // Auth
  async createUser(email: string, username: string, password: string) {
    return this.request.post('/api/auth/sign-up/email', {
      data: { email, name: username, password },
    });
  }

  async login(email: string, password: string) {
    return this.request.post('/api/auth/sign-in/email', {
      data: { email, password },
    });
  }

  // Series
  async createSeries(data: { title: string; genre?: string; logline?: string }) {
    const response = await this.request.post('/api/rpc/series.create', { data });
    return response.json();
  }

  async deleteSeries(id: string) {
    return this.request.post('/api/rpc/series.delete', { data: { id } });
  }

  // Scripts
  async createScript(data: { seriesId: string; title: string }) {
    const response = await this.request.post('/api/rpc/scripts.create', { data });
    return response.json();
  }

  // Knowledge Base
  async createCharacter(data: { seriesId: string; name: string; description?: string }) {
    const response = await this.request.post('/api/rpc/knowledgeBase.characters.create', { data });
    return response.json();
  }

  async createLocation(data: { seriesId: string; name: string; description?: string }) {
    const response = await this.request.post('/api/rpc/knowledgeBase.locations.create', { data });
    return response.json();
  }
}

export function createApiHelper(page: Page): ApiHelper {
  return new ApiHelper(page.request);
}
```

```typescript
// e2e/helpers/test-data.helper.ts
import { faker } from '@faker-js/faker';

export const generateTestUser = () => ({
  email: faker.internet.email(),
  username: faker.internet.username(),
  password: 'TestPassword123!',
});

export const generateTestSeries = () => ({
  title: faker.lorem.words(3),
  genre: faker.helpers.arrayElement(['DRAMA', 'COMEDY', 'ACTION', 'THRILLER']),
  logline: faker.lorem.sentence(),
});

export const generateTestScript = () => ({
  title: faker.lorem.words(2),
});

export const generateTestCharacter = () => ({
  name: faker.person.fullName(),
  description: faker.lorem.paragraph(),
});

export const generateTestLocation = () => ({
  name: faker.location.city(),
  description: faker.lorem.paragraph(),
});
```

```typescript
// e2e/helpers/wait.helper.ts
import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Wait utilities for handling async UI states
 */
export class WaitHelper {
  constructor(private page: Page) {}

  /**
   * Wait for a specific number of elements to be present
   */
  async waitForCount(locator: Locator, count: number, timeout = 10000): Promise<void> {
    await expect(locator).toHaveCount(count, { timeout });
  }

  /**
   * Wait for loading skeleton to disappear
   */
  async waitForSkeletonToDisappear(): Promise<void> {
    const skeleton = this.page.locator('[data-testid="skeleton"], [data-loading="true"]');
    await skeleton.waitFor({ state: 'detached', timeout: 30000 }).catch(() => {
      // Skeleton may not exist, which is fine
    });
  }

  /**
   * Wait for mutation to complete (network idle + no loading states)
   */
  async waitForMutation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForSkeletonToDisappear();
  }

  /**
   * Wait for toast notification and optionally dismiss it
   */
  async waitForToast(message?: string | RegExp, dismiss = true): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible({ timeout: 10000 });
    
    if (message) {
      await expect(toast).toContainText(message);
    }

    if (dismiss) {
      // Wait a moment for user to see, then dismiss
      await this.page.waitForTimeout(500);
      const closeButton = toast.locator('button[aria-label="Close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  }

  /**
   * Wait for URL to match pattern
   */
  async waitForUrl(pattern: string | RegExp, timeout = 10000): Promise<void> {
    await this.page.waitForURL(pattern, { timeout });
  }

  /**
   * Wait for element to be stable (no layout shifts)
   */
  async waitForStable(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    // Wait for any animations to complete
    await this.page.waitForTimeout(100);
  }

  /**
   * Retry an action until it succeeds or times out
   */
  async retry<T>(
    action: () => Promise<T>,
    options: { maxAttempts?: number; delay?: number } = {}
  ): Promise<T> {
    const { maxAttempts = 3, delay = 1000 } = options;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          await this.page.waitForTimeout(delay);
        }
      }
    }

    throw lastError;
  }
}

export function createWaitHelper(page: Page): WaitHelper {
  return new WaitHelper(page);
}
```

```typescript
// e2e/helpers/cleanup.helper.ts
import { type APIRequestContext } from '@playwright/test';

/**
 * Cleanup utilities for test isolation
 */
export class CleanupHelper {
  private cleanupTasks: Array<() => Promise<void>> = [];

  constructor(private request: APIRequestContext) {}

  /**
   * Register a cleanup task to run after the test
   */
  register(task: () => Promise<void>): void {
    this.cleanupTasks.push(task);
  }

  /**
   * Register series for cleanup
   */
  registerSeries(seriesId: string): void {
    this.register(async () => {
      await this.request.post('/api/rpc/series.delete', {
        data: { id: seriesId },
        failOnStatusCode: false,
      });
    });
  }

  /**
   * Register character for cleanup
   */
  registerCharacter(characterId: string): void {
    this.register(async () => {
      await this.request.post('/api/rpc/knowledgeBase.characters.delete', {
        data: { id: characterId },
        failOnStatusCode: false,
      });
    });
  }

  /**
   * Register user for cleanup (use sparingly - prefer reusing test users)
   */
  registerUser(userId: string): void {
    this.register(async () => {
      await this.request.post('/api/rpc/users.delete', {
        data: { id: userId },
        failOnStatusCode: false,
      });
    });
  }

  /**
   * Run all cleanup tasks in reverse order (LIFO)
   */
  async runAll(): Promise<void> {
    const errors: Error[] = [];

    // Run in reverse order for proper dependency cleanup
    for (const task of this.cleanupTasks.reverse()) {
      try {
        await task();
      } catch (error) {
        errors.push(error as Error);
      }
    }

    this.cleanupTasks = [];

    if (errors.length > 0) {
      console.warn(`Cleanup completed with ${errors.length} errors:`, errors);
    }
  }
}

export function createCleanupHelper(request: APIRequestContext): CleanupHelper {
  return new CleanupHelper(request);
}
```

## Constitution Alignment

- **Contracts**: E2E tests validate contract implementations through actual UI interactions, ensuring the frontend correctly communicates with backend oRPC procedures.
- **Canonical continuity**: Tests verify entity relationships, appearances, and cross-feature data integrity through user flow validation.
- **Access & collaboration**: Auth flow tests validate session handling, route protection, and NOT_FOUND stance for unauthorized access.
- **Quality gates**: E2E tests complement `bun run check-types` and `bun run lint` by validating runtime behavior.
- **Observability/recovery**: Test reports with screenshots, videos, and traces enable debugging.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: E2E test suite achieves >80% coverage of critical user paths (auth, series CRUD, script editing, KB management).
- **SC-002**: Full E2E suite completes in under 10 minutes locally with parallelization.
- **SC-003**: Test flakiness rate is <1% (99+ retries pass deterministically).
- **SC-004**: All P1 user stories have corresponding E2E tests before feature deployment.
- **SC-005**: Test reports are generated with screenshots for all tests.

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Set up Playwright configuration
- Create base page objects
- Implement auth fixtures and tests
- Configure CI pipeline

### Phase 2: Core Features (Week 2-3)
- Implement series page objects and tests
- Implement script editor page objects and tests
- Implement KB page objects and tests
- Add data seeding helpers

### Phase 3: Extended Coverage (Week 4)
- Implement export tests
- Add cross-browser testing
- Expand edge case coverage

### Phase 4: Optimization (Ongoing)
- Reduce test execution time
- Eliminate flaky tests
- Add accessibility testing

## Dependencies

- **Upstream**: All domain features must have stable implementations
- **External**: Playwright, @faker-js/faker

## E2E Test Documentation

Create `apps/web/e2e/README.md` with the following content:

```markdown
# E2E Testing Guide

## Quick Start

```bash
# Install Playwright browsers
bunx playwright install

# Run all tests
bun run test:e2e

# Run tests with UI mode (recommended for development)
bun run test:e2e:ui

# Run specific test file
bunx playwright test tests/auth/login.spec.ts

# Debug a specific test
bunx playwright test tests/auth/login.spec.ts --debug
```

## Project Structure

```
e2e/
├── fixtures/          # Test fixtures and setup
├── helpers/           # Utility functions
├── pages/             # Page Object Models
├── tests/             # Test specifications
├── global.setup.ts    # Global test setup
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
test('should create series', async ({ dashboardPage, seriesPage }) => {
  await dashboardPage.clickCreateSeries();
  await seriesPage.createSeries({ title: 'My Series' });
  await dashboardPage.expectSeriesVisible('My Series');
});

// ❌ Bad - Direct locator usage in tests
test('should create series', async ({ page }) => {
  await page.click('button:has-text("Create Series")');
  await page.fill('input[name="title"]', 'My Series');
  // ... more direct locator usage
});
```

### Fixtures
Use fixtures for test data setup:

```typescript
import { test, expect } from '../../fixtures/series.fixture';

test('my test', async ({ testSeries, testScript }) => {
  // testSeries and testScript are pre-created
});
```

### Assertions
Use Playwright's auto-waiting assertions:

```typescript
// ✅ Auto-waiting (recommended)
await expect(page.locator('.item')).toBeVisible();

// ❌ Manual waiting (avoid)
await page.waitForSelector('.item');
expect(await page.locator('.item').isVisible()).toBe(true);
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
await expect(page.locator('[data-testid="save-indicator"]')).toContainText('Saved');

// ❌ Flaky - race condition
await page.click('button');
await expect(page.locator('.result')).toBeVisible();

// ✅ Better - wait for network
await page.click('button');
await page.waitForLoadState('networkidle');
await expect(page.locator('.result')).toBeVisible();
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
bun run test:e2e:ui
```

## Test Data

### Generators
Use `@faker-js/faker` for random test data:

```typescript
import { generateTestSeries } from '../../helpers/test-data.helper';

test('my test', async () => {
  const series = generateTestSeries();
  // series.title, series.genre, etc.
});
```

### API Seeding
For faster tests, seed data via API:

```typescript
test.beforeEach(async ({ authenticatedPage }) => {
  const response = await authenticatedPage.request.post('/api/rpc/series.create', {
    data: { title: 'Test Series' },
  });
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
```

## Future Enhancements

- CI/CD integration with GitHub Actions for automated test execution on PRs
- Canvas E2E tests (deferred due to React Flow complexity)
- Accessibility testing with @axe-core/playwright  
- Performance testing with Lighthouse CI
- API contract testing alongside E2E
- Component testing for isolated UI validation
- Database snapshot/restore for faster test isolation

````
