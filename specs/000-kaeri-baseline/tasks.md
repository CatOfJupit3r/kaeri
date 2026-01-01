# Tasks: Kaeri Baseline Platform

**Input**: Design documents from `/specs/000-kaeri-baseline/`
**Prerequisites**: plan.md (done), spec.md (done), research.md, data-model.md, contracts/
**Tests**: Include targeted tests where specified; performance checks per SCs.
**Organization**: Tasks grouped by phase and user story for independent delivery.
**Constitution Hooks**: Contract-first (`packages/shared`), continuity integrity, auth/NOT_FOUND stance, tests + lint/types, observability/audit.

## Phase 1: Setup (Shared Infrastructure)
- [ ] T001 Document local env steps for feature in `specs/000-kaeri-baseline/quickstart.md` (create file)
- [ ] T002 Verify `.env` copies for server/web and Docker running; note in `quickstart.md`
- [ ] T003 [P] Add feature branch reference to README or internal notes (no code change paths)

---

## Phase 2: Foundational (Blocking Prerequisites)
- [ ] T004 Define shared enums/constants for entity types, relationship types, export formats in `packages/shared/src/enums/` and export index
- [ ] T005 Add audit entry schemas/types in `packages/shared/src/constants` or `enums` (path: `packages/shared/src/enums/audit.ts`)
- [ ] T006 Add continuity graph/audit contracts skeleton in `packages/shared/src/contract/continuity.contract.ts`
- [ ] T007 Add series/script/KB/canvas/export contract skeletons in `packages/shared/src/contract/` (series, scripts, knowledge-base, canvas, export)
- [ ] T008 Update `packages/shared/src/contract/index.ts` to export new contracts
- [ ] T009 Create Typegoose models (Series, Script, Character, Location, Prop, TimelineEntry, WildCard, CanvasNode, CanvasEdge, AuditEntry) in `apps/server/src/features/**` per data model
- [ ] T010 Register models/services tokens in `apps/server/src/di/tokens.ts` and `apps/server/src/di/container.ts`
- [ ] T011 Add performance telemetry hooks (search/load/export timers) skeleton in `apps/server/src/lib` (new file) and wire logger factory
- [ ] T012 Ensure auth/NOT_FOUND stance documented in `apps/server/src/routers/di-getter.ts` or middleware notes

---

## Phase 3: User Story 1 - Create & Manage Series (Priority: P1) 🎯 MVP
**Goal**: Create/manage a series and see scripts in library.
**Independent Test**: Create series, add a script, reopen with persisted data.

- [ ] T013 [P] [US1] Implement series contracts handlers in `apps/server/src/routers/series.router.ts`
- [ ] T014 [P] [US1] Add series services for CRUD + lastEditedAt in `apps/server/src/features/series/series.service.ts`
- [ ] T015 [P] [US1] Add series list/grid view and creation modal in `apps/web/src/features/series` and route `apps/web/src/routes/series/index.tsx`
- [ ] T016 [US1] Wire series creation/editing forms with oRPC calls in `apps/web/src/features/series/components/series-modal.tsx`
- [ ] T017 [US1] Add series library query hooks and optimistic updates in `apps/web/src/features/series/hooks/queries/use-series.ts`

---

## Phase 4: User Story 2 - Write Script with Split Editor (Priority: P1)
**Goal**: Open script, edit text, split view with KB panel; autosave.
**Independent Test**: Type, save/autosave, reopen script; KB panel visible.

- [ ] T018 [P] [US2] Implement script CRUD + saveContent handlers in `apps/server/src/routers/scripts.router.ts`
- [ ] T019 [US2] Implement script service with autosave and lastEditedAt updates in `apps/server/src/features/scripts/scripts.service.ts`
- [ ] T020 [P] [US2] Add script list/grid under series route `apps/web/src/routes/series/$seriesId/scripts.tsx`
- [ ] T021 [US2] Build split editor layout (text left, KB tabs right) in `apps/web/src/features/scripts/components/split-editor.tsx`
- [ ] T022 [US2] Add autosave + manual save hooks in `apps/web/src/features/scripts/hooks/use-save-script.ts`

---

## Phase 5: User Story 3 - Manage Knowledge Base (Priority: P1)
**Goal**: CRUD Characters, Locations, Props, Timeline, Wild Cards; search across.
**Independent Test**: Create/edit entities, search returns results across types.

- [ ] T023 [P] [US3] Implement KB CRUD/search handlers in `apps/server/src/routers/knowledge-base.router.ts`
- [ ] T024 [US3] Add KB services enforcing relationships/appearances integrity in `apps/server/src/features/knowledge-base/knowledge-base.service.ts`
- [ ] T025 [P] [US3] Create KB search/list UI and forms in `apps/web/src/features/knowledge-base` and route `apps/web/src/routes/series/$seriesId/knowledge-base.tsx`
- [ ] T026 [US3] Add KB query/mutation hooks with optimistic updates in `apps/web/src/features/knowledge-base/hooks`

