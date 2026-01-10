# Concrete Tasks: Knowledge Base

Breakdown modeled after TASK_BREAKDOWN.md structure (Phase 1, Sessions 1.1-1.10).

**Note**: Sessions 1.1-1.7 from TASK_BREAKDOWN are already completed (existing KB UI). Focus is on remaining detail/relationship/appearance sessions.

---

## Session KB1.8: KB Search Functionality  COMPLETED
(Already implemented in `apps/web/src/features/knowledge-base/components/kb-search.tsx` and route.)

---

## Session KB1.9: Character Relationships UI
**Goal**: Add relationship management to Character forms  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create relationship picker: `apps/web/src/features/knowledge-base/components/relationship-picker.tsx`
   - Select target character from dropdown (other characters in series)
   - Select relationship type (from shared enums or predefined list)
   - Optional note field
   - Add/remove relationships UI

2. Update character-form.tsx to include relationships section
   - Array of relationships with add/remove
   - Use relationship-picker component
   - Validate no self-relationships

3. Update mutation hooks to handle relationships in create/update
   - Persist relationships array on character entity

**Acceptance Criteria**:
- Character form has "Relationships" section
- Can add multiple relationships with type and target
- Can remove relationships
- Relationships persist on save
- Target dropdown only shows other characters (not self)

**Files to Create**:
- `apps/web/src/features/knowledge-base/components/relationship-picker.tsx`

**Files to Update**:
- `apps/web/src/features/knowledge-base/components/character-form.tsx` (add relationships)
- Character list view should show relationship count

---

## Session KB1.10: Character Appearances UI
**Goal**: Add appearance tracking to Character forms  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create appearance picker: `apps/web/src/features/knowledge-base/components/appearance-picker.tsx`
   - Select script from dropdown (scripts in series)
   - Scene reference input (string/textarea)
   - Optional location selector (locations in KB)
   - Add/remove appearances UI

2. Update character-form.tsx to include appearances section
   - Array of appearances with add/remove
   - Use appearance-picker component

3. Update mutation hooks to handle appearances in create/update
   - Persist appearances array on character entity

**Acceptance Criteria**:
- Character form has "Appearances" section
- Can add multiple appearances with script, scene ref, optional location
- Appearances persist on save
- Script dropdown shows scripts in current series
- Location dropdown shows locations in KB

**Files to Create**:
- `apps/web/src/features/knowledge-base/components/appearance-picker.tsx`

**Files to Update**:
- `apps/web/src/features/knowledge-base/components/character-form.tsx` (add appearances)
- Character list view should show appearance count

---

## Session KB2.1: Character Detail Route & Overview Tab
**Goal**: Create character detail page with Overview tab  
**Estimated Time**: 60-75 minutes

**Deliverables**:
1. Create route: `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base/characters/$characterId.tsx`
   - Load character with relationships/appearances/variations
   - Tab layout: Overview, Variations, Appearances
   - Breadcrumb: Series > KB > Characters > Character Name

2. Create character detail component: `apps/web/src/features/knowledge-base/components/character-detail.tsx`
   - Overview tab: show avatar, description, traits, relationships list
   - Relationships list with linked character names (clickable)
   - Edit button to open character-form in edit mode

3. Create query hook: `apps/web/src/features/knowledge-base/hooks/queries/use-character-detail.ts`
   - Use `tanstackRPC.knowledgeBase.characters.get` or new detail endpoint
   - Load character with nested relationships/appearances/variations

**Acceptance Criteria**:
- Route accessible at `/series/{seriesId}/knowledge-base/characters/{characterId}`
- Overview tab displays character info and relationships
- Relationships list shows linked characters (clickable)
- Edit button works
- Breadcrumb navigation functional

