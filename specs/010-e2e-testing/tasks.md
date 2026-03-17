````markdown
# E2E Testing Implementation Tasks

## Overview

This document breaks down the implementation of E2E testing with Playwright into actionable tasks organized by priority and phase.

## Phase 1: Foundation Setup (P1)

### Task 1.1: Install Playwright and Dependencies
**Deliverables**:
- Add Playwright to `apps/web/package.json`
- Add `@faker-js/faker` for test data generation
- Add `@axe-core/playwright` for future accessibility testing
- Configure scripts: `test:e2e`, `test:e2e:ui`, `test:e2e:debug`

**Files**:
- `apps/web/package.json`

**Acceptance Criteria**:
- `bun run test:e2e` runs Playwright tests
- `bun run test:e2e:ui` opens Playwright UI mode
- `bun run test:e2e:debug` runs in debug mode

---

### Task 1.2: Create Playwright Configuration
**Deliverables**:
- Create `playwright.config.ts` with multi-browser support
- Configure trace, screenshot, and video capture
- Set up local dev server integration
- Configure parallel execution settings

**Files**:
- `apps/web/e2e/playwright.config.ts`

**Acceptance Criteria**:
- Tests run against local dev server
- Chrome, Firefox, Safari projects configured
- Proper timeout and retry settings
- HTML and JSON reporters configured

---

### Task 1.3: Create Base Page Object
**Deliverables**:
- Implement `BasePage` class with common utilities
- Add navigation helpers
- Add wait utilities
- Add assertion helpers
- Add toast/modal interaction methods

**Files**:
- `apps/web/e2e/pages/base.page.ts`
- `apps/web/e2e/pages/index.ts`

**Acceptance Criteria**:
- All page objects extend BasePage
- Common patterns are reusable
- TypeScript strict mode compatible

---

### Task 1.4: Implement Auth Page Object and Tests
**Deliverables**:
- Create `AuthPage` class
- Implement login/signup/logout flows
- Create auth fixture for authenticated sessions
- Write auth test specifications

**Files**:
- `apps/web/e2e/pages/auth.page.ts`
- `apps/web/e2e/fixtures/auth.fixture.ts`
- `apps/web/e2e/tests/auth/login.spec.ts`
- `apps/web/e2e/tests/auth/signup.spec.ts`
- `apps/web/e2e/tests/auth/logout.spec.ts`

**Acceptance Criteria**:
- Full auth cycle tested (signup → dashboard → logout → login)
- Invalid credential handling tested
- Route protection tested
- Session persistence verified

---

### Task 1.5: Add Required Test IDs to Components
**Deliverables**:
- Audit existing components for testability
- Add `data-testid` attributes as specified in spec
- Add `data-tab`, `data-value`, `data-block-type` attributes where needed
- Ensure all interactive elements are queryable

**Files**:
- `apps/web/src/features/series/components/series-grid.tsx`
- `apps/web/src/features/series/components/series-card.tsx`
- `apps/web/src/features/series/components/series-header.tsx`
- `apps/web/src/features/scripts/components/script-editor.tsx`
- `apps/web/src/features/scripts/components/script-block.tsx`
- `apps/web/src/features/knowledge-base/components/entity-tabs.tsx`
- `apps/web/src/features/knowledge-base/components/entity-list.tsx`
- `apps/web/src/features/auth/components/auth-form.tsx`
- Additional component files as needed

**Acceptance Criteria**:
- All test IDs from spec's "Required Data Test IDs" table are present
- Test IDs follow naming convention: `data-testid="<component-name>"`
- No duplicate test IDs within the same page context
- Test IDs are stable (not based on dynamic data)

**Test ID Checklist**:
| Component | Test ID | Status |
|-----------|---------|--------|
| Series grid | `series-grid` | ⬜ |
| Series card | `series-card` | ⬜ |
| Empty series | `empty-series` | ⬜ |
| User menu | `user-menu` | ⬜ |
| Series header | `series-header` | ⬜ |
| Scripts list | `scripts-list` | ⬜ |
| Script card | `script-card` | ⬜ |
| Script editor | `script-editor` | ⬜ |
| Block | `block` | ⬜ |
| Block type selector | `block-type-selector` | ⬜ |
| Save indicator | `save-indicator` | ⬜ |
| Autocomplete dropdown | `autocomplete-dropdown` | ⬜ |
| KB panel | `knowledge-base-panel` | ⬜ |
| KB entity tabs | `kb-entity-tabs` | ⬜ |
| Entity list | `entity-list` | ⬜ |
| Entity card | `entity-card` | ⬜ |
| Auth error | `auth-error` | ⬜ |
| Export menu | `export-menu` | ⬜ |
| Export dialog | `export-dialog` | ⬜ |

