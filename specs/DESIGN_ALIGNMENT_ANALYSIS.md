# Design Alignment Analysis: web-mock vs apps/web

**Created**: 2026-01-09  
**Purpose**: Document design inconsistencies between the V0 design mock (`apps/web-mock`) and the current implementation (`apps/web`), and outline tasks to align them.

---

## Executive Summary

The `apps/web-mock` Next.js application contains a comprehensive design vision for Kaeri that includes several features and UI patterns not yet reflected in either the current `apps/web` implementation or the feature specifications. This document identifies:

1. **Design features in the mock that are missing from specs**
2. **UI/UX patterns that differ from current implementation**
3. **New entity types and data structures shown in the mock**
4. **Tasks required to align specs and implementation with the design vision**

---

## Design Components Analysis

### 1. Project Library (`project-library.tsx`)

**Mock Design Features**:
- **Series Type Templates**: TV Series, Film Trilogy, Anthology, Standalone (with icons and descriptions)
- **Grid Card Layout**: Cover image, name, type icon, description, date info, dropdown menu
- **Project Type Selection**: 2x2 grid of project types with visual selection state

**Current State**:
- `apps/web/src/routes/_auth_only/projects.tsx` has basic series cards
- No series type/template concept exists
- Missing project type selection in creation flow

**Spec Gap**: `001-series/spec.md` does not define series types or templates

---

### 2. Script Editor (`script-editor.tsx`)

**Mock Design Features**:
- **Split Layout**: Script editor (left) + Knowledge Base/Canvas/AI Assistant tabs (right)
- **Screenplay Formatting Preview**: Visual styling overlay with colored borders for block types
- **Autocomplete**: Character and location suggestions with `@` trigger
- **Right Panel Tabs**: Knowledge Base, Canvas, AI Assistant
- **Editor Toolbar** (`editor-toolbar.tsx`): File/Edit/Format menus, style selector, formatting buttons, Breakdown/Table Read/Export actions

**Current State**:
- No script editor UI exists yet (per `002-scripts/tasks.md`)
- Backend CRUD handlers implemented

**Spec Alignment**: Spec `002-scripts/spec.md` covers block-based editing but:
- Missing: AI Assistant panel integration
- Missing: Table Read feature
- Missing: Script Breakdown feature
- Missing: Full toolbar with File/Edit/Format menus

---

### 3. Knowledge Base (`knowledge-base.tsx`)

**Mock Design Features**:
- **Unified "All" View**: Grid showing Characters, Scenes, Themes, Story Arcs, Locations together
- **Three View Modes**: Grid, Graph (network), Timeline
- **Import/Export Buttons**: In header toolbar
- **Entity Types**:
  - Characters ✓ (exists in spec)
  - Locations ✓ (exists in spec)
  - Props ✓ (exists in spec)
  - **Scenes** ⚠️ (in mock, not a separate KB entity in current spec)
  - **Themes** ⚠️ (new entity type, not in spec)
  - **Story Arcs** ⚠️ (new entity type, not in spec)
  - **Episodes** ⚠️ (in mock, episode management concept not in spec)
  - **Research** ⚠️ (in mock, not in spec)

**Current State**:
- KB UI exists with tabs for Characters, Locations, Props, Timeline, Wildcards
- No Graph or Timeline views
- No Scenes, Themes, Story Arcs, Episodes, Research tabs

**Spec Gap**: `003-knowledge-base/spec.md` does not include:
- Themes entity
- Story Arcs entity  
- Scenes as KB entity (separate from script scenes)
- Episodes entity
- Research entity
- Graph/Timeline view modes

---

### 4. Character Detail (`character-detail.tsx`)

**Mock Design Features**:
- **Script Variations Section**: Character versions per script (version label, age, notes, appearance)
- **Mentions Section**: Scene references grouped by script
- **Relationship Linking**: Hover popover previews for linked characters
- **Visual Avatar**: Large avatar with initials

**Current State**:
- `apps/web/src/features/knowledge-base/components/character-detail.tsx` exists
- Has Overview, Script Variations, Appearances tabs
- Has hover preview component

**Alignment**: Reasonably aligned, but mock has richer variation fields (age, appearance description)

---

### 5. Location Detail (`location-detail.tsx`)

**Mock Design Features**:
- **Reference Images Gallery**: Multiple images with captions
- **Associated Characters**: List with first appearance info
- **Props Used**: Badge list of props
- **Production Notes**: Text area
- **Scenes at Location**: Grouped by script

**Current State**:
- Basic location detail likely exists but not reviewed