**Files to Create**:
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base/characters/$characterId.tsx`
- `apps/web/src/features/knowledge-base/components/character-detail.tsx`
- `apps/web/src/features/knowledge-base/hooks/queries/use-character-detail.ts`

---

## Session KB2.2: Character Variations Tab
**Goal**: Add Variations tab to character detail with per-script traits  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Add Variations tab to character-detail.tsx
   - List variations by script
   - Show script name and variation-specific traits/description
   - Add/edit/remove variation UI

2. Create variation form: `apps/web/src/features/knowledge-base/components/variation-form.tsx`
   - Select script from dropdown
   - Variation traits (multi-input)
   - Variation description (textarea)

3. Add mutation hooks for variations
   - `use-add-variation`, `use-update-variation`, `use-remove-variation`

**Acceptance Criteria**:
- Variations tab shows list of script-specific variations
- Can add variation with script, traits, description
- Can edit and remove variations
- Variations persist on character entity

**Files to Create**:
- `apps/web/src/features/knowledge-base/components/variation-form.tsx`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-add-variation.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-update-variation.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-remove-variation.ts`

**Files to Update**:
- `apps/web/src/features/knowledge-base/components/character-detail.tsx` (add tab)

---

## Session KB2.3: Character Appearances Tab
**Goal**: Add Appearances tab to character detail with scene table  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Add Appearances tab to character-detail.tsx
   - Table view: Script Name, Scene Ref, Location (linked)
   - Click script name to navigate to script editor (optional)
   - Click location to navigate to location detail (optional)
   - Add/remove appearance UI

2. Wire appearance-picker to appearances tab
   - Reuse appearance-picker component for adding
   - Delete button per row

**Acceptance Criteria**:
- Appearances tab shows table of appearances with script/scene/location
- Can add appearance from tab
- Can remove appearance
- Script and location names are linked (clickable)

**Files to Update**:
- `apps/web/src/features/knowledge-base/components/character-detail.tsx` (add Appearances tab)

---

## Session KB2.4: Hover Preview for Linked Characters
**Goal**: Add hover preview/popover for linked characters in relationships  
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Create hover preview component: `apps/web/src/features/knowledge-base/components/character-hover-preview.tsx`
   - Lightweight popover/tooltip showing character summary
   - Shows: avatar, name, description (truncated), trait count
   - Triggered on hover over linked character names

2. Integrate into character-detail.tsx relationships list
   - Wrap character names in hover trigger
   - Load character data on hover (with caching)

**Acceptance Criteria**:
- Hovering over linked character name shows preview popover
- Preview loads character info without full page navigation
- Click still navigates to full character detail
- Preview is performant and cached

**Files to Create**:
- `apps/web/src/features/knowledge-base/components/character-hover-preview.tsx`

**Files to Update**:
- `apps/web/src/features/knowledge-base/components/character-detail.tsx` (integrate hovers)

---

## Session KB3.1: Theme Entity Backend (DESIGN-020)
**Goal**: Implement Theme entity with contract, model, and services  
**Estimated Time**: 75-90 minutes  
**Reference**: `specs/007-narrative-entities/spec.md`, `specs/003-knowledge-base/theme-detail.ts.mock`

**Deliverables**:
1. Create Theme schema and contract: `packages/shared/src/contract/theme.contract.ts`
   - Theme fields: `id`, `seriesId`, `name`, `description`, `color`, `visualMotifs[]`, `relatedCharacters[]` (with connection descriptions), `evolution[]` (per-script notes), `appearances[]` (scene references with quotes)
   - Zod schema for validation
   - CRUD endpoints: list, getById, create, update, delete

2. Create Theme model: `apps/server/src/db/models/theme.model.ts`
   - Mongoose schema matching contract
   - Indexes on seriesId
   - Timestamps

3. Create Theme service: `apps/server/src/features/themes/theme.service.ts`
   - CRUD operations
   - Validation (unique name per series optional)
   - Query by series

4. Create Theme router: `apps/server/src/routers/theme.router.ts`
   - Wire oRPC procedures
   - Protected endpoints with series ownership validation

**Acceptance Criteria**:
- Theme contract exports all CRUD procedures
- Theme model persists to MongoDB
- Theme service handles CRUD with proper validation
- Theme router exposes authenticated endpoints
- Can create/read/update/delete themes via API

