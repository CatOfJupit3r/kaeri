import { call } from '@orpc/server';
import type { z } from 'zod';

import { createSceneInputSchema } from '@kaeri/shared/contract/scene.contract';
import { createThemeValueSchema } from '@kaeri/shared/contract/theme.contract';

import { appRouter } from './instance';
import { createUser } from './utilities';
import type { TestCtx } from './utilities';

const DEFAULT_SERIES_TITLE = 'Test Series';
const DEFAULT_SCRIPT_TITLE = 'Test Script';
const DEFAULT_CHARACTER_NAME = 'Test Character';
const DEFAULT_LOCATION_NAME = 'Test Location';
const DEFAULT_PROP_NAME = 'Test Prop';

type CreateSceneValue = Partial<Omit<z.infer<typeof createSceneInputSchema>, 'seriesId' | 'scriptId'>>;
type CreateThemeValue = Partial<z.infer<typeof createThemeValueSchema>>;

export async function createSeries(
  ctx: TestCtx,
  input: { title?: string; genre?: string; logline?: string; coverUrl?: string } = {},
) {
  return call(
    appRouter.series.createSeries,
    {
      title: DEFAULT_SERIES_TITLE,
      ...input,
    },
    ctx(),
  );
}

export async function createSeriesWithUser(
  input: { title?: string; genre?: string; logline?: string; coverUrl?: string } = {},
) {
  const user = await createUser();
  const series = await createSeries(user.ctx, input);
  return { ...user, series };
}

export async function createScript(
  ctx: TestCtx,
  seriesId: string,
  input: {
    title?: string;
    authors?: string[];
    genre?: string;
    logline?: string;
    coverUrl?: string;
  } = {},
) {
  return call(
    appRouter.scripts.createScript,
    {
      seriesId,
      title: DEFAULT_SCRIPT_TITLE,
      ...input,
    },
    ctx(),
  );
}

export async function createCharacter(
  ctx: TestCtx,
  seriesId: string,
  value: {
    name?: string;
    description?: string;
    traits?: string[];
    avatarUrl?: string;
    relationships?: Array<{ targetId: string; type: string; note?: string }>;
    variations?: Array<{ scriptId: string; label: string; notes?: string }>;
    appearances?: Array<{ scriptId: string; sceneRef: string; locationId?: string }>;
  } = {},
) {
  return call(
    appRouter.knowledgeBase.characters.create,
    {
      seriesId,
      value: {
        name: DEFAULT_CHARACTER_NAME,
        ...value,
      },
    },
    ctx(),
  );
}

export async function createLocation(
  ctx: TestCtx,
  seriesId: string,
  value: {
    name?: string;
    description?: string;
    tags?: string[];
    images?: Array<{ url: string; caption?: string }>;
    associatedCharacterIds?: string[];
    propIds?: string[];
    productionNotes?: string;
    mood?: string;
    timeOfDay?: string[];
  } = {},
) {
  return call(
    appRouter.knowledgeBase.locations.create,
    {
      seriesId,
      value: {
        name: DEFAULT_LOCATION_NAME,
        ...value,
      },
    },
    ctx(),
  );
}

export async function createProp(ctx: TestCtx, seriesId: string, value: { name?: string; description?: string } = {}) {
  return call(
    appRouter.knowledgeBase.props.create,
    {
      seriesId,
      value: {
        name: DEFAULT_PROP_NAME,
        ...value,
      },
    },
    ctx(),
  );
}

export async function createTimelineEntry(
  ctx: TestCtx,
  seriesId: string,
  value: {
    label?: string;
    order?: number;
    timestamp?: string;
    links?: Array<{ entityType: string; entityId: string }>;
  } = {},
) {
  return call(
    appRouter.knowledgeBase.timeline.create,
    {
      seriesId,
      value: {
        label: 'Timeline Entry',
        ...value,
      },
    },
    ctx(),
  );
}

export async function createWildcard(
  ctx: TestCtx,
  seriesId: string,
  value: { title?: string; body?: string; tag?: string } = {},
) {
  return call(
    appRouter.knowledgeBase.wildcards.create,
    {
      seriesId,
      value: {
        title: 'Wildcard',
        ...value,
      },
    },
    ctx(),
  );
}

export async function createScene(ctx: TestCtx, seriesId: string, scriptId: string, value: CreateSceneValue = {}) {
  const { heading = 'INT. LOCATION - DAY', ...rest } = value;

  return call(
    appRouter.scene.createScene,
    {
      seriesId,
      scriptId,
      heading,
      ...rest,
    },
    ctx(),
  );
}

export async function createStoryArc(
  ctx: TestCtx,
  seriesId: string,
  value: {
    name?: string;
    description?: string;
    status?: 'planned' | 'in_progress' | 'completed' | 'abandoned';
    startScriptId?: string;
    endScriptId?: string;
    keyBeats?: Array<{
      id: string;
      order: number;
      description: string;
      scriptId?: string;
      sceneId?: string;
    }>;
    resolution?: string;
    characters?: Array<{
      characterId: string;
      role: string;
    }>;
    themeIds?: string[];
  } = {},
) {
  return call(
    appRouter.storyArc.createStoryArc,
    {
      seriesId,
      name: 'Test Story Arc',
      description: '',
      status: 'planned',
      ...value,
    },
    ctx(),
  );
}

export async function createTheme(ctx: TestCtx, seriesId: string, value: CreateThemeValue = {}) {
  const { name = 'Test Theme', ...rest } = value;

  return call(
    appRouter.theme.createTheme,
    {
      seriesId,
      value: {
        name,
        ...rest,
      },
    },
    ctx(),
  );
}

export async function addAppearance(
  ctx: TestCtx,
  params: {
    seriesId: string;
    characterId: string;
    scriptId: string;
    sceneRef: string;
    locationId?: string;
  },
) {
  const { seriesId, characterId, scriptId, sceneRef, locationId } = params;
  return call(
    appRouter.knowledgeBase.addAppearance,
    {
      seriesId,
      characterId,
      appearance: {
        scriptId,
        sceneRef,
        locationId,
      },
    },
    ctx(),
  );
}

export async function addRelationship(
  ctx: TestCtx,
  params: { seriesId: string; characterId: string; targetId: string; type: string; note?: string },
) {
  const { seriesId, characterId, targetId, type, note } = params;
  return call(
    appRouter.knowledgeBase.addRelationship,
    {
      seriesId,
      characterId,
      relationship: { targetId, type, note },
    },
    ctx(),
  );
}

export async function upsertCanvas(
  ctx: TestCtx,
  seriesId: string,
  nodes: Array<{ _id: string; type: 'text' | 'shape'; content: string; position: { x: number; y: number } }>,
  edges: Array<{ _id: string; sourceId: string; targetId: string; label?: string }> = [],
) {
  if (nodes.length) {
    await call(
      appRouter.canvas.upsertNodes,
      {
        seriesId,
        nodes: nodes.map((node) => ({ ...node, seriesId })),
      },
      ctx(),
    );
  }

  if (edges.length) {
    await call(
      appRouter.canvas.upsertEdges,
      {
        seriesId,
        edges: edges.map((edge) => ({ ...edge, seriesId })),
      },
      ctx(),
    );
  }
}
