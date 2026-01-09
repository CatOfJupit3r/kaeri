# Tasks: Script Authoring

Status snapshot: backend CRUD/autosave handlers and services exist (`apps/server/src/routers/scripts.router.ts`, `apps/server/src/features/scripts/scripts.service.ts`). No script UI or hooks are present.

## To complete the spec

### Core Editor (P1)
- [ ] **T020** Add script list/grid under series route (`apps/web/src/routes/_auth_only/series/$seriesId/scripts.tsx`).
- [ ] **T021** Build split editor layout with block-based editor (left) and KB/Canvas/AI Assistant panel (right) (`apps/web/src/features/scripts/components/split-editor-layout.tsx`).
- [ ] **T022** Implement block-based text editor with 6 block types, dropdowns, and keyboard navigation (`apps/web/src/features/scripts/components/script-block-editor.tsx`).
- [ ] **T023** Add block parsing/serialization utilities (`apps/web/src/features/scripts/utils/block-parser.ts`).
- [ ] **T024** Implement autocomplete for characters/locations within blocks (`apps/web/src/features/scripts/components/block-autocomplete.tsx`).
- [ ] **T025** Add autosave + manual save hooks with block serialization (`apps/web/src/features/scripts/hooks/use-save-script.ts`).
- [ ] **T026** Implement "Add Block" section with suggestions (`apps/web/src/features/scripts/components/add-block-section.tsx`).

### Editor Toolbar (P1)
- [ ] **T027** Implement editor toolbar component matching V0 design (`apps/web/src/features/scripts/components/editor-toolbar.tsx`).
  - File menu: New, Open, Save, Save As, Export
  - Edit menu: Undo, Redo, Cut, Copy, Paste, Find, Replace
  - Format menu: Paragraph styles, indent controls
  - Style selector dropdown
  - Text formatting buttons: Bold, Italic, Underline
  - Alignment buttons: Left, Center, Right
  - List buttons: Bullet, Numbered
  - Right-side actions: Breakdown, Table Read, Edit Details, Save
  - Auto-saved status indicator

### Script Breakdown (P1)
- [ ] **T028** Implement script breakdown feature (`apps/web/src/features/scripts/components/breakdown-modal.tsx`).
  - Breakdown button in editor toolbar
  - Shooting Schedule tab: scene list with location, characters, day grouping
  - Locations tab: location list with scene counts
  - Character Schedule tab: character list with scene appearances
  - Props tab: prop list with scene occurrences
  - Add breakdown data generation utility (`apps/web/src/features/scripts/utils/breakdown-generator.ts`)

### Right Panel Tabs (P1)
- [ ] **T029** Add AI Assistant tab placeholder to right panel.
  - Knowledge Base tab (existing in spec)
  - Canvas tab (existing in spec)
  - AI Assistant tab (placeholder UI with messages layout, defer chat functionality to post-MVP)

### Table Read Feature (P2 - deferred)
- [ ] **T030** Implement table read modal (`apps/web/src/features/scripts/components/table-read-modal.tsx`).
  - Character-to-reader assignment panel
  - Script content display with character/dialogue parsing
  - Reading mode with current line highlighting
  - Play/Pause controls

### Testing
- [ ] **T045-Scripts** Targeted tests for script CRUD/autosave and block parsing once test infra is unblocked.

## Completed
- [x] **T018** Implement script CRUD + saveContent handlers (`apps/server/src/routers/scripts.router.ts`).
- [x] **T019** Implement script service with autosave + lastEditedAt updates (`apps/server/src/features/scripts/scripts.service.ts`).
