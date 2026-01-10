# Spec 001a: Narrative Entities (Scenes, Themes, Story Arcs)

**Status**: Planning  
**Priority**: P1  
**Dependencies**: 001-series, 003-knowledge-base  
**Related Specs**: 002-scripts (scene references), 006-continuity (graph visualization)

---

## Overview

This spec defines three narrative entity types that extend the knowledge base with story structure elements:

1. **Scenes**: First-class KB entities with metadata (location, time, emotional tone, beats, props, technical notes)
2. **Themes**: Thematic elements with visual motifs, character connections, and evolution tracking
3. **Story Arcs**: Multi-episode/script narrative arcs with character journeys and plot threads

These entities are separate from the existing Character/Location/Props entities and provide richer narrative analysis capabilities. They are accessible through the Knowledge Base interface and participate in the continuity graph.

**Note**: Episodes as a separate entity have been removed. Episode-level tracking is handled through script metadata and timeline views.

---

## Requirements

### Functional Requirements

#### FR-001: Scene Entity Management
- Users can create, read, update, and delete Scene entities within a series
- Each Scene belongs to a specific script and has a unique scene number per script
- Scenes have rich metadata: location reference, time/duration, emotional tone, conflict description
- Scenes support ordered beat lists (scene beats with descriptions)
- Scenes can reference props and characters from the KB
- Scenes include technical production notes (lighting, sound, camera)
- Scenes support optional storyboard images
- Previous/next scene navigation within script context
- Scenes appear in KB "All" view and have dedicated detail pages

#### FR-002: Theme Entity Management
- Users can create, read, update, and delete Theme entities within a series
- Themes have names, descriptions, and color indicators
- Themes support visual motif lists (text badges)
- Themes track related characters with connection descriptions
- Themes show thematic evolution notes per script/episode
- Themes list key script appearances with scene references and quotes
- Themes appear in KB "All" view and have dedicated detail pages

#### FR-003: Story Arc Entity Management
- Users can create, read, update, and delete Story Arc entities within a series
- Story arcs span multiple scripts/episodes with start and end points
- Story arcs track status (Planned, In Progress, Completed, Abandoned)
- Story arcs include description, key beats, and resolution
- Story arcs link to characters involved with role descriptions
- Story arcs reference related themes
- Story arcs show timeline progression across scripts
- Story arcs appear in KB "All" view and have dedicated detail pages

#### FR-004: Research Entity Management
- Users can create, read, update, and delete Research entities within a series
- Research entries have titles, content (markdown), tags, and source URLs
- Research can be linked to any KB entity (characters, locations, themes, etc.)
- Research appears in KB sidebar or dedicated tab
- Research supports search and filtering by tags

#### FR-005: Entity Relationships
- Scenes reference Locations (many-to-one)
- Scenes reference Characters (many-to-many appearances)
- Scenes reference Props (many-to-many)
- Themes reference Characters (many-to-many with connection descriptions)
- Story Arcs reference Characters (many-to-many with roles)
- Story Arcs reference Themes (many-to-many)
- Research links to any KB entity type

#### FR-006: KB Integration
- All four entity types appear in Knowledge Base "All" view
- Entity type filter includes Scenes, Themes, Story Arcs, Research
- Search works across all entity types
- Grid view shows entity cards with type-specific icons and colors
- Detail views match design patterns (colored borders, avatars/icons)

---

### Non-Functional Requirements

#### NFR-001: Performance
- Scene list loads under 500ms for 100+ scenes
- Theme/Story Arc queries cached for repeat access
- Research search performs full-text search under 200ms

#### NFR-002: Data Integrity
- Scene numbers enforce uniqueness per script
- Deleting a location warns if scenes reference it
- Deleting a character warns if story arcs involve them
- Soft delete for story arcs to preserve narrative history

#### NFR-003: Usability
- Scene creation wizard suggests location and characters from script context
- Theme color picker provides preset palette
- Story arc timeline visualizes progression
- Research autosave prevents data loss

---

## Data Models

### Scene Entity
```typescript
interface Scene {
  id: string;
  seriesId: string;
  scriptId: string;
  sceneNumber: number; // unique per script
  heading: string; // "INT. COFFEE SHOP - DAY"
  locationId?: string; // reference to Location entity
  timeOfDay?: "dawn" | "day" | "dusk" | "night" | "continuous";
  duration?: string; // "5 minutes"
  emotionalTone?: string; // "tense", "romantic", "comedic"
  conflict?: string; // long-form text
  beats: SceneBeat[]; // ordered list
  characterIds: string[]; // references to Character entities
  propIds: string[]; // references to Prop entities
  lighting?: string; // technical notes
  sound?: string; // technical notes
  camera?: string; // technical notes
  storyNotes?: string;
  storyboardUrl?: string; // optional image
  createdAt: Date;
  updatedAt: Date;
}

interface SceneBeat {
  id: string;
  order: number;
  description: string;
}
```