**Spec Gap**: Location entity in spec doesn't include:
- Reference images array
- Associated characters relation
- Props relation
- Production notes field

---

### 6. Scene Detail (`scene-detail.tsx`)

**Mock Design Features**:
- **Scene Card**: Number, heading, script name
- **Metadata Cards**: Location, Time/Duration, Emotional Tone
- **Conflict Description**: Text block
- **Beats List**: Ordered list of scene beats with descriptions
- **Props List**: Badge list
- **Lighting/Sound**: Technical notes
- **Previous/Next Scene Navigation**: Links
- **Story Notes**: Text area
- **Storyboard Image**: Optional reference

**Spec Gap**: Scenes are not a standalone KB entity in current spec. The mock treats scenes as first-class entities with rich metadata.

---

### 7. Theme Detail (`theme-detail.tsx`)

**Mock Design Features**:
- **Theme Description**: Long-form text
- **Related Characters**: With connection description
- **Visual Motifs**: Badge list
- **Thematic Evolution**: Per-episode interpretation
- **Appearances in Scripts**: Key scenes with quotes

**Spec Gap**: Themes entity does not exist in current spec.

---

### 8. Story Arc Detail (`story-arc-detail.tsx`)

**Mock Design Features**:
- **Arc Description**: Long-form text
- **Progress Bar**: Visual progress indicator
- **Start/Current/End Points**: Three-column summary
- **Key Milestones**: Per-episode events with completion status
- **Related Characters**: With role descriptions
- **Thematic Connections**: Badge links to themes
- **Emotional Journey**: Per-act emotional states with colors

**Spec Gap**: Story Arcs entity does not exist in current spec.

---

### 9. Export Modal (`export-modal.tsx`)

**Mock Design Features**:
- **Export Formats**:
  - Hollywood Standard PDF
  - Final Draft (.fdx)
  - Production Script
  - Call Sheet
- **Options**:
  - Include scene numbers
  - Include revision marks

**Current State**:
- Export spec exists (`005-export/spec.md`)
- PDF and JSON export defined

**Spec Gap**: Missing:
- Final Draft (.fdx) format
- Production Script format
- Call Sheet format
- Scene numbers option
- Revision marks option

---

### 10. Breakdown Modal (`breakdown-modal.tsx`)

**Mock Design Features**:
- **Shooting Schedule Tab**: Scene list with location, characters, day grouping
- **Locations Tab**: Location list with scene counts
- **Character Schedule Tab**: Character list with scene appearances
- **Props Tab**: Prop list with scene occurrences

**Spec Gap**: Script Breakdown feature is not defined in any spec. This is a production-focused feature for pre-production planning.

---

### 11. Table Read Modal (`table-read-modal.tsx`)

**Mock Design Features**:
- **Character Assignments**: Assign readers to characters
- **Reading Mode**: Highlight current line during read-through
- **Script Parsing**: Character detection and line attribution

**Spec Gap**: Table Read feature is not defined in any spec.

---

### 12. Series Header (`series-header.tsx`)

**Mock Design Features**:
- **Breadcrumb Navigation**: All Projects → Scripts → Knowledge Base
- **Collaborator Avatars**: Show active users
- **Settings Dropdown**: Manage Users, Series Settings, Export Series

**Current State**:
- Series header exists but may differ in layout/features

---

### 13. Series Tabs (`series-tabs.tsx`)

**Mock Design Features**:
- **Tab Navigation**: Scripts, Knowledge Base, Analytics
- **Analytics Tab**: New feature

**Spec Gap**: Series Analytics is not in current specs

---

### 14. Series Analytics (`series-analytics.tsx`)

**Mock Design Features**:
- **Overview Cards**: Scripts count, Characters count, Locations count, Word count
- **Scene Distribution Chart**: Locations breakdown
- **Character Appearances Chart**: Bar chart
- **Story Arc Progress**: Progress bars
- **Writing Activity**: Calendar heatmap
- **Word Count Trend**: Line chart over time

**Spec Gap**: Analytics/dashboard feature is not defined in any spec.

---

## New Entity Types Required

Based on the mock analysis, the following new entity types should be added to specs:

| Entity | Spec Location | Description |
|--------|---------------|-------------|
| Theme | `003-knowledge-base/spec.md` | Thematic elements with descriptions, related characters, visual motifs, and script occurrences |
| Story Arc | `003-knowledge-base/spec.md` | Character transformation arcs with milestones, progress tracking, and emotional journey |
| Scene | `003-knowledge-base/spec.md` | Scene-level metadata including beats, tone, conflict, props, lighting/sound notes |
| Episode | `001-series/spec.md` or `002-scripts/spec.md` | Episode container for TV series type, grouping scripts |
| Research | `003-knowledge-base/spec.md` | Research notes and references for period/technical accuracy |

