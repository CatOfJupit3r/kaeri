# Concrete Tasks: Script Authoring

Breakdown modeled after TASK_BREAKDOWN.md structure with session-by-session tasks.

---

## Session SC1.1: Script List Route & Basic Components
**Goal**: Create script list view under series with CRUD skeleton  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create route: `apps/web/src/routes/_auth_only/series/$seriesId/scripts.tsx`
   - Grid view of scripts in series
   - Show: title, authors, genre, logline, last edited date
   - "New Script" button
   - Click script to navigate to editor

2. Create script list component: `apps/web/src/features/scripts/components/script-list.tsx`
   - Reusable script grid/list layout
   - Empty state when no scripts
   - Loading skeleton state

3. Create query hook: `apps/web/src/features/scripts/hooks/queries/use-script-list.ts`
   - Use `tanstackRPC.scripts.listBySeriesId`
   - Pagination support (limit, offset)

**Acceptance Criteria**:
- Route accessible at `/series/{id}/scripts`
- Scripts display in grid with metadata
- Empty state shows when no scripts exist
- Click script navigates to editor route (stub for now)

**Files to Create**:
- `apps/web/src/routes/_auth_only/series/$seriesId/scripts.tsx`
- `apps/web/src/features/scripts/components/script-list.tsx`
- `apps/web/src/features/scripts/hooks/queries/use-script-list.ts`

---

## Session SC1.2: Script Creation & Deletion
**Goal**: Enable creating and deleting scripts with validation  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create script form: `apps/web/src/features/scripts/components/script-form.tsx`
   - Fields: title (required), authors (multi-input), genre, logline, coverUrl
   - Modal/dialog wrapper using shadcn Dialog
   - Create mode initially (edit mode in separate session)

2. Create mutation hooks:
   - `apps/web/src/features/scripts/hooks/mutations/use-create-script.ts`
   - `apps/web/src/features/scripts/hooks/mutations/use-delete-script.ts`
   - Both with optimistic updates

3. Wire to "New Script" button in script list
4. Add delete button to script cards with confirmation dialog

**Acceptance Criteria**:
- Click "New Script" opens modal with form
- Creating script adds to list immediately (optimistic)
- Delete button shows confirmation dialog
- Deleting removes from list immediately
- Success/error toasts for both operations

**Files to Create**:
- `apps/web/src/features/scripts/components/script-form.tsx`
- `apps/web/src/features/scripts/hooks/mutations/use-create-script.ts`
- `apps/web/src/features/scripts/hooks/mutations/use-delete-script.ts`

**Files to Update**:
- `apps/web/src/features/scripts/components/script-list.tsx` (add delete action)

---

## Session SC1.3: Script Editor Route & Layout
**Goal**: Create script editor page with split layout skeleton  
**Estimated Time**: 60-75 minutes

**Deliverables**:
1. Create route: `apps/web/src/routes/_auth_only/series/$seriesId/scripts/$scriptId.tsx`
   - Load script data on mount
   - Loading state
   - Error state (script not found, redirect or toast)

2. Create split editor layout: `apps/web/src/features/scripts/components/split-editor-layout.tsx`
   - Left panel: block editor placeholder (empty container)
   - Right panel: tabs for KB and Canvas (Canvas stub/disabled)
   - Responsive split (e.g., 60/40 or 70/30)
   - Fixed split initially (resizable divider optional later)

3. Create query hook: `apps/web/src/features/scripts/hooks/queries/use-script.ts`
   - Use `tanstackRPC.scripts.getById`
   - Load script metadata and content

**Acceptance Criteria**:
- Route accessible at `/series/{seriesId}/scripts/{scriptId}`
- Split layout displays with left panel and right panel
- Script data loads successfully
- Right panel has tabs (KB tab functional, Canvas stub)
- Layout is fixed to desktop (mobile shows warning or stacks)

**Files to Create**:
- `apps/web/src/routes/_auth_only/series/$seriesId/scripts/$scriptId.tsx`
- `apps/web/src/features/scripts/components/split-editor-layout.tsx`
- `apps/web/src/features/scripts/hooks/queries/use-script.ts`

