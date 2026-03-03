# Feature Specification: Script Editor × Knowledge Base Integration

**Feature Branch**: `118-epic-scripts-editor-and-knowledge-base-entities-integration`  
**Created**: 2026-03-01  
**Status**: Draft  
**Input**: Deep integration between Script Editor and Knowledge Base entities with inline autocomplete, quick create, real-time sync, and appearance tracking

## Overview

This specification details the integration between the Script Editor (spec 002) and Knowledge Base entities (spec 003) to create a seamless writing experience where characters, locations, props, scenes, timeline entries, wildcards, story arcs, and themes are directly accessible and linkable within the script editing workflow.

### Design Principles

1. **Non-Intrusive**: Suggestions appear contextually; never interrupt writing flow
2. **Real-Time Ready**: All state designed for future WebSocket collaboration
3. **Bidirectional Sync**: Script changes update KB; KB changes reflect in scripts
4. **Optimistic Updates**: UI responds immediately; reconciles with server asynchronously
5. **Graceful Degradation**: Works offline with sync queue; handles conflicts

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Character Autocomplete in Script (Priority: P0)

A writer types a character name in a Character block and sees suggestions from their Knowledge Base, selects one, and the character is automatically linked for appearance tracking.

**Why this priority**: Core writing workflow; characters are referenced constantly.

**Independent Test**: Typing in Character block shows filtered character list; selecting links character ID; appearance recorded in KB.

**Acceptance Scenarios**:
1. Given a Character block, when typing "JO", then autocomplete shows characters containing "JO" (John, Joanna, Major Jones) within 200ms.
2. Given autocomplete is open, when pressing ArrowDown/Up and Enter, then selection inserts full name and links characterId.
3. Given a new character name typed, when selecting "+ Create [name]", then character creation modal opens with name pre-filled.
4. Given character is linked, when viewing character in KB, then Appearances tab shows this script/scene reference.

### User Story 2 - Location Autocomplete in Scene Heading (Priority: P0)

A writer types a scene heading and gets location suggestions after INT./EXT., with time of day suggestions based on location history.

**Why this priority**: Every scene starts with a heading; locations are frequently reused.

**Independent Test**: Scene heading autocomplete triggers after typing "INT. "; location selection populates heading; Scene entity created/linked.

**Acceptance Scenarios**:
1. Given a Scene Heading block with "INT. ", when typing "OFF", then suggest "OFFICE", "OFFICE - BULLPEN", "OFFSHORE RIG" from KB locations.
2. Given location selected, when typing " - ", then suggest time of day options from location's `timeOfDay[]` history.
3. Given new location typed, when selecting "+ Create location", then location modal opens with parsed name.
4. Given scene heading completed, when Scene entity doesn't exist, then auto-create Scene with heading, locationId, scriptId.

### User Story 3 - Prop Mentions in Action Blocks (Priority: P1)

A writer mentions props in action descriptions using `#` trigger, tracking which props appear in which scenes.

**Why this priority**: Props are important for production planning; tracking is valuable.

**Independent Test**: `#` in Action block shows prop autocomplete; selection inserts highlighted prop name; prop added to Scene.propIds.

**Acceptance Scenarios**:
1. Given an Action block, when typing "#gun", then show props matching "gun" from KB.
2. Given prop selected, when viewing Scene entity, then propIds includes this prop.
3. Given prop doesn't exist, when selecting "+ Create prop", then prop creation flow starts.

### User Story 4 - Character Mentions in Action Blocks (Priority: P1)

A writer mentions characters in action using `@` trigger for tracking character presence beyond dialogue.

**Why this priority**: Characters appear in action lines; this tracks presence accurately.

**Independent Test**: `@` in Action block shows character autocomplete; selection inserts styled mention; character tracked in scene.

**Acceptance Scenarios**:
1. Given an Action block, when typing "@", then show all characters; typing more filters list.
2. Given character mention inserted, when viewing Scene entity, then characterIds includes mentioned character.

### User Story 5 - Real-Time Entity Updates (Priority: P1)

When another user (or another tab) updates an entity, the script editor reflects changes without page refresh.

**Why this priority**: Foundation for collaborative editing; prevents stale data issues.

**Independent Test**: Entity rename in KB panel reflects in all linked script references; optimistic updates reconcile correctly.

**Acceptance Scenarios**:
1. Given character "JOHN" linked in script, when KB renames to "JOHNNY", then script displays "JOHNNY" after sync.
2. Given location renamed during editing, when sync event received, then scene heading updates with new name.
3. Given entity deleted, when sync event received, then linked references show "Unknown Entity" state with repair option.

### User Story 6 - Scene Metadata Quick Editor (Priority: P1)

A writer accesses scene-level metadata (emotional tone, conflict, beats, lighting) directly from the scene heading.

**Why this priority**: Scene metadata enriches production planning; should be accessible while writing.

**Independent Test**: Scene heading context menu shows "Scene Details"; quick editor appears inline; changes save to Scene entity.

