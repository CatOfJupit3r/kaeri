/**
 * Entity Integration Types
 *
 * Type definitions for Script × Knowledge Base integration.
 * Designed for real-time collaboration readiness.
 */
import type {
  AppearanceRecord,
  AutocompleteEntityType,
  AutocompleteSuggestion,
  EntitySyncUpdate,
  LinkType,
  SyncAction,
} from '@kaeri/shared/contract/script-kb-integration.contract';

// ============================================================================
// Node Attribute Types
// ============================================================================

/**
 * Extended attributes for Character block nodes
 */
export interface iCharacterNodeAttrs {
  characterId: string | null;
  class: string;
}

/**
 * Extended attributes for Scene Heading block nodes
 */
export interface iSceneHeadingNodeAttrs {
  sceneId: string | null;
  locationId: string | null;
  timeOfDay: string | null;
  class: string;
}

/**
 * Entity mention within a block
 */
export interface iEntityMentionAttrs {
  type: 'character' | 'prop' | 'wildcard';
  entityId: string;
  start: number;
  end: number;
}

/**
 * Theme tag on a text range
 */
export interface iThemeTagAttrs {
  themeId: string;
  start: number;
  end: number;
}

/**
 * Extended attributes for Action block nodes
 */
export interface iActionNodeAttrs {
  mentions: iEntityMentionAttrs[];
  themeTags: iThemeTagAttrs[];
  class: string;
}

// ============================================================================
// Entity Link Tracking
// ============================================================================

/**
 * Reference to an entity link within a script
 */
export interface iEntityLinkRef {
  scriptId: string;
  blockId: string;
  entityType: AutocompleteEntityType;
  entityId: string;
  linkType: LinkType;
  position?: { start: number; end: number };
}

/**
 * Tracked entity with current state
 */
export interface iTrackedEntity {
  _id: string;
  name: string;
  entityType: AutocompleteEntityType;
  avatarUrl?: string;
  isOrphaned: boolean;
  lastSyncVersion: number;
}

// ============================================================================
// Autocomplete Types
// ============================================================================

/**
 * Configuration for entity autocomplete behavior
 */
export interface iEntityAutocompleteConfig {
  /** Trigger character(s) that activate autocomplete */
  trigger: string | string[];
  /** Entity types to search */
  entityTypes: AutocompleteEntityType[];
  /** Block types where this autocomplete is allowed */
  allowedBlockTypes: string[];
  /** Minimum characters before searching (0 = show on empty) */
  minChars: number;
  /** Debounce delay in milliseconds */
  debounceMs: number;
  /** Maximum suggestions to show */
  limit: number;
  /** Whether to allow creating new entities inline */
  allowCreate: boolean;
}

/**
 * State for autocomplete dropdown
 */
export interface iAutocompleteState {
  isOpen: boolean;
  query: string;
  suggestions: AutocompleteSuggestion[];
  selectedIndex: number;
  isLoading: boolean;
  error: Error | null;
  position: { top: number; left: number } | null;
}

/**
 * Autocomplete selection result
 */
export interface iAutocompleteSelection {
  entityId: string;
  entityType: AutocompleteEntityType;
  name: string;
  isNew: boolean;
}

// ============================================================================
// Scene Heading Parsing
// ============================================================================

/**
 * Parsed scene heading components
 */
export interface iParsedSceneHeading {
  /** Interior/Exterior indicator */
  interior: 'INT' | 'EXT' | 'INT/EXT' | null;
  /** Location name */
  location: string;
  /** Time of day */
  timeOfDay: string | null;
  /** Raw heading text */
  raw: string;
  /** Whether the heading is complete */
  isComplete: boolean;
}

/**
 * Scene heading autocomplete stage
 */
export type SceneHeadingStage = 'interior' | 'location' | 'timeOfDay' | 'complete';

// ============================================================================
// Scene Tracking
// ============================================================================

/**
 * Scene boundary information in a document
 */
export interface iSceneBoundary {
  /** Scene number (1-indexed) */
  sceneNumber: number;
  /** Heading block node ID */
  headingBlockId: string;
  /** Start position in document */
  startPos: number;
  /** End position in document (before next scene or doc end) */
  endPos: number;
  /** Parsed heading */
  heading: iParsedSceneHeading;
  /** Linked scene entity ID (if exists) */
  sceneId: string | null;
  /** Linked location entity ID (if matched) */
  locationId: string | null;
}

/**
 * Characters and props appearing in a scene
 */
export interface iSceneEntitySummary {
  characterIds: string[];
  propIds: string[];
  mentionCount: number;
}

// ============================================================================
// Real-Time Sync Types
// ============================================================================

/**
 * Sync connection status
 */
export type SyncStatus = 'connected' | 'reconnecting' | 'offline' | 'error';

/**
 * Pending mutation in offline queue
 */
