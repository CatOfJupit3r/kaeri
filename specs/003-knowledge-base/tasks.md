# Tasks: Knowledge Base

Status snapshot: backend CRUD/search and relationships/appearances are implemented (`apps/server/src/routers/knowledge-base.router.ts`, `apps/server/src/features/knowledge-base/knowledge-base.service.ts`). UI for CRUD/search exists (`apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx` + KB components). Character detail/appearances UI is missing.

## To complete the spec
- [ ] **T027** Extend character contract outputs for variations/appearances (`packages/shared/src/contract/knowledge-base.contract.ts`).
- [ ] **T028** Implement character detail handlers (detail endpoint) (`apps/server/src/routers/knowledge-base.router.ts`).
- [ ] **T029** Build character detail UI with tabs (Overview/Variations/Appearances) (`apps/web/src/features/knowledge-base/components/character-detail.tsx`).
- [ ] **T030** Add hover preview/popover components for linked characters (`apps/web/src/features/knowledge-base/components`).
- [ ] **T045-KB** Targeted KB tests (CRUD/search/detail) once test infra is unblocked.

## Design Alignment Tasks (from V0 mock)
Reference: `specs/DESIGN_ALIGNMENT_ANALYSIS.md`, `specs/DESIGN_ALIGNMENT_TASKS.md`

### P1: Themes Entity
- [ ] **DESIGN-020** Add Theme entity to knowledge base
  - Add Theme schema with fields: `name`, `description`, `color`, `occurrences`, `relatedScripts[]` (with key scenes and quotes), `relatedCharacters[]` (with connection descriptions), `visualMotifs[]`, `evolution[]` (per-episode interpretation)
  - Add Theme contract to `packages/shared/src/contract/knowledge-base.contract.ts`
  - Add Theme model to `apps/server/src/db/models/`
  - Add Theme CRUD handlers and services
  - Add Theme list component (`apps/web/src/features/themes/components/theme-list.tsx`)
  - Add Theme detail view (`theme-detail.tsx` from mock)
  - Add Theme form for create/edit
  - Wire to KB Themes tab

### P1: Story Arcs Entity
- [ ] **DESIGN-021** Add Story Arc entity to knowledge base
  - Add Story Arc schema with fields: `character` reference, `arcName`, `description`, `progress` (0-100), `startPoint`, `currentState`, `endGoal`, `keyMilestones[]` (episode, event, impact, complete), `relatedCharacters[]` (with role descriptions), `thematicConnections[]` (theme references), `emotionalJourney[]` (per-act states with colors)
  - Add Story Arc contract to `packages/shared/src/contract/knowledge-base.contract.ts`
  - Add Story Arc model to `apps/server/src/db/models/`
  - Add Story Arc CRUD handlers and services
  - Add Story Arc list component (`apps/web/src/features/story-arcs/components/story-arc-list.tsx`)
  - Add Story Arc detail view (`story-arc-detail.tsx` from mock)
  - Add Story Arc form for create/edit
  - Wire to KB Story Arcs tab

### P1: Scenes as KB Entity
- [ ] **DESIGN-022** Add Scene as first-class KB entity
  - Add Scene schema with fields: `number`, `heading`, `scriptId`, `location` reference, `characters[]` references, `emotionalTone`, `conflict`, `duration`, `beats[]` (ordered descriptions), `props[]` references, `lighting`, `sound`, `previousScene`, `nextScene`, `notes`, `storyboardUrl`
  - Add Scene contract to `packages/shared/src/contract/knowledge-base.contract.ts`
  - Add Scene model to `apps/server/src/db/models/`
  - Add Scene CRUD handlers and services
  - Add Scene list component (`apps/web/src/features/scenes/components/scene-list.tsx`)
  - Add Scene detail view (`scene-detail.tsx` from mock)
  - Add Scene form for create/edit
  - Wire to KB Scenes tab

### P1: Enhanced Location Fields
- [ ] **DESIGN-025** Extend Location entity with mock design fields
  - Add fields: `images[]` (with url and caption), `associatedCharacters[]` references, `props[]` references, `productionNotes`, `mood`, `timeOfDay[]`
  - Update Location contract and model
  - Update Location detail view to display new fields (`location-detail.tsx` from mock)
  - Add reference images gallery component
  - Add associated characters/props display

### P1: Enhanced Character Variation Fields
- [ ] **DESIGN-026** Extend Character variations with mock design fields
  - Add fields to variations: `age` (character age in variation), `appearance` (physical appearance description)
  - Update Character contract and model
  - Update Character detail variation display

### P1: KB View Modes
- [ ] **DESIGN-024** Implement KB view mode toggle
  - Add view mode state: `grid | graph | timeline`
  - Add toggle buttons in KB header (Grid, Graph, Timeline icons)
  - Grid view: current list implementation
  - Graph view: network visualization (link to continuity graph)
  - Timeline view: chronological entity placement (placeholder, defer full implementation)

### P1: KB Header Updates
- [ ] **DESIGN-102** Update KB header to match mock design
  - Unified cross-entity search input
  - View mode toggle buttons (Grid/Graph/Timeline)
  - Import/Export buttons

### P1: "All" Overview Tab
- [ ] **DESIGN-027** Add unified "All" tab to KB matching mock
  - Grid showing Characters, Scenes, Themes, Story Arcs, Locations together
  - Summary cards for each entity type with counts
  - Quick navigation to entity sections

### P2: Research Entity
- [ ] **DESIGN-023** Add Research entity (defer if not MVP-critical)
  - Add Research schema with fields: `title`, `notes`, `url`, `type`
  - Add Research CRUD and UI

## Completed
- [x] **T023** Implement KB CRUD/search handlers (`apps/server/src/routers/knowledge-base.router.ts`).
- [x] **T024** Add KB services enforcing relationships/appearances integrity (`apps/server/src/features/knowledge-base/knowledge-base.service.ts`).
- [x] **T025** Create KB search/list UI and forms (`apps/web/src/features/knowledge-base`, `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx`).
- [x] **T026** Add KB query/mutation hooks with optimistic updates (`apps/web/src/features/knowledge-base/hooks`).