---

## Session SC1.4: Block Parsing & Serialization Utilities
**Goal**: Create utilities to parse plain text to blocks and serialize blocks back  
**Estimated Time**: 60-75 minutes

**Deliverables**:
1. Create block types: `apps/web/src/features/scripts/types/blocks.ts`
   - BlockType enum: scene-heading, action, character, dialogue, parenthetical, transition
   - ScriptBlock interface: id, type, content
   - BlockConfig interface: label, shortcut, icon, placeholder, color, bgColor, alignment, textStyle

2. Create block parser: `apps/web/src/features/scripts/utils/block-parser.ts`
   - `parseContentToBlocks(content: string): ScriptBlock[]`
   - Detection patterns:
     - `/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i` → Scene Heading
     - `/^(FADE IN:|FADE OUT|CUT TO:|DISSOLVE TO:)$/i` → Transition
     - `/^\(.*\)$/` → Parenthetical
     - Uppercase < 40 chars → Character
     - After Character/Parenthetical → Dialogue
     - Default → Action
   - Handle multi-line blocks (action descriptions)

3. Create block serializer: `apps/web/src/features/scripts/utils/block-serializer.ts`
   - `blocksToContent(blocks: ScriptBlock[]): string`
   - Add appropriate spacing (Scene Heading gets extra newlines)
   - Preserve formatting hints

4. Create block config: `apps/web/src/features/scripts/config/block-config.ts`
   - BLOCK_CONFIG object with all 6 block types
   - Colors, icons, placeholders, shortcuts

**Acceptance Criteria**:
- Parser correctly identifies all block types from plain text
- Multi-line action blocks parse as single block
- Serializer produces properly formatted screenplay text
- Round-trip (parse → serialize → parse) preserves structure
- Edge cases handled (empty lines, malformed input)

**Files to Create**:
- `apps/web/src/features/scripts/types/blocks.ts`
- `apps/web/src/features/scripts/utils/block-parser.ts`
- `apps/web/src/features/scripts/utils/block-serializer.ts`
- `apps/web/src/features/scripts/config/block-config.ts`

---

## Session SC1.5: Block Component & Keyboard Navigation
**Goal**: Create reusable block component with dropdown and keyboard controls  
**Estimated Time**: 75-90 minutes

**Deliverables**:
1. Create block component: `apps/web/src/features/scripts/components/script-block.tsx`
   - Props: block, isFocused, onChange, onKeyDown, onChangeType, onFocus, onBlur
   - Left section: Dropdown with icon + label + chevron (96px width)
   - Right section: Auto-resize textarea with type-specific styling
   - Visual states: default (white bg), hover (shadow-sm), focused (colored bg + shadow)
   - Type-specific alignment (center for Character/Parenthetical, right for Transition)
   - Type-specific text transform (uppercase for Scene/Character/Transition, italic for Parenthetical)

2. Implement keyboard handlers:
   - Enter: Create new block with context-aware type
   - Backspace on empty: Delete block (min 1 enforced)
   - Arrow Up (at start): Focus previous block, cursor at end
   - Arrow Down (at end): Focus next block, cursor at start
   - Tab: Cycle through block types

3. Create dropdown using shadcn DropdownMenu
   - Show all 6 block types with icons
   - Highlight current type
   - Keyboard shortcuts displayed (S, A, C, D, W, T)

**Acceptance Criteria**:
- Block displays with proper brutalist styling (2px borders)
- Dropdown changes block type immediately
- Enter creates new block with smart type detection
- Backspace deletes empty blocks (keeps minimum 1)
- Arrow keys navigate between blocks smoothly
- Tab cycles through all block types
- Focused blocks show colored background
- Auto-resize textarea adjusts to content height

**Files to Create**:
- `apps/web/src/features/scripts/components/script-block.tsx`

---

## Session SC1.6: Block Editor Container & State Management
**Goal**: Create main block editor component managing block array state  
**Estimated Time**: 60-75 minutes

