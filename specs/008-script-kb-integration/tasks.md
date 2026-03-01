# Implementation Tasks: Script × KB Integration

**Epic**: `#118` - Scripts Editor and Knowledge Base Entities Integration  
**Spec**: [spec.md](./spec.md)  
**Status**: Planning

---

## Task Breakdown by Phase

### Phase 1: Core Autocomplete Infrastructure

#### T001: Create Base Entity Mention Extension
**File**: `apps/web/src/features/scripts/extensions/entity-mention.ts`  
**Priority**: P0  
**Estimate**: 4h

- [ ] Create `EntityMention` TipTap extension using `@tiptap/suggestion`
- [ ] Configure trigger character handling (`@`, `#`, `!`)
- [ ] Implement block type filtering (only trigger in allowed blocks)
- [ ] Handle keyboard navigation (ArrowUp/Down, Enter, Escape)
- [ ] Support custom rendering via render function
- [ ] Export configuration options interface

**Acceptance**:
- Typing `@` in Action block opens suggestion popup
- ArrowUp/Down navigates suggestions
- Enter inserts selected suggestion
- Escape closes popup

---

#### T002: Create Entity Autocomplete Component
**Files**: `apps/web/src/features/scripts/components/entity-autocomplete/`  
**Priority**: P0  
**Estimate**: 6h

- [ ] Create `EntityAutocomplete` container component
- [ ] Create `SuggestionList` with virtualized scroll for large lists
- [ ] Create `SuggestionItem` with entity type-specific rendering
- [ ] Create `CreateEntityOption` for "+ Create new" action
- [ ] Implement loading and empty states
- [ ] Add keyboard navigation hooks
- [ ] Style with brutalist design tokens

**Files to create**:
```
entity-autocomplete/
├── entity-autocomplete.tsx
├── suggestion-list.tsx
├── suggestion-item.tsx
├── create-entity-option.tsx
├── use-autocomplete-keyboard.ts
└── index.ts
```

**Acceptance**:
- Suggestions render with avatar/icon, name, preview text
- Scrollable list for 10+ items
- Visual highlight on focused item
- "+ Create X" option at bottom when typing new name

---

#### T003: Create useCharacterSuggestions Hook
**File**: `apps/web/src/features/scripts/hooks/use-character-suggestions.ts`  
**Priority**: P0  
**Estimate**: 3h

- [ ] Query `autocompleteSearch` endpoint with debounce (150ms)
- [ ] Cache recent queries in memory
- [ ] Prioritize recently used characters
- [ ] Support fuzzy matching
- [ ] Return loading/error states

```typescript
interface UseCharacterSuggestionsOptions {
  seriesId: string;
  query: string;
  limit?: number;
  recentlyUsed?: string[];
}

interface UseCharacterSuggestionsReturn {
  suggestions: CharacterSuggestion[];
  isLoading: boolean;
  error: Error | null;
}
```

**Acceptance**:
- Typing "JO" returns characters containing "John", "Joanna", "Major Jones"
- Results appear within 200ms
- Previously used characters appear first

---

#### T004: Implement Character Block Autocomplete
**File**: `apps/web/src/features/scripts/extensions/character.ts` (modify)  
**Priority**: P0  
**Estimate**: 4h

- [ ] Add `characterId` attribute to Character node
- [ ] Integrate EntityMention extension for Character blocks
- [ ] Auto-trigger suggestions when block is empty and focused
- [ ] Insert character name and set characterId on selection
- [ ] Support Escape to dismiss and type freely

**Node attribute addition**:
```typescript
addAttributes() {
  return {
    characterId: { default: null },
    class: { default: 'script-block script-block--character' },
  };
},
```

**Acceptance**:
- New Character block shows suggestions automatically
- Selecting character sets both text and characterId
- Typing without selecting leaves characterId null (new character)

---

#### T005: Create useLocationSuggestions Hook
**File**: `apps/web/src/features/scripts/hooks/use-location-suggestions.ts`  
**Priority**: P0  
**Estimate**: 3h

- [ ] Query locations from KB
- [ ] Support partial matching on location name
- [ ] Include time of day suggestions from location history
- [ ] Parse scene heading to extract location portion

