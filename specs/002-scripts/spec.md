# Feature Specification: Script Authoring

**Feature Branch**: `[scripts-domain]`  
**Created**: 2026-01-02  
**Status**: Draft  
**Input**: Script authoring with split editor, autosave, metadata, and KB/Canvas side panel

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Write Script with Block-Based Editor (Priority: P1)
A writer opens a script and writes using block-based editing with proper formatting, keyboard shortcuts, and side panel access to knowledge base.

**Why this priority**: Delivers the primary authoring experience with professional screenplay formatting.

**Independent Test**: A script can be created, opened in a split layout with block editor, edited using keyboard shortcuts, saved, and reopened with all blocks and formatting intact; KB panel loads alongside.

**Acceptance Scenarios**:
1. Given a script, when opened, then a split layout shows the block-based editor on the left and the knowledge base tabs on the right.
2. Given a block, when clicking the type dropdown or pressing Tab, then the block type changes with appropriate visual styling (colored borders, alignment, formatting).
3. Given focused block, when pressing Enter, then a new block is created with contextually appropriate type (Scene Heading → Action, Character → Dialogue, etc.).
4. Given empty block, when pressing Backspace, then the block is deleted and focus moves to previous block (minimum 1 block remains).
5. Given focused block, when typing "@" or character trigger, then autocomplete suggests characters/locations from knowledge base.
6. Given text changes, when autosave or manual save triggers, then all blocks with content and types persist and reload accurately.
7. Given bottom of script, when viewing, then "Add Block" button is visible with suggested next block types.