**Deliverables**:
1. Create block editor: `apps/web/src/features/scripts/components/script-block-editor.tsx`
   - State: blocks array (ScriptBlock[])
   - State: focusedBlockId (string | null)
   - Parse content to blocks on mount (useEffect)
   - Render ScriptBlock components with map
   - Handle block updates (updateBlock)
   - Handle block type changes (changeBlockType)
   - Handle block creation (addBlockAfter)
   - Handle block deletion (deleteBlock)
   - Track refs for all blocks (useRef<Map>)
   - Auto-focus newly created blocks

2. Create save mutation hook: `apps/web/src/features/scripts/hooks/mutations/use-save-script.ts`
   - Serialize blocks to content before save
   - Use `tanstackRPC.scripts.saveContent`
   - Optimistic update of lastEditedAt
   - Success/error handling with toast

3. Create toolbar component: `apps/web/src/features/scripts/components/script-editor-toolbar.tsx`
   - Word count (calculate from all blocks)
   - Page count (~250 words per page)
   - Save button (manual trigger)
   - Quick block type buttons (optional)

**Acceptance Criteria**:
- Block editor loads script content as blocks
- All keyboard navigation works (Enter, Backspace, Arrows, Tab)
- Block updates trigger re-render
- Block creation/deletion updates state correctly
- Focus management works (new blocks auto-focus)
- Word/page count updates in real-time
- Manual save serializes blocks and persists

**Files to Create**:
- `apps/web/src/features/scripts/components/script-block-editor.tsx`
- `apps/web/src/features/scripts/components/script-editor-toolbar.tsx`
- `apps/web/src/features/scripts/hooks/mutations/use-save-script.ts`

**Files to Update**:
- `apps/web/src/features/scripts/components/split-editor-layout.tsx` (integrate block editor)

---

## Session SC1.7: Script Metadata Editing
**Goal**: Enable editing script metadata from editor toolbar  
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Update script-form.tsx to support edit mode
   - Accept initial data for pre-filling
   - Update form title and button text based on mode

2. Create mutation hook: `apps/web/src/features/scripts/hooks/mutations/use-update-script.ts`
   - Use `tanstackRPC.scripts.update`
   - Optimistic updates for metadata fields

3. Add edit button to script editor toolbar
   - Opens script-form in edit mode
   - Updates visible immediately after save

**Acceptance Criteria**:
- Edit button in script editor opens metadata form
- Editing metadata updates script immediately (optimistic)
- Form validates required fields (title)
- Success/error toasts

**Files to Create**:
- `apps/web/src/features/scripts/hooks/mutations/use-update-script.ts`

**Files to Update**:
- `apps/web/src/features/scripts/components/script-form.tsx` (edit mode support)
- `apps/web/src/routes/_auth_only/series/$seriesId/scripts/$scriptId.tsx` (add edit button)

---

## Session SC1.8: Autosave with Block Serialization
**Goal**: Add debounced autosave to block editor  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create autosave hook: `apps/web/src/features/scripts/hooks/use-autosave.ts`
   - Debounced save (1-2 seconds after typing stops)
   - Use existing `use-save-script` mutation
   - Skip save if no changes detected (compare serialized content)
   - Show "autosaving..." status during save
   - Accept blocks array as dependency

2. Update script-block-editor.tsx to integrate autosave
   - Call autosave hook with blocks dependency
   - Show autosave indicator in toolbar
   - Manual save button still available (immediate trigger)
   - Content update timeout to batch rapid changes

3. Add save status component: `apps/web/src/features/scripts/components/save-status.tsx`
   - Visual indicator: "Saved", "Unsaved changes", "Saving...", "Autosaving..."
   - Color-coded (green for saved, yellow for unsaved, blue for saving)
   - Display in toolbar

**Acceptance Criteria**:
- Content automatically saves 1-2 seconds after typing stops
- Autosave indicator shows status changes
- Manual save button still works (immediate save)
- No unnecessary saves (only when blocks change)
- Block focus preserved during autosave
- Cursor position preserved during autosave

**Files to Create**:
- `apps/web/src/features/scripts/hooks/use-autosave.ts`
- `apps/web/src/features/scripts/components/save-status.tsx`