### Theme Entity
```typescript
interface Theme {
  id: string;
  seriesId: string;
  name: string;
  description: string; // long-form text
  color: string; // hex color for visual identity
  visualMotifs: string[]; // ["mirrors", "water", "clocks"]
  relatedCharacters: ThemeCharacterConnection[];
  evolution: ThemeEvolution[]; // per-script notes
  appearances: ThemeAppearance[]; // key scenes
  createdAt: Date;
  updatedAt: Date;
}

interface ThemeCharacterConnection {
  characterId: string;
  connection: string; // "embodies the theme of redemption"
}

interface ThemeEvolution {
  scriptId: string;
  notes: string; // how theme evolves in this script/episode
}

interface ThemeAppearance {
  sceneId: string;
  quote?: string; // key quote from scene
  notes?: string;
}
```

### Story Arc Entity
```typescript
interface StoryArc {
  id: string;
  seriesId: string;
  name: string;
  description: string;
  status: "planned" | "in_progress" | "completed" | "abandoned";
  startScriptId?: string; // optional script reference
  endScriptId?: string; // optional script reference
  keyBeats: ArcBeat[]; // major plot points
  resolution?: string; // how arc concludes
  characters: ArcCharacterRole[];
  themeIds: string[]; // related themes
  createdAt: Date;
  updatedAt: Date;
}

interface ArcBeat {
  id: string;
  order: number;
  description: string;
  scriptId?: string; // optional script reference
  sceneId?: string; // optional scene reference
}

interface ArcCharacterRole {
  characterId: string;
  role: string; // "protagonist", "antagonist", "catalyst"
}
```

### Research Entity
```typescript
interface Research {
  id: string;
  seriesId: string;
  title: string;
  content: string; // markdown
  tags: string[];
  sourceUrl?: string;
  linkedEntities: ResearchLink[]; // link to any KB entity
  createdAt: Date;
  updatedAt: Date;
}

interface ResearchLink {
  entityType: "character" | "location" | "prop" | "scene" | "theme" | "storyArc";
  entityId: string;
}
```

---

## API Contracts

### Scene Endpoints
```typescript
// packages/shared/src/contract/scene.contract.ts
export const sceneContract = {
  listByScript: {
    input: z.object({
      scriptId: z.string(),
    }),
    output: z.array(sceneSchema),
  },
  getById: {
    input: z.object({
      id: z.string(),
    }),
    output: sceneSchema,
  },
  create: {
    input: z.object({
      seriesId: z.string(),
      scriptId: z.string(),
      sceneNumber: z.number(),
      heading: z.string(),
      // ... all scene fields
    }),
    output: sceneSchema,
  },
  update: {
    input: z.object({
      id: z.string(),
      // ... partial scene fields
    }),
    output: sceneSchema,
  },
  delete: {
    input: z.object({
      id: z.string(),
    }),
    output: z.object({ success: z.boolean() }),
  },
};
```

### Theme Endpoints
```typescript
// packages/shared/src/contract/theme.contract.ts
export const themeContract = {
  listBySeries: {
    input: z.object({
      seriesId: z.string(),
    }),
    output: z.array(themeSchema),
  },
  getById: {
    input: z.object({
      id: z.string(),
    }),
    output: themeSchema,
  },
  create: {
    input: z.object({
      seriesId: z.string(),
      name: z.string(),
      description: z.string(),
      color: z.string(),
      // ... all theme fields
    }),
    output: themeSchema,
  },
  update: {
    input: z.object({
      id: z.string(),
      // ... partial theme fields
    }),
    output: themeSchema,
  },
  delete: {
    input: z.object({
      id: z.string(),
    }),
    output: z.object({ success: z.boolean() }),
  },
};
```

### Story Arc Endpoints
```typescript
// packages/shared/src/contract/story-arc.contract.ts
export const storyArcContract = {
  listBySeries: {
    input: z.object({
      seriesId: z.string(),
    }),
    output: z.array(storyArcSchema),
  },
  getById: {
    input: z.object({
      id: z.string(),
    }),
    output: storyArcSchema,
  },
  create: {
    input: z.object({
      seriesId: z.string(),
      name: z.string(),
      description: z.string(),
      status: z.enum(["planned", "in_progress", "completed", "abandoned"]),
      // ... all story arc fields
    }),
    output: storyArcSchema,
  },
  update: {
    input: z.object({
      id: z.string(),
      // ... partial story arc fields
    }),
    output: storyArcSchema,
  },
  delete: {
    input: z.object({
      id: z.string(),
    }),
    output: z.object({ success: z.boolean() }),
  },
};
```

### Research Endpoints
```typescript
// packages/shared/src/contract/research.contract.ts
export const researchContract = {
  listBySeries: {
    input: z.object({
      seriesId: z.string(),
    }),
    output: z.array(researchSchema),
  },
  search: {
    input: z.object({
      seriesId: z.string(),
      query: z.string(),
      tags: z.array(z.string()).optional(),
    }),
    output: z.array(researchSchema),
  },
  getById: {
    input: z.object({
      id: z.string(),
    }),
    output: researchSchema,
  },
  create: {
    input: z.object({
      seriesId: z.string(),
      title: z.string(),
      content: z.string(),
      tags: z.array(z.string()),
      sourceUrl: z.string().optional(),
      linkedEntities: z.array(researchLinkSchema),
    }),
    output: researchSchema,
  },
  update: {
    input: z.object({
      id: z.string(),
      // ... partial research fields
    }),
    output: researchSchema,
  },
  delete: {
    input: z.object({
      id: z.string(),
    }),
    output: z.object({ success: z.boolean() }),
  },
};
```