### Edge Cases
- Autosave failures surface errors and allow manual save retry.
- Large scripts (500+ pages/1000+ blocks) keep the editor responsive; consider virtualization for block rendering.
- Deleting a script with appearances cleans up references or blocks with guidance.
- Concurrent edits (single-user) resolve last-write-wins; future multi-user needs OT/CRDT.
- Pasting plain text converts to appropriate blocks based on content detection (INT./EXT. → Scene Heading, ALL CAPS → Character, etc.).
- Copying blocks preserves type and formatting information.
- Undo/redo operations work across block creation, deletion, type changes, and content edits.
- Block type transitions respect screenplay conventions (e.g., Dialogue shouldn't auto-create another Dialogue without Character in between).
- Autocomplete handles partial matches, fuzzy search, and keyboard-only navigation.
- Empty blocks at script end are allowed but not persisted on save.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-002**: System MUST provide a Script library view within a Series showing title, authors, genre, logline, last updated, and optional cover.
- **FR-003**: System MUST provide a split-screen Script Editor with block-based text entry, autosave/manual save, and a right-side panel with Knowledge Base and Canvas tabs.
- **FR-004**: System MUST support block-based script editing with the following block types:
  - Scene Heading (blue left border, uppercase, shortcut: S)
  - Action (no colored border, standard formatting, shortcut: A)
  - Character (amber/orange left border, centered uppercase, shortcut: C)
  - Dialogue (green left border, indented, shortcut: D)
  - Parenthetical/Wrylies (purple/pink left border, centered italic, shortcut: W)
  - Transition (yellow left border, right-aligned uppercase, shortcut: T)
- **FR-005**: System MUST provide block type selector dropdown on each block with visual icons and keyboard shortcuts (S, A, C, D, W, T).
- **FR-006**: System MUST support keyboard navigation:
  - Enter: Create new block (auto-determines next type based on context)
  - Tab: Cycle through block types
  - Arrow Up/Down: Navigate between blocks
  - Backspace on empty block: Delete block (minimum 1 block required)
- **FR-007**: System MUST display "Add Block" button with suggested next block types at the bottom of the script.
- **FR-008**: System MUST track and display last edited timestamps for Scripts.
- **FR-009**: System MUST provide autocomplete for character names and locations within blocks with keyboard navigation (arrow keys + Enter).

### Key Entities *(include if feature involves data)*

- **Script**: id (UUID), seriesId, title (required), authors[], genre, logline, coverUrl, content (string, serialized blocks or plain text), lastEditedAt, createdAt, updatedAt; optional scenes/wordCount/pageCount/blockCount for metadata.
- **ScriptBlock (frontend-only)**: id (string), type (scene-heading | action | character | dialogue | parenthetical | transition), content (string), order (implicit by array position).
- **BlockType Config**: label, shortcut key, icon, placeholder text, color (for border), bgColor (for active state), alignment rules, text transformation (uppercase, italic, etc.).
- **Scene (future optional)**: id, heading, content, order, characters[], locations[].

### Constitution Alignment

- Contracts: oRPC procedures in `packages/shared/src/contract/scripts.contract.ts` are defined before handlers/UI.
- Canonical continuity: Script content links to knowledge base appearances; IDs remain series-scoped UUIDs.
- Access and collaboration: Auth required; NOT_FOUND stance for hidden scripts; reserve roles for future collaboration.
- Quality gates: `bun run check-types`, `bun run lint`, and targeted script CRUD/autosave tests (blocked by Mongo memory server download issue).
- Observability and recovery: Structured logging for content saves planned; consider local backup for unsaved edits.

## Block-Based Editor Design *(implementation detail)*

### Block Types and Visual Styling

Each block type has distinct visual characteristics following brutalist design principles with 2px borders and colored accents:

| Block Type | Color | Border | Alignment | Text Style | Icon | Shortcut |
|------------|-------|--------|-----------|------------|------|----------|
| Scene Heading | Blue (`var(--brutalist-blue)`) | 2px solid all sides | Left | Uppercase, bold | Clapperboard | S |
| Action | None (transparent) | 2px solid all sides | Left | Normal | Film | A |
| Character | Amber/Orange (`var(--brutalist-orange)`) | 2px solid all sides | Center | Uppercase, bold | User | C |
| Dialogue | Green (`var(--brutalist-green)`) | 2px solid all sides | Left (indented) | Normal | MessageSquare | D |
| Parenthetical | Pink/Purple (`var(--brutalist-pink)`) | 2px solid all sides | Center | Italic | () | W |
| Transition | Yellow (`var(--brutalist-yellow)`) | 2px solid all sides | Right | Uppercase, bold | ArrowRight | T |

### Block Component Structure

```
┌─────────────────────────────────────────────┐
│ [Type Icon + Label ▼]  │  [Text Content]   │ ← Focused: colored background + shadow
└─────────────────────────────────────────────┘
  ↑ 24-width dropdown      ↑ Flexible textarea
```

- **Left Section**: 96px (w-24) width, dropdown button with icon, label (hidden on small screens), and chevron
- **Right Section**: Flexible textarea with auto-resize, monospace font, type-specific alignment and styling
- **Interaction States**:
  - Default: White/card background, 2px border
  - Hover: `brutalist-shadow-sm` effect
  - Focused: Colored background (matches block type), `brutalist-shadow` effect

### Keyboard Behavior

**Enter Key**:
- Context-aware next block type:
  - Scene Heading → Action
  - Character → Dialogue
  - Dialogue → Character (for next speaker)
  - Parenthetical → Dialogue
  - Default → Action

**Tab Key**: Cycles through all block types in order (Scene → Action → Character → Dialogue → Parenthetical → Transition → Scene...)

**Backspace on Empty Block**: Deletes block and focuses previous block (minimum 1 block enforced)

**Arrow Keys**:
- Up (at start): Move to previous block, cursor at end
- Down (at end): Move to next block, cursor at start

### Add Block Section

At the bottom of the script:
```
┌─────────────────────────────────────────────┐
│  [+  Add Block]                             │ ← Dashed border button
└─────────────────────────────────────────────┘
│  [Scene] [Action] [Character] ...          │ ← Quick-add buttons (optional, future)
```

### Autocomplete Behavior

- Trigger: `@` character or context-based detection (e.g., typing in Character block)
- Display: Dropdown below cursor with keyboard navigation
- Arrow Up/Down: Navigate suggestions
- Enter: Insert selected suggestion
- Escape: Close autocomplete
- Continues typing: Filters suggestions

### Parsing and Serialization

**Parse Plain Text → Blocks**:
1. Split by newlines
2. Detect patterns:
   - `/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i` → Scene Heading
   - `/^(FADE IN:|FADE OUT|CUT TO:|DISSOLVE TO:)$/i` → Transition
   - `/^\(.*\)$/` → Parenthetical
   - Uppercase < 40 chars + not transition keyword → Character
   - After Character/Parenthetical → Dialogue
   - Default → Action

**Serialize Blocks → Plain Text**:
1. Add appropriate spacing for block types (Scene Heading gets extra newlines)
2. Preserve alignment hints via spacing (character names centered conceptually but stored as plain text)
3. Save as single string in `Script.content`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A script can be created, opened in the block-based editor, and saved/reopened within a 2s load time on desktop with all block types and formatting preserved.
- **SC-002**: Block type changes via dropdown or Tab key complete within 100ms with immediate visual feedback.
- **SC-003**: Keyboard navigation (Enter, Backspace, Arrow keys) between blocks executes within 50ms with proper focus management.
- **SC-004**: Autocomplete suggestions appear within 200ms of trigger character with keyboard-navigable list.
- **SC-005**: Scripts with 1000+ blocks maintain 60fps scrolling performance with virtualization.
