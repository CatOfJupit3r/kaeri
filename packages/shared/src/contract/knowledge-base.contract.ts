import { oc } from '@orpc/contract';
import z from 'zod';

import { authProcedure } from './procedures';

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

const relationshipSchema = z.object({
  targetId: z.string(),
  type: z.string(),
  note: z.string().optional(),
});

const variationSchema = z.object({
  scriptId: z.string(),
  label: z.string(),
  notes: z.string().optional(),
});

const appearanceSchema = z.object({
  scriptId: z.string(),
  sceneRef: z.string(),
  locationId: z.string().optional(),
});

const characterSchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  traits: z.array(z.string()).optional(),
  relationships: z.array(relationshipSchema).optional(),
  variations: z.array(variationSchema).optional(),
  appearances: z.array(appearanceSchema).optional(),
  avatarUrl: z.string().url().optional(),
});

const locationSchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  appearances: z.array(appearanceSchema).optional(),
});

const propSchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  associations: z
    .array(
      z.object({
        characterId: z.string().optional(),
        locationId: z.string().optional(),
        scriptId: z.string().optional(),
        note: z.string().optional(),
      }),
    )
    .optional(),
});

const timelineEntrySchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  label: z.string(),
  order: z.number().optional(),
  timestamp: z.string().optional(),
  links: z.array(z.object({ entityType: z.string(), entityId: z.string() })).optional(),
});

const wildCardSchema = z.object({
  _id: z.string(),
  seriesId: z.string(),
  title: z.string(),
  body: z.string().optional(),
  tag: z.string().optional(),
});

const kbEntityUnion = z.discriminatedUnion('_type', [
  characterSchema.extend({ _type: z.literal('character') }),
  locationSchema.extend({ _type: z.literal('location') }),
  propSchema.extend({ _type: z.literal('prop') }),
  timelineEntrySchema.extend({ _type: z.literal('timeline') }),
  wildCardSchema.extend({ _type: z.literal('wildcard') }),
]);

const searchKB = authProcedure
  .route({
    path: '/search',
    method: 'GET',
    summary: 'Search knowledge base entities',
    description: 'Search across characters, locations, props, timeline entries, and wild cards for a series.',
  })
  .input(
    paginationSchema.merge(
      z.object({
        seriesId: z.string(),
        query: z.string().trim().optional(),
      }),
    ),
  )
  .output(z.object({ items: z.array(kbEntityUnion), total: z.number() }));

// Character CRUD
const characterCrud = {
  create: authProcedure
    .route({
      path: '/characters/create',
      method: 'POST',
      summary: 'Create character',
      description: 'Creates a character entity under a series.',
    })
    .input(
      z.object({
        seriesId: z.string(),
        value: characterSchema.omit({ _id: true, seriesId: true }),
      }),
    )
    .output(characterSchema),

  update: authProcedure
    .route({
      path: '/characters/update',
      method: 'PUT',
      summary: 'Update character',
      description: 'Updates fields on a character entity.',
    })
    .input(
      z.object({
        id: z.string(),
        seriesId: z.string(),
        patch: characterSchema.omit({ _id: true, seriesId: true }).partial(),
      }),
    )
    .output(characterSchema),

  remove: authProcedure
    .route({
      path: '/characters/delete',
      method: 'DELETE',
      summary: 'Delete character',
      description: 'Deletes a character entity. Implementations must guard against orphaning references.',
    })
    .input(z.object({ id: z.string(), seriesId: z.string() }))
    .output(z.object({ success: z.boolean() })),

  get: authProcedure
    .route({
      path: '/characters/get',
      method: 'GET',
      summary: 'Get character',
      description: 'Returns a character entity by ID. Uses NOT_FOUND for inaccessible resources.',
    })
    .input(z.object({ id: z.string(), seriesId: z.string() }))
    .output(characterSchema),

  list: authProcedure
    .route({
      path: '/characters/list',
      method: 'GET',
      summary: 'List characters',
      description: 'Lists character entities by series with pagination.',
    })
    .input(paginationSchema.merge(z.object({ seriesId: z.string() })))
    .output(z.object({ items: z.array(characterSchema), total: z.number() })),
} as const;

