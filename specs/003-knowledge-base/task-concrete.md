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