---

## New Features Required

| Feature | Spec Location | Description |
|---------|---------------|-------------|
| Table Read | `002-scripts/spec.md` | Assign readers to characters, read-through mode with line highlighting |
| Script Breakdown | `002-scripts/spec.md` or new spec | Production breakdown by schedule, locations, characters, props |
| Series Analytics | `001-series/spec.md` or new spec | Dashboard with statistics, charts, writing activity |
| KB Graph View | `003-knowledge-base/spec.md` | Network graph visualization of entity relationships |
| KB Timeline View | `003-knowledge-base/spec.md` | Timeline visualization of story events |
| AI Assistant | New spec or `002-scripts/spec.md` | AI writing assistant panel in script editor |
| Final Draft Export | `005-export/spec.md` | Export to .fdx format |
| Production Script Export | `005-export/spec.md` | Export with scene numbers and production marks |
| Call Sheet Export | `005-export/spec.md` | Production call sheet generation |

---

## UI/UX Patterns to Adopt

1. **Colored Left Borders**: Mock uses 4px colored left borders for list items (blue for characters, green for locations, etc.)
2. **Avatar Initials**: Large circular avatars with character initials
3. **ChevronRight Indicators**: Hover-reveal navigation arrows on clickable items
4. **Progress Bars**: Inline progress indicators for story arcs
5. **Badge Collections**: Tags and categories as badge groups
6. **Split Panel Layout**: Consistent left/right split in editors
7. **Unified Search**: Cross-entity search in KB header
8. **View Mode Toggles**: Grid/Graph/Timeline toggle buttons
9. **Import/Export Actions**: Consistent placement in headers

---

## Entity Field Enhancements

### Character
Current fields: `name, description, traits[], avatarUrl, relationships[], appearances[], variations[]`

Add from mock:
- `variations[].age` - Character age in this variation
- `variations[].appearance` - Physical appearance description

### Location
Current fields: `name, description, tags[], imageUrl, appearances[]`

Add from mock:
- `images[]` - Multiple reference images with captions
- `associatedCharacters[]` - Characters linked to this location
- `props[]` - Props used at this location
- `productionNotes` - Production-specific notes
- `mood` - Emotional mood descriptor
- `timeOfDay[]` - Day/Night/etc. classifications

### Scene (new entity)
Fields from mock:
- `number` - Scene number
- `heading` - Scene heading (INT./EXT., Location, Time)
- `scriptId` - Parent script reference
- `location` - Location reference
- `characters[]` - Characters in scene
- `emotionalTone` - Tone descriptor
- `conflict` - Central conflict description
- `duration` - Page/time estimate
- `beats[]` - Ordered list of scene beats
- `props[]` - Props needed
- `lighting` - Lighting notes
- `sound` - Sound design notes
- `previousScene` - Navigation link
- `nextScene` - Navigation link
- `notes` - General notes
- `storyboardUrl` - Reference image

### Theme (new entity)
Fields from mock:
- `name` - Theme name
- `description` - Long-form description
- `color` - Associated color
- `occurrences` - Count across series
- `relatedScripts[]` - Scripts with key scenes and quotes
- `relatedCharacters[]` - Characters with connection descriptions
- `visualMotifs[]` - Visual/symbolic motifs
- `evolution[]` - Per-episode interpretation changes

### Story Arc (new entity)
Fields from mock:
- `character` - Character reference
- `arcName` - Arc label (e.g., "Victim → Hero")
- `description` - Long-form description
- `progress` - Percentage complete
- `startPoint` - Starting character state
- `currentState` - Current character state
- `endGoal` - Destination state
- `keyMilestones[]` - Episode events with completion status
- `relatedCharacters[]` - Characters with roles
- `thematicConnections[]` - Theme references
- `emotionalJourney[]` - Per-act emotional states

---

## Series Type System

The mock introduces a series type system not present in current specs:

| Type | Description | Icon |
|------|-------------|------|
| `tv-series` | Episodic television with multiple seasons | Tv |
| `film-trilogy` | Three-part film series | Film |
| `anthology` | Standalone stories in shared universe | Library |
| `standalone` | Single film or pilot script | FileText |

This affects:
- Series creation flow (template selection)
- Series metadata display (type icon and label)
- Potentially episode/season organization