```typescript
interface LocationSuggestion {
  _id: string;
  name: string;
  fullHeading?: string; // "LOCATION - TIME"
  images?: string[];
  mood?: string;
  usedTimeOfDay?: string[];
}
```

**Acceptance**:
- After "INT. ", typing shows location suggestions
- Each suggestion shows location name and preview image (if available)
- Suggestions include previously used time of day options

---

#### T006: Implement Scene Heading Location Autocomplete
**File**: `apps/web/src/features/scripts/extensions/scene-heading.ts` (modify)  
**Priority**: P0  
**Estimate**: 5h

- [ ] Add `sceneId` and `locationId` attributes
- [ ] Parse heading structure: `[INT/EXT] [LOCATION] - [TIME]`
- [ ] Trigger location suggestions after INT./EXT. prefix
- [ ] Trigger time of day suggestions after ` - `
- [ ] Set locationId when location selected

**Parsing logic**:
```typescript
function parseSceneHeading(text: string): {
  interior: 'INT' | 'EXT' | 'INT/EXT' | null;
  location: string;
  timeOfDay: string;
} {
  const match = text.match(/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*(.+?)(?:\s*-\s*(.+))?$/i);
  // ...
}
```

**Acceptance**:
- "INT. " triggers location autocomplete
- Selecting location inserts full name
- " - " triggers time of day suggestions
- Final heading has both values

---

#### T007: Create autocompleteSearch API Endpoint
**Files**: 
- `packages/shared/src/contract/script-kb-integration.contract.ts`
- `apps/server/src/routers/script-kb-integration.router.ts`  
**Priority**: P0  
**Estimate**: 4h

- [ ] Define contract with input/output schemas
- [ ] Implement router handler with MongoDB text search
- [ ] Include usage frequency sorting
- [ ] Return minimal fields for fast response
- [ ] Add timing metrics to response

**Contract**:
```typescript
const autocompleteSearch = authProcedure
  .route({ path: '/autocomplete', method: 'GET' })
  .input(z.object({
    seriesId: z.string(),
    entityType: z.enum(['character', 'location', 'prop', 'wildcard']),
    query: z.string().max(100),
    limit: z.number().default(5),
  }))
  .output(z.object({
    items: z.array(z.object({
      _id: z.string(),
      name: z.string(),
      avatarUrl: z.string().optional(),
      preview: z.string().optional(),
    })),
    timing: z.object({ queryMs: z.number() }),
  }));
```

**Acceptance**:
- API returns within 200ms for typical queries
- Results are properly filtered by series
- Case-insensitive matching works

---

#### T008: Implement Quick-Create Entity Flow
**Files**: `apps/web/src/features/scripts/components/entity-autocomplete/create-entity-option.tsx`  
**Priority**: P1  
**Estimate**: 4h

- [ ] Add "+ Create [typed name]" option to autocomplete
- [ ] Open create modal with pre-filled name
- [ ] On modal save, insert new entity and link
- [ ] Handle modal cancel gracefully
- [ ] Support character, location, prop, wildcard types

**Integration with existing modals**:
- Reuse `CharacterCreateForm` from `features/characters/`
- Reuse `LocationCreateForm` from `features/locations/`
- Pass `initialName` prop to pre-fill

**Acceptance**:
- Typing unknown name shows "+ Create X" option
- Selecting opens appropriate create modal
- New entity appears in suggestions after creation
- Entity is immediately linked to block

---

### Phase 2: Scene Entity Integration

#### T009: Create SceneMetadata TipTap Extension
**File**: `apps/web/src/features/scripts/extensions/scene-metadata.ts`  
**Priority**: P1  
**Estimate**: 4h

- [ ] Define scene boundary detection in document
- [ ] Track scene numbers automatically
- [ ] Provide commands for accessing scene metadata
- [ ] Emit events on scene heading changes

```typescript
export const SceneMetadata = Extension.create({
  name: 'sceneMetadata',
  
  addStorage() {
    return {
      scenes: [] as SceneInfo[],
    };
  },
  
  onUpdate() {
    // Recalculate scene boundaries
    this.storage.scenes = detectScenes(this.editor.state.doc);
  },
});
```

