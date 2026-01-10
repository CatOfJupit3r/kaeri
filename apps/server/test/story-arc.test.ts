import { call } from '@orpc/server';
import { describe, expect, it } from 'bun:test';

import { createSeriesWithUser } from './helpers/factories';
import { appRouter } from './helpers/instance';
import { createUser, expectErrorCode } from './helpers/utilities';
import type { TestCtx } from './helpers/utilities';

const DEFAULT_STORY_ARC_NAME = 'Test Story Arc';

async function createStoryArc(
  ctx: TestCtx,
  seriesId: string,
  input: {
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
      name: DEFAULT_STORY_ARC_NAME,
      ...input,
    },
    ctx(),
  );
}

describe('Story Arc API', () => {
  describe('createStoryArc', () => {
    it('should create a story arc with required fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Hero Journey',
      });

      expect(storyArc).toBeDefined();
      expect(storyArc._id).toBeDefined();
      expect(storyArc.name).toBe('Hero Journey');
      expect(storyArc.seriesId).toBe(series._id);
      expect(storyArc.status).toBe('planned');
      expect(storyArc.description).toBe('');
      expect(storyArc.keyBeats).toEqual([]);
      expect(storyArc.characters).toEqual([]);
      expect(storyArc.themeIds).toEqual([]);
      expect(storyArc.createdAt).toBeDefined();
      expect(storyArc.updatedAt).toBeDefined();
    });

    it('should create a story arc with all optional fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Full Arc',
        description: 'A complete arc description',
        status: 'in_progress',
        startScriptId: 'script1',
        endScriptId: 'script2',
        keyBeats: [
          {
            id: 'beat1',
            order: 0,
            description: 'First beat',
            scriptId: 'script1',
            sceneId: 'scene1',
          },
        ],
        resolution: 'Arc resolves successfully',
        characters: [
          {
            characterId: 'char1',
            role: 'protagonist',
          },
        ],
        themeIds: ['theme1', 'theme2'],
      });

      expect(storyArc.name).toBe('Full Arc');
      expect(storyArc.description).toBe('A complete arc description');
      expect(storyArc.status).toBe('in_progress');
      expect(storyArc.startScriptId).toBe('script1');
      expect(storyArc.endScriptId).toBe('script2');
      expect(storyArc.keyBeats).toHaveLength(1);
      expect(storyArc.keyBeats[0].description).toBe('First beat');
      expect(storyArc.resolution).toBe('Arc resolves successfully');
      expect(storyArc.characters).toHaveLength(1);
      expect(storyArc.characters[0].role).toBe('protagonist');
      expect(storyArc.themeIds).toEqual(['theme1', 'theme2']);
    });

    it('should fail when name is empty', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(() => createStoryArc(ctx, series._id, { name: '' }), 'BAD_REQUEST');
    });

    it('should fail when name is whitespace only', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(() => createStoryArc(ctx, series._id, { name: '   ' }), 'BAD_REQUEST');
    });

    it('should create multiple story arcs for the same series', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const arc1 = await createStoryArc(ctx, series._id, { name: 'Arc 1' });
      const arc2 = await createStoryArc(ctx, series._id, { name: 'Arc 2' });

      expect(arc1._id).not.toBe(arc2._id);
      expect(arc1.seriesId).toBe(series._id);
      expect(arc2.seriesId).toBe(series._id);
    });
  });

  describe('getStoryArc', () => {
    it('should get an existing story arc', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const created = await createStoryArc(ctx, series._id, {
        name: 'Get Test',
        description: 'Test description',
      });

      const fetched = await call(appRouter.storyArc.getStoryArc, { storyArcId: created._id }, ctx());

      expect(fetched._id).toBe(created._id);
      expect(fetched.name).toBe('Get Test');
      expect(fetched.description).toBe('Test description');
    });

    it('should return NOT_FOUND for non-existent story arc', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.storyArc.getStoryArc, { storyArcId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });

    it('should return NOT_FOUND for invalid ID format', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.storyArc.getStoryArc, { storyArcId: 'invalid-id' }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('updateStoryArc', () => {
    it('should update story arc name', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const created = await createStoryArc(ctx, series._id, { name: 'Original Name' });

      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: created._id,
          patch: { name: 'Updated Name' },
        },
        ctx(),
      );

      expect(updated.name).toBe('Updated Name');
      expect(updated._id).toBe(created._id);
    });

    it('should update story arc status', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const created = await createStoryArc(ctx, series._id, {
        name: 'Progress Arc',
        status: 'planned',
      });

      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: created._id,
          patch: { status: 'in_progress' },
        },
        ctx(),
      );

      expect(updated.status).toBe('in_progress');
    });

    it('should update multiple fields at once', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const created = await createStoryArc(ctx, series._id, { name: 'Original' });

      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: created._id,
          patch: {
            name: 'New Name',
            description: 'New description',
            status: 'completed',
            resolution: 'Arc completed successfully',
          },
        },
        ctx(),
      );

      expect(updated.name).toBe('New Name');
      expect(updated.description).toBe('New description');
      expect(updated.status).toBe('completed');
      expect(updated.resolution).toBe('Arc completed successfully');
    });

    it('should update key beats', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const created = await createStoryArc(ctx, series._id, { name: 'Beat Arc' });

      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: created._id,
          patch: {
            keyBeats: [
              { id: 'beat1', order: 0, description: 'Beat 1' },
              { id: 'beat2', order: 1, description: 'Beat 2' },
            ],
          },
        },
        ctx(),
      );

      expect(updated.keyBeats).toHaveLength(2);
      expect(updated.keyBeats[0].description).toBe('Beat 1');
      expect(updated.keyBeats[1].description).toBe('Beat 2');
    });

    it('should update character roles', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const created = await createStoryArc(ctx, series._id, { name: 'Character Arc' });

      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: created._id,
          patch: {
            characters: [
              { characterId: 'char1', role: 'protagonist' },
              { characterId: 'char2', role: 'antagonist' },
            ],
          },
        },
        ctx(),
      );

      expect(updated.characters).toHaveLength(2);
      expect(updated.characters[0].role).toBe('protagonist');
      expect(updated.characters[1].role).toBe('antagonist');
    });

    it('should fail when story arc does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.storyArc.updateStoryArc,
            {
              storyArcId: '507f1f77bcf86cd799439011',
              patch: { name: 'New Name' },
            },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });

    it('should fail when name is empty string', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const created = await createStoryArc(ctx, series._id, { name: 'Original' });

      await expectErrorCode(
        () =>
          call(
            appRouter.storyArc.updateStoryArc,
            {
              storyArcId: created._id,
              patch: { name: '' },
            },
            ctx(),
          ),
        'BAD_REQUEST',
      );
    });
  });

  describe('deleteStoryArc', () => {
    it('should delete an existing story arc', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const created = await createStoryArc(ctx, series._id, { name: 'To Delete' });

      const result = await call(appRouter.storyArc.deleteStoryArc, { storyArcId: created._id }, ctx());

      expect(result.success).toBe(true);

      // Verify it's deleted
      await expectErrorCode(
        () => call(appRouter.storyArc.getStoryArc, { storyArcId: created._id }, ctx()),
        'NOT_FOUND',
      );
    });

    it('should fail when story arc does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.storyArc.deleteStoryArc, { storyArcId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('listStoryArcs', () => {
    it('should list story arcs for a series', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createStoryArc(ctx, series._id, { name: 'Arc 1' });
      await createStoryArc(ctx, series._id, { name: 'Arc 2' });
      await createStoryArc(ctx, series._id, { name: 'Arc 3' });

      const result = await call(
        appRouter.storyArc.listStoryArcs,
        {
          seriesId: series._id,
          limit: 10,
          offset: 0,
        },
        ctx(),
      );

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should filter story arcs by status', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createStoryArc(ctx, series._id, { name: 'Planned Arc', status: 'planned' });
      await createStoryArc(ctx, series._id, { name: 'In Progress Arc', status: 'in_progress' });
      await createStoryArc(ctx, series._id, { name: 'Completed Arc', status: 'completed' });

      const result = await call(
        appRouter.storyArc.listStoryArcs,
        {
          seriesId: series._id,
          status: 'in_progress',
          limit: 10,
          offset: 0,
        },
        ctx(),
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('In Progress Arc');
      expect(result.items[0].status).toBe('in_progress');
      expect(result.total).toBe(1);
    });

    it('should paginate story arcs', async () => {
      const { ctx, series } = await createSeriesWithUser();

      for (let i = 0; i < 5; i++) {
        await createStoryArc(ctx, series._id, { name: `Arc ${i}` });
      }

      const page1 = await call(
        appRouter.storyArc.listStoryArcs,
        {
          seriesId: series._id,
          limit: 2,
          offset: 0,
        },
        ctx(),
      );

      const page2 = await call(
        appRouter.storyArc.listStoryArcs,
        {
          seriesId: series._id,
          limit: 2,
          offset: 2,
        },
        ctx(),
      );

      expect(page1.items).toHaveLength(2);
      expect(page2.items).toHaveLength(2);
      expect(page1.total).toBe(5);
      expect(page2.total).toBe(5);
      expect(page1.items[0]._id).not.toBe(page2.items[0]._id);
    });

    it('should return empty list for series with no story arcs', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const result = await call(
        appRouter.storyArc.listStoryArcs,
        {
          seriesId: series._id,
          limit: 10,
          offset: 0,
        },
        ctx(),
      );

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should not return story arcs from other series', async () => {
      const { ctx, series } = await createSeriesWithUser();
      const { series: otherSeries } = await createSeriesWithUser();

      await createStoryArc(ctx, series._id, { name: 'Series 1 Arc' });
      await createStoryArc(ctx, otherSeries._id, { name: 'Series 2 Arc' });

      const result = await call(
        appRouter.storyArc.listStoryArcs,
        {
          seriesId: series._id,
          limit: 10,
          offset: 0,
        },
        ctx(),
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Series 1 Arc');
    });
  });

  describe('Story Arc Status Transitions', () => {
    it('should transition through all statuses', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const arc = await createStoryArc(ctx, series._id, { name: 'Status Arc', status: 'planned' });

      // Transition to in_progress
      const inProgress = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: arc._id,
          patch: { status: 'in_progress' },
        },
        ctx(),
      );
      expect(inProgress.status).toBe('in_progress');

      // Transition to completed
      const completed = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: arc._id,
          patch: { status: 'completed', resolution: 'Successfully completed' },
        },
        ctx(),
      );
      expect(completed.status).toBe('completed');
      expect(completed.resolution).toBe('Successfully completed');
    });

    it('should allow setting status to abandoned', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const arc = await createStoryArc(ctx, series._id, { name: 'Abandoned Arc' });

      const abandoned = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: arc._id,
          patch: { status: 'abandoned' },
        },
        ctx(),
      );

      expect(abandoned.status).toBe('abandoned');
    });
  });
});