**Acceptance Scenarios**:
1. Given a scene heading, when clicking block menu → "Scene Details", then inline panel appears with Scene fields.
2. Given quick editor open, when editing emotional tone, then Scene entity updates with debounced save.
3. Given scene beats edited, when viewing KB Scene detail, then beats array reflects changes.

### User Story 7 - Inline Entity Preview (Priority: P2)

A writer hovers over a linked entity to see preview without leaving the editor.

**Why this priority**: Quick reference improves continuity; reduces context switching.

**Independent Test**: Hover on linked character shows floating card with avatar, traits; click opens full KB panel.

**Acceptance Scenarios**:
1. Given linked character name, when hovering for 500ms, then preview card shows avatar, description, key traits.
2. Given preview card visible, when clicking "Open in KB", then right panel switches to character detail.
3. Given location in scene heading, when hovering, then preview shows location image, mood, associated props.

### User Story 8 - Story Arc Progress Tracking (Priority: P2)

A writer tracks which scenes advance which story arcs, with visual progress indication.

**Why this priority**: Arc tracking helps maintain story structure across long scripts.

**Independent Test**: Scene details panel shows arc association; arc panel shows progress across script.

**Acceptance Scenarios**:
1. Given scene details open, when selecting "Advances Arc: Main Plot", then Scene links to Story Arc.
2. Given Story Arc in KB, when viewing, then keyBeats shows scenes that advance this arc.

### User Story 9 - Timeline Linking (Priority: P2)

A writer links scenes to timeline entries for chronological story tracking.

**Why this priority**: Non-linear stories need timeline visualization; linking enables this.

**Independent Test**: Scene details panel shows timeline link option; timeline view shows linked scenes.

**Acceptance Scenarios**:
1. Given scene details, when linking to timeline entry "Day 2", then Scene appears in timeline view.
2. Given reordered timeline, when viewing script, then optional timeline indicator updates.

### User Story 10 - Wildcard Reference System (Priority: P2)

A writer references research notes and wildcards within the script for context.

**Why this priority**: Writers need quick access to research without switching contexts.

**Independent Test**: `!` trigger shows wildcards; selection inserts subtle reference marker; hover shows content.

**Acceptance Scenarios**:
1. Given Action block, when typing "!", then show wildcards filtered by tag/title.
2. Given wildcard reference inserted, when hovering marker, then wildcard content shows in tooltip.

### User Story 11 - Theme Passage Tagging (Priority: P3)

A writer tags dialogue or action passages with thematic relevance for analysis.

**Why this priority**: Theme tracking useful for analysis but not critical path.

**Independent Test**: Select text → context menu "Tag Theme" → select theme; passage appears in Theme appearances.

**Acceptance Scenarios**:
1. Given selected dialogue, when right-click → "Tag Theme" → "Redemption", then Theme.appearances includes this passage.
2. Given theme has color, when viewing tagged passage with highlights enabled, then subtle background tint appears.

### Edge Cases

- **Offline Editing**: Changes queue locally; sync on reconnect with conflict resolution
- **Entity Deletion**: Linked references show "Entity Removed" with option to unlink or create new
- **Duplicate Names**: Autocomplete shows entity ID suffix; preview distinguishes duplicates
- **Large Scripts**: Virtualized rendering for 1000+ blocks; lazy load entity previews
- **Race Conditions**: Last-write-wins with optimistic reversion on conflict
- **Circular References**: Story arcs referencing themes referencing characters handled gracefully
- **Permission Changes**: Entity access revoked shows "Access Denied" state
- **Network Failures**: Retry with exponential backoff; surface persistent failures

---

## Requirements *(mandatory)*

### Functional Requirements

#### Autocomplete & Linking

- **FR-001**: System MUST provide character autocomplete in Character blocks triggered by typing, with fuzzy matching and keyboard navigation.
- **FR-002**: System MUST provide location autocomplete in Scene Heading blocks after INT./EXT. prefix, with location name and time of day suggestions.
- **FR-003**: System MUST provide prop autocomplete in Action blocks triggered by `#` prefix, with prop name matching.
- **FR-004**: System MUST provide character mention autocomplete in Action blocks triggered by `@` prefix.
- **FR-005**: System MUST provide wildcard reference autocomplete triggered by `!` prefix in any block.
- **FR-006**: System MUST support quick-create flow for all entity types from autocomplete with pre-filled data.

#### Entity Linking & Tracking

- **FR-007**: System MUST store entity IDs as node attributes on linked script blocks.
- **FR-008**: System MUST automatically create Scene entities when new scene headings are confirmed.
- **FR-009**: System MUST track character appearances by updating Character.appearances[] when characters are linked or mentioned.
- **FR-010**: System MUST track props per scene by updating Scene.propIds[] when props are mentioned.
- **FR-011**: System MUST track characters per scene by updating Scene.characterIds[] when characters appear/are mentioned.

#### Real-Time Synchronization