**Acceptance**:
- Extension tracks all scene headings in document
- Scene numbers calculated correctly
- Scene info accessible via extension storage

---

#### T010: Create useSceneAutoCreate Hook
**File**: `apps/web/src/features/scripts/hooks/use-scene-auto-create.ts`  
**Priority**: P1  
**Estimate**: 4h

- [ ] Detect new scene heading confirmation (blur or Enter)
- [ ] Check if Scene entity exists for this heading
- [ ] Call `ensureScene` API if needed
- [ ] Update node with sceneId attribute
- [ ] Handle concurrent scene creation (idempotent)

**Trigger conditions**:
- Scene heading block loses focus
- User presses Enter at end of scene heading
- User changes block type away from scene-heading

**Acceptance**:
- New scene heading creates Scene entity automatically
- Duplicate headings don't create duplicate entities
- SceneId attribute set on node

---

#### T011: Create ensureScene API Endpoint
**Files**: 
- `packages/shared/src/contract/script-kb-integration.contract.ts`
- `apps/server/src/routers/script-kb-integration.router.ts`  
**Priority**: P1  
**Estimate**: 3h

- [ ] Implement idempotent scene creation
- [ ] Match existing scene by scriptId + sceneNumber or heading
- [ ] Create with parsed locationId if matched
- [ ] Return `isNew` flag for optimistic update handling

**Idempotency key**: `scriptId + sceneNumber`

**Acceptance**:
- First call creates scene, returns isNew: true
- Second call returns existing scene, isNew: false
- LocationId populated if location matches KB

---

#### T012: Create SceneMetadataPanel Component
**File**: `apps/web/src/features/scripts/components/scene-editor/scene-metadata-panel.tsx`  
**Priority**: P1  
**Estimate**: 6h

- [ ] Inline panel below scene heading
- [ ] Display scene metadata fields:
  - Emotional tone
  - Conflict
  - Lighting/Sound/Camera
  - Story notes
  - Beats (list)
- [ ] Edit with debounced save
- [ ] Link to story arcs and timeline
- [ ] Character/prop summary badges

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│ INT. COFFEE SHOP - MORNING                     [×] │
├─────────────────────────────────────────────────────┤
│ 📍 Location: Coffee Shop         🕐 Duration: 2min │
│ 😊 Tone: [Tense but hopeful    ▼]                  │
│ ⚔️ Conflict: [John vs Sarah...              ]      │
├─────────────────────────────────────────────────────┤
│ 👥 Characters (3)  📦 Props (2)                    │
├─────────────────────────────────────────────────────┤
│ 📖 Story Arcs: [+ Add arc]                         │
│   • Main Plot (Beat 3/7)                           │
│ ⏱️ Timeline: [+ Link to timeline]                  │
└─────────────────────────────────────────────────────┘
```

**Acceptance**:
- Opens from scene heading context menu
- Edits save without page reload
- Closes with × or clicking outside
- Shows linked characters and props

---

### Phase 3: Prop & Extended Mentions

#### T013: Implement Prop Mention Extension
**File**: `apps/web/src/features/scripts/extensions/prop-mention.ts`  
**Priority**: P1  
**Estimate**: 3h

- [ ] Configure EntityMention for `#` trigger
- [ ] Only allow in Action blocks
- [ ] Insert styled prop mention
- [ ] Track in node attributes

**Styling**:
```css
.prop-mention {
  background-color: var(--brutalist-yellow);
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 500;
}
```

**Acceptance**:
- `#gun` in Action block shows prop suggestions
- Selected prop appears highlighted
- Prop tracked in node mentions array

---

#### T014: Implement Character Mention in Action
**File**: `apps/web/src/features/scripts/extensions/character-mention.ts`  
**Priority**: P1  
**Estimate**: 3h

- [ ] Configure EntityMention for `@` trigger in Action
- [ ] Insert styled character mention
- [ ] Track for appearance counting

**Styling**:
```css
.character-mention {
  color: var(--brutalist-orange);
  font-weight: 600;
}
```

**Acceptance**:
- `@John` in Action block shows character suggestions
- Selected character appears styled
- Character tracked in scene appearances

---

#### T015: Create Mention Mark Schema
**File**: `apps/web/src/features/scripts/extensions/mention-mark.ts`  
**Priority**: P1  
**Estimate**: 3h

