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

const buildCrud = <TSchema extends z.ZodObject>(basePath: string, schema: TSchema) => {
  const create = authProcedure
    .route({
      path: `/${basePath}/create`,
      method: 'POST',
      summary: `Create ${basePath}`,
      description: `Creates a ${basePath} entity under a series.`,
    })
    .input(z.object({ seriesId: z.string(), value: schema.clone().omit({ _id: true, seriesId: true }) }))
    .output(schema);

  const update = authProcedure
    .route({
      path: `/${basePath}/update`,
      method: 'PUT',
      summary: `Update ${basePath}`,
      description: `Updates fields on a ${basePath} entity.`,
    })
    .input(
      z.object({
        id: z.string(),
        seriesId: z.string(),
        patch: schema.clone().partial().omit({ _id: true, seriesId: true }),
      }),
    )
    .output(schema);

  const remove = authProcedure
    .route({
      path: `/${basePath}/delete`,
      method: 'DELETE',
      summary: `Delete ${basePath}`,
      description: `Deletes a ${basePath} entity. Implementations must guard against orphaning references.`,
    })
    .input(z.object({ id: z.string(), seriesId: z.string() }))
    .output(z.object({ success: z.boolean() }));

  const get = authProcedure
    .route({
      path: `/${basePath}/get`,
      method: 'GET',
      summary: `Get ${basePath}`,
      description: `Returns a ${basePath} entity by ID. Uses NOT_FOUND for inaccessible resources.`,
    })
    .input(z.object({ id: z.string(), seriesId: z.string() }))
    .output(schema);

  const list = authProcedure
    .route({
      path: `/${basePath}/list`,
      method: 'GET',
      summary: `List ${basePath}`,
      description: `Lists ${basePath} entities by series with pagination.`,
    })
    // merge is deprecated, but extend() has issues with type inference here
    .input(paginationSchema.clone().merge(z.object({ seriesId: z.string() })))
    .output(z.object({ items: z.array(schema), total: z.number() }));

  return { create, update, remove, get, list } as const;
};

const characterCrud = buildCrud('characters', characterSchema);
const locationCrud = buildCrud('locations', locationSchema);
const propCrud = buildCrud('props', propSchema);
const timelineCrud = buildCrud('timeline', timelineEntrySchema);
const wildCardCrud = buildCrud('wildcards', wildCardSchema);

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