**Files to Create**:
- `packages/shared/src/contract/theme.contract.ts`
- `packages/shared/src/schemas/theme.schema.ts`
- `apps/server/src/db/models/theme.model.ts`
- `apps/server/src/features/themes/theme.service.ts`
- `apps/server/src/routers/theme.router.ts`

**Files to Update**:
- `apps/server/src/routers/index.ts` (register theme router)
- `packages/shared/src/enums/errors.ts` (add theme error codes if needed)

---

## Session KB3.2: Theme Entity Frontend (DESIGN-020)
**Goal**: Build Theme UI components and integrate with KB  
**Estimated Time**: 90-120 minutes  
**Reference**: `specs/003-knowledge-base/theme-detail.ts.mock`

**Deliverables**:
1. Create Theme list component: `apps/web/src/features/themes/components/theme-list.tsx`
   - Grid of theme cards with name, description preview, occurrence count
   - Color indicator badge
   - Click to navigate to detail

2. Create Theme detail component: `apps/web/src/features/themes/components/theme-detail.tsx`
   - Match V0 mock design from `theme-detail.ts.mock`
   - Description section
   - Related Characters with connection descriptions
   - Visual Motifs badge list
   - Thematic Evolution per-script accordion
   - Appearances in Scripts with scene references and quotes
   - Edit button

3. Create Theme form: `apps/web/src/features/themes/components/theme-form.tsx`
   - Name, description, color picker
   - Visual motifs input (badge creator)
   - Character connection editor (select character, add connection text)
   - Evolution entries (select script, add notes)
   - Create/Edit modes

4. Add Theme hooks:
   - `apps/web/src/features/themes/hooks/use-theme-list.ts`
   - `apps/web/src/features/themes/hooks/use-theme.ts`
   - `apps/web/src/features/themes/hooks/use-create-theme.ts`
   - `apps/web/src/features/themes/hooks/use-update-theme.ts`
   - `apps/web/src/features/themes/hooks/use-delete-theme.ts`

5. Add Themes tab to KB: `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx`

**Acceptance Criteria**:
- Themes tab shows theme grid
- Click theme opens detail view matching mock design
- Can create/edit/delete themes
- All theme fields persist correctly
- Visual motifs, character connections, evolution entries work
- Color picker provides preset palette

**Files to Create**:
- `apps/web/src/features/themes/components/theme-list.tsx`
- `apps/web/src/features/themes/components/theme-detail.tsx`
- `apps/web/src/features/themes/components/theme-form.tsx`
- `apps/web/src/features/themes/hooks/*.ts` (5 hooks)