- **FR-012**: System MUST support real-time entity updates via event subscription (WebSocket-ready).
- **FR-013**: System MUST apply optimistic updates on entity mutations with rollback on failure.
- **FR-014**: System MUST reconcile entity name changes in linked script blocks within 1 second of sync event.
- **FR-015**: System MUST handle entity deletion by marking links as "orphaned" with visual indication.

#### Preview & Quick Edit

- **FR-016**: System MUST display entity preview card on hover with configurable delay (default 500ms).
- **FR-017**: System MUST provide inline Scene metadata quick editor accessible from scene heading block menu.
- **FR-018**: System MUST support scene-to-story-arc linking from scene metadata editor.
- **FR-019**: System MUST support scene-to-timeline linking from scene metadata editor.

#### Theme Integration

- **FR-020**: System MUST support text selection → theme tagging with theme selection UI.
- **FR-021**: System MUST display optional theme highlight overlays based on Theme.color.

### Non-Functional Requirements

- **NFR-001**: Autocomplete suggestions MUST appear within 200ms of trigger.
- **NFR-002**: Entity preview cards MUST load within 500ms including network latency.
- **NFR-003**: Real-time sync events MUST propagate within 1 second on stable connection.
- **NFR-004**: System MUST maintain 60fps scrolling with 1000+ blocks and 100+ entity links.
- **NFR-005**: Offline queue MUST persist across browser refresh using IndexedDB.

### Key Entities *(data structures)*

#### Extended Script Block Node Attributes

```typescript
// TipTap node attrs extension
interface ScriptBlockAttrs {
  // Character block
  characterId?: string;
  
  // Scene heading block
  sceneId?: string;
  locationId?: string;
  
  // Entity mentions (Action block)
  mentions?: Array<{
    type: 'character' | 'prop' | 'wildcard';
    entityId: string;
    start: number; // position in node
    end: number;
  }>;
  
  // Theme tags (any block)
  themeTags?: Array<{
    themeId: string;
    start: number;
    end: number;
  }>;
}
```

#### Entity Link Reference (for sync)

```typescript
interface EntityLinkRef {
  scriptId: string;
  blockId: string; // tiptap node id
  entityType: 'character' | 'location' | 'prop' | 'scene' | 'timeline' | 'wildcard' | 'storyArc' | 'theme';
  entityId: string;
  linkType: 'primary' | 'mention' | 'reference' | 'themeTag';
  position?: { start: number; end: number };
}
```

#### Sync Event Payloads (WebSocket-ready)

```typescript
// Server → Client events
type EntitySyncEvent = 
  | { type: 'entity:updated'; entityType: string; entityId: string; patch: Record<string, unknown>; version: number }
  | { type: 'entity:deleted'; entityType: string; entityId: string }
  | { type: 'entity:created'; entityType: string; entity: unknown }
  | { type: 'script:updated'; scriptId: string; blocks: unknown[]; version: number };

// Client → Server events (for future collaboration)
type ClientSyncEvent =
  | { type: 'entity:link'; linkRef: EntityLinkRef }
  | { type: 'entity:unlink'; linkRef: EntityLinkRef }
  | { type: 'script:edit'; scriptId: string; operations: unknown[]; baseVersion: number };
```

### Constitution Alignment

- **Contracts**: New procedures in `packages/shared/src/contract/script-kb-integration.contract.ts` defining autocomplete endpoints, bulk appearance updates, and sync operations.
- **Canonical Continuity**: Entity links maintain referential integrity; orphan links flagged for user resolution.
- **Access & Collaboration**: Auth required; entity visibility respects series access; sync events filtered by permission.
- **Quality Gates**: `bun run check-types`, `bun run lint`, integration tests for autocomplete and sync flows.
- **Observability**: Structured logging for link operations; metrics for sync latency and conflict resolution.

---

## Technical Architecture

### TipTap Extensions

#### 1. EntityMention Extension

```typescript
// apps/web/src/features/scripts/extensions/entity-mention.ts
import { Extension } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';

export interface EntityMentionOptions {
  suggestion: {
    char: string; // trigger character
    entityType: 'character' | 'prop' | 'wildcard';
    allowedBlockTypes?: string[];
  };
}

export const EntityMention = Extension.create<EntityMentionOptions>({
  name: 'entityMention',
  
  addOptions() {
    return {
      suggestion: {
        char: '@',
        entityType: 'character',
        allowedBlockTypes: ['action', 'character', 'dialogue'],
      },
    };
  },
  
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: this.options.suggestion.char,
        // ... suggestion configuration
      }),
    ];
  },
});
```

#### 2. LocationSuggestion Extension

```typescript
// apps/web/src/features/scripts/extensions/location-suggestion.ts
import { Extension } from '@tiptap/core';

export const LocationSuggestion = Extension.create({
  name: 'locationSuggestion',
  
  // Triggers after INT./EXT. pattern in scene-heading blocks
  // Parses heading structure: [INT/EXT] [LOCATION] - [TIME]
});
```

#### 3. SceneMetadata Extension

