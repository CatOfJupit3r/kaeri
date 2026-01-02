# Tasks: Knowledge Base

Status snapshot: backend CRUD/search and relationships/appearances are implemented (`apps/server/src/routers/knowledge-base.router.ts`, `apps/server/src/features/knowledge-base/knowledge-base.service.ts`). UI for CRUD/search exists (`apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx` + KB components). Character detail/appearances UI is missing.

## To complete the spec
- [ ] **T027** Extend character contract outputs for variations/appearances (`packages/shared/src/contract/knowledge-base.contract.ts`).
- [ ] **T028** Implement character detail handlers (detail endpoint) (`apps/server/src/routers/knowledge-base.router.ts`).
- [ ] **T029** Build character detail UI with tabs (Overview/Variations/Appearances) (`apps/web/src/features/knowledge-base/components/character-detail.tsx`).
- [ ] **T030** Add hover preview/popover components for linked characters (`apps/web/src/features/knowledge-base/components`).
- [ ] **T045-KB** Targeted KB tests (CRUD/search/detail) once test infra is unblocked.

## Completed
- [x] **T023** Implement KB CRUD/search handlers (`apps/server/src/routers/knowledge-base.router.ts`).
- [x] **T024** Add KB services enforcing relationships/appearances integrity (`apps/server/src/features/knowledge-base/knowledge-base.service.ts`).
- [x] **T025** Create KB search/list UI and forms (`apps/web/src/features/knowledge-base`, `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx`).
- [x] **T026** Add KB query/mutation hooks with optimistic updates (`apps/web/src/features/knowledge-base/hooks`).
