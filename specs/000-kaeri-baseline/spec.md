# Feature Specification: Kaeri Baseline (Single-User) Platform

**Feature Branch**: `[000-kaeri-baseline-platform]`  
**Created**: 2026-01-01  
**Status**: Draft  
**Input**: User description provided (single-user first, multi-user later; PC-only focus)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create & Manage Series (Priority: P1)
A writer creates a series, configures metadata (title, genre, logline), and manages scripts inside it.

**Why this priority**: Core container for all downstream work.

**Independent Test**: User can create a series, add at least one script, and reopen it with persisted data.

**Acceptance Scenarios**:
1. Given no series, when the writer creates one with required fields, then the series is saved and visible in library.
2. Given an existing series, when the writer edits metadata, then updates persist and show last-edited timestamp.

---

### User Story 2 - Write Script with Split Editor (Priority: P1)
A writer opens a script and writes in the split editor while viewing the knowledge base side panel.

**Why this priority**: Delivers primary authoring experience.

**Independent Test**: User can type, save, and reopen a script; knowledge base panel loads side-by-side on desktop.

**Acceptance Scenarios**:
1. Given a script, when opened, then a split layout shows text editor (left) and knowledge base tabs (right).
2. Given text changes, when user saves or autosave triggers, then content persists and reloads accurately.

---

### User Story 3 - Manage Knowledge Base Entities (Priority: P1)
A writer creates and edits Characters, Locations, Props, Timeline items, and Wild Cards from the knowledge base.

**Why this priority**: Supplies canon and continuity data for scripts.

**Independent Test**: Each entity type can be created, edited, and searched; relationships render correctly in detail view.

**Acceptance Scenarios**:
1. Given the knowledge base, when a new character is added with traits and relationships, then it appears in search and detail view.
2. Given multiple entities, when the writer searches, then results include all matching entities across types.

---

### User Story 4 - Character Detail & Appearances (Priority: P2)
A writer views character overview, script variations, and appearances linked to scenes/sections.

**Why this priority**: Continuity and cross-script tracking.

**Independent Test**: Character detail tabs render; appearances table lists scene references; hover previews work.

**Acceptance Scenarios**:
1. Given a character with relationships, when viewing Overview, then linked characters show hover previews.
2. Given appearances tagged in a script, when opening Appearances, then scene references list with locations.

---

### User Story 5 - Canvas for Story Structuring (Priority: P3)
A writer uses the canvas to place notes/shapes and link ideas while drafting.

**Why this priority**: Supports brainstorming and structuring.

**Independent Test**: User can add shapes/text, pan, and persist the canvas per series.

**Acceptance Scenarios**:
1. Given a series, when the user opens Canvas, then tools for text/shapes/lines are available and state persists.
2. Given placed nodes, when reconnecting later, then nodes and connections reload.

---

### User Story 6 - Export Draft (Priority: P3)
A writer exports a script to PDF with screenplay-friendly formatting (basic).

**Why this priority**: Enables external sharing.

**Independent Test**: Export produces a PDF with monospace layout, line numbers optional, and preserved content.

**Acceptance Scenarios**:
1. Given a saved script, when export is triggered, then a PDF downloads with scene headings and dialogue indentation preserved.
2. Given invalid/unsaved script, when export is triggered, then user is prompted to save first.

---

### Edge Cases
- What happens when a user deletes an entity referenced by relationships/appearances? → Prevent deletion or require reassignment; otherwise mark as “orphaned” with clear UI and NOT_FOUND server stance.
- How does system handle very large scripts (>500 scenes) or knowledge base (>500 entities)? → Pagination/virtualization and indexed search.
- Offline/unsynced changes? → Out of scope for baseline; fail gracefully with clear status.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow creating, editing, and deleting a Series with metadata (title, genre, logline, cover image, last-edited timestamp).
- **FR-002**: System MUST provide a Script library view (grid) within a Series showing name, authors, genre, logline, last updated, and optional cover.
- **FR-003**: System MUST provide a split-screen Script Editor with monospace text entry (Courier New), autosave/manual save, and a right-side panel with tabs: Knowledge Base, Canvas.
- **FR-004**: System MUST support creating/editing Characters, Locations, Props, Timeline entries, and Wild Cards with search across all entities.
- **FR-005**: System MUST support Character Detail tabs: Overview (traits/relationships), Script Variations, and Appearances (scene references).
- **FR-006**: System MUST allow Canvas nodes (text/shapes/lines) with pan mode, persisted per Series.
- **FR-007**: System MUST export a script to PDF with screenplay-friendly formatting (scene heading detection, dialogue indentation; basic, not industry-perfect).
- **FR-008**: System MUST track and display last edited timestamps for Series and Scripts.
- **FR-009**: System MUST enforce access control even in single-user mode (auth required; hide non-accessible resources with NOT_FOUND).
- **FR-010**: System MUST maintain canonical IDs for entities to avoid duplicates across imports/exports (future multi-user ready).
- **FR-011**: System MUST log continuity-affecting changes (entity edits, relationships, appearances) for audit/debug.

### Key Entities *(include if feature involves data)*

- **Series**: Container for scripts, knowledge base, canvas, settings. Attributes: id, title, genre, logline, cover, lastEditedAt.
- **Script**: Belongs to Series. Attributes: id, seriesId, title, authors, genre, logline, cover, content (structured/plain), lastEditedAt.
- **Character**: Attributes: id, seriesId, name, description, traits, relationships (character-character), variations, appearances (scene refs), cover/avatar.
- **Location**: Attributes: id, seriesId, name, description, tags, appearances.
- **Prop**: Attributes: id, seriesId, name, description, associations.
- **Timeline Entry**: Attributes: id, seriesId, label, timestamp/order, linked scenes/entities.
- **Wild Card**: Flexible note/entity with type/tag.
- **Canvas Node/Edge**: Per-series persisted nodes (text/shape) and connections.

### Constitution Alignment

- Contracts: Define Series (create/update/list/delete, settings), Script (crud, content save, export), Knowledge Base (characters/locations/props/timeline/wild cards CRUD + search), Character detail/relationships/appearances, Canvas (nodes/edges CRUD), and Export (PDF) procedures in `packages/shared` with zod schemas and enums, exported via `CONTRACT`.
- Canonical continuity: Series-scoped canonical IDs for all entities; relationships/appearances enforce referential integrity; prevent or reassign deletes that would orphan references; timeline ordering preserved on writes.
- Access & collaboration: Auth required even single-user; hide non-accessible resources via NOT_FOUND; prepare roles (writer/editor/viewer) for future multi-user while defaulting to single-user allowances; log change authorship.
- Quality gates: Commands `bun run check-types`, `bun run lint`, targeted API/UI tests for contract parity, continuity (relationships/appearances), canvas persistence, export validity; deterministic fixtures for scripts and KB entities.
- Observability/recovery: Structured logging around contract calls; audit log for canon mutations; backups/exports (JSON + PDF) as interim recovery; migrations for canon data must be reversible.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new Series with at least one Script can be created, reopened, and edited within 2s load time on desktop.
- **SC-002**: Knowledge base search returns relevant entities across all types with <300ms backend response on a dataset of 500 entities.
- **SC-003**: Character detail Appearances tab correctly lists 95%+ tagged scenes in a 120-page script test corpus.
- **SC-004**: Script export completes within 5s for a 120-page script and produces a valid PDF download.
- **SC-005**: All contract endpoints pass automated tests and type checks (`bun run check-types`, `bun run lint`, targeted test suite) in CI.