---

## Phase 2: Core Feature Testing (P1)

### Task 2.1: Implement Dashboard Page Object and Tests
**Deliverables**:
- Create `DashboardPage` class
- Implement series grid interactions
- Add user menu interactions
- Write dashboard tests

**Files**:
- `apps/web/e2e/pages/dashboard.page.ts`
- `apps/web/e2e/tests/dashboard/dashboard.spec.ts`

**Acceptance Criteria**:
- Series visibility assertions work
- Create series button interaction works
- User logout flow works
- Search functionality tested

---

### Task 2.2: Implement Series Page Object and Tests
**Deliverables**:
- Create `SeriesPage` class
- Implement series CRUD operations
- Add tab navigation helpers
- Write series CRUD tests

**Files**:
- `apps/web/e2e/pages/series.page.ts`
- `apps/web/e2e/fixtures/series.fixture.ts`
- `apps/web/e2e/tests/series/create-series.spec.ts`
- `apps/web/e2e/tests/series/edit-series.spec.ts`
- `apps/web/e2e/tests/series/delete-series.spec.ts`

**Acceptance Criteria**:
- Series creation with all fields tested
- Series editing with persistence tested
- Series deletion with confirmation tested
- Tab navigation verified

---

### Task 2.3: Implement Script Editor Page Object and Tests
**Deliverables**:
- Create `ScriptEditorPage` class
- Implement block manipulation methods
- Add keyboard shortcut helpers
- Write block editing tests

**Files**:
- `apps/web/e2e/pages/script-editor.page.ts`
- `apps/web/e2e/tests/scripts/create-script.spec.ts`
- `apps/web/e2e/tests/scripts/block-editing.spec.ts`
- `apps/web/e2e/tests/scripts/autosave.spec.ts`
- `apps/web/e2e/tests/scripts/keyboard-shortcuts.spec.ts`

**Acceptance Criteria**:
- All block types can be created and changed
- Keyboard shortcuts (Tab, Enter, Backspace) work
- Content persists after save/reload
- Autosave indicator verified
- Context-aware block type transitions tested

---

### Task 2.4: Implement Knowledge Base Page Object and Tests
**Deliverables**:
- Create `KnowledgeBasePage` class
- Implement entity CRUD operations
- Add search functionality
- Write KB tests for all entity types

**Files**:
- `apps/web/e2e/pages/knowledge-base.page.ts`
- `apps/web/e2e/tests/knowledge-base/characters.spec.ts`
- `apps/web/e2e/tests/knowledge-base/locations.spec.ts`
- `apps/web/e2e/tests/knowledge-base/search.spec.ts`

**Acceptance Criteria**:
- Character creation and detail view tested
- Location creation tested
- Cross-entity search tested
- Entity relationships verified

---

### Task 2.5: Create API Seeding Helpers
**Deliverables**:
- Create `ApiHelper` class for direct API calls
- Implement test data generators
- Add cleanup utilities

**Files**:
- `apps/web/e2e/helpers/api.helper.ts`
- `apps/web/e2e/helpers/test-data.helper.ts`
- `apps/web/e2e/helpers/cleanup.helper.ts`

**Acceptance Criteria**:
- Series/scripts/entities can be created via API
- Test data is deterministic with timestamps
- Cleanup runs after test isolation

---

### Task 2.6: Implement Export Page Object
**Deliverables**:
- Create `ExportPage` class
- Implement PDF export flow
- Handle download events
- Add file validation helpers

**Files**:
- `apps/web/e2e/pages/export.page.ts`

**Acceptance Criteria**:
- Export menu opens correctly
- PDF download triggers and completes
- Downloaded file size is validated
- Filename contains expected content

---

### Task 2.7: Create Wait and Cleanup Helpers
**Deliverables**:
- Create `WaitHelper` class for async UI states
- Create `CleanupHelper` class for test isolation
- Add retry utilities for flaky operations
- Integrate with fixtures for automatic cleanup

**Files**:
- `apps/web/e2e/helpers/wait.helper.ts`
- `apps/web/e2e/helpers/cleanup.helper.ts`
- `apps/web/e2e/helpers/index.ts`