```typescript
// apps/web/src/features/scripts/extensions/scene-metadata.ts
import { Extension } from '@tiptap/core';

export const SceneMetadata = Extension.create({
  name: 'sceneMetadata',
  
  addAttributes() {
    return {
      sceneId: { default: null },
      locationId: { default: null },
    };
  },
  
  // Auto-creates Scene entity when scene heading confirmed
  // Tracks scene boundaries in document
});
```

### React Components

#### Autocomplete Components

```typescript
// apps/web/src/features/scripts/components/entity-autocomplete/
├── entity-autocomplete.tsx      // Main autocomplete dropdown
├── character-suggestion.tsx     // Character-specific rendering
├── location-suggestion.tsx      // Location-specific rendering  
├── prop-suggestion.tsx          // Prop-specific rendering
├── wildcard-suggestion.tsx      // Wildcard-specific rendering
├── create-entity-option.tsx     // "+ Create new" option
└── index.ts
```

#### Preview Components

```typescript
// apps/web/src/features/scripts/components/entity-preview/
├── entity-preview-card.tsx      // Generic preview wrapper
├── character-preview.tsx        // Character hover preview
├── location-preview.tsx         // Location hover preview
├── prop-preview.tsx             // Prop hover preview
└── index.ts
```

#### Scene Editor Components

```typescript
// apps/web/src/features/scripts/components/scene-editor/
├── scene-metadata-panel.tsx     // Inline scene details editor
├── scene-arc-linker.tsx         // Story arc association UI
├── scene-timeline-linker.tsx    // Timeline linking UI
├── scene-entity-summary.tsx     // Characters/props count badges
└── index.ts
```

### Hooks Architecture

```typescript
// apps/web/src/features/scripts/hooks/

// Autocomplete
├── use-character-suggestions.ts   // Filtered character list
├── use-location-suggestions.ts    // Filtered location list
├── use-prop-suggestions.ts        // Filtered prop list
├── use-wildcard-suggestions.ts    // Filtered wildcard list

// Entity Linking
├── use-entity-link.ts             // Link/unlink entity to block
├── use-scene-auto-create.ts       // Auto-create Scene entities
├── use-appearance-tracker.ts       // Track character/prop appearances

// Real-time Sync
├── use-entity-sync.ts             // Subscribe to entity updates
├── use-sync-reconciler.ts         // Apply sync updates to editor
├── use-offline-queue.ts           // Offline mutation queue

// Preview
├── use-entity-preview.ts          // Hover preview state
├── use-preview-position.ts        // Calculate preview position
```

### State Management for Real-Time

```typescript
// apps/web/src/features/scripts/stores/

// Entity cache for instant autocomplete
export const entityCacheStore = create<EntityCacheState>((set, get) => ({
  characters: new Map<string, Character>(),
  locations: new Map<string, Location>(),
  props: new Map<string, Prop>(),
  
  // Optimistic updates
  pendingMutations: new Map<string, PendingMutation>(),
  
  // Sync state
  lastSyncVersion: 0,
  syncStatus: 'connected' | 'reconnecting' | 'offline',
  
  // Actions
  applyEntityUpdate: (event: EntitySyncEvent) => { /* ... */ },
  queueMutation: (mutation: Mutation) => { /* ... */ },
  reconcilePending: (serverResponse: unknown) => { /* ... */ },
}));

// Script-entity link tracking
export const scriptLinksStore = create<ScriptLinksState>((set, get) => ({
  links: new Map<string, EntityLinkRef[]>(), // blockId → links
  orphanedLinks: Set<string>,
  
  addLink: (link: EntityLinkRef) => { /* ... */ },
  removeLink: (blockId: string, entityId: string) => { /* ... */ },
  markOrphaned: (entityId: string) => { /* ... */ },
}));
```

### API Contract Extensions

