# Tasks: Series Management

Status snapshot: backend handlers exist (`apps/server/src/routers/series.router.ts`, `apps/server/src/features/series/series.service.ts`); frontend experience is missing.

## To complete the spec
- [ ] **T015** Add series list/grid view and creation modal (`apps/web/src/features/series`, `apps/web/src/routes/_auth_only/series/index.tsx`).
- [ ] **T016** Wire series creation/editing forms with oRPC calls (`apps/web/src/features/series/components/series-modal.tsx`).
- [ ] **T017** Add series library query hooks + optimistic updates (`apps/web/src/features/series/hooks/queries/use-series.ts`).
- [ ] **T045-Series** Targeted tests for series CRUD (server + UI) once Mongo memory server/download issue is resolved.

## Completed
- [x] **T013** Implement series contract handlers (`apps/server/src/routers/series.router.ts`).
- [x] **T014** Add series services for CRUD + lastEditedAt (`apps/server/src/features/series/series.service.ts`).
