# Foundation Platform - Task Breakdown for LLM Agent Sessions

**Created**: 2026-01-02
**Focus**: Knowledge Base → Script Editor → Series Management Polish
**Deferred**: Canvas, Export (PDF), Audit/Continuity UI

## Overview

This document breaks down the remaining Foundation Platform implementation into discrete, completable sessions. Each task is designed to be completed by an LLM agent in one session (~30-60 minutes of focused work).

**Current State**:
- ✅ Backend fully implemented (Series, Scripts, Knowledge Base services)
- ✅ Series list view exists (`/projects` route)
- ✅ Basic query hooks for series created
- ❌ No KB UI exists
- ❌ No Script Editor exists
- ❌ Series creation/editing modals missing

**Strategy**: Build Knowledge Base UI first (foundation for script editor), then Script Editor with KB integration, finally polish Series management.

---

## Phase 1: Knowledge Base Foundation

### Session 1.1: KB Route Structure & Character List
**Goal**: Create KB route with Character entity list view
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create route file: `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx`
   - Route configuration with seriesId param
   - Basic layout with tabs for entity types
   - Tab navigation (Characters, Locations, Props, Timeline, Wild Cards)

2. Create Character list component: `apps/web/src/features/knowledge-base/components/character-list.tsx`
   - Grid/list view of characters
   - Show: name, avatar, trait count, relationship count
   - Empty state when no characters
   - "New Character" button

3. Create query hook: `apps/web/src/features/knowledge-base/hooks/queries/use-character-list.ts`
   - Use `tanstackRPC.knowledgeBase.characters.list`
   - Pagination support (limit, offset)
   - Integrate with TanStack Query

**Acceptance Criteria**:
- Route accessible at `/series/{id}/knowledge-base`
- Characters tab shows list of characters or empty state
- Hook fetches and displays data correctly
- Navigation between tabs works (even if other tabs are empty stubs)

**Files to Create**:
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx`
- `apps/web/src/features/knowledge-base/components/character-list.tsx`
- `apps/web/src/features/knowledge-base/hooks/queries/use-character-list.ts`

---

### Session 1.2: Character Creation Form
**Goal**: Implement character creation with form and mutation
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create Character form component: `apps/web/src/features/knowledge-base/components/character-form.tsx`
   - Form fields: name (required), description, traits (multi-input), avatarUrl
   - Use TanStack Form for validation
   - Modal/dialog wrapper

2. Create mutation hook: `apps/web/src/features/knowledge-base/hooks/mutations/use-create-character.ts`
   - Use `tanstackRPC.knowledgeBase.characters.create`
   - Optimistic updates for character list
   - Success/error toasts

3. Wire form to "New Character" button in character-list.tsx
   - Dialog state management
   - Form submission handling

**Acceptance Criteria**:
- Click "New Character" opens modal with form
- Form validates required fields (name)
- Successful creation adds character to list immediately (optimistic update)
- Form closes and shows success toast on save
- Error handling with error toast

**Files to Create**:
- `apps/web/src/features/knowledge-base/components/character-form.tsx`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-create-character.ts`

**Files to Update**:
- `apps/web/src/features/knowledge-base/components/character-list.tsx` (add modal integration)

---

### Session 1.3: Character Editing & Deletion
**Goal**: Enable editing and deleting characters
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create mutation hooks:
   - `apps/web/src/features/knowledge-base/hooks/mutations/use-update-character.ts`
   - `apps/web/src/features/knowledge-base/hooks/mutations/use-delete-character.ts`
   - Both with optimistic updates

2. Update character-form.tsx to support edit mode
   - Accept initial data prop for editing
   - Update form title and button text based on mode
   - Handle update vs create submission

3. Add edit/delete actions to character-list.tsx
   - Edit button opens form in edit mode
   - Delete button with confirmation dialog
   - Use shadcn AlertDialog for delete confirmation