**Files to Update**:
- `apps/web/src/features/scripts/components/script-block-editor.tsx` (integrate autosave)
- `apps/web/src/features/scripts/components/script-editor-toolbar.tsx` (add save status)

---

## Session SC1.9: Add Block Section with Suggestions
**Goal**: Create "Add Block" button with contextual suggestions  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create add block section: `apps/web/src/features/scripts/components/add-block-section.tsx`
   - Main "Add Block" button with dashed border
   - Suggests 2-3 next block types based on last block
   - Context-aware suggestions:
     - After Scene Heading → Action, Character
     - After Character → Dialogue, Parenthetical
     - After Dialogue → Character, Action
     - After Action → Scene Heading, Character, Transition
   - Click suggestion creates block of that type

2. Update script-block-editor.tsx to include add block section at bottom
   - Always visible below last block
   - Scrolls into view smoothly

3. Style with brutalist design
   - Dashed border for main button
   - Solid colored buttons for suggestions (matching block colors)
   - Icons for each suggestion

**Acceptance Criteria**:
- "Add Block" button visible at bottom of script
- Suggestions change based on last block type
- Clicking suggestion creates and focuses new block
- Visual styling matches brutalist theme
- Smooth scroll to new block on creation

**Files to Create**:
- `apps/web/src/features/scripts/components/add-block-section.tsx`

**Files to Update**:
- `apps/web/src/features/scripts/components/script-block-editor.tsx` (add section at bottom)

---

## Session SC1.10: Block Autocomplete for Characters & Locations
**Goal**: Add autocomplete for KB entities within blocks  
**Estimated Time**: 60-75 minutes

**Deliverables**:
1. Create autocomplete component: `apps/web/src/features/scripts/components/block-autocomplete.tsx`
   - Dropdown positioned below cursor/block
   - Shows filtered list of characters and locations
   - Arrow keys navigate (up/down)
   - Enter inserts selected item
   - Escape closes
   - Click outside closes

2. Create autocomplete hook: `apps/web/src/features/scripts/hooks/use-block-autocomplete.ts`
   - Detect trigger: "@" character or context (Character block)
   - Query KB entities (use existing KB queries)
   - Filter by typed text after trigger
   - Return: options, selectedIndex, handlers (select, navigate, close)

3. Update script-block.tsx to integrate autocomplete
   - Detect trigger on input
   - Show autocomplete dropdown
   - Handle autocomplete selection (insert at cursor)
   - Auto-focus Character block on Scene Heading completion

4. Create autocomplete portal wrapper
   - Position relative to textarea cursor
   - z-index above editor
   - Scrollable list with max height

**Acceptance Criteria**:
- Typing "@" in any block shows autocomplete
- Character block automatically shows character autocomplete
- Arrow keys navigate suggestions
- Enter inserts selected character/location name
- Escape or click outside closes autocomplete
- Autocomplete filters as user types
- Visual styling matches brutalist theme with borders

**Files to Create**:
- `apps/web/src/features/scripts/components/block-autocomplete.tsx`
- `apps/web/src/features/scripts/hooks/use-block-autocomplete.ts`

**Files to Update**:
- `apps/web/src/features/scripts/components/script-block.tsx` (integrate autocomplete)

---

## Session SC1.11: KB Panel in Script Editor
**Goal**: Integrate KB search and quick-add in script editor right panel  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create KB panel component: `apps/web/src/features/scripts/components/kb-panel.tsx`
   - Mini search bar (reuse KB search logic)
   - Quick-add buttons for each entity type (Character, Location, Prop, etc.)
   - Entity list in compact view
   - Click entity to view detail or edit

2. Add KB tab to split-editor-layout.tsx
   - Integrate kb-panel.tsx in right panel KB tab
   - Tab should be default active

3. Create quick-add modal: `apps/web/src/features/scripts/components/kb-quick-add.tsx`
   - Simplified forms for each entity type
   - Inline creation without leaving editor
   - Success updates KB list immediately

