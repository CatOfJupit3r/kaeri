# Tasks: Narrative Entities

Status snapshot: No backend or frontend implementation exists yet. This is a new feature set extracted from the V0 design mock.

## To complete the spec

### Contracts & Schema (P1)
- [ ] **T001-NE** Define Scene contract and Zod schema (`packages/shared/src/contract/scene.contract.ts`, `packages/shared/src/schemas/scene.schema.ts`)
  - Scene entity with metadata, beats, relationships
  - List by script, get by ID, create, update, delete endpoints
  - Scene beat sub-schema

- [ ] **T002-NE** Define Theme contract and Zod schema (`packages/shared/src/contract/theme.contract.ts`, `packages/shared/src/schemas/theme.schema.ts`)
  - Theme entity with visual motifs, character connections, evolution
  - List by series, get by ID, create, update, delete endpoints
  - Theme appearance and evolution sub-schemas

- [ ] **T003-NE** Define Story Arc contract and Zod schema (`packages/shared/src/contract/story-arc.contract.ts`, `packages/shared/src/schemas/story-arc.schema.ts`)
  - Story arc entity with status, beats, character roles
  - List by series, get by ID, create, update, delete endpoints
  - Arc beat and character role sub-schemas

- [ ] **T004-NE** Define Research contract and Zod schema (`packages/shared/src/contract/research.contract.ts`, `packages/shared/src/schemas/research.schema.ts`)
  - Research entity with markdown content, tags, entity links
  - List by series, search, get by ID, create, update, delete endpoints
  - Research link sub-schema

### Backend Models & Services (P1)
- [ ] **T005-NE** Create Scene model and service (`apps/server/src/db/models/scene.model.ts`, `apps/server/src/features/scenes/scene.service.ts`)
  - Mongoose schema with scene metadata, beats array, relationships
  - Unique composite index on (scriptId, sceneNumber)
  - Service with CRUD operations and scene number generation

- [ ] **T006-NE** Create Theme model and service (`apps/server/src/db/models/theme.model.ts`, `apps/server/src/features/themes/theme.service.ts`)
  - Mongoose schema with visual motifs, character connections, evolution tracking
  - Service with CRUD operations

- [ ] **T007-NE** Create Story Arc model and service (`apps/server/src/db/models/story-arc.model.ts`, `apps/server/src/features/story-arcs/story-arc.service.ts`)
  - Mongoose schema with status, beats, character roles, theme references
  - Service with CRUD operations and timeline generation

- [ ] **T008-NE** Create Research model and service (`apps/server/src/db/models/research.model.ts`, `apps/server/src/features/research/research.service.ts`)
  - Mongoose schema with markdown content, tags, entity links
  - Full-text search index on title and content
  - Service with CRUD and search operations

### Backend Routers (P1)
- [ ] **T009-NE** Create Scene router with oRPC procedures (`apps/server/src/routers/scene.router.ts`)
  - Implements scene contract endpoints
  - Protected procedures with series ownership validation
  - Scene number uniqueness enforcement

- [ ] **T010-NE** Create Theme router with oRPC procedures (`apps/server/src/routers/theme.router.ts`)
  - Implements theme contract endpoints
  - Protected procedures with series ownership validation

- [ ] **T011-NE** Create Story Arc router with oRPC procedures (`apps/server/src/routers/story-arc.router.ts`)
  - Implements story arc contract endpoints
  - Protected procedures with series ownership validation

- [ ] **T012-NE** Create Research router with oRPC procedures (`apps/server/src/routers/research.router.ts`)
  - Implements research contract endpoints including search
  - Protected procedures with series ownership validation

### Frontend Entity Constants (P1)
- [ ] **T013-NE** Add narrative entity type constants (`packages/shared/src/constants/entity-types.ts`)
  - Add SCENE, THEME, STORY_ARC, RESEARCH to entity type enum
  - Add entity icons (Drama, Sparkles, TrendingUp, BookOpen)
  - Add entity colors (purple, pink, orange, blue borders)
  - Update entity type filters

### Frontend Scene UI (P1)
- [ ] **T014-NE** Create Scene detail component matching V0 design (`apps/web/src/features/scenes/components/scene-detail.tsx`)
  - Scene card with number, heading, script name
  - Metadata cards: Location, Time/Duration, Emotional Tone
  - Conflict description textarea
  - Beats list with inline editing
  - Props list (badges)
  - Technical notes (lighting, sound, camera)
  - Storyboard image upload
  - Previous/Next navigation

- [ ] **T015-NE** Create Scene form component (`apps/web/src/features/scenes/components/scene-form.tsx`)
  - Modal/dialog with all scene fields
  - Location picker (dropdown from KB)
  - Character multi-select
  - Props multi-select
  - Beat list editor (add/remove/reorder)