- [ ] Define TipTap Mark for entity mentions
- [ ] Store entityId and entityType in mark attrs
- [ ] Render with appropriate styling
- [ ] Support serialization/deserialization

```typescript
export const MentionMark = Mark.create({
  name: 'mention',
  
  addAttributes() {
    return {
      entityId: { default: null },
      entityType: { default: null },
    };
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['span', { 
      class: `mention mention--${HTMLAttributes.entityType}`,
      'data-entity-id': HTMLAttributes.entityId,
    }, 0];
  },
});
```

**Acceptance**:
- Mentions survive save/reload cycle
- Entity IDs preserved in serialized content
- Styling applied from mark type

---

#### T016: Create syncAppearances API Endpoint
**Files**: 
- `packages/shared/src/contract/script-kb-integration.contract.ts`
- `apps/server/src/routers/script-kb-integration.router.ts`  
**Priority**: P1  
**Estimate**: 5h

- [ ] Accept bulk appearance updates
- [ ] Diff against existing appearances
- [ ] Update Character.appearances[], Scene.characterIds[], Scene.propIds[]
- [ ] Handle removed appearances (character removed from scene)
- [ ] Return summary of changes

**Logic**:
```typescript
// Input: all appearances found in script
// Server: diff against stored appearances for this scriptId
// Result: add new, remove missing, keep unchanged
```

**Acceptance**:
- Script save syncs all appearances
- Removed characters/props cleaned up
- Appearance counts accurate

---

#### T017: Create useAppearanceTracker Hook
**File**: `apps/web/src/features/scripts/hooks/use-appearance-tracker.ts`  
**Priority**: P1  
**Estimate**: 4h

- [ ] Extract all entity links from editor state
- [ ] Group by scene (based on following scene heading)
- [ ] Call syncAppearances on script save
- [ ] Handle optimistic tracking during editing

```typescript
interface UseAppearanceTrackerOptions {
  editor: Editor;
  scriptId: string;
  seriesId: string;
  enabled?: boolean;
}

function extractAppearances(doc: Node): Appearance[] {
  const appearances: Appearance[] = [];
  let currentSceneRef = '';
  
  doc.descendants((node) => {
    if (node.type.name === 'scene-heading') {
      currentSceneRef = node.textContent;
    }
    if (node.attrs.characterId) {
      appearances.push({
        entityType: 'character',
        entityId: node.attrs.characterId,
        sceneRef: currentSceneRef,
      });
    }
    // ... props, mentions
  });
  
  return appearances;
}
```

**Acceptance**:
- All linked entities extracted on save
- Appearances correctly attributed to scenes
- Sync happens on script save

---

### Phase 4: Real-Time Sync Foundation

#### T018: Add Version Tracking to Entities
**Files**: Entity models in `apps/server/src/db/models/`  
**Priority**: P1  
**Estimate**: 3h

- [ ] Add `_version: number` to all KB entities
- [ ] Add `_lastModifiedBy: string` (userId)
- [ ] Add `_lastModifiedAt: Date`
- [ ] Increment version on every save
- [ ] Add compound index for efficient polling

**Model updates**:
- `character.model.ts`
- `location.model.ts`
- `prop.model.ts`
- `scene.model.ts`
- `wildcard.model.ts`
- `theme.model.ts`
- `story-arc.model.ts`
- `timeline.model.ts`

**Acceptance**:
- Version increments on every update
- Existing entities get version 1 on first access

---

#### T019: Create pollEntityUpdates API Endpoint
**Files**: 
- `packages/shared/src/contract/script-kb-integration.contract.ts`
- `apps/server/src/routers/script-kb-integration.router.ts`  
**Priority**: P1  
**Estimate**: 4h

- [ ] Implement long-polling with configurable timeout
- [ ] Query entities modified since version
- [ ] Return patches (changed fields only)
- [ ] Include hasMore flag for pagination
- [ ] Filter by entityType if specified

**Polling implementation**:
```typescript
// Wait for updates or timeout
const updates = await waitForUpdates(seriesId, sinceVersion, timeout);
return {
  updates,
  currentVersion: getLatestVersion(),
  hasMore: updates.length >= limit,
};
```

