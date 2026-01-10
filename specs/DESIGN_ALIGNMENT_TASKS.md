# Design Alignment Task Breakdown

**Created**: 2026-01-09  
**Purpose**: Task breakdown for aligning specs and implementation with V0 design mock (`apps/web-mock`)  
**Reference**: See `DESIGN_ALIGNMENT_ANALYSIS.md` for full design comparison

---

## Overview

This document provides actionable tasks organized by spec to align the Kaeri platform with the V0 design vision. Tasks are grouped by priority:

- **P1**: Core features that should be included in current spec scope
- **P2**: Enhanced features that extend current spec scope
- **P3**: New features requiring new specs or major spec revisions

---

## 001-series: Series Management

### Spec Updates Required

#### P1: Series Type System
**Task ID**: `DESIGN-001`

The mock introduces a series type/template system. Update `001-series/spec.md` to include:

- [ ] Add `type` field to Series entity: `tv-series | film-trilogy | anthology | standalone`
- [ ] Add FR for series type selection during creation with template cards
- [ ] Update Series entity schema in spec

**Affected Files**:
- `specs/001-series/spec.md` - Add type field and template selection requirements
- `packages/shared/src/contract/series.contract.ts` - Add type to schema
- `apps/server/src/db/models/series.model.ts` - Add type field

---

#### P2: Series Analytics Dashboard
**Task ID**: `DESIGN-002`

The mock includes a `series-analytics.tsx` component with:

- Overview stats (scripts, characters, locations, word count)
- Scene distribution chart
- Character appearances chart
- Story arc progress
- Writing activity heatmap
- Word count trend

- [ ] Add new section to `001-series/spec.md` for Analytics feature
- [ ] Define User Story: "Writer views series analytics dashboard"
- [ ] Add FR for analytics data aggregation endpoints
- [ ] Add SC for analytics load time and accuracy

---

#### P1: Episodes Entity
**Task ID**: `DESIGN-003`

For `tv-series` type, the mock shows episode management:

- [ ] Add Episode entity to spec (or as sub-entity of Series)
- [ ] Episode fields: `number`, `title`, `scenes[]`, `status` (Outline/In Progress/Complete)
- [ ] Add FR for episode CRUD within TV series

---

## 002-scripts: Script Authoring

### Spec Updates Required

#### P1: Script Breakdown Feature
**Task ID**: `DESIGN-010`

Add `breakdown-modal.tsx` feature to spec:

- [ ] Add User Story: "Writer generates script breakdown for production planning"
- [ ] Add FR: System MUST generate breakdown reports for:
  - Shooting schedule (scene list with location, characters, day grouping)
  - Locations (location list with scene counts)
  - Character schedule (character list with scene appearances)
  - Props (prop list with scene occurrences)
- [ ] Add acceptance scenarios for breakdown generation

---

#### P2: Table Read Feature
**Task ID**: `DESIGN-011`

Add `table-read-modal.tsx` feature to spec:

- [ ] Add User Story: "Writer conducts table read with character assignments"
- [ ] Add FR: System MUST support table read mode with:
  - Character-to-reader assignment
  - Read-through mode with line highlighting
  - Character line detection and attribution
- [ ] Add acceptance scenarios for table read flow

---

#### P1: Editor Toolbar Enhancements
**Task ID**: `DESIGN-012`

Update spec to include full editor toolbar from mock:

- [ ] Add FR for File menu (New, Open, Save, Save As, Export)
- [ ] Add FR for Edit menu (Undo, Redo, Cut, Copy, Paste, Find, Replace)
- [ ] Add FR for Format menu (Paragraph styles, indent controls)
- [ ] Add FR for toolbar actions: Breakdown, Table Read, Edit Details

---

#### P3: AI Assistant Panel
**Task ID**: `DESIGN-013`

The mock includes an AI Assistant tab in the script editor:

- [ ] Consider creating new spec `007-ai-assistant/spec.md`
- [ ] Define User Story: "Writer receives AI suggestions while writing"
- [ ] Define FR for AI chat interface and context awareness
- [ ] Defer to future phase (post-MVP)

---