**Acceptance Criteria**:
- KB tab in script editor shows search and entities
- Can search KB entities without leaving editor
- Quick-add buttons open simplified creation forms
- Creating entity from editor updates KB immediately
- Clicking entity shows detail (modal or inline)

**Files to Create**:
- `apps/web/src/features/scripts/components/kb-panel.tsx`
- `apps/web/src/features/scripts/components/kb-quick-add.tsx`

**Files to Update**:
- `apps/web/src/features/scripts/components/split-editor-layout.tsx` (wire KB panel)

---

## Session SC1.12: Editor Toolbar Enhancement (T027)
**Goal**: Enhance toolbar with formatting, version control, and actions matching V0 design  
**Estimated Time**: 60-75 minutes

**Deliverables**:
1. Update toolbar component: `apps/web/src/features/scripts/components/script-editor-toolbar.tsx`
   - Left section: Title and metadata (editable inline or dialog)
   - Center section: Formatting buttons (Bold, Italic, Underline)
   - Right section: Version dropdown, Share, Export, More actions (MoreVertical)
   
2. Add toolbar button components:
   - Format buttons with icons (Bold, Italic, Underline)
   - Version dropdown with revision history (stub initially)
   - Share button (copy link or share dialog)
   - Export button (triggers export modal from T030)
   - More menu (dropdown with additional options: Print, Settings)

3. Implement formatting handlers:
   - Apply text formatting to selected block content
   - Toggle format state (active/inactive)
   - Preserve formatting in block serialization

4. Add version dropdown:
   - List recent versions (timestamps)
   - Click version to preview (read-only mode)
   - "Restore this version" option
   - Version data from backend (stub for now)

**Acceptance Criteria**:
- Toolbar displays with left/center/right sections
- Format buttons toggle formatting on selected text
- Version dropdown shows revision history
- Share button copies script link
- Export button triggers export modal
- More menu shows additional actions
- Visual styling matches V0 design with proper spacing

**Files to Update**:
- `apps/web/src/features/scripts/components/script-editor-toolbar.tsx`

**Files to Create**:
- `apps/web/src/features/scripts/components/toolbar-format-buttons.tsx`
- `apps/web/src/features/scripts/components/toolbar-version-dropdown.tsx`
- `apps/web/src/features/scripts/components/toolbar-more-menu.tsx`

---

## Session SC1.13: Script Breakdown Feature (T028)
**Goal**: Add breakdown modal for cast, locations, props, and scenes  
**Estimated Time**: 75-90 minutes

**Deliverables**:
1. Create breakdown modal: `apps/web/src/features/scripts/components/breakdown-modal.tsx`
   - Dialog with tabs: Cast, Locations, Props, Scenes
   - Each tab shows list of entities extracted from script
   - Show entity counts and scene appearances
   - Click entity to view/edit details
   - Export breakdown option (CSV, PDF)

2. Create breakdown parser: `apps/web/src/features/scripts/utils/breakdown-parser.ts`
   - Parse script blocks to extract entities
   - Detect characters from Character blocks
   - Detect locations from Scene Heading blocks
   - Detect props from Action block keywords (stub initially)
   - Track scene appearances for each entity
   - Return breakdown data structure

3. Create breakdown tabs:
   - `apps/web/src/features/scripts/components/breakdown-cast-tab.tsx`: Character list with appearance counts
   - `apps/web/src/features/scripts/components/breakdown-locations-tab.tsx`: Location list with scene numbers
   - `apps/web/src/features/scripts/components/breakdown-props-tab.tsx`: Props list with appearances
   - `apps/web/src/features/scripts/components/breakdown-scenes-tab.tsx`: Scene list with metadata

4. Add breakdown button to toolbar
   - Opens breakdown modal
   - Parses current script state
   - Shows loading state during parse

**Acceptance Criteria**:
- Breakdown button in toolbar opens modal
- Modal displays tabs for Cast, Locations, Props, Scenes
- Parser correctly extracts entities from script blocks
- Entity counts and appearances accurate
- Click entity opens detail view
- Export breakdown generates file (CSV/PDF)
- Visual styling matches V0 design