// Location CRUD
const locationCrud = {
  create: authProcedure
    .route({
      path: '/locations/create',
      method: 'POST',
      summary: 'Create location',
      description: 'Creates a location entity under a series.',
    })
    .input(
      z.object({
        seriesId: z.string(),
        value: locationSchema.omit({ _id: true, seriesId: true }),
      }),
    )
    .output(locationSchema),

  update: authProcedure
    .route({
      path: '/locations/update',
      method: 'PUT',
      summary: 'Update location',
      description: 'Updates fields on a location entity.',
    })
    .input(
      z.object({
        id: z.string(),
        seriesId: z.string(),
        patch: locationSchema.omit({ _id: true, seriesId: true }).partial(),
      }),
    )
    .output(locationSchema),

  remove: authProcedure
    .route({
      path: '/locations/delete',
      method: 'DELETE',
      summary: 'Delete location',
      description: 'Deletes a location entity. Implementations must guard against orphaning references.',
    })
    .input(z.object({ id: z.string(), seriesId: z.string() }))
    .output(z.object({ success: z.boolean() })),

  get: authProcedure
    .route({
      path: '/locations/get',
      method: 'GET',
      summary: 'Get location',
      description: 'Returns a location entity by ID. Uses NOT_FOUND for inaccessible resources.',
    })
    .input(z.object({ id: z.string(), seriesId: z.string() }))
    .output(locationSchema),

  list: authProcedure
    .route({
      path: '/locations/list',
      method: 'GET',
      summary: 'List locations',
      description: 'Lists location entities by series with pagination.',
    })
    .input(paginationSchema.merge(z.object({ seriesId: z.string() })))
    .output(z.object({ items: z.array(locationSchema), total: z.number() })),
} as const;

// Prop CRUD
const propCrud = {
  create: authProcedure
    .route({
      path: '/props/create',
      method: 'POST',
      summary: 'Create prop',
      description: 'Creates a prop entity under a series.',
    })
    .input(
      z.object({
        seriesId: z.string(),
        value: propSchema.omit({ _id: true, seriesId: true }),
      }),
    )
    .output(propSchema),

  update: authProcedure
    .route({
      path: '/props/update',
      method: 'PUT',
      summary: 'Update prop',
      description: 'Updates fields on a prop entity.',
    })
    .input(
      z.object({
        id: z.string(),
        seriesId: z.string(),
        patch: propSchema.omit({ _id: true, seriesId: true }).partial(),
      }),
    )
    .output(propSchema),

  remove: authProcedure
    .route({
      path: '/props/delete',
      method: 'DELETE',
      summary: 'Delete prop',
      description: 'Deletes a prop entity. Implementations must guard against orphaning references.',
    })
    .input(z.object({ id: z.string(), seriesId: z.string() }))
    .output(z.object({ success: z.boolean() })),

  get: authProcedure
    .route({
      path: '/props/get',
      method: 'GET',
      summary: 'Get prop',
      description: 'Returns a prop entity by ID. Uses NOT_FOUND for inaccessible resources.',
    })
    .input(z.object({ id: z.string(), seriesId: z.string() }))
    .output(propSchema),

  list: authProcedure
    .route({
      path: '/props/list',
      method: 'GET',
      summary: 'List props',
      description: 'Lists prop entities by series with pagination.',
    })
    .input(paginationSchema.merge(z.object({ seriesId: z.string() })))
    .output(z.object({ items: z.array(propSchema), total: z.number() })),
} as const;

// Timeline CRUD
const timelineCrud = {
  create: authProcedure
    .route({
      path: '/timeline/create',
      method: 'POST',
      summary: 'Create timeline entry',
      description: 'Creates a timeline entry entity under a series.',
    })
    .input(
      z.object({
        seriesId: z.string(),
        value: timelineEntrySchema.omit({ _id: true, seriesId: true }),
      }),
    )
    .output(timelineEntrySchema),

  update: authProcedure
    .route({
      path: '/timeline/update',
      method: 'PUT',
      summary: 'Update timeline entry',
      description: 'Updates fields on a timeline entry entity.',
    })
    .input(
      z.object({
        id: z.string(),
        seriesId: z.string(),
        patch: timelineEntrySchema.omit({ _id: true, seriesId: true }).partial(),
      }),
    )
    .output(timelineEntrySchema),

  remove: authProcedure
    .route({
      path: '/timeline/delete',
      method: 'DELETE',
      summary: 'Delete timeline entry',
      description: 'Deletes a timeline entry entity. Implementations must guard against orphaning references.',
    })
    .input(z.object({ id: z.string(), seriesId: z.string() }))
    .output(z.object({ success: z.boolean() })),

  get: authProcedure
    .route({
      path: '/timeline/get',
      method: 'GET',
      summary: 'Get timeline entry',
      description: 'Returns a timeline entry entity by ID. Uses NOT_FOUND for inaccessible resources.',
    })
    .input(z.object({ id: z.string(), seriesId: z.string() }))
    .output(timelineEntrySchema),

  list: authProcedure
    .route({
      path: '/timeline/list',
      method: 'GET',
      summary: 'List timeline entries',
      description: 'Lists timeline entry entities by series with pagination.',
    })
    .input(paginationSchema.merge(z.object({ seriesId: z.string() })))
    .output(z.object({ items: z.array(timelineEntrySchema), total: z.number() })),
} as const;