export interface iPendingMutation {
  id: string;
  type: 'link' | 'unlink' | 'create' | 'update' | 'appearance';
  payload: unknown;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

/**
 * Entity update event for editor reconciliation
 */
export interface iEntityUpdateEvent {
  entityType: AutocompleteEntityType;
  entityId: string;
  action: SyncAction;
  previousName?: string;
  newName?: string;
  patch?: Record<string, unknown>;
}

/**
 * Conflict resolution strategy
 */
export type ConflictStrategy = 'last-write-wins' | 'merge-fields' | 'manual-resolve';

// ============================================================================
// Preview Types
// ============================================================================

/**
 * Entity preview state
 */
export interface iEntityPreviewState {
  isVisible: boolean;
  entityId: string | null;
  entityType: AutocompleteEntityType | null;
  position: { x: number; y: number } | null;
  triggerElement: HTMLElement | null;
}

/**
 * Character preview data
 */
export interface iCharacterPreviewData {
  _id: string;
  name: string;
  description?: string;
  traits: string[];
  avatarUrl?: string;
  relationshipCount: number;
  appearanceCount: number;
}

/**
 * Location preview data
 */
export interface iLocationPreviewData {
  _id: string;
  name: string;
  description?: string;
  images: Array<{ url: string; caption?: string }>;
  mood?: string;
  associatedProps: string[];
  usageCount: number;
}

/**
 * Prop preview data
 */
export interface iPropPreviewData {
  _id: string;
  name: string;
  description?: string;
  associationCount: number;
}

// ============================================================================
// Scene Metadata Quick Editor
// ============================================================================

/**
 * Scene metadata panel state
 */
export interface iSceneMetadataPanelState {
  isOpen: boolean;
  sceneId: string | null;
  position: { top: number } | null;
}

/**
 * Scene metadata form values
 */
export interface iSceneMetadataFormValues {
  emotionalTone?: string;
  conflict?: string;
  lighting?: string;
  sound?: string;
  camera?: string;
  storyNotes?: string;
  linkedArcIds: string[];
  linkedTimelineIds: string[];
}

// ============================================================================
// Store Types
// ============================================================================

/**
 * Entity cache store state
 */
export interface iEntityCacheState {
  /** Cached entities by type */
  entities: Map<string, iTrackedEntity>;

  /** Pending mutations awaiting server confirmation */
  pendingMutations: Map<string, iPendingMutation>;

  /** Current sync version */
  lastSyncVersion: number;

  /** Connection status */
  syncStatus: SyncStatus;

  /** Actions */
  getEntity: (entityId: string) => iTrackedEntity | undefined;
  setEntity: (entity: iTrackedEntity) => void;
  applyEntityUpdate: (update: EntitySyncUpdate) => void;
  queueMutation: (mutation: Omit<iPendingMutation, 'id' | 'timestamp' | 'retryCount'>) => string;
  resolveMutation: (mutationId: string) => void;
  setSyncStatus: (status: SyncStatus) => void;
}

/**
 * Script links store state
 */
export interface iScriptLinksState {
  /** Entity links indexed by block ID */
  linksByBlock: Map<string, iEntityLinkRef[]>;

  /** Entity links indexed by entity ID */
  linksByEntity: Map<string, iEntityLinkRef[]>;

  /** Set of orphaned entity IDs */
  orphanedEntityIds: Set<string>;

  /** Actions */
  addLink: (link: iEntityLinkRef) => void;
  removeLink: (blockId: string, entityId: string) => void;
  clearBlockLinks: (blockId: string) => void;
  markOrphaned: (entityId: string) => void;
  clearOrphaned: (entityId: string) => void;
  isOrphaned: (entityId: string) => boolean;
  getLinksForEntity: (entityId: string) => iEntityLinkRef[];
  getLinksForBlock: (blockId: string) => iEntityLinkRef[];
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * Return type for useCharacterSuggestions
 */
export interface iUseCharacterSuggestionsReturn {
  suggestions: AutocompleteSuggestion[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Return type for useLocationSuggestions
 */
export interface iUseLocationSuggestionsReturn {
  suggestions: AutocompleteSuggestion[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Return type for useEntitySync
 */
export interface iUseEntitySyncReturn {
  syncStatus: SyncStatus;
  lastSyncVersion: number;
  pendingCount: number;
  forceSync: () => Promise<void>;
}

/**
 * Return type for useEntityPreview
 */
export interface iUseEntityPreviewReturn {
  previewState: iEntityPreviewState;
  showPreview: (entityId: string, entityType: AutocompleteEntityType, element: HTMLElement) => void;
  hidePreview: () => void;
}

/**
 * Return type for useSceneAutoCreate
 */
export interface iUseSceneAutoCreateReturn {
  createOrLinkScene: (heading: iParsedSceneHeading, sceneNumber: number) => Promise<string>;
  isCreating: boolean;
}

/**
 * Return type for useAppearanceTracker
 */
export interface iUseAppearanceTrackerReturn {
  extractAppearances: () => AppearanceRecord[];
  syncAppearances: () => Promise<void>;
  isSyncing: boolean;
}