**Files to Create**:
- `apps/web/src/features/scripts/components/breakdown-modal.tsx`
- `apps/web/src/features/scripts/components/breakdown-cast-tab.tsx`
- `apps/web/src/features/scripts/components/breakdown-locations-tab.tsx`
- `apps/web/src/features/scripts/components/breakdown-props-tab.tsx`
- `apps/web/src/features/scripts/components/breakdown-scenes-tab.tsx`
- `apps/web/src/features/scripts/utils/breakdown-parser.ts`

**Files to Update**:
- `apps/web/src/features/scripts/components/script-editor-toolbar.tsx` (add breakdown button)

---

## Session SC1.14: Right Panel Tabs Enhancement (T029)
**Goal**: Add AI Assistant tab to script editor right panel  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create AI Assistant panel: `apps/web/src/features/scripts/components/ai-assistant-panel.tsx`
   - Chat interface with message history
   - Input field for user queries
   - AI suggestions for script improvements
   - Context-aware (current script, scene, character)
   - Preset prompts (Generate dialogue, Improve action, Analyze pacing)

2. Create AI message component: `apps/web/src/features/scripts/components/ai-message.tsx`
   - Display user and AI messages
   - Markdown formatting support
   - Copy button for AI responses
   - Apply suggestion button (inserts content into script)

3. Update split-editor-layout.tsx:
   - Add AI Assistant tab to right panel
   - Tab order: Knowledge Base, Canvas, AI Assistant
   - AI tab persists state when switching tabs

4. Create AI query hook: `apps/web/src/features/scripts/hooks/use-ai-assistant.ts`
   - Send queries to AI backend (stub initially)
   - Handle streaming responses
   - Context injection (script excerpt, entity info)

**Acceptance Criteria**:
- AI Assistant tab visible in script editor right panel
- Chat interface allows user queries
- AI responses display with formatting
- Preset prompts provide quick access to common tasks
- Apply suggestion inserts AI content into script
- Context-aware responses reference current script state
- Visual styling matches V0 design

**Files to Create**:
- `apps/web/src/features/scripts/components/ai-assistant-panel.tsx`
- `apps/web/src/features/scripts/components/ai-message.tsx`
- `apps/web/src/features/scripts/hooks/use-ai-assistant.ts`

**Files to Update**:
- `apps/web/src/features/scripts/components/split-editor-layout.tsx` (add AI Assistant tab)

---

## Session SC1.15: Table Read Feature (T030)
**Goal**: Add table read modal for collaborative script reading  
**Estimated Time**: 60-75 minutes

**Deliverables**:
1. Create table read modal: `apps/web/src/features/scripts/components/table-read-modal.tsx`
   - Dialog with script view optimized for reading
   - Character role assignment (assign users to characters)
   - Current block highlight (synchronized reading position)
   - Previous/Next block navigation
   - Reader mode toggle (shows only assigned character's lines)

2. Create table read state hook: `apps/web/src/features/scripts/hooks/use-table-read.ts`
   - Manage reading position (current block index)
   - Track assigned roles (user → character mapping)
   - Handle navigation (next/previous block)
   - Reader mode filtering

3. Create role assignment component: `apps/web/src/features/scripts/components/table-read-roles.tsx`
   - List all characters in script
   - Dropdown to assign user to each character
   - Unassigned characters shown separately
   - Color-coded by assignment

4. Add table read button to toolbar
   - Opens table read modal
   - Parses script to extract characters
   - Starts at first block

**Acceptance Criteria**:
- Table read button in toolbar opens modal
- Modal displays script blocks in reading format
- Can assign users to character roles
- Current block highlights during reading
- Next/Previous navigation works
- Reader mode filters to assigned character's lines
- Visual styling matches V0 design with proper formatting

**Files to Create**:
- `apps/web/src/features/scripts/components/table-read-modal.tsx`
- `apps/web/src/features/scripts/components/table-read-roles.tsx`
- `apps/web/src/features/scripts/hooks/use-table-read.ts`

**Files to Update**:
- `apps/web/src/features/scripts/components/script-editor-toolbar.tsx` (add table read button)