---

## UI/UX Requirements

### Scene Detail View
- Match V0 design from `scene-detail.tsx`
- Scene card with number, heading, script name
- Metadata cards: Location, Time/Duration, Emotional Tone
- Conflict description text block
- Beats list (ordered, editable)
- Props list (badges)
- Lighting/Sound/Camera technical notes
- Previous/Next scene navigation
- Story notes textarea
- Optional storyboard image upload

### Theme Detail View
- Match V0 design from `theme-detail.tsx`
- Theme name with color indicator
- Description (long-form)
- Related Characters section with connection descriptions
- Visual Motifs (badge list, editable)
- Thematic Evolution (per-script accordion/list)
- Appearances in Scripts (scene references with quotes)

### Story Arc Detail View
- Match V0 design from `story-arc-detail.tsx`
- Arc name and status badge
- Description
- Timeline visualization (start → beats → end)
- Key Beats list (ordered)
- Characters Involved (with roles)
- Related Themes (linked badges)
- Resolution text

### Research Panel
- Sidebar or tab in Knowledge Base
- List of research entries with titles and tags
- Click to expand/view full content
- Markdown rendering
- Link to related entities (badges)
- Search and filter by tags

---

## Success Criteria

### SC-001: Scene Management
- User can create scene from script editor context
- Scene detail page displays all metadata
- Scene beats are editable inline
- Scene navigation (prev/next) works within script
- Scenes appear in KB "All" view with scene icon
- Deleting script warns if scenes exist

### SC-002: Theme Management
- User can create theme with color picker
- Theme detail shows all related characters
- Thematic evolution entries can be added per script
- Theme appearances link to scenes
- Themes appear in KB "All" view with theme icon

### SC-003: Story Arc Management
- User can create story arc with status
- Arc timeline visualizes progression
- Arc beats are reorderable
- Character roles are editable
- Story arcs appear in KB "All" view with arc icon
- Completed arcs show resolution text

### SC-004: Research Management
- User can create research with markdown editor
- Research links to KB entities via picker
- Research search performs full-text search
- Research entries render markdown correctly
- Research tags are filterable

### SC-005: KB Integration
- All four entity types appear in unified "All" view
- Entity type filter includes new types
- Grid cards show type-specific icons and colors
- Detail views match brutalist design system
- Entity relationships display correctly (e.g., scene → location)

---

## Dependencies and Risks

### Dependencies
- **001-series**: Series context required for all entities
- **003-knowledge-base**: KB infrastructure and UI patterns
- **002-scripts**: Scene entities reference scripts

### Risks
- **Scene number conflicts**: Multiple users creating scenes simultaneously could create duplicates
  - Mitigation: Backend enforces unique scene numbers per script with optimistic locking
- **Complex relationships**: Scenes/Themes/Arcs have many cross-references
  - Mitigation: Use lazy loading and pagination for relationship lists
- **Performance**: Graph queries across all entity types could be slow
  - Mitigation: Index foreign keys, cache graph data, limit depth

---

## Out of Scope

- Episodes as standalone entities (removed from design)
- Automated scene detection from script content (future enhancement)
- AI-generated themes/arcs (future enhancement)
- Collaborative real-time editing of scenes (future enhancement)
- Version control for scene beats (future enhancement)

---

## Implementation Notes

### Backend
- Create Mongoose models for Scene, Theme, StoryArc, Research
- Add indexes for seriesId, scriptId, sceneNumber (unique composite)
- Implement oRPC routers for all four entity types
- Add cascade delete logic (e.g., deleting script → delete scenes)
- Implement search service for Research full-text search

### Frontend
- Add entity type constants for Scenes, Themes, StoryArcs, Research
- Create detail components matching V0 designs
- Extend KB "All" view filter to include new types
- Add entity icons and colors to design system
- Create relationship picker components (e.g., link research to entities)

### Testing
- Unit tests for scene number uniqueness
- Integration tests for cascade deletes
- UI tests for scene beat reordering
- Performance tests for graph queries with 100+ entities

---

## References

- V0 Design Components:
  - `apps/web-mock/components/scene-detail.tsx`
  - `apps/web-mock/components/theme-detail.tsx`
  - `apps/web-mock/components/story-arc-detail.tsx`
  - `apps/web-mock/components/knowledge-base.tsx`
- Related Specs:
  - `001-series/spec.md` (series context)
  - `003-knowledge-base/spec.md` (KB infrastructure)
  - `002-scripts/spec.md` (scene references)
  - `006-continuity/spec.md` (graph visualization)
