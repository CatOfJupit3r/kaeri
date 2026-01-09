# Tasks: Series Management

Status snapshot: backend handlers exist (`apps/server/src/routers/series.router.ts`, `apps/server/src/features/series/series.service.ts`); frontend experience is missing.

## To complete the spec
- [ ] **T015** Add series list/grid view and creation modal (`apps/web/src/features/series`, `apps/web/src/routes/_auth_only/series/index.tsx`).
- [ ] **T016** Wire series creation/editing forms with oRPC calls (`apps/web/src/features/series/components/series-modal.tsx`).
- [ ] **T017** Add series library query hooks + optimistic updates (`apps/web/src/features/series/hooks/queries/use-series.ts`).
- [ ] **T045-Series** Targeted tests for series CRUD (server + UI) once Mongo memory server/download issue is resolved.

## Design Alignment Tasks (from V0 mock)
Reference: `specs/DESIGN_ALIGNMENT_ANALYSIS.md`, `specs/DESIGN_ALIGNMENT_TASKS.md`

### P1: Series Type System
- [ ] **DESIGN-001** Add `type` field to Series entity: `tv-series | film-trilogy | anthology | standalone`
  - Update `packages/shared/src/contract/series.contract.ts` to add type enum and field
  - Update `apps/server/src/db/models/series.model.ts` to add type field
  - Update `apps/web/src/features/series/components/series-modal.tsx` to add template selection grid
  - Add type icons (Tv, Film, Library, FileText) and descriptions to creation flow

### P1: Episodes Entity (for TV Series)
- [ ] **DESIGN-003** Add Episode entity for `tv-series` type
  - Add Episode schema with fields: `number`, `title`, `scenes[]`, `status` (Outline/In Progress/Complete)
  - Add Episode CRUD contract and handlers
  - Add Episode management UI within TV series

### P1: Series Header Updates
- [ ] **DESIGN-101** Update series header to match mock (`series-header.tsx`)
  - Add collaborator avatars display (placeholder for future multi-user)
  - Add settings dropdown with Manage Users, Series Settings, Export Series
  - Update breadcrumb navigation pattern

### P2: Series Analytics Dashboard
- [ ] **DESIGN-002** Add Analytics tab to series view
  - Overview stats: scripts count, characters count, locations count, word count
  - Scene distribution chart by location
  - Character appearances bar chart
  - Story arc progress indicators
  - Writing activity heatmap
  - Word count trend line chart

## Completed
- [x] **T013** Implement series contract handlers (`apps/server/src/routers/series.router.ts`).
- [x] **T014** Add series services for CRUD + lastEditedAt (`apps/server/src/features/series/series.service.ts`).