**Acceptance Criteria**:
- Click edit on character opens form pre-filled with data
- Editing updates character in list immediately (optimistic)
- Delete button shows confirmation dialog
- Confirming delete removes character from list immediately
- Both operations show appropriate success/error toasts

**Files to Create**:
- `apps/web/src/features/knowledge-base/hooks/mutations/use-update-character.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-delete-character.ts`

**Files to Update**:
- `apps/web/src/features/knowledge-base/components/character-form.tsx` (edit mode support)
- `apps/web/src/features/knowledge-base/components/character-list.tsx` (add edit/delete actions)

---

### Session 1.4: Location Entity (List, Create, Edit, Delete)
**Goal**: Complete Location entity management (mirror Character pattern)
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create Location list: `apps/web/src/features/knowledge-base/components/location-list.tsx`
   - Grid/list view with name, description preview, tag count
   - "New Location" button

2. Create Location form: `apps/web/src/features/knowledge-base/components/location-form.tsx`
   - Fields: name (required), description, tags (multi-input)
   - Support create and edit modes

3. Create hooks:
   - `apps/web/src/features/knowledge-base/hooks/queries/use-location-list.ts`
   - `apps/web/src/features/knowledge-base/hooks/mutations/use-create-location.ts`
   - `apps/web/src/features/knowledge-base/hooks/mutations/use-update-location.ts`
   - `apps/web/src/features/knowledge-base/hooks/mutations/use-delete-location.ts`

4. Wire to Locations tab in knowledge-base.tsx route

**Acceptance Criteria**:
- Locations tab shows location list with create/edit/delete functionality
- All CRUD operations work with optimistic updates
- Pattern matches Character implementation for consistency

**Files to Create**:
- `apps/web/src/features/knowledge-base/components/location-list.tsx`
- `apps/web/src/features/knowledge-base/components/location-form.tsx`
- `apps/web/src/features/knowledge-base/hooks/queries/use-location-list.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-create-location.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-update-location.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-delete-location.ts`

**Files to Update**:
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx` (wire Locations tab)

---

### Session 1.5: Prop Entity (List, Create, Edit, Delete)
**Goal**: Complete Prop entity management
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create Prop list: `apps/web/src/features/knowledge-base/components/prop-list.tsx`
   - Grid/list view with name, description preview

2. Create Prop form: `apps/web/src/features/knowledge-base/components/prop-form.tsx`
   - Fields: name (required), description, associations (text area for JSON or links)

3. Create hooks:
   - `apps/web/src/features/knowledge-base/hooks/queries/use-prop-list.ts`
   - `apps/web/src/features/knowledge-base/hooks/mutations/use-create-prop.ts`
   - `apps/web/src/features/knowledge-base/hooks/mutations/use-update-prop.ts`
   - `apps/web/src/features/knowledge-base/hooks/mutations/use-delete-prop.ts`

4. Wire to Props tab in knowledge-base.tsx route

**Acceptance Criteria**:
- Props tab functional with full CRUD
- Pattern matches Character/Location implementations

**Files to Create**:
- `apps/web/src/features/knowledge-base/components/prop-list.tsx`
- `apps/web/src/features/knowledge-base/components/prop-form.tsx`
- `apps/web/src/features/knowledge-base/hooks/queries/use-prop-list.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-create-prop.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-update-prop.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-delete-prop.ts`

**Files to Update**:
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx`

---

### Session 1.6: Timeline Entity (List, Create, Edit, Delete)
**Goal**: Complete Timeline entity management
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create Timeline list: `apps/web/src/features/knowledge-base/components/timeline-list.tsx`
   - List view (chronological if date provided) with label, date, description preview

2. Create Timeline form: `apps/web/src/features/knowledge-base/components/timeline-form.tsx`
   - Fields: label (required), date (optional date picker), description, links (text area)