---

## Phase 6: User Story 4 - Character Detail & Appearances (Priority: P2)
**Goal**: Tabs for overview, variations, appearances with hover previews.
**Independent Test**: Detail tabs render; appearances table lists scene refs; hovers show linked info.

- [ ] T027 [P] [US4] Extend character contract outputs for variations/appearances in `packages/shared/src/contract/knowledge-base.contract.ts`
- [ ] T028 [US4] Implement character detail handlers in `apps/server/src/routers/knowledge-base.router.ts` (detail endpoint)
- [ ] T029 [P] [US4] Build character detail UI with tabs in `apps/web/src/features/knowledge-base/components/character-detail.tsx`
- [ ] T030 [US4] Add hover preview/popover components for linked characters in `apps/web/src/features/knowledge-base/components`

---

## Phase 7: User Story 5 - Canvas for Story Structuring (Priority: P3)
**Goal**: Place shapes/text/lines, pan, persist per series.
**Independent Test**: Nodes/edges persist and reload.

- [ ] T031 [P] [US5] Implement canvas endpoints (get/upsert/delete) in `apps/server/src/routers/canvas.router.ts`
- [ ] T032 [US5] Add canvas service with per-series persistence in `apps/server/src/features/canvas/canvas.service.ts`
- [ ] T033 [P] [US5] Build canvas UI (pan, text, shapes, lines) in `apps/web/src/features/canvas/components/canvas-board.tsx`
- [ ] T034 [US5] Add canvas state hooks and persistence wiring in `apps/web/src/features/canvas/hooks/use-canvas.ts`

---

## Phase 8: User Story 6 - Export Draft (Priority: P3)
**Goal**: Export script to PDF with basic screenplay formatting.
**Independent Test**: Export works for saved script; unsaved prompts save.

- [ ] T035 [P] [US6] Implement export contract/handler in `apps/server/src/routers/export.router.ts` using pdf-lib formatter
- [ ] T036 [US6] Add export service + formatter in `apps/server/src/features/export/export.service.ts`
- [ ] T037 [P] [US6] Add export UI action in script editor toolbar `apps/web/src/features/scripts/components/split-editor.tsx`
- [ ] T038 [US6] Add export mutation hook with error handling and progress in `apps/web/src/features/scripts/hooks/use-export-script.ts`

---

## Phase 9: Continuity Graph & Audit (Cross-cutting)
**Goal**: Graph view and audit trail for canon changes.
**Independent Test**: Graph renders nodes/edges; audit list shows changes with pagination.

- [ ] T039 [P] Add continuity graph resolver in `apps/server/src/features/continuity/continuity.service.ts`
- [ ] T040 Add audit logging middleware/util called from canon mutations in `apps/server/src/lib/audit-logger.ts`
- [ ] T041 [P] Add continuity graph UI in `apps/web/src/features/continuity/continuity-graph.tsx`
- [ ] T042 Add audit history UI in `apps/web/src/features/continuity/audit-log.tsx`

---

## Phase 10: Quality & Observability
- [ ] T043 Add structured logging for canon mutations and export paths in `apps/server/src/lib/logger` usage sites
- [ ] T044 Add performance telemetry (search/load/export timers) reporting in `apps/server/src/lib/telemetry.ts`
- [ ] T045 Add targeted tests: contracts parity, continuity (relationships/appearances/graph), canvas persistence, export timing in `apps/server/test/`
- [ ] T046 [P] Add frontend integration tests/smoke (if applicable) or test plan in `specs/000-kaeri-baseline/quickstart.md`
- [ ] T047 Run and document `bun run check-types` and `bun run lint` results in `specs/000-kaeri-baseline/quickstart.md`

---

## Phase 11: Polish & Cross-Cutting
- [ ] T048 [P] Documentation updates for KB/canvas/export/continuity in `README.md` or feature docs
- [ ] T049 Code cleanup and refactors after tests in touched files
- [ ] T050 [P] Validate backup/export JSON path and recovery steps in `specs/000-kaeri-baseline/quickstart.md`

## Dependencies & Execution Order
- Setup → Foundational → US1 (MVP) → US2/US3 (parallel after foundational) → US4 → US5 → US6 → Continuity/Audit → Quality → Polish.
- Tests and telemetry tasks (T043-T047) depend on prior implementations.

## Parallel Execution Examples
- Parallel: T004–T008 (shared contract/enums) while T009–T011 (models/telemetry) proceed.
- Parallel: UI vs backend per story (e.g., T013/T014 with T015–T017 after contracts ready).
- Parallel: Canvas UI (T033) and service (T031–T032) once contracts exist.

## Implementation Strategy
- MVP after US1 + US2 + US3 completes (series + scripts + KB basic CRUD/search).
- Incrementally add US4 (character detail), US5 (canvas), US6 (export), then continuity graph/audit.