```typescript
// packages/shared/src/contract/script-kb-integration.contract.ts
import { oc } from '@orpc/contract';
import z from 'zod';
import { authProcedure } from './procedures';

/**
 * Optimized autocomplete search for inline suggestions
 */
const autocompleteSearch = authProcedure
  .route({
    path: '/autocomplete',
    method: 'GET',
    summary: 'Fast entity search for autocomplete',
    description: 'Returns minimal entity data optimized for autocomplete rendering. Designed for <200ms response.',
  })
  .input(z.object({
    seriesId: z.string(),
    entityType: z.enum(['character', 'location', 'prop', 'wildcard', 'theme', 'storyArc']),
    query: z.string().max(100),
    limit: z.number().int().min(1).max(10).default(5),
    // Context for smarter suggestions
    context: z.object({
      scriptId: z.string().optional(),
      blockType: z.string().optional(),
      recentlyUsed: z.array(z.string()).max(10).optional(),
    }).optional(),
  }))
  .output(z.object({
    items: z.array(z.object({
      _id: z.string(),
      name: z.string(),
      avatarUrl: z.string().optional(),
      preview: z.string().optional(), // First trait, tag, or description snippet
      usageCount: z.number().optional(), // For sorting by frequency
    })),
    timing: z.object({
      queryMs: z.number(),
      totalMs: z.number(),
    }),
  }));

/**
 * Bulk update entity appearances from script save
 */
const syncAppearances = authProcedure
  .route({
    path: '/sync-appearances',
    method: 'POST',
    summary: 'Bulk sync entity appearances from script',
    description: 'Called on script save to update all character/prop/location appearances. Handles additions and removals.',
  })
  .input(z.object({
    scriptId: z.string(),
    seriesId: z.string(),
    appearances: z.array(z.object({
      entityType: z.enum(['character', 'location', 'prop']),
      entityId: z.string(),
      sceneRef: z.string(),
      sceneId: z.string().optional(),
      linkType: z.enum(['primary', 'mention', 'reference']),
    })),
    // Previous appearances for diff calculation
    previousVersion: z.number().optional(),
  }))
  .output(z.object({
    updated: z.number(),
    added: z.number(),
    removed: z.number(),
    version: z.number(),
  }));

/**
 * Create entity inline from script editor
 */
const quickCreateEntity = authProcedure
  .route({
    path: '/quick-create',
    method: 'POST',
    summary: 'Quick create entity from script autocomplete',
    description: 'Creates minimal entity for immediate use in script. User can enrich later.',
  })
  .input(z.object({
    seriesId: z.string(),
    entityType: z.enum(['character', 'location', 'prop', 'wildcard']),
    name: z.string().min(1).max(100),
    // Optional enrichment
    description: z.string().optional(),
    // For immediate appearance tracking
    initialAppearance: z.object({
      scriptId: z.string(),
      sceneRef: z.string(),
    }).optional(),
  }))
  .output(z.object({
    entity: z.object({
      _id: z.string(),
      name: z.string(),
      seriesId: z.string(),
    }),
  }));

/**
 * Auto-create or link Scene entity for scene heading
 */
const ensureScene = authProcedure
  .route({
    path: '/ensure-scene',
    method: 'POST',
    summary: 'Create or retrieve Scene entity for script scene',
    description: 'Idempotent operation to ensure a Scene entity exists for a script scene. Creates if needed, returns existing if found.',
  })
  .input(z.object({
    scriptId: z.string(),
    seriesId: z.string(),
    heading: z.string(),
    sceneNumber: z.number().int().min(1),
    locationId: z.string().optional(),
    timeOfDay: z.string().optional(),
  }))
  .output(z.object({
    scene: z.object({
      _id: z.string(),
      heading: z.string(),
      sceneNumber: z.number(),
      locationId: z.string().optional(),
      isNew: z.boolean(),
    }),
  }));

/**
 * Subscribe to entity updates (WebSocket-ready polling fallback)
 */
const pollEntityUpdates = authProcedure
  .route({
    path: '/poll-updates',
    method: 'GET',
    summary: 'Poll for entity updates since version',
    description: 'Long-polling endpoint for entity sync. Returns updates since client version. Will be replaced by WebSocket in collaboration epic.',
  })
  .input(z.object({
    seriesId: z.string(),
    sinceVersion: z.number().int().min(0),
    entityTypes: z.array(z.enum(['character', 'location', 'prop', 'scene', 'wildcard', 'theme', 'storyArc'])).optional(),
    timeout: z.number().int().min(1000).max(30000).default(15000),
  }))
  .output(z.object({
    updates: z.array(z.object({
      entityType: z.string(),
      entityId: z.string(),
      action: z.enum(['created', 'updated', 'deleted']),
      patch: z.record(z.unknown()).optional(),
      timestamp: z.coerce.date(),
    })),
    currentVersion: z.number(),
    hasMore: z.boolean(),
  }));

export const scriptKBIntegrationContract = oc.prefix('/script-kb').router({
  autocompleteSearch,
  syncAppearances,
  quickCreateEntity,
  ensureScene,
  pollEntityUpdates,
});
```

---

## Real-Time Collaboration Architecture

### Sync Strategy

The system uses **optimistic UI with server reconciliation**, designed to transition smoothly to WebSocket-based real-time collaboration.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Current Architecture                              │
│                         (Polling + Optimistic Updates)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    Mutation    ┌──────────────┐    REST    ┌───────────┐ │
│  │   Script     │──────────────▶│   Entity     │──────────▶│   API     │ │
│  │   Editor     │               │   Cache      │◀──────────│   Server  │ │
│  └──────────────┘◀──────────────└──────────────┘   Poll    └───────────┘ │
│         │         Optimistic          │                                    │
│         │                             │                                    │
│         ▼                             ▼                                    │
│  ┌──────────────┐              ┌──────────────┐                           │
│  │   TipTap     │              │   Offline    │                           │
│  │   State      │              │   Queue      │                           │
│  └──────────────┘              └──────────────┘                           │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                          Future Architecture                                 │
│                    (WebSocket + Operational Transform)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐   Operations  ┌──────────────┐  WebSocket ┌───────────┐ │
│  │   Script     │──────────────▶│   Yjs/OT     │◀─────────▶│   Collab  │ │
│  │   Editor     │◀──────────────│   Provider   │           │   Server  │ │
│  └──────────────┘   Transforms  └──────────────┘           └───────────┘ │
│         │                             │                          │         │
│         │                             │                          │         │
│         ▼                             ▼                          ▼         │
│  ┌──────────────┐              ┌──────────────┐         ┌───────────────┐ │
│  │   TipTap     │              │   Entity     │◀───────▶│   Entity Sync │ │
│  │   Y.Doc      │              │   Events     │         │   WebSocket   │ │
│  └──────────────┘              └──────────────┘         └───────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Version Tracking