3. Create hooks:
   - `apps/web/src/features/knowledge-base/hooks/queries/use-timeline-list.ts`
   - `apps/web/src/features/knowledge-base/hooks/mutations/use-create-timeline.ts`
   - `apps/web/src/features/knowledge-base/hooks/mutations/use-update-timeline.ts`
   - `apps/web/src/features/knowledge-base/hooks/mutations/use-delete-timeline.ts`

4. Wire to Timeline tab in knowledge-base.tsx route

**Acceptance Criteria**:
- Timeline tab functional with full CRUD
- Date picker works correctly (optional field)
- Entries display in chronological order if dates present

**Files to Create**:
- `apps/web/src/features/knowledge-base/components/timeline-list.tsx`
- `apps/web/src/features/knowledge-base/components/timeline-form.tsx`
- `apps/web/src/features/knowledge-base/hooks/queries/use-timeline-list.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-create-timeline.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-update-timeline.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-delete-timeline.ts`

**Files to Update**:
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx`

---

### Session 1.7: Wild Card Entity (List, Create, Edit, Delete)
**Goal**: Complete Wild Card entity management
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create Wild Card list: `apps/web/src/features/knowledge-base/components/wildcard-list.tsx`
   - Grid/card view with title, content preview, tags

2. Create Wild Card form: `apps/web/src/features/knowledge-base/components/wildcard-form.tsx`
   - Fields: title (required), content (textarea), tags (multi-input)

3. Create hooks:
   - `apps/web/src/features/knowledge-base/hooks/queries/use-wildcard-list.ts`
   - `apps/web/src/features/knowledge-base/hooks/mutations/use-create-wildcard.ts`
   - `apps/web/src/features/knowledge-base/hooks/mutations/use-update-wildcard.ts`
   - `apps/web/src/features/knowledge-base/hooks/mutations/use-delete-wildcard.ts`

4. Wire to Wild Cards tab in knowledge-base.tsx route

**Acceptance Criteria**:
- Wild Cards tab functional with full CRUD
- Pattern matches other entity implementations
- All 5 KB entity types now fully functional

**Files to Create**:
- `apps/web/src/features/knowledge-base/components/wildcard-list.tsx`
- `apps/web/src/features/knowledge-base/components/wildcard-form.tsx`
- `apps/web/src/features/knowledge-base/hooks/queries/use-wildcard-list.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-create-wildcard.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-update-wildcard.ts`
- `apps/web/src/features/knowledge-base/hooks/mutations/use-delete-wildcard.ts`

**Files to Update**:
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx`

---

### Session 1.8: KB Search Functionality
**Goal**: Implement cross-entity search in Knowledge Base
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create search component: `apps/web/src/features/knowledge-base/components/kb-search.tsx`
   - Search input with debounce (300ms)
   - Results display all entity types with type badge
   - Click result to navigate to entity or open detail modal

2. Create search hook: `apps/web/src/features/knowledge-base/hooks/queries/use-kb-search.ts`
   - Use `tanstackRPC.knowledgeBase.searchKB`
   - Handle debounced input
   - Return results with type discriminator

3. Add search to knowledge-base.tsx route
   - Place at top of layout above tabs
   - Show results overlay when searching

**Acceptance Criteria**:
- Search input appears at top of KB page
- Typing triggers search after 300ms delay
- Results show entities from all types with visual distinction
- Clicking result navigates to appropriate tab or shows detail
- Empty search shows no results overlay

**Files to Create**:
- `apps/web/src/features/knowledge-base/components/kb-search.tsx`
- `apps/web/src/features/knowledge-base/hooks/queries/use-kb-search.ts`