// WildCard CRUD
const wildCardCrud = {
  create: authProcedure
    .route({
      path: '/wildcards/create',
      method: 'POST',
      summary: 'Create wildcard',
      description: 'Creates a wildcard entity under a series.',
    })
    .input(
      z.object({
        seriesId: z.string(),
        value: wildCardSchema.omit({ _id: true, seriesId: true }),
      }),
    )
    .output(wildCardSchema),

  update: authProcedure
    .route({
      path: '/wildcards/update',
      method: 'PUT',
      summary: 'Update wildcard',
      description: 'Updates fields on a wildcard entity.',
    })
    .input(
      z.object({
        id: z.string(),
        seriesId: z.string(),
        patch: wildCardSchema.omit({ _id: true, seriesId: true }).partial(),
      }),
    )
    .output(wildCardSchema),

  remove: authProcedure
    .route({
      path: '/wildcards/delete',
      method: 'DELETE',
      summary: 'Delete wildcard',
      description: 'Deletes a wildcard entity. Implementations must guard against orphaning references.',
    })
    .input(z.object({ id: z.string(), seriesId: z.string() }))
    .output(z.object({ success: z.boolean() })),

  get: authProcedure
    .route({
      path: '/wildcards/get',
      method: 'GET',
      summary: 'Get wildcard',
      description: 'Returns a wildcard entity by ID. Uses NOT_FOUND for inaccessible resources.',
    })
    .input(z.object({ id: z.string(), seriesId: z.string() }))
    .output(wildCardSchema),

  list: authProcedure
    .route({
      path: '/wildcards/list',
      method: 'GET',
      summary: 'List wildcards',
      description: 'Lists wildcard entities by series with pagination.',
    })
    .input(paginationSchema.merge(z.object({ seriesId: z.string() })))
    .output(z.object({ items: z.array(wildCardSchema), total: z.number() })),
} as const;

const addRelationship = authProcedure
  .route({
    path: '/characters/add-relationship',
    method: 'POST',
    summary: 'Add a character relationship',
    description: 'Adds a relationship from one character to another with a type and optional note.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      characterId: z.string(),
      relationship: relationshipSchema,
    }),
  )
  .output(characterSchema);

const removeRelationship = authProcedure
  .route({
    path: '/characters/remove-relationship',
    method: 'DELETE',
    summary: 'Remove a character relationship',
    description: 'Removes a relationship between characters.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      characterId: z.string(),
      targetId: z.string(),
    }),
  )
  .output(characterSchema);

const addAppearance = authProcedure
  .route({
    path: '/characters/add-appearance',
    method: 'POST',
    summary: 'Add a character appearance',
    description: 'Adds a scene appearance for a character with optional location.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      characterId: z.string(),
      appearance: appearanceSchema,
    }),
  )
  .output(characterSchema);

const removeAppearance = authProcedure
  .route({
    path: '/characters/remove-appearance',
    method: 'DELETE',
    summary: 'Remove a character appearance',
    description: 'Removes a scene appearance for a character.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      characterId: z.string(),
      scriptId: z.string(),
      sceneRef: z.string(),
    }),
  )
  .output(characterSchema);

const addVariation = authProcedure
  .route({
    path: '/characters/add-variation',
    method: 'POST',
    summary: 'Add a character variation',
    description: 'Adds a script-specific variation for a character (e.g., different timelines).',
  })
  .input(
    z.object({
      seriesId: z.string(),
      characterId: z.string(),
      variation: variationSchema,
    }),
  )
  .output(characterSchema);

const updateVariation = authProcedure
  .route({
    path: '/characters/update-variation',
    method: 'PUT',
    summary: 'Update a character variation',
    description: 'Updates a script-specific variation for a character by scriptId and label.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      characterId: z.string(),
      scriptId: z.string(),
      label: z.string(),
      patch: variationSchema.partial().omit({ scriptId: true }),
    }),
  )
  .output(characterSchema);

const removeVariation = authProcedure
  .route({
    path: '/characters/remove-variation',
    method: 'DELETE',
    summary: 'Remove a character variation',
    description: 'Removes a character variation by script.',
  })
  .input(
    z.object({
      seriesId: z.string(),
      characterId: z.string(),
      scriptId: z.string(),
      label: z.string().optional(),
    }),
  )
  .output(characterSchema);

const knowledgeBaseContract = oc.prefix('/knowledge-base').router({
  searchKB,
  characters: characterCrud,
  locations: locationCrud,
  props: propCrud,
  timeline: timelineCrud,
  wildcards: wildCardCrud,
  addRelationship,
  removeRelationship,
  addAppearance,
  removeAppearance,
  addVariation,
  updateVariation,
  removeVariation,
});

export default knowledgeBaseContract;
export {
  characterSchema,
  locationSchema,
  propSchema,
  timelineEntrySchema,
  wildCardSchema,
  relationshipSchema,
  variationSchema,
  appearanceSchema,
};