## 003-knowledge-base: Knowledge Base

### Spec Updates Required

#### P1: Themes Entity
**Task ID**: `DESIGN-020`

Add Theme entity based on `theme-detail.tsx`:

- [ ] Add Theme entity to spec with fields:
  - `name`, `description`, `color`, `occurrences`
  - `relatedScripts[]` with key scenes and quotes
  - `relatedCharacters[]` with connection descriptions
  - `visualMotifs[]`
  - `evolution[]` per-episode interpretation
- [ ] Add FR for Theme CRUD
- [ ] Add FR for Theme-Script linking
- [ ] Add FR for Theme-Character linking

---

#### P1: Story Arcs Entity
**Task ID**: `DESIGN-021`

Add Story Arc entity based on `story-arc-detail.tsx`:

- [ ] Add Story Arc entity to spec with fields:
  - `character` reference
  - `arcName` label
  - `description`
  - `progress` percentage
  - `startPoint`, `currentState`, `endGoal`
  - `keyMilestones[]` with episode, event, impact, complete status
  - `relatedCharacters[]` with role descriptions
  - `thematicConnections[]` theme references
  - `emotionalJourney[]` per-act states
- [ ] Add FR for Story Arc CRUD
- [ ] Add FR for Arc-Character linking
- [ ] Add FR for Arc-Theme linking
- [ ] Add FR for Arc progress tracking

---

#### P1: Scenes as KB Entity
**Task ID**: `DESIGN-022`

Add Scene as a first-class KB entity based on `scene-detail.tsx`:

- [ ] Add Scene entity to spec with fields:
  - `number`, `heading`, `scriptId`
  - `location` reference
  - `characters[]` references
  - `emotionalTone`, `conflict`, `duration`
  - `beats[]` ordered descriptions
  - `props[]` references
  - `lighting`, `sound` notes
  - `previousScene`, `nextScene` navigation
  - `notes`, `storyboardUrl`
- [ ] Add FR for Scene CRUD (separate from script content)
- [ ] Add FR for Scene-Location linking
- [ ] Add FR for Scene-Character linking
- [ ] Add FR for Scene navigation

---

#### P2: Research Entity
**Task ID**: `DESIGN-023`

Add Research entity for reference materials:

- [ ] Add Research entity with fields:
  - `title`, `notes`, `url`, `type`
- [ ] Add FR for Research CRUD
- [ ] Defer to future phase if not core to MVP

---

#### P1: KB View Modes
**Task ID**: `DESIGN-024`

Add Graph and Timeline view modes:

- [ ] Add FR: System MUST support three KB view modes:
  - Grid view (current implementation)
  - Graph view (network visualization of relationships)
  - Timeline view (chronological entity placement)
- [ ] Add SC for Graph view with 100+ nodes loading under 1s
- [ ] Link to `006-continuity` spec for graph visualization

---

#### P1: Enhanced Location Fields
**Task ID**: `DESIGN-025`

Update Location entity based on `location-detail.tsx`:

- [ ] Add fields to Location entity:
  - `images[]` with url and caption
  - `associatedCharacters[]` references
  - `props[]` references
  - `productionNotes`
  - `mood`
  - `timeOfDay[]`
- [ ] Update FR for Location detail view

---

#### P1: Enhanced Character Variation Fields
**Task ID**: `DESIGN-026`

Update Character variations based on `character-detail.tsx`:

- [ ] Add fields to Character variations:
  - `age` - Character age in this variation
  - `appearance` - Physical appearance description
- [ ] Update FR for Character variation management

---

## 004-canvas: Canvas

### Spec Updates Required

#### P1: Canvas in Script Editor
**Task ID**: `DESIGN-030`

The mock shows Canvas as a tab in the script editor side panel:

- [ ] Add FR: Canvas MUST be accessible as a tab alongside Knowledge Base in script editor
- [ ] Ensure canvas-script integration in spec

---

## 005-export: Export

### Spec Updates Required

#### P1: Additional Export Formats
**Task ID**: `DESIGN-040`

Update export spec based on `export-modal.tsx`:

- [ ] Add FR for Final Draft (.fdx) export format
- [ ] Add FR for Production Script format (with scene numbers and marks)
- [ ] Add FR for Call Sheet export (character/location breakdowns)

---

#### P1: Export Options
**Task ID**: `DESIGN-041`

- [ ] Add FR for export options:
  - Include scene numbers (boolean)
  - Include revision marks (boolean)
  - Page size selection
  - Font size selection

---

## 006-continuity: Continuity and Audit

### Spec Updates Required

#### P1: Graph View Integration
**Task ID**: `DESIGN-050`

Align continuity graph with KB graph view mode:

- [ ] Add FR for KB graph view powered by continuity graph data
- [ ] Ensure graph supports all KB entity types (Characters, Locations, Props, Themes, Story Arcs, Scenes)

---

## UI/UX Implementation Tasks

### P1: Adopt Mock Visual Patterns
**Task ID**: `DESIGN-100`

Update existing components to match mock styling:

- [ ] Adopt 4px colored left borders for entity type distinction
- [ ] Add ChevronRight hover indicators to clickable list items
- [ ] Implement large circular avatars with initials
- [ ] Add progress bar components for story arcs
- [ ] Use badge collections for tags/categories

---

### P1: Header and Navigation Updates
**Task ID**: `DESIGN-101`

Update series header based on `series-header.tsx`:

- [ ] Add collaborator avatars display
- [ ] Add settings dropdown with Manage Users, Series Settings, Export Series
- [ ] Update breadcrumb navigation pattern

---

### P1: KB Header Updates
**Task ID**: `DESIGN-102`

Update KB header based on `knowledge-base.tsx`:

- [ ] Add unified cross-entity search
- [ ] Add view mode toggle buttons (Grid/Graph/Timeline)
- [ ] Add Import/Export buttons

---

## New Spec Considerations

### P3: 007-ai-assistant (Deferred)
**Task ID**: `DESIGN-200`

Consider creating new spec for AI writing assistant:
- AI chat panel in script editor
- Context-aware suggestions
- Character/plot consistency checks

---

### P3: 008-table-read (Could be part of scripts)
**Task ID**: `DESIGN-201`

Could be integrated into `002-scripts` or standalone:
- Character assignment management
- Read-through session mode
- Line-by-line progression

---

### P3: 009-analytics (Could be part of series)
**Task ID**: `DESIGN-202`

Could be integrated into `001-series` or standalone:
- Writing statistics dashboard
- Progress tracking
- Chart visualizations

---

## Summary: Tasks Per Spec

| Spec | P1 Tasks | P2 Tasks | P3 Tasks |
|------|----------|----------|----------|
| 001-series | 3 | 1 | 0 |
| 002-scripts | 3 | 1 | 1 |
| 003-knowledge-base | 7 | 1 | 0 |
| 004-canvas | 1 | 0 | 0 |
| 005-export | 2 | 0 | 0 |
| 006-continuity | 1 | 0 | 0 |
| UI/UX | 3 | 0 | 0 |
| New Specs | 0 | 0 | 3 |
| **Total** | **20** | **3** | **4** |

---

## Implementation Order Recommendation

1. **Phase 1: Entity Expansion** (P1)
   - DESIGN-020: Themes Entity
   - DESIGN-021: Story Arcs Entity
   - DESIGN-022: Scenes as KB Entity
   - DESIGN-025: Enhanced Location Fields
   - DESIGN-026: Enhanced Character Variation Fields
   - DESIGN-001: Series Type System

2. **Phase 2: Feature Additions** (P1)
   - DESIGN-010: Script Breakdown
   - DESIGN-012: Editor Toolbar
   - DESIGN-024: KB View Modes
   - DESIGN-040: Additional Export Formats
   - DESIGN-041: Export Options

3. **Phase 3: UI Alignment** (P1)
   - DESIGN-100: Visual Patterns
   - DESIGN-101: Header Updates
   - DESIGN-102: KB Header Updates

4. **Phase 4: Extended Features** (P2/P3)
   - DESIGN-002: Series Analytics
   - DESIGN-011: Table Read
   - DESIGN-013: AI Assistant