- [ ] **T016-NE** Add Scene hooks (`apps/web/src/features/scenes/hooks/`)
  - `use-scene-list.ts`: Query hook for script scenes
  - `use-scene.ts`: Query hook for single scene
  - `use-create-scene.ts`: Mutation with optimistic update
  - `use-update-scene.ts`: Mutation with optimistic update
  - `use-delete-scene.ts`: Mutation with confirmation

### Frontend Theme UI (P1)
- [ ] **T017-NE** Create Theme detail component matching V0 design (`apps/web/src/features/themes/components/theme-detail.tsx`)
  - Theme name with color indicator badge
  - Description textarea
  - Related Characters section with connection descriptions
  - Visual Motifs badge list (add/remove)
  - Thematic Evolution accordion (per-script entries)
  - Appearances list (scene references with quotes)

- [ ] **T018-NE** Create Theme form component (`apps/web/src/features/themes/components/theme-form.tsx`)
  - Modal/dialog with theme fields
  - Color picker with preset palette
  - Visual motifs input (badge creator)
  - Character connection editor

- [ ] **T019-NE** Add Theme hooks (`apps/web/src/features/themes/hooks/`)
  - `use-theme-list.ts`: Query hook for series themes
  - `use-theme.ts`: Query hook for single theme
  - `use-create-theme.ts`: Mutation with optimistic update
  - `use-update-theme.ts`: Mutation with optimistic update
  - `use-delete-theme.ts`: Mutation with confirmation

### Frontend Story Arc UI (P1)
- [ ] **T020-NE** Create Story Arc detail component matching V0 design (`apps/web/src/features/story-arcs/components/story-arc-detail.tsx`)
  - Arc name and status badge
  - Description textarea
  - Timeline visualization (start → beats → end)
  - Key Beats list (ordered, editable)
  - Characters Involved with role badges
  - Related Themes (linked badges)
  - Resolution textarea

- [ ] **T021-NE** Create Story Arc form component (`apps/web/src/features/story-arcs/components/story-arc-form.tsx`)
  - Modal/dialog with arc fields
  - Status dropdown
  - Script start/end pickers
  - Beat list editor (add/remove/reorder)
  - Character role editor
  - Theme multi-select

- [ ] **T022-NE** Add Story Arc hooks (`apps/web/src/features/story-arcs/hooks/`)
  - `use-story-arc-list.ts`: Query hook for series arcs
  - `use-story-arc.ts`: Query hook for single arc
  - `use-create-story-arc.ts`: Mutation with optimistic update
  - `use-update-story-arc.ts`: Mutation with optimistic update
  - `use-delete-story-arc.ts`: Mutation with confirmation

### Frontend Research UI (P2)
- [ ] **T023-NE** Create Research panel component (`apps/web/src/features/research/components/research-panel.tsx`)
  - Research list with titles and tags
  - Expand/collapse content view
  - Markdown rendering
  - Link to related entities (badge links)
  - Search input with tag filters

- [ ] **T024-NE** Create Research form component (`apps/web/src/features/research/components/research-form.tsx`)
  - Modal/dialog with markdown editor
  - Tag input (multi-value)
  - Source URL input
  - Entity link picker (any KB entity type)

- [ ] **T025-NE** Add Research hooks (`apps/web/src/features/research/hooks/`)
  - `use-research-list.ts`: Query hook for series research
  - `use-research-search.ts`: Search query hook
  - `use-research.ts`: Query hook for single entry
  - `use-create-research.ts`: Mutation with optimistic update
  - `use-update-research.ts`: Mutation with optimistic update
  - `use-delete-research.ts`: Mutation with confirmation

### KB Integration (P1)
- [ ] **T026-NE** Extend KB "All" view to include narrative entities (`apps/web/src/features/knowledge-base/components/kb-all-view.tsx`)
  - Add Scenes, Themes, Story Arcs, Research to grid
  - Add entity type filter checkboxes
  - Add entity type icons and colors
  - Sort/group by entity type

- [ ] **T027-NE** Add narrative entity tabs to KB (`apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx`)
  - Add Scenes tab
  - Add Themes tab
  - Add Story Arcs tab
  - Add Research tab
  - Each tab shows filtered entity list

- [ ] **T028-NE** Create entity relationship components (`apps/web/src/features/knowledge-base/components/`)
  - `scene-location-link.tsx`: Display scene → location relationship
  - `theme-character-link.tsx`: Display theme → character connections
  - `arc-theme-link.tsx`: Display arc → theme relationships
  - `research-entity-links.tsx`: Display research → entity links

### Testing
- [ ] **T045-NE** Targeted tests for narrative entities when test infra is available
  - Scene number uniqueness
  - Cascade deletes (script → scenes)
  - Theme character connections
  - Story arc timeline generation
  - Research full-text search

## Completed
- _None yet._