**Acceptance**:
- Client receives updates within poll interval
- Only changed fields returned (bandwidth efficient)
- Handles no-updates case (returns empty after timeout)

---

#### T020: Create useEntitySync Hook
**File**: `apps/web/src/features/scripts/hooks/use-entity-sync.ts`  
**Priority**: P1  
**Estimate**: 4h

- [ ] Poll for entity updates on interval
- [ ] Track last sync version
- [ ] Apply updates to TanStack Query cache
- [ ] Emit events for UI updates
- [ ] Handle reconnection after offline

```typescript
export function useEntitySync(options: UseEntitySyncOptions) {
  const [syncStatus, setSyncStatus] = useState<'connected' | 'reconnecting'>('connected');
  const versionRef = useRef(0);
  
  // ... polling logic
  
  return {
    syncStatus,
    lastSyncVersion: versionRef.current,
    forceSync: () => { /* immediate poll */ },
  };
}
```

**Acceptance**:
- Sync runs in background during editing
- Cache updates without user action
- Status exposed for UI indication

---

#### T021: Create useSyncReconciler Hook
**File**: `apps/web/src/features/scripts/hooks/use-sync-reconciler.ts`  
**Priority**: P1  
**Estimate**: 5h

- [ ] Listen for entity update events
- [ ] Find affected blocks in editor
- [ ] Update entity names in blocks (preserve cursor)
- [ ] Handle entity deletion (mark orphaned)
- [ ] Avoid triggering save for sync-induced changes

**Name update logic**:
```typescript
function updateEntityNameInEditor(
  editor: Editor,
  entityId: string,
  newName: string
) {
  const { state, view } = editor;
  const tr = state.tr;
  
  state.doc.descendants((node, pos) => {
    if (node.attrs.characterId === entityId) {
      // Replace text content while preserving attrs
      const end = pos + node.nodeSize;
      tr.replaceWith(pos, end, /* new node with updated text */);
    }
  });
  
  view.dispatch(tr);
}
```

**Acceptance**:
- Entity rename reflects in all linked blocks
- Cursor position preserved during update
- No duplicate save triggered

---

#### T022: Handle Entity Deletion
**File**: `apps/web/src/features/scripts/hooks/use-entity-deletion.ts`  
**Priority**: P1  
**Estimate**: 3h

- [ ] Detect entity deletion from sync
- [ ] Mark affected blocks as orphaned
- [ ] Show visual indication (strikethrough, warning icon)
- [ ] Provide repair options:
  - Unlink (convert to plain text)
  - Link to different entity
  - Delete block

**Orphaned state**:
```typescript
// Store tracks orphaned entity IDs
scriptLinksStore.markOrphaned(entityId);

// Block rendering checks
if (scriptLinksStore.isOrphaned(characterId)) {
  return <OrphanedEntityBadge />;
}
```

**Acceptance**:
- Deleted entity shows warning in blocks
- User can choose how to handle
- Clean state after resolution

---

#### T023: Create useOfflineQueue Hook
**File**: `apps/web/src/features/scripts/hooks/use-offline-queue.ts`  
**Priority**: P2  
**Estimate**: 5h

- [ ] Persist pending mutations to IndexedDB
- [ ] Queue mutations when offline
- [ ] Process queue on reconnect
- [ ] Handle conflicts/failures
- [ ] Expose queue status

```typescript
const db = await openDB('kaeri-offline', 1, {
  upgrade(db) {
    db.createObjectStore('mutations', { keyPath: 'id' });
    db.createObjectStore('meta', { keyPath: 'key' });
  },
});
```

**Acceptance**:
- Mutations queued when offline
- Queue persists across refresh
- Processed automatically on reconnect
- Failed mutations surfaced to user

---

### Phase 5: Preview & Story Features

#### T024: Create EntityPreviewCard Component
**File**: `apps/web/src/features/scripts/components/entity-preview/entity-preview-card.tsx`  
**Priority**: P2  
**Estimate**: 4h

- [ ] Floating card on entity hover
- [ ] Configurable delay (500ms default)
- [ ] Position near cursor, avoid viewport edges
- [ ] Show type-specific content
- [ ] "Open in KB" action