Each entity and script maintains a monotonic version number for conflict detection:

```typescript
interface VersionedEntity {
  _id: string;
  _version: number; // Incremented on every mutation
  _lastModifiedBy: string; // userId for conflict attribution
  _lastModifiedAt: Date;
}

// Conflict resolution
type ConflictStrategy = 
  | 'last-write-wins'      // Current default
  | 'merge-fields'         // Field-level merge for non-conflicting changes
  | 'manual-resolve'       // Surface to user (future)
  | 'operational-transform'; // CRDT/OT for character-level (future)
```

### Event-Driven Updates

```typescript
// apps/web/src/features/scripts/hooks/use-entity-sync.ts
import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface UseEntitySyncOptions {
  seriesId: string;
  enabled?: boolean;
  pollInterval?: number; // Will become WebSocket in future
}

export function useEntitySync({ seriesId, enabled = true, pollInterval = 5000 }: UseEntitySyncOptions) {
  const queryClient = useQueryClient();
  const versionRef = useRef(0);
  
  // Polling implementation (replaced by WebSocket later)
  const { data } = useQuery({
    queryKey: ['entity-sync', seriesId, versionRef.current],
    queryFn: () => tanstackRPC.scriptKBIntegration.pollEntityUpdates.call({
      input: {
        seriesId,
        sinceVersion: versionRef.current,
        timeout: pollInterval,
      },
    }),
    enabled,
    refetchInterval: pollInterval,
    refetchIntervalInBackground: false,
  });
  
  useEffect(() => {
    if (!data?.updates.length) return;
    
    // Update version tracker
    versionRef.current = data.currentVersion;
    
    // Apply updates to relevant caches
    for (const update of data.updates) {
      const queryKey = getQueryKeyForEntity(update.entityType, update.entityId);
      
      switch (update.action) {
        case 'updated':
          queryClient.setQueryData(queryKey, (old: unknown) => ({
            ...old,
            ...update.patch,
          }));
          break;
        case 'deleted':
          queryClient.removeQueries({ queryKey });
          // Mark links as orphaned
          scriptLinksStore.getState().markOrphaned(update.entityId);
          break;
        case 'created':
          queryClient.invalidateQueries({ queryKey: getListQueryKey(update.entityType) });
          break;
      }
    }
  }, [data, queryClient]);
  
  return {
    isConnected: true, // Will reflect WebSocket state in future
    lastSyncVersion: versionRef.current,
  };
}
```

### Offline Support

```typescript
// apps/web/src/features/scripts/hooks/use-offline-queue.ts
import { openDB, type IDBPDatabase } from 'idb';

interface QueuedMutation {
  id: string;
  type: 'link' | 'unlink' | 'create' | 'update';
  payload: unknown;
  timestamp: number;
  retryCount: number;
}

export function useOfflineQueue() {
  const dbRef = useRef<IDBPDatabase | null>(null);
  
  useEffect(() => {
    const init = async () => {
      dbRef.current = await openDB('kaeri-offline', 1, {
        upgrade(db) {
          db.createObjectStore('mutations', { keyPath: 'id' });
        },
      });
    };
    init();
  }, []);
  
  const queueMutation = async (mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>) => {
    if (!dbRef.current) return;
    
    const entry: QueuedMutation = {
      id: crypto.randomUUID(),
      ...mutation,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    await dbRef.current.add('mutations', entry);
  };
  
  const processPendingMutations = async () => {
    if (!dbRef.current || !navigator.onLine) return;
    
    const mutations = await dbRef.current.getAll('mutations');
    
    for (const mutation of mutations) {
      try {
        await applyMutation(mutation);
        await dbRef.current.delete('mutations', mutation.id);
      } catch (error) {
        // Increment retry count, remove if too many failures
        if (mutation.retryCount >= 3) {
          await dbRef.current.delete('mutations', mutation.id);
          // Surface to user
        } else {
          await dbRef.current.put('mutations', {
            ...mutation,
            retryCount: mutation.retryCount + 1,
          });
        }
      }
    }
  };
  
  // Process on reconnect
  useEffect(() => {
    const handleOnline = () => processPendingMutations();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);
  
  return { queueMutation, processPendingMutations };
}
```

---

## Data Flow Diagrams

### Character Autocomplete Flow

