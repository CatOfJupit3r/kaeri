import { oc } from '@orpc/contract';
import z from 'zod';

import { authProcedure } from './procedures';

// ============================================================================
// Shared Schemas
// ============================================================================

/**
 * Entity types that support autocomplete integration
 */
export const autocompleteEntityTypeSchema = z.enum(['character', 'location', 'prop', 'wildcard', 'theme', 'storyArc']);
export const AUTOCOMPLETE_ENTITY_TYPES = autocompleteEntityTypeSchema.enum;
export type AutocompleteEntityType = z.infer<typeof autocompleteEntityTypeSchema>;

/**
 * Entity types that can track appearances
 */
export const appearanceEntityTypeSchema = z.enum(['character', 'location', 'prop']);
export const APPEARANCE_ENTITY_TYPES = appearanceEntityTypeSchema.enum;
export type AppearanceEntityType = z.infer<typeof appearanceEntityTypeSchema>;

/**
 * Link types for entity connections to script blocks
 */
export const linkTypeSchema = z.enum(['primary', 'mention', 'reference', 'themeTag']);
export const LINK_TYPES = linkTypeSchema.enum;
export type LinkType = z.infer<typeof linkTypeSchema>;

/**
 * Sync event action types
 */
export const syncActionSchema = z.enum(['created', 'updated', 'deleted']);
export const SYNC_ACTIONS = syncActionSchema.enum;
export type SyncAction = z.infer<typeof syncActionSchema>;

/**
 * Autocomplete suggestion item (minimal for speed)
 */
export const autocompleteSuggestionSchema = z.object({
  _id: z.string(),
  name: z.string(),
  avatarUrl: z.string().url().optional(),
  preview: z.string().optional(),
  usageCount: z.number().int().min(0).optional(),
});
export type AutocompleteSuggestion = z.infer<typeof autocompleteSuggestionSchema>;

/**
 * Appearance record for tracking entity presence in scripts
 */
export const appearanceRecordSchema = z.object({
  entityType: appearanceEntityTypeSchema,
  entityId: z.string(),
  sceneRef: z.string(),
  sceneId: z.string().optional(),
  linkType: linkTypeSchema,
});
export type AppearanceRecord = z.infer<typeof appearanceRecordSchema>;

/**
 * Entity sync update payload
 */
export const entitySyncUpdateSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  action: syncActionSchema,
  patch: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.coerce.date(),
  version: z.number().int().min(1),
});
export type EntitySyncUpdate = z.infer<typeof entitySyncUpdateSchema>;

// ============================================================================
// Input/Output Schemas
// ============================================================================

/**
 * Context for smarter autocomplete suggestions
 */
const autocompleteContextSchema = z.object({
  scriptId: z.string().optional(),
  blockType: z.string().optional(),
  recentlyUsed: z.array(z.string()).max(10).optional(),
});

/**
 * API timing metrics for performance monitoring
 */
const timingMetricsSchema = z.object({
  queryMs: z.number(),
  totalMs: z.number(),
});

// ============================================================================
// Procedures
// ============================================================================

/**
 * Fast entity search optimized for inline autocomplete
 *
 * Design for <200ms response time:
 * - Returns minimal fields only
 * - Uses text indexes for fast matching
 * - Supports context-aware ranking (recently used first)
 */
const autocompleteSearch = authProcedure
  .route({
    path: '/autocomplete',
    method: 'GET',
    summary: 'Fast entity search for autocomplete',
    description:
      'Returns minimal entity data optimized for autocomplete rendering. Designed for <200ms response. Supports fuzzy matching and context-aware ranking.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      entityType: autocompleteEntityTypeSchema,
      query: z.string().max(100).default(''),
      limit: z.number().int().min(1).max(10).default(5),
      context: autocompleteContextSchema.optional(),
    }),
  )
  .output(
    z.object({
      items: z.array(autocompleteSuggestionSchema),
      timing: timingMetricsSchema,
    }),
  );

/**
 * Bulk sync entity appearances from script save
 *
 * Called on each script save to update all appearance tracking:
 * - Character.appearances[]
 * - Scene.characterIds[]
 * - Scene.propIds[]
 *
 * Handles additions and removals by diffing against previous state.
 */
const syncAppearances = authProcedure
  .route({
    path: '/sync-appearances',
    method: 'POST',
    summary: 'Bulk sync entity appearances from script',
    description:
      'Called on script save to update all character/prop/location appearances. Calculates diff from previous state, adds new appearances, removes stale ones.',
  })
  .input(
    z.object({
      scriptId: z.string(),
      seriesId: z.string(),
      appearances: z.array(appearanceRecordSchema),
      previousVersion: z.number().int().min(0).optional(),
    }),
  )
  .output(
    z.object({
      updated: z.number().int().min(0),
      added: z.number().int().min(0),
      removed: z.number().int().min(0),
      version: z.number().int().min(1),
    }),
  );