```typescript
interface EntityPreviewCardProps {
  entityId: string;
  entityType: 'character' | 'location' | 'prop' | 'wildcard';
  position: { x: number; y: number };
  onClose: () => void;
  onOpenInKB: () => void;
}
```

**Acceptance**:
- Preview appears after hover delay
- Shows relevant entity info
- Click "Open in KB" switches panel

---

#### T025: Create Character Preview
**File**: `apps/web/src/features/scripts/components/entity-preview/character-preview.tsx`  
**Priority**: P2  
**Estimate**: 3h

- [ ] Avatar image
- [ ] Description snippet
- [ ] Key traits (first 3)
- [ ] Relationship count
- [ ] Appearance count in current script

**Layout**:
```
┌───────────────────────────┐
│ [Avatar]  JOHN SMITH      │
│           Protagonist     │
├───────────────────────────┤
│ A retired detective...    │
│                           │
│ 🏷️ Brave, Stubborn, Loyal │
│ 👥 5 relationships        │
│ 📄 12 appearances         │
├───────────────────────────┤
│     [Open in KB]          │
└───────────────────────────┘
```

**Acceptance**:
- Character info displays correctly
- Loads within 500ms
- Handles missing avatar gracefully

---

#### T026: Create Location Preview
**File**: `apps/web/src/features/scripts/components/entity-preview/location-preview.tsx`  
**Priority**: P2  
**Estimate**: 3h

- [ ] Location image (if available)
- [ ] Description snippet
- [ ] Mood indicator
- [ ] Associated props
- [ ] Usage count

**Acceptance**:
- Location details display correctly
- Images load or show placeholder
- Props listed

---

#### T027: Implement Story Arc Linking
**File**: `apps/web/src/features/scripts/components/scene-editor/scene-arc-linker.tsx`  
**Priority**: P2  
**Estimate**: 4h

- [ ] List available story arcs for series
- [ ] Link scene to arc beat
- [ ] Show arc progress visualization
- [ ] Update Story Arc entity on link

```typescript
interface SceneArcLinkerProps {
  sceneId: string;
  seriesId: string;
  linkedArcs: Array<{ arcId: string; beatIndex: number }>;
  onLinkArc: (arcId: string, beatIndex: number) => void;
  onUnlinkArc: (arcId: string) => void;
}
```

**Acceptance**:
- Can link scene to story arc
- Beat position tracked
- Arc shows scene in its beats

---

#### T028: Implement Timeline Linking
**File**: `apps/web/src/features/scripts/components/scene-editor/scene-timeline-linker.tsx`  
**Priority**: P2  
**Estimate**: 3h

- [ ] List timeline entries for series
- [ ] Link scene to timeline entry
- [ ] Show chronological position

**Acceptance**:
- Can link scene to timeline entry
- Timeline entry shows linked scene
- Visual indicator in scene heading (optional)

---

#### T029: Implement Wildcard Reference
**Files**: 
- `apps/web/src/features/scripts/extensions/wildcard-reference.ts`
- `apps/web/src/features/scripts/hooks/use-wildcard-suggestions.ts`  
**Priority**: P2  
**Estimate**: 4h

- [ ] Configure EntityMention for `!` trigger
- [ ] Insert subtle reference marker
- [ ] Show wildcard content on hover
- [ ] Link to wildcard entity

**Reference marker**:
```css
.wildcard-reference {
  color: var(--muted-foreground);
  font-size: 0.85em;
  vertical-align: super;
}
.wildcard-reference::before {
  content: '📝';
}
```

**Acceptance**:
- `!note` shows wildcard suggestions
- Selected wildcard shows marker
- Hover reveals content

---

### Phase 6: Theme & Polish

#### T030: Implement Theme Tagging
**Files**: 
- `apps/web/src/features/scripts/extensions/theme-mark.ts`
- `apps/web/src/features/scripts/components/theme-tagger.tsx`  
**Priority**: P3  
**Estimate**: 5h

- [ ] Text selection context menu
- [ ] "Tag Theme" submenu
- [ ] Apply theme mark to selection
- [ ] Store in Theme.appearances[]
- [ ] Optional highlight rendering