```
User types "JO" in Character block
         │
         ▼
┌─────────────────────────────────┐
│ CharacterSuggestion Extension   │
│ - Detect typing in char block   │
│ - Debounce 150ms                │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ useCharacterSuggestions Hook    │
│ - Check local cache first       │
│ - Query API if cache miss/stale │
└─────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────────────────────┐
│ Cache  │ │ API: autocompleteSearch│
│ Hit    │ │ - seriesId, query, ctx │
└────────┘ └────────────────────────┘
    │         │
    └────┬────┘
         ▼
┌─────────────────────────────────┐
│ EntityAutocomplete Component    │
│ - Render suggestion list        │
│ - Handle keyboard navigation    │
│ - Show "+ Create" option        │
└─────────────────────────────────┘
         │
         │ User selects character
         ▼
┌─────────────────────────────────┐
│ Insert & Link                   │
│ - Set node text to char name    │
│ - Set node attr characterId     │
│ - Add to scriptLinksStore       │
└─────────────────────────────────┘
         │
         │ On script save
         ▼
┌─────────────────────────────────┐
│ API: syncAppearances            │
│ - Batch update appearances[]    │
│ - Return new version number     │
└─────────────────────────────────┘
```

### Scene Heading → Scene Entity Flow

```
User completes scene heading "INT. COFFEE SHOP - MORNING"
         │
         ▼
┌─────────────────────────────────┐
│ SceneMetadata Extension         │
│ - Parse heading structure       │
│ - Match location from KB        │
│ - Extract time of day           │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ useSceneAutoCreate Hook         │
│ - Check if scene exists         │
│ - Calculate scene number        │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ API: ensureScene                │
│ - Idempotent create/retrieve    │
│ - Link locationId if matched    │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Update Node Attributes          │
│ - sceneId = response._id        │
│ - locationId = matched location │
└─────────────────────────────────┘
         │
         │ User opens Scene Details
         ▼
┌─────────────────────────────────┐
│ SceneMetadataPanel Component    │
│ - Fetch full Scene entity       │
│ - Display/edit metadata         │
│ - Link arcs, timeline           │
└─────────────────────────────────┘
```

### Real-Time Entity Update Flow

```
User B renames character "JOHN" → "JOHNNY" in KB panel
         │
         ▼
┌─────────────────────────────────┐
│ useUpdateCharacter Mutation     │
│ - Optimistic update in cache    │
│ - API call to update            │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Server: Update + Increment Ver  │
│ - character._version++          │
│ - Broadcast to poll listeners   │
└─────────────────────────────────┘
         │
         │ Poll interval triggers for User A
         ▼
┌─────────────────────────────────┐
│ useEntitySync Hook (User A)     │
│ - Receive update in poll        │
│ - Update local cache            │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ useSyncReconciler Hook          │
│ - Find blocks with characterId  │
│ - Update displayed names        │
│ - Preserve cursor position      │
└─────────────────────────────────┘
         │
         ▼
Script editor shows "JOHNNY" without user refresh
```

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Autocomplete suggestions appear within 200ms of trigger for 95% of requests on a series with 200 entities.
- **SC-002**: Entity preview cards load within 500ms including image assets for 95% of hovers.
- **SC-003**: Real-time entity updates propagate to other tabs/users within 2 seconds via polling (will improve with WebSocket).
- **SC-004**: Script with 100+ entity links maintains 60fps scroll performance.
- **SC-005**: Offline mutations successfully sync within 10 seconds of reconnection for 99% of cases.
- **SC-006**: Character appearances tracked with 99% accuracy compared to manual tagging on a 50-scene test script.
- **SC-007**: Scene entities auto-created for 100% of new scene headings within 1 second of heading confirmation.
- **SC-008**: Quick-create entity flow completes in under 3 user interactions from autocomplete trigger.

---

## Implementation Phases

### Phase 1: Core Autocomplete Infrastructure (Week 1-2)

**Goal**: Character and Location autocomplete with linking

Tasks:
- [ ] Create `EntityMention` TipTap extension with suggestion plugin
- [ ] Create `EntityAutocomplete` component with keyboard navigation
- [ ] Create `useCharacterSuggestions` hook with caching
- [ ] Implement character autocomplete in Character blocks
- [ ] Add `characterId` attribute to Character node
- [ ] Create `LocationSuggestion` extension for scene headings
- [ ] Implement location autocomplete after INT./EXT.
- [ ] Add `locationId` attribute to SceneHeading node
- [ ] Create `autocompleteSearch` API endpoint
- [ ] Add quick-create flow with modal integration

### Phase 2: Scene Entity Integration (Week 2-3)

**Goal**: Automatic Scene entity creation and metadata editing

Tasks:
- [ ] Create `SceneMetadata` TipTap extension
- [ ] Implement `useSceneAutoCreate` hook
- [ ] Create `ensureScene` API endpoint
- [ ] Create `SceneMetadataPanel` component
- [ ] Add scene number calculation logic
- [ ] Link scene heading to Scene entity
- [ ] Implement scene details quick editor