**Files to Update**:
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx` (add Themes tab)

---

## Session KB3.3: Story Arc Entity Backend (DESIGN-021)
**Goal**: Implement Story Arc entity with contract, model, and services  
**Estimated Time**: 75-90 minutes  
**Reference**: `specs/007-narrative-entities/spec.md`, `specs/003-knowledge-base/story-arc-detail.ts.mock`

**Deliverables**:
1. Create Story Arc schema and contract: `packages/shared/src/contract/story-arc.contract.ts`
   - Story Arc fields: `id`, `seriesId`, `name`, `description`, `status` (planned/in_progress/completed/abandoned), `startScriptId`, `endScriptId`, `keyBeats[]`, `resolution`, `characters[]` (with roles), `themeIds[]`
   - Zod schema with status enum
   - CRUD endpoints: list, getById, create, update, delete

2. Create Story Arc model: `apps/server/src/db/models/story-arc.model.ts`
   - Mongoose schema matching contract
   - Indexes on seriesId, status
   - Timestamps

3. Create Story Arc service: `apps/server/src/features/story-arcs/story-arc.service.ts`
   - CRUD operations
   - Status validation
   - Query by series, filter by status

4. Create Story Arc router: `apps/server/src/routers/story-arc.router.ts`
   - Wire oRPC procedures
   - Protected endpoints

**Acceptance Criteria**:
- Story Arc contract exports all CRUD procedures
- Story Arc model persists with status enum
- Story Arc service handles CRUD and status transitions
- Story Arc router exposes authenticated endpoints
- Can create/read/update/delete story arcs via API

**Files to Create**:
- `packages/shared/src/contract/story-arc.contract.ts`
- `packages/shared/src/schemas/story-arc.schema.ts`
- `apps/server/src/db/models/story-arc.model.ts`
- `apps/server/src/features/story-arcs/story-arc.service.ts`
- `apps/server/src/routers/story-arc.router.ts`

**Files to Update**:
- `apps/server/src/routers/index.ts` (register story arc router)

---

## Session KB3.4: Story Arc Entity Frontend (DESIGN-021)
**Goal**: Build Story Arc UI components and integrate with KB  
**Estimated Time**: 90-120 minutes  
**Reference**: `specs/003-knowledge-base/story-arc-detail.ts.mock`

**Deliverables**:
1. Create Story Arc list component: `apps/web/src/features/story-arcs/components/story-arc-list.tsx`
   - Grid of arc cards with name, status badge, progress bar
   - Character involved
   - Click to navigate to detail

2. Create Story Arc detail component: `apps/web/src/features/story-arcs/components/story-arc-detail.tsx`
   - Match V0 mock design from `story-arc-detail.ts.mock`
   - Arc description with progress bar
   - Three-column summary: Starting Point, Current State, End Goal
   - Key Milestones list with completion status
   - Related Characters with role badges
   - Thematic Connections (linked theme badges)
   - Emotional Journey visualization (act phases with colors)
   - Edit button

3. Create Story Arc form: `apps/web/src/features/story-arcs/components/story-arc-form.tsx`
   - Name, description, status dropdown
   - Start/end script pickers
   - Beat list editor (add/remove/reorder with drag)
   - Character role editor (select character, add role text)
   - Theme multi-select
   - Resolution textarea
   - Create/Edit modes

4. Add Story Arc hooks:
   - `apps/web/src/features/story-arcs/hooks/use-story-arc-list.ts`
   - `apps/web/src/features/story-arcs/hooks/use-story-arc.ts`
   - `apps/web/src/features/story-arcs/hooks/use-create-story-arc.ts`
   - `apps/web/src/features/story-arcs/hooks/use-update-story-arc.ts`
   - `apps/web/src/features/story-arcs/hooks/use-delete-story-arc.ts`

5. Add Story Arcs tab to KB

**Acceptance Criteria**:
- Story Arcs tab shows arc grid with progress
- Click arc opens detail view matching mock design
- Can create/edit/delete story arcs
- Status transitions work (planned → in_progress → completed)
- Beat reordering works
- Character roles and theme connections display correctly
- Progress bar updates based on milestone completion

**Files to Create**:
- `apps/web/src/features/story-arcs/components/story-arc-list.tsx`
- `apps/web/src/features/story-arcs/components/story-arc-detail.tsx`
- `apps/web/src/features/story-arcs/components/story-arc-form.tsx`
- `apps/web/src/features/story-arcs/hooks/*.ts` (5 hooks)

**Files to Update**:
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx` (add Story Arcs tab)

---

## Session KB3.5: Scene Entity Backend (DESIGN-022)
**Goal**: Implement Scene entity with contract, model, and services  
**Estimated Time**: 75-90 minutes  
**Reference**: `specs/007-narrative-entities/spec.md`, `specs/007-narrative-entities/scene-detail.ts.mock`

**Deliverables**:
1. Create Scene schema and contract: `packages/shared/src/contract/scene.contract.ts`
   - Scene fields: `id`, `seriesId`, `scriptId`, `sceneNumber`, `heading`, `locationId`, `timeOfDay`, `duration`, `emotionalTone`, `conflict`, `beats[]`, `characterIds[]`, `propIds[]`, `lighting`, `sound`, `camera`, `storyNotes`, `storyboardUrl`
   - Unique composite index: (scriptId, sceneNumber)
   - CRUD endpoints: listByScript, getById, create, update, delete

2. Create Scene model: `apps/server/src/db/models/scene.model.ts`
   - Mongoose schema matching contract
   - Composite unique index enforcement
   - Scene beat sub-schema (order, description)

3. Create Scene service: `apps/server/src/features/scenes/scene.service.ts`
   - CRUD operations
   - Scene number generation (auto-increment per script)
   - Validation for uniqueness

4. Create Scene router: `apps/server/src/routers/scene.router.ts`
   - Wire oRPC procedures
   - Protected endpoints

**Acceptance Criteria**:
- Scene contract exports all CRUD procedures
- Scene model enforces unique scene numbers per script
- Scene service auto-generates scene numbers
- Scene router exposes authenticated endpoints
- Can create/read/update/delete scenes via API

**Files to Create**:
- `packages/shared/src/contract/scene.contract.ts`
- `packages/shared/src/schemas/scene.schema.ts`
- `apps/server/src/db/models/scene.model.ts`
- `apps/server/src/features/scenes/scene.service.ts`
- `apps/server/src/routers/scene.router.ts`

**Files to Update**:
- `apps/server/src/routers/index.ts` (register scene router)

---

## Session KB3.6: Scene Entity Frontend (DESIGN-022)
**Goal**: Build Scene UI components and integrate with KB  
**Estimated Time**: 90-120 minutes  
**Reference**: `specs/007-narrative-entities/scene-detail.ts.mock`

**Deliverables**:
1. Create Scene list component: `apps/web/src/features/scenes/components/scene-list.tsx`
   - Grid of scene cards with number, heading, location
   - Emotional tone badge
   - Click to navigate to detail

2. Create Scene detail component: `apps/web/src/features/scenes/components/scene-detail.tsx`
   - Match V0 mock design from `scene-detail.ts.mock`
   - Scene card with number, heading, script name
   - Metadata cards: Location, Time/Duration, Emotional Tone
   - Conflict description textarea
   - Beats list (ordered, editable inline)
   - Characters Present badges
   - Props list badges
   - Production Details (lighting, sound, camera)
   - Scene Flow (previous/next navigation)
   - Director's Notes
   - Storyboard image upload
   - Edit button

3. Create Scene form: `apps/web/src/features/scenes/components/scene-form.tsx`
   - Scene number, heading
   - Location picker (from KB)
   - Time of day, duration, emotional tone
   - Conflict textarea
   - Beat list editor (add/remove/reorder)
   - Character multi-select
   - Props multi-select
   - Technical notes (lighting, sound, camera)
   - Story notes, storyboard URL
   - Create/Edit modes

4. Add Scene hooks:
   - `apps/web/src/features/scenes/hooks/use-scene-list.ts`
   - `apps/web/src/features/scenes/hooks/use-scene.ts`
   - `apps/web/src/features/scenes/hooks/use-create-scene.ts`
   - `apps/web/src/features/scenes/hooks/use-update-scene.ts`
   - `apps/web/src/features/scenes/hooks/use-delete-scene.ts`

5. Add Scenes tab to KB

**Acceptance Criteria**:
- Scenes tab shows scene grid grouped by script
- Click scene opens detail view matching mock design
- Can create/edit/delete scenes
- Scene numbers auto-increment per script
- Beats are reorderable
- Previous/next navigation works within script context
- All metadata fields persist correctly

**Files to Create**:
- `apps/web/src/features/scenes/components/scene-list.tsx`
- `apps/web/src/features/scenes/components/scene-detail.tsx`
- `apps/web/src/features/scenes/components/scene-form.tsx`
- `apps/web/src/features/scenes/hooks/*.ts` (5 hooks)

**Files to Update**:
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx` (add Scenes tab)

---

## Session KB3.7: Enhanced Location Fields (DESIGN-025)
**Goal**: Extend Location entity with additional fields from mock  
**Estimated Time**: 60-75 minutes  
**Reference**: `specs/003-knowledge-base/location-detail.ts.mock`

**Deliverables**:
1. Update Location schema: `packages/shared/src/schemas/location.schema.ts`
   - Add fields: `images[]` (url, caption), `associatedCharacterIds[]`, `propIds[]`, `productionNotes`, `mood`, `timeOfDay[]`

2. Update Location model: `apps/server/src/db/models/location.model.ts`
   - Add new fields to Mongoose schema
   - Image sub-schema (url, caption)

3. Update Location service: `apps/server/src/features/locations/location.service.ts`
   - Handle new fields in CRUD operations

4. Update Location form: `apps/web/src/features/knowledge-base/components/location-form.tsx`
   - Add image gallery input (url + caption fields)
   - Character multi-select for associations
   - Props multi-select
   - Production notes textarea
   - Mood and time of day inputs

5. Update Location detail: `apps/web/src/features/knowledge-base/components/location-detail.tsx`
   - Reference images gallery display
   - Associated characters list (linked)
   - Props used badge list
   - Production notes section
   - Scenes at location grouped by script

**Acceptance Criteria**:
- Location form includes all new fields
- Location detail displays new fields matching mock design
- Image gallery shows multiple images with captions
- Associated characters and props are linked/clickable
- Production notes persist correctly

**Files to Update**:
- `packages/shared/src/schemas/location.schema.ts`
- `apps/server/src/db/models/location.model.ts`
- `apps/server/src/features/locations/location.service.ts`
- `apps/web/src/features/knowledge-base/components/location-form.tsx`
- `apps/web/src/features/knowledge-base/components/location-detail.tsx`

---

## Session KB3.8: Enhanced Character Variation Fields (DESIGN-026)
**Goal**: Add age and appearance fields to character variations  
**Estimated Time**: 30-45 minutes  
**Reference**: `specs/003-knowledge-base/character-detail.ts.mock`

**Deliverables**:
1. Update Character schema: `packages/shared/src/schemas/character.schema.ts`
   - Add to variation sub-schema: `age` (number or string like "30s"), `appearance` (physical description text)

2. Update Character model: `apps/server/src/db/models/character.model.ts`
   - Add fields to variation sub-schema

3. Update variation form: `apps/web/src/features/knowledge-base/components/variation-form.tsx`
   - Age input field
   - Appearance textarea

4. Update Character detail Variations tab: `apps/web/src/features/knowledge-base/components/character-detail.tsx`
   - Display age and appearance in variation cards

**Acceptance Criteria**:
- Variation form includes age and appearance fields
- Variations tab displays age and appearance
- Age and appearance persist correctly per variation

**Files to Update**:
- `packages/shared/src/schemas/character.schema.ts`
- `apps/server/src/db/models/character.model.ts`
- `apps/web/src/features/knowledge-base/components/variation-form.tsx`
- `apps/web/src/features/knowledge-base/components/character-detail.tsx`

---

## Session KB3.9: KB View Modes (DESIGN-024)
**Goal**: Add view mode toggle for Grid/Graph/Timeline  
**Estimated Time**: 45-60 minutes  
**Reference**: `specs/003-knowledge-base/knowledge-base.ts.mock`

**Deliverables**:
1. Add view mode state to KB route: `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx`
   - State: `viewMode: 'grid' | 'graph' | 'timeline'` (default: 'grid')
   - View mode toggle buttons in header

2. Create view mode toggle component: `apps/web/src/features/knowledge-base/components/view-mode-toggle.tsx`
   - Three buttons: Grid (List icon), Graph (Network icon), Timeline (Clock icon)
   - Active state styling

3. Implement Grid view (current implementation)
   - Shows current tab-based list view

4. Implement Graph view placeholder
   - Link to continuity graph feature
   - Placeholder message: "Graph view shows entity relationships. Coming soon."

5. Implement Timeline view placeholder
   - Chronological entity placement
   - Placeholder message: "Timeline view shows when entities appear. Coming soon."

**Acceptance Criteria**:
- View mode toggle buttons appear in KB header
- Clicking toggles between Grid/Graph/Timeline
- Grid view shows current tab-based layout
- Graph and Timeline show placeholder messages
- View mode state persists during session

**Files to Create**:
- `apps/web/src/features/knowledge-base/components/view-mode-toggle.tsx`

**Files to Update**:
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx` (add toggle)

---

## Session KB3.10: KB Header Updates (DESIGN-102)
**Goal**: Update KB header to match mock design  
**Estimated Time**: 30-45 minutes  
**Reference**: `specs/003-knowledge-base/knowledge-base.ts.mock`

**Deliverables**:
1. Update KB header: `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx`
   - Unified cross-entity search input (searches all entity types)
   - View mode toggle (from KB3.9)
   - Import/Export buttons

2. Update search functionality to be cross-entity
   - Search Characters, Locations, Props, Scenes, Themes, Story Arcs simultaneously
   - Display results grouped by entity type

3. Add Import/Export button handlers (stub initially)
   - Import: upload JSON/CSV of KB entities
   - Export: download KB entities as JSON/CSV

**Acceptance Criteria**:
- KB header has unified search input
- Search works across all entity types
- Import/Export buttons present (stub functionality)
- View mode toggle integrated
- Header layout matches mock design

**Files to Update**:
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx`
- `apps/web/src/features/knowledge-base/components/kb-search.tsx` (make cross-entity)

---

## Session KB3.11: "All" Overview Tab (DESIGN-027)
**Goal**: Add unified "All" tab showing all entity types  
**Estimated Time**: 60-75 minutes  
**Reference**: `specs/003-knowledge-base/knowledge-base.ts.mock`

**Deliverables**:
1. Create "All" tab component: `apps/web/src/features/knowledge-base/components/kb-all-view.tsx`
   - Grid showing Characters, Scenes, Themes, Story Arcs, Locations, Props together
   - Summary cards for each entity type with counts and icons
   - Quick "View All" links to entity-specific tabs
   - Recent entities (last edited) from each type

2. Add "All" as first tab in KB tabs
   - Default active tab on KB page load

3. Create summary card component: `apps/web/src/features/knowledge-base/components/entity-summary-card.tsx`
   - Entity type icon and name
   - Count badge
   - Preview of 2-3 recent entities
   - "View All" button

**Acceptance Criteria**:
- "All" tab is first tab in KB
- Shows summary cards for all 6 entity types
- Summary cards display counts and recent entities
- Click "View All" navigates to entity-specific tab
- Click entity preview opens detail view

**Files to Create**:
- `apps/web/src/features/knowledge-base/components/kb-all-view.tsx`
- `apps/web/src/features/knowledge-base/components/entity-summary-card.tsx`

**Files to Update**:
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx` (add "All" tab)

---

## Session KB3.12: Research Entity (DESIGN-023) - P2
**Goal**: Add Research entity for reference materials (defer if time-constrained)  
**Estimated Time**: 60-75 minutes  
**Reference**: `specs/007-narrative-entities/spec.md`

**Deliverables**:
1. Create Research schema and contract: `packages/shared/src/contract/research.contract.ts`
   - Research fields: `id`, `seriesId`, `title`, `content` (markdown), `tags[]`, `sourceUrl`, `linkedEntities[]` (any KB entity type)
   - Full-text search endpoint
   - CRUD endpoints

2. Create Research model: `apps/server/src/db/models/research.model.ts`
   - Text index on title and content
   - Research link sub-schema (entityType, entityId)

3. Create Research service and router

4. Create Research panel: `apps/web/src/features/research/components/research-panel.tsx`
   - List with search and tag filters
   - Markdown rendering
   - Entity links display

5. Create Research form with markdown editor

6. Add Research tab or sidebar to KB

**Acceptance Criteria**:
- Research entity persists with markdown content
- Full-text search works
- Can link research to any KB entity
- Markdown renders correctly
- Tags are filterable

**Files to Create**:
- `packages/shared/src/contract/research.contract.ts`
- `packages/shared/src/schemas/research.schema.ts`
- `apps/server/src/db/models/research.model.ts`
- `apps/server/src/features/research/research.service.ts`
- `apps/server/src/routers/research.router.ts`
- `apps/web/src/features/research/components/research-panel.tsx`
- `apps/web/src/features/research/components/research-form.tsx`
- `apps/web/src/features/research/hooks/*.ts` (5 hooks)

**Files to Update**:
- `apps/server/src/routers/index.ts` (register research router)
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx` (add Research tab)