**Acceptance Criteria**:
- `waitForSkeletonToDisappear()` works reliably
- `waitForMutation()` handles network + loading states
- `waitForToast()` captures and optionally dismisses toasts
- Cleanup tasks run in reverse order (LIFO)
- Failed cleanup doesn't break subsequent tests

---

## Phase 3: Extended Coverage (P2)

### Task 3.1: Implement Export Tests
**Deliverables**:
- Create export test specifications
- Verify PDF download functionality
- Add PDF content validation

**Files**:
- `apps/web/e2e/tests/export/pdf-export.spec.ts`

**Acceptance Criteria**:
- Export button triggers download
- Downloaded file is valid PDF
- Export completes within timeout

---

### Task 3.2: Add Autocomplete Integration Tests
**Deliverables**:
- Test `@` mention autocomplete in script editor
- Verify KB entity suggestions
- Test keyboard navigation in autocomplete

**Files**:
- `apps/web/e2e/tests/scripts/autocomplete.spec.ts`

**Acceptance Criteria**:
- Typing `@` shows autocomplete dropdown
- Characters from KB appear in suggestions
- Keyboard selection works
- Selected entity is inserted correctly

---

## Phase 4: Optimization (P3)

### Task 4.1: Add Global Setup for Auth State
**Deliverables**:
- Create global setup for authenticated state
- Use storage state across tests
- Reduce per-test auth overhead

**Files**:
- `apps/web/e2e/global.setup.ts`
- `apps/web/e2e/playwright.config.ts` (update)

**Acceptance Criteria**:
- Auth happens once per worker
- Storage state is reused
- Test execution time reduced

---

### Task 4.2: Eliminate Flaky Tests
**Deliverables**:
- Audit all tests for flakiness
- Add proper waits and assertions
- Document flaky test patterns in README

**Files**:
- Various test files
- `apps/web/e2e/README.md` (best practices section)

**Acceptance Criteria**:
- <1% flakiness rate
- All tests deterministic
- Common pitfalls documented

---

### Task 4.3: Create E2E README Documentation
**Deliverables**:
- Create comprehensive README for E2E tests
- Document test patterns and best practices
- Include debugging guide
- Add contribution guidelines

**Files**:
- `apps/web/e2e/README.md`

**Acceptance Criteria**:
- Quick start guide helps new developers run tests
- Page Object pattern is explained with examples
- Flaky test patterns are documented
- Debugging tools (trace viewer, UI mode) are explained
- Test data seeding patterns are documented

---

## Deferred Tasks (Future Phases)

### CI/CD Integration
**Status**: Deferred - tests run locally for now

**When to implement**: After E2E tests are stable and team is ready for automated PR checks

**Deliverables**:
- Create GitHub Actions workflow for E2E tests
- Configure MongoDB service container
- Set up artifact storage for reports
- Add caching for Playwright browsers

**Files (when implemented)**:
- `.github/workflows/e2e-tests.yml`

---

### Canvas E2E Tests
**Status**: Deferred due to complexity of testing React Flow drag-and-drop interactions

**When to implement**: After core features are stable and team has bandwidth for complex UI testing

**Files (when implemented)**:
- `apps/web/e2e/pages/canvas.page.ts`
- `apps/web/e2e/tests/canvas/canvas-operations.spec.ts`

---

## Task Dependencies

```
Phase 1 (Foundation):
1.1 → 1.2 → 1.3 → 1.4
                   ↓
                  1.5

Phase 2 (Core Features):
1.4 → 2.1 → 2.2 → 2.3 → 2.6
         ↘      ↗
          2.4 → 2.5 → 2.7

Phase 3 (Extended):
2.3 + 2.6 → 3.1 (Export)
2.3 + 2.4 → 3.2 (Autocomplete)

Phase 4 (Optimization):
1.4 → 4.1
All → 4.2
2.7 → 4.3
```

## Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | 5-6 days | 1.1 - 1.5 |
| Phase 2 | 2.5 weeks | 2.1 - 2.7 |
| Phase 3 | 3-4 days | 3.1 - 3.2 |
| Phase 4 | Ongoing | 4.1 - 4.3 |

**Total Initial Setup**: ~3.5 weeks

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Flaky tests | High | Proper waits, retry logic, test isolation |
| Slow execution | Medium | Parallelization, focused test suites |
| Test maintenance | Medium | Page Object Model, shared fixtures |
| Environment drift | Low | Docker-based dev, documented setup |
| Missing test IDs | High | Task 1.5 checklist, audit before test writing |
| Test data pollution | Medium | Cleanup helpers, fixture isolation |

````