### Phase 3: Prop & Extended Mentions (Week 3-4)

**Goal**: Prop mentions and character mentions in action blocks

Tasks:
- [ ] Implement `#` trigger for prop autocomplete
- [ ] Implement `@` trigger for character mentions in action
- [ ] Create mention mark styling (highlighted text)
- [ ] Track mentions in node attributes
- [ ] Create `syncAppearances` API endpoint
- [ ] Implement appearance tracking on script save

### Phase 4: Real-Time Sync Foundation (Week 4-5)

**Goal**: Entity updates reflect across tabs/users

Tasks:
- [ ] Create `pollEntityUpdates` API endpoint
- [ ] Implement `useEntitySync` hook with polling
- [ ] Create `useSyncReconciler` for editor updates
- [ ] Implement version tracking on entities
- [ ] Handle entity deletion gracefully
- [ ] Create `useOfflineQueue` with IndexedDB
- [ ] Test cross-tab synchronization

### Phase 5: Preview & Story Features (Week 5-6)

**Goal**: Hover previews, story arc, timeline, wildcard integration

Tasks:
- [ ] Create `EntityPreviewCard` component
- [ ] Implement hover delay and positioning
- [ ] Add story arc linking in scene metadata
- [ ] Add timeline linking in scene metadata
- [ ] Implement `!` trigger for wildcard references
- [ ] Create wildcard reference styling

### Phase 6: Theme & Polish (Week 6-7)

**Goal**: Theme tagging and performance optimization

Tasks:
- [ ] Implement text selection → theme tagging
- [ ] Create theme highlight rendering
- [ ] Optimize for large scripts (1000+ blocks)
- [ ] Performance profiling and fixes
- [ ] Comprehensive integration testing
- [ ] Documentation and examples

---

## File Structure

```
apps/web/src/features/scripts/
├── extensions/
│   ├── entity-mention.ts           # NEW: @/# mention plugin
│   ├── location-suggestion.ts      # NEW: Scene heading location
│   ├── scene-metadata.ts           # NEW: Scene entity linking
│   ├── theme-mark.ts               # NEW: Theme tag marks
│   └── ...existing extensions
├── components/
│   ├── entity-autocomplete/        # NEW: Autocomplete UI
│   │   ├── entity-autocomplete.tsx
│   │   ├── suggestion-list.tsx
│   │   ├── create-entity-option.tsx
│   │   └── index.ts
│   ├── entity-preview/             # NEW: Hover previews
│   │   ├── entity-preview-card.tsx
│   │   ├── character-preview.tsx
│   │   ├── location-preview.tsx
│   │   └── index.ts
│   ├── scene-editor/               # NEW: Scene metadata
│   │   ├── scene-metadata-panel.tsx
│   │   ├── scene-arc-linker.tsx
│   │   ├── scene-timeline-linker.tsx
│   │   └── index.ts
│   └── ...existing components
├── hooks/
│   ├── use-character-suggestions.ts  # NEW
│   ├── use-location-suggestions.ts   # NEW
│   ├── use-prop-suggestions.ts       # NEW
│   ├── use-entity-link.ts            # NEW
│   ├── use-scene-auto-create.ts      # NEW
│   ├── use-appearance-tracker.ts     # NEW
│   ├── use-entity-sync.ts            # NEW
│   ├── use-sync-reconciler.ts        # NEW
│   ├── use-offline-queue.ts          # NEW
│   └── use-entity-preview.ts         # NEW
├── stores/
│   ├── entity-cache.store.ts         # NEW: Zustand store
│   └── script-links.store.ts         # NEW: Link tracking
└── types/
    └── entity-integration.ts         # NEW: Shared types

packages/shared/src/contract/
└── script-kb-integration.contract.ts # NEW: API contract

apps/server/src/routers/
└── script-kb-integration.router.ts   # NEW: API handlers
```

---

## Testing Strategy

### Unit Tests

- Extension suggestion triggering logic
- Autocomplete filtering and sorting
- Scene heading parsing
- Version conflict detection
- Offline queue operations

### Integration Tests

- Character autocomplete → selection → linking flow
- Scene heading → Scene entity creation
- Entity rename propagation across tabs
- Appearance tracking accuracy
- Offline mutation replay

### E2E Tests

- Complete writing session with entity linking
- Cross-tab synchronization scenario
- Large script performance (500+ blocks)
- Network interruption recovery

---

## Migration Notes

### Existing Scripts

Scripts created before this feature will not have entity links. The system handles this gracefully:

1. **No Breaking Changes**: Old scripts load and function normally
2. **Progressive Enhancement**: Users can manually link entities by selecting text
3. **Auto-Detection** (optional future): Scan existing scripts to suggest entity links

### Data Migration

No database migration required. Entity linking is additive:
- New `_version` field added to entities (defaults to 1)
- Script content JSON gains optional node attributes
- Appearance arrays may grow but existing data preserved