**Context menu integration**:
- Use TipTap BubbleMenu or custom right-click handler
- Show theme list with colors
- Allow multiple themes per passage

**Acceptance**:
- Can select text and tag theme
- Theme appearance tracked
- Optional highlight visible

---

#### T031: Performance Optimization
**Priority**: P1  
**Estimate**: 6h

- [ ] Profile large script rendering (1000+ blocks)
- [ ] Implement virtualized block rendering if needed
- [ ] Lazy load entity previews
- [ ] Optimize autocomplete caching
- [ ] Reduce re-renders on sync updates

**Targets**:
- 60fps scroll with 1000 blocks
- <200ms autocomplete response
- <100ms sync update application

**Acceptance**:
- Performance metrics meet SC targets
- No jank on large documents
- Memory usage reasonable

---

#### T032: Integration Testing Suite
**File**: `apps/web/src/features/scripts/__tests__/`  
**Priority**: P1  
**Estimate**: 8h

- [ ] Character autocomplete flow tests
- [ ] Location autocomplete flow tests
- [ ] Scene auto-creation tests
- [ ] Sync reconciliation tests
- [ ] Offline queue tests

**Test structure**:
```
__tests__/
├── autocomplete.test.tsx
├── scene-creation.test.tsx
├── entity-sync.test.tsx
├── offline-queue.test.ts
└── fixtures/
    ├── characters.json
    ├── locations.json
    └── test-script.json
```

**Acceptance**:
- All critical paths covered
- Tests run in CI
- Fixtures match production schemas

---

## Dependency Graph

```
T007 (API: autocomplete) ───┐
                            │
T001 (EntityMention)  ──────┼──▶ T004 (Character Autocomplete)
                            │         │
T002 (Autocomplete UI) ─────┤         ▼
                            │    T008 (Quick Create)
T003 (useCharacterSuggestions) ─┘
                            
T005 (useLocationSuggestions) ──▶ T006 (Scene Heading Autocomplete)
                                       │
                                       ▼
T009 (SceneMetadata Extension) ──▶ T010 (useSceneAutoCreate)
                                       │
T011 (API: ensureScene) ───────────────┘
                                       │
                                       ▼
                                  T012 (SceneMetadataPanel)

T013 (Prop Mention) ───┐
T014 (Char Mention) ───┼──▶ T015 (Mention Mark) ──▶ T017 (useAppearanceTracker)
T015 (Mention Mark) ───┘                                  │
                                                          ▼
                                                    T016 (API: syncAppearances)

T018 (Version Tracking) ──▶ T019 (API: pollUpdates) ──▶ T020 (useEntitySync)
                                                              │
                                                              ▼
                                                        T021 (useSyncReconciler)
                                                              │
                                                              ▼
                                                        T022 (Entity Deletion)

T023 (Offline Queue) ──▶ [Independent after Phase 4]

T024 (EntityPreviewCard) ──┬──▶ T025 (Character Preview)
                           ├──▶ T026 (Location Preview)
                           └──▶ [More entity previews]

T027 (Arc Linking) ──┐
T028 (Timeline Linking)├──▶ [Scene Editor Panel completion]
T029 (Wildcard Reference)─┘

T030 (Theme Tagging) ──▶ [After Phase 5]

T031 (Performance) ──▶ [After all features]
T032 (Testing) ──▶ [Continuous]
```

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Autocomplete latency > 200ms | Medium | Pre-cache frequently used entities; optimize DB indexes |
| Large script performance | High | Implement virtualization early; profile continuously |
| Sync conflicts on concurrent edit | Medium | Last-write-wins acceptable for now; flag for review |
| Entity deletion breaks scripts | High | Graceful orphan handling; never hard-delete |
| Offline queue data loss | Medium | IndexedDB with periodic cleanup; sync status visible |

---

## Definition of Done

Each task is complete when:
- [ ] Code implemented and TypeScript compiles
- [ ] Unit tests written and passing (where applicable)
- [ ] Manual testing completed
- [ ] Code reviewed
- [ ] Documentation updated (if API/component)
- [ ] No regressions in existing features
- [ ] Accessibility considered (keyboard nav works)
- [ ] Mobile responsiveness verified (where applicable)