**Files to Update**:
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx` (add search component)

---

### Session 1.9: Character Relationships UI
**Goal**: Add relationship management to Character forms
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create relationship picker: `apps/web/src/features/knowledge-base/components/relationship-picker.tsx`
   - Select target character from dropdown (other characters in series)
   - Select relationship type (from KAERI_ENUMS.RELATIONSHIP_TYPES)
   - Optional note field
   - Add/remove relationships

2. Update character-form.tsx to include relationships section
   - Array of relationships with add/remove
   - Use relationship-picker component

3. Update mutation hooks to handle relationships in create/update

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

### Session 1.10: Character Appearances UI
**Goal**: Add appearance tracking to Character forms
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create appearance picker: `apps/web/src/features/knowledge-base/components/appearance-picker.tsx`
   - Select script from dropdown (scripts in series)
   - Scene reference input (string/textarea)
   - Optional location selector (locations in KB)
   - Add/remove appearances

2. Update character-form.tsx to include appearances section
   - Array of appearances with add/remove
   - Use appearance-picker component

3. Update mutation hooks to handle appearances in create/update

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

## Phase 2: Script Management

### Session 2.1: Script List Route & Basic Components
**Goal**: Create script list view under series
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create route: `apps/web/src/routes/_auth_only/series/$seriesId/scripts.tsx`
   - Grid view of scripts in series
   - Show: title, authors, genre, logline, last edited date
   - "New Script" button
   - Click script to navigate to editor

2. Create script list component: `apps/web/src/features/series/components/script-list.tsx`
   - Reusable script grid/list
   - Empty state
   - Loading state

3. Create query hook: `apps/web/src/features/series/hooks/queries/use-script-list.ts`
   - Use `tanstackRPC.scripts.listScriptsBySeries`
   - Pagination support

**Acceptance Criteria**:
- Route accessible at `/series/{id}/scripts`
- Scripts display in grid with metadata
- Empty state shows when no scripts
- Click script navigates to editor route (stub for now)

**Files to Create**:
- `apps/web/src/routes/_auth_only/series/$seriesId/scripts.tsx`
- `apps/web/src/features/series/components/script-list.tsx`
- `apps/web/src/features/series/hooks/queries/use-script-list.ts`

---

### Session 2.2: Script Creation & Deletion
**Goal**: Enable creating and deleting scripts
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create script form: `apps/web/src/features/series/components/script-form.tsx`
   - Fields: title (required), authors (multi-input), genre, logline, coverUrl
   - Modal/dialog wrapper
   - Create mode only (editing in separate session)

2. Create mutation hooks:
   - `apps/web/src/features/series/hooks/mutations/use-create-script.ts`
   - `apps/web/src/features/series/hooks/mutations/use-delete-script.ts`
   - Both with optimistic updates

3. Wire to "New Script" button in script list
4. Add delete button to script cards with confirmation

**Acceptance Criteria**:
- Click "New Script" opens modal with form
- Creating script adds to list immediately (optimistic)
- Delete button shows confirmation dialog
- Deleting removes from list immediately
- Success/error toasts for both operations

**Files to Create**:
- `apps/web/src/features/series/components/script-form.tsx`
- `apps/web/src/features/series/hooks/mutations/use-create-script.ts`
- `apps/web/src/features/series/hooks/mutations/use-delete-script.ts`

**Files to Update**:
- `apps/web/src/features/series/components/script-list.tsx` (add delete action)

---

### Session 2.3: Script Editor Route & Layout
**Goal**: Create script editor page with split layout
**Estimated Time**: 60-75 minutes

**Deliverables**:
1. Create route: `apps/web/src/routes/_auth_only/series/$seriesId/scripts/$scriptId.tsx`
   - Load script data on mount
   - Loading state
   - Error state (script not found)

2. Create split editor layout: `apps/web/src/features/series/components/split-editor-layout.tsx`
   - Left panel: text editor (placeholder textarea for now)
   - Right panel: tabs (KB, Canvas - canvas tab can be disabled/stub)
   - Responsive split (e.g., 60/40 or 70/30)
   - Resizable divider (optional, use fixed split if complex)

3. Create query hook: `apps/web/src/features/series/hooks/queries/use-script.ts`
   - Use `tanstackRPC.scripts.getScript`
   - Load script by ID

**Acceptance Criteria**:
- Route accessible at `/series/{seriesId}/scripts/{scriptId}`
- Split layout displays with left text area and right panel
- Script content loads in text area
- Right panel has tabs (KB tab functional, others stub)
- Layout is fixed to desktop (mobile can show warning or stack)

**Files to Create**:
- `apps/web/src/routes/_auth_only/series/$seriesId/scripts/$scriptId.tsx`
- `apps/web/src/features/series/components/split-editor-layout.tsx`
- `apps/web/src/features/series/hooks/queries/use-script.ts`

---

### Session 2.4: Script Content Editor with Manual Save
**Goal**: Implement text editor with manual save functionality
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create text editor component: `apps/web/src/features/series/components/script-text-editor.tsx`
   - Controlled textarea with monospace font (Courier New)
   - Track cursor position (selectionStart)
   - Save button in toolbar
   - Save status indicator (saved, unsaved, saving...)
   - Character/word count (optional)

2. Create save mutation hook: `apps/web/src/features/series/hooks/mutations/use-save-script.ts`
   - Use `tanstackRPC.scripts.saveScriptContent`
   - Include cursor position in save
   - Optimistic update
   - Success/error handling

3. Wire editor to split-editor-layout.tsx

**Acceptance Criteria**:
- Text editor displays script content
- Typing updates content in real-time
- Save button appears when content changes
- Clicking save persists content to backend
- Save status updates (unsaved → saving → saved)
- Cursor position preserved after save

**Files to Create**:
- `apps/web/src/features/series/components/script-text-editor.tsx`
- `apps/web/src/features/series/hooks/mutations/use-save-script.ts`

**Files to Update**:
- `apps/web/src/features/series/components/split-editor-layout.tsx` (integrate editor)

---

### Session 2.5: Autosave Functionality
**Goal**: Add debounced autosave to script editor
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Create autosave hook: `apps/web/src/features/series/hooks/use-autosave.ts`
   - Debounced save (2-3 seconds after typing stops)
   - Use existing use-save-script mutation
   - Skip if no changes
   - Show "autosaving..." status

2. Update script-text-editor.tsx to use autosave
   - Call autosave hook on content change
   - Show autosave indicator
   - Manual save button still available

**Acceptance Criteria**:
- Content automatically saves 2-3 seconds after typing stops
- Autosave indicator shows "autosaving..." during save
- Manual save button still works (immediate save)
- No unnecessary saves (only when content changes)
- Cursor position preserved during autosave

**Files to Create**:
- `apps/web/src/features/series/hooks/use-autosave.ts`

**Files to Update**:
- `apps/web/src/features/series/components/script-text-editor.tsx` (integrate autosave)

---

### Session 2.6: KB Panel in Script Editor
**Goal**: Integrate KB search/quick-add in script editor right panel
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create KB panel component: `apps/web/src/features/series/components/kb-panel.tsx`
   - Mini search bar (reuse kb-search logic)
   - Quick-add buttons for each entity type
   - Entity list (compact view)
   - Click entity to view detail or edit

2. Add KB tab to split-editor-layout.tsx
   - Integrate kb-panel.tsx in right panel KB tab
   - Tab should be default active

3. Create quick-add modal: `apps/web/src/features/series/components/kb-quick-add.tsx`
   - Simplified forms for each entity type
   - Inline creation without leaving editor

**Acceptance Criteria**:
- KB tab in script editor shows search and entities
- Can search KB entities without leaving editor
- Quick-add buttons open simplified creation forms
- Creating entity from editor updates KB immediately
- Clicking entity shows detail (modal or inline)

**Files to Create**:
- `apps/web/src/features/series/components/kb-panel.tsx`
- `apps/web/src/features/series/components/kb-quick-add.tsx`

**Files to Update**:
- `apps/web/src/features/series/components/split-editor-layout.tsx` (wire KB panel)

---

### Session 2.7: Script Metadata Editing
**Goal**: Enable editing script metadata (title, authors, genre, logline)
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Update script-form.tsx to support edit mode
   - Accept initial data for editing
   - Update form title and button text

2. Create mutation hook: `apps/web/src/features/series/hooks/mutations/use-update-script.ts`
   - Use `tanstackRPC.scripts.updateScript`
   - Optimistic updates

3. Add edit button to script editor toolbar
   - Opens script-form in edit mode
   - Updates visible immediately after save

**Acceptance Criteria**:
- Edit button in script editor opens metadata form
- Editing metadata updates script immediately (optimistic)
- Form validates required fields
- Success/error toasts

**Files to Create**:
- `apps/web/src/features/series/hooks/mutations/use-update-script.ts`

**Files to Update**:
- `apps/web/src/features/series/components/script-form.tsx` (edit mode)
- `apps/web/src/routes/_auth_only/series/$seriesId/scripts/$scriptId.tsx` (add edit button)

---

## Phase 3: Series Management Polish

### Session 3.1: Series Creation Modal
**Goal**: Complete series creation functionality
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create series modal component: `apps/web/src/features/series/components/series-modal.tsx`
   - Form fields: title (required), genre, logline, coverUrl
   - Use TanStack Form
   - Modal/dialog wrapper

2. Wire to "New Project" button in projects.tsx route
   - Dialog state management
   - Use existing use-create-series hook
   - Success closes modal and shows toast

**Acceptance Criteria**:
- Click "New Project" opens modal with form
- Form validates required field (title)
- Creating series adds to list immediately (optimistic)
- Modal closes on success
- Error handling with toast

**Files to Create**:
- `apps/web/src/features/series/components/series-modal.tsx`

**Files to Update**:
- `apps/web/src/routes/_auth_only/projects.tsx` (wire button to modal)

---

### Session 3.2: Series Editing & Deletion
**Goal**: Enable editing and deleting series
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Update series-modal.tsx to support edit mode
   - Accept initial data prop
   - Update form title and button text

2. Add edit/delete actions to series cards in projects.tsx
   - Edit button (icon or dropdown menu)
   - Delete button with confirmation dialog
   - Use existing mutation hooks

3. Ensure optimistic updates work correctly
   - Edit updates card immediately
   - Delete removes card immediately

**Acceptance Criteria**:
- Series cards have edit and delete actions
- Edit opens modal pre-filled with data
- Delete shows confirmation dialog
- Both operations update UI immediately (optimistic)
- Success/error toasts

**Files to Update**:
- `apps/web/src/features/series/components/series-modal.tsx` (edit mode)
- `apps/web/src/routes/_auth_only/projects.tsx` (add edit/delete actions)

---

### Session 3.3: Series Detail View with Navigation
**Goal**: Create series detail page with tabs for scripts/KB
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create route: `apps/web/src/routes/_auth_only/series/$seriesId/index.tsx`
   - Series overview/dashboard
   - Show series metadata
   - Quick stats (script count, KB entity counts)
   - Navigation to scripts and KB

2. Update series cards in projects.tsx to link to detail view
   - Click card navigates to series detail

3. Add navigation in series detail route
   - Tabs or buttons to scripts and KB pages
   - Breadcrumb navigation back to projects

**Acceptance Criteria**:
- Clicking series card navigates to detail page
- Detail page shows series info and stats
- Can navigate to scripts and KB from detail page
- Breadcrumb navigation works

**Files to Create**:
- `apps/web/src/routes/_auth_only/series/$seriesId/index.tsx`

**Files to Update**:
- `apps/web/src/routes/_auth_only/projects.tsx` (add click navigation to cards)

---

## Phase 4: Polish & Enhancement

### Session 4.1: Loading & Error States
**Goal**: Improve loading and error states across all views
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create loading skeletons for:
   - Series grid (projects.tsx)
   - Script grid
   - KB entity lists

2. Create error boundaries and fallbacks
   - Generic error page component
   - Not found page for missing resources

3. Add retry buttons to error states

**Acceptance Criteria**:
- Loading states show skeleton loaders instead of blank screens
- Error states show helpful messages with retry option
- 404 states handle missing series/scripts/entities gracefully

**Files to Create**:
- `apps/web/src/components/loading/series-skeleton.tsx`
- `apps/web/src/components/loading/script-skeleton.tsx`
- `apps/web/src/components/loading/entity-skeleton.tsx`
- `apps/web/src/components/errors/error-fallback.tsx`

**Files to Update**:
- All route files (add better loading/error handling)

---

### Session 4.2: Navigation & Breadcrumbs
**Goal**: Add consistent navigation and breadcrumbs
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Create breadcrumb component: `apps/web/src/components/navigation/breadcrumb.tsx`
   - Dynamic breadcrumb based on route
   - Links to parent routes

2. Add to all series/script/KB routes
   - Show: Projects > Series Name > [Scripts/KB/Script Name]

3. Add sidebar navigation (optional)
   - Quick links to projects, settings, etc.

**Acceptance Criteria**:
- Breadcrumbs appear on all deep routes
- Clicking breadcrumb navigates correctly
- Breadcrumbs reflect current location

**Files to Create**:
- `apps/web/src/components/navigation/breadcrumb.tsx`

**Files to Update**:
- All series/script/KB routes (add breadcrumbs)

---

### Session 4.3: Keyboard Shortcuts
**Goal**: Add keyboard shortcuts for common actions
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Create keyboard shortcut hook: `apps/web/src/hooks/use-keyboard-shortcuts.ts`
   - Register shortcuts with actions
   - Handle conflicts
   - Show shortcut hints in UI

2. Add shortcuts for:
   - Save script: Ctrl+S / Cmd+S
   - New entity: Ctrl+N / Cmd+N
   - Search: Ctrl+K / Cmd+K
   - Close modal: Esc

3. Create shortcut help modal
   - Show all available shortcuts
   - Triggered by ? key

**Acceptance Criteria**:
- Keyboard shortcuts work in appropriate contexts
- Shortcuts don't conflict with browser defaults
- Help modal shows all shortcuts
- Visual hints for shortcuts in UI (optional)

**Files to Create**:
- `apps/web/src/hooks/use-keyboard-shortcuts.ts`
- `apps/web/src/components/help/shortcuts-modal.tsx`

---

## Summary

**Total Sessions**: 27 sessions organized into 4 phases

**Phase Breakdown**:
- Phase 1 (KB Foundation): 10 sessions → Complete Knowledge Base UI
- Phase 2 (Script Management): 7 sessions → Complete Script Editor with KB integration
- Phase 3 (Series Polish): 3 sessions → Complete Series management
- Phase 4 (Polish): 3 sessions → UI/UX improvements

**Estimated Timeline**:
- Phase 1: 8-10 hours (KB foundation)
- Phase 2: 6-8 hours (Script editor)
- Phase 3: 3-4 hours (Series polish)
- Phase 4: 2-3 hours (Polish)
- **Total**: 19-25 hours of focused development

**Deferred Features** (Phase 5+):
- Canvas UI (Phase 7 from original plan)
- PDF Export implementation (Phase 8)
- Continuity graph UI (Phase 9)
- Audit log viewer (Phase 9)
- Performance telemetry (Phase 10)
- Comprehensive testing (Phase 10-11)

**MVP Definition** (After Phase 3):
- ✅ Create and manage series
- ✅ Create and manage scripts with text editor
- ✅ Create and manage all KB entities (Characters, Locations, Props, Timeline, Wild Cards)
- ✅ Search across KB entities
- ✅ Character relationships and appearances
- ✅ Autosave in script editor
- ✅ KB panel integrated in script editor

This task breakdown enables systematic, completable sessions while building toward a functional MVP. Each session is scoped to be achievable in one focused sitting with clear acceptance criteria.