/**
 * Quick create entity from script autocomplete
 *
 * Creates minimal entity for immediate use in script.
 * User can enrich entity details later via KB panel.
 */
const quickCreateEntity = authProcedure
  .route({
    path: '/quick-create',
    method: 'POST',
    summary: 'Quick create entity from script autocomplete',
    description:
      'Creates minimal entity for immediate use in script. Returns entity ID for linking. User can enrich details later.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      entityType: z.enum(['character', 'location', 'prop', 'wildcard']),
      name: z.string().min(1).max(100).trim(),
      description: z.string().optional(),
      initialAppearance: z
        .object({
          scriptId: z.string(),
          sceneRef: z.string(),
        })
        .optional(),
    }),
  )
  .output(
    z.object({
      entity: z.object({
        _id: z.string(),
        name: z.string(),
        seriesId: z.string(),
      }),
    }),
  );

/**
 * Ensure Scene entity exists for a script scene
 *
 * Idempotent operation:
 * - If Scene exists for scriptId + sceneNumber, return it
 * - If not, create new Scene with provided data
 *
 * This enables automatic Scene creation as writers add scene headings.
 */
const ensureScene = authProcedure
  .route({
    path: '/ensure-scene',
    method: 'POST',
    summary: 'Create or retrieve Scene entity for script scene',
    description:
      'Idempotent operation to ensure a Scene entity exists for a script scene. Creates if needed, returns existing if found by scriptId + sceneNumber.',
  })
  .input(
    z.object({
      scriptId: z.string(),
      seriesId: z.string(),
      heading: z.string().min(1),
      sceneNumber: z.number().int().min(1),
      locationId: z.string().optional(),
      timeOfDay: z.string().optional(),
    }),
  )
  .output(
    z.object({
      scene: z.object({
        _id: z.string(),
        heading: z.string(),
        sceneNumber: z.number().int(),
        locationId: z.string().optional(),
        isNew: z.boolean(),
      }),
    }),
  );

/**
 * Poll for entity updates since a given version
 *
 * Long-polling endpoint for entity synchronization.
 * Returns updates since client's last known version.
 *
 * This will be replaced by WebSocket push in the collaboration epic,
 * but provides the same interface for seamless migration.
 *
 * Design for real-time collaboration readiness:
 * - Version-based change tracking
 * - Incremental patch delivery
 * - Timeout prevents hanging connections
 */
const pollEntityUpdates = authProcedure
  .route({
    path: '/poll-updates',
    method: 'GET',
    summary: 'Poll for entity updates since version',
    description:
      'Long-polling endpoint for entity sync. Returns updates since client version. Will be replaced by WebSocket in collaboration epic. Timeout prevents hanging.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      sinceVersion: z.number().int().min(0),
      entityTypes: z.array(autocompleteEntityTypeSchema).optional(),
      timeout: z.number().int().min(1000).max(30000).default(15000),
    }),
  )
  .output(
    z.object({
      updates: z.array(entitySyncUpdateSchema),
      currentVersion: z.number().int().min(0),
      hasMore: z.boolean(),
    }),
  );

/**
 * Get entity link references for a script
 *
 * Returns all entity links in a script for:
 * - Initial load state
 * - Validation after sync
 * - Orphan detection
 */
const getScriptEntityLinks = authProcedure
  .route({
    path: '/script-links',
    method: 'GET',
    summary: 'Get entity links for a script',
    description:
      'Returns all entity links in a script. Used for initial load and orphan detection when entities are deleted.',
  })
  .input(
    z.object({
      scriptId: z.string(),
      seriesId: z.string(),
    }),
  )
  .output(
    z.object({
      links: z.array(
        z.object({
          entityType: z.string(),
          entityId: z.string(),
          entityName: z.string(),
          exists: z.boolean(),
        }),
      ),
    }),
  );

/**
 * Validate entity links and report orphans
 *
 * Checks which linked entities still exist.
 * Returns list of orphaned (deleted) entity IDs.
 */
const validateEntityLinks = authProcedure
  .route({
    path: '/validate-links',
    method: 'POST',
    summary: 'Validate entity links exist',
    description: 'Checks array of entity references and returns which ones no longer exist (orphaned).',
  })
  .input(
    z.object({
      seriesId: z.string(),
      links: z.array(
        z.object({
          entityType: z.string(),
          entityId: z.string(),
        }),
      ),
    }),
  )
  .output(
    z.object({
      orphaned: z.array(z.string()),
      valid: z.array(z.string()),
    }),
  );

// ============================================================================
// Contract Export
// ============================================================================

const scriptKBIntegrationContract = oc.prefix('/script-kb').router({
  autocompleteSearch,
  syncAppearances,
  quickCreateEntity,
  ensureScene,
  pollEntityUpdates,
  getScriptEntityLinks,
  validateEntityLinks,
});

export default scriptKBIntegrationContract;
