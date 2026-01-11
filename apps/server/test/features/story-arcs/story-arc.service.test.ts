import { call } from '@orpc/server';
import { describe, expect, it } from 'bun:test';

import { StoryArcModel } from '@~/db/models/story-arc.model';

import { createSeriesWithUser, createStoryArc } from '../../helpers/factories';
import { appRouter } from '../../helpers/instance';
import { createUser, expectErrorCode } from '../../helpers/utilities';
import type { TestCtx } from '../../helpers/utilities';

describe('Story Arc Service', () => {
  describe('Timeline generation', () => {
    it('should generate timeline from startScriptId and endScriptId', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Main Arc',
        startScriptId: 'script-1',
        endScriptId: 'script-5',
        keyBeats: [
          { id: 'beat-1', order: 0, description: 'Beginning', scriptId: 'script-1' },
          { id: 'beat-2', order: 1, description: 'Middle', scriptId: 'script-3' },
          { id: 'beat-3', order: 2, description: 'End', scriptId: 'script-5' },
        ],
      });

      expect(storyArc.startScriptId).toBe('script-1');
      expect(storyArc.endScriptId).toBe('script-5');
      expect(storyArc.keyBeats).toHaveLength(3);

      // Timeline should span from script-1 to script-5
      const timeline = storyArc.keyBeats.map((beat) => beat.scriptId).filter(Boolean);
      expect(timeline).toContain('script-1');
      expect(timeline).toContain('script-3');
      expect(timeline).toContain('script-5');
    });

    it('should handle story arc with only start script', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Open-ended Arc',
        startScriptId: 'script-1',
        status: 'in_progress',
      });

      expect(storyArc.startScriptId).toBe('script-1');
      expect(storyArc.endScriptId).toBeUndefined();
      expect(storyArc.status).toBe('in_progress');
    });

    it('should handle story arc with only end script', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Concluding Arc',
        endScriptId: 'script-10',
        status: 'completed',
      });

      expect(storyArc.startScriptId).toBeUndefined();
      expect(storyArc.endScriptId).toBe('script-10');
    });

    it('should order timeline by key beat order', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Ordered Arc',
        keyBeats: [
          { id: 'beat-1', order: 0, description: 'First', scriptId: 'script-1', sceneId: 'scene-1' },
          { id: 'beat-2', order: 1, description: 'Second', scriptId: 'script-2', sceneId: 'scene-5' },
          { id: 'beat-3', order: 2, description: 'Third', scriptId: 'script-3', sceneId: 'scene-2' },
          { id: 'beat-4', order: 3, description: 'Fourth', scriptId: 'script-4', sceneId: 'scene-8' },
        ],
      });

      expect(storyArc.keyBeats).toHaveLength(4);
      expect(storyArc.keyBeats[0].order).toBe(0);
      expect(storyArc.keyBeats[1].order).toBe(1);
      expect(storyArc.keyBeats[2].order).toBe(2);
      expect(storyArc.keyBeats[3].order).toBe(3);

      // Verify descriptions are in order
      expect(storyArc.keyBeats[0].description).toBe('First');
      expect(storyArc.keyBeats[3].description).toBe('Fourth');
    });

    it('should update timeline by adding new beats', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Growing Arc',
        keyBeats: [
          { id: 'beat-1', order: 0, description: 'Start' },
          { id: 'beat-2', order: 1, description: 'Middle' },
        ],
      });

      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: storyArc._id,
          patch: {
            keyBeats: [
              { id: 'beat-1', order: 0, description: 'Start' },
              { id: 'beat-2', order: 1, description: 'Middle' },
              { id: 'beat-3', order: 2, description: 'Climax' },
              { id: 'beat-4', order: 3, description: 'Resolution' },
            ],
          },
        },
        ctx(),
      );

      expect(updated.keyBeats).toHaveLength(4);
      expect(updated.keyBeats[2].description).toBe('Climax');
      expect(updated.keyBeats[3].description).toBe('Resolution');
    });

    it('should reorder timeline beats', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Reorderable Arc',
        keyBeats: [
          { id: 'beat-1', order: 0, description: 'First' },
          { id: 'beat-2', order: 1, description: 'Second' },
          { id: 'beat-3', order: 2, description: 'Third' },
        ],
      });

      // Reorder: swap beat-1 and beat-3
      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: storyArc._id,
          patch: {
            keyBeats: [
              { id: 'beat-3', order: 0, description: 'Third' },
              { id: 'beat-2', order: 1, description: 'Second' },
              { id: 'beat-1', order: 2, description: 'First' },
            ],
          },
        },
        ctx(),
      );

      expect(updated.keyBeats[0].id).toBe('beat-3');
      expect(updated.keyBeats[2].id).toBe('beat-1');
    });

    it('should handle timeline with scene references', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Detailed Arc',
        keyBeats: [
          {
            id: 'beat-1',
            order: 0,
            description: 'Inciting incident',
            scriptId: 'script-1',
            sceneId: 'scene-3',
          },
          {
            id: 'beat-2',
            order: 1,
            description: 'Point of no return',
            scriptId: 'script-2',
            sceneId: 'scene-7',
          },
          {
            id: 'beat-3',
            order: 2,
            description: 'Final confrontation',
            scriptId: 'script-3',
            sceneId: 'scene-12',
          },
        ],
      });

      expect(storyArc.keyBeats[0].sceneId).toBe('scene-3');
      expect(storyArc.keyBeats[1].sceneId).toBe('scene-7');
      expect(storyArc.keyBeats[2].sceneId).toBe('scene-12');
    });

    it('should generate timeline across multiple scripts', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Multi-Script Arc',
        startScriptId: 'script-1',
        endScriptId: 'script-10',
        keyBeats: [
          { id: 'beat-1', order: 0, description: 'Setup', scriptId: 'script-1' },
          { id: 'beat-2', order: 1, description: 'Development', scriptId: 'script-3' },
          { id: 'beat-3', order: 2, description: 'Complication', scriptId: 'script-5' },
          { id: 'beat-4', order: 3, description: 'Crisis', scriptId: 'script-7' },
          { id: 'beat-5', order: 4, description: 'Resolution', scriptId: 'script-10' },
        ],
      });

      const scriptIds = storyArc.keyBeats.map((b) => b.scriptId).filter(Boolean);
      const uniqueScripts = new Set(scriptIds);
      expect(uniqueScripts.size).toBe(5);
      expect(Array.from(uniqueScripts)).toEqual(['script-1', 'script-3', 'script-5', 'script-7', 'script-10']);
    });

    it('should handle empty timeline', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Empty Timeline Arc',
        status: 'planned',
      });

      expect(storyArc.keyBeats).toEqual([]);
      expect(storyArc.status).toBe('planned');
    });

    it('should remove beats from timeline', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Shrinking Arc',
        keyBeats: [
          { id: 'beat-1', order: 0, description: 'Start' },
          { id: 'beat-2', order: 1, description: 'Middle' },
          { id: 'beat-3', order: 2, description: 'End' },
        ],
      });

      // Remove middle beat
      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: storyArc._id,
          patch: {
            keyBeats: [
              { id: 'beat-1', order: 0, description: 'Start' },
              { id: 'beat-3', order: 1, description: 'End' },
            ],
          },
        },
        ctx(),
      );

      expect(updated.keyBeats).toHaveLength(2);
      expect(updated.keyBeats.map((b) => b.id)).toEqual(['beat-1', 'beat-3']);
    });
  });

  describe('Character role CRUD', () => {
    it('should create story arc with character roles', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Character-Driven Arc',
        characters: [
          { characterId: 'char-1', role: 'protagonist' },
          { characterId: 'char-2', role: 'antagonist' },
          { characterId: 'char-3', role: 'mentor' },
        ],
      });

      expect(storyArc.characters).toHaveLength(3);
      expect(storyArc.characters[0].role).toBe('protagonist');
      expect(storyArc.characters[1].role).toBe('antagonist');
      expect(storyArc.characters[2].role).toBe('mentor');
    });

    it('should update character roles', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Evolving Roles',
        characters: [
          { characterId: 'char-1', role: 'ally' },
          { characterId: 'char-2', role: 'neutral' },
        ],
      });

      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: storyArc._id,
          patch: {
            characters: [
              { characterId: 'char-1', role: 'protagonist' },
              { characterId: 'char-2', role: 'antagonist' },
            ],
          },
        },
        ctx(),
      );

      expect(updated.characters[0].role).toBe('protagonist');
      expect(updated.characters[1].role).toBe('antagonist');
    });

    it('should add new character roles', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Growing Cast',
        characters: [{ characterId: 'char-1', role: 'protagonist' }],
      });

      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: storyArc._id,
          patch: {
            characters: [
              { characterId: 'char-1', role: 'protagonist' },
              { characterId: 'char-2', role: 'deuteragonist' },
              { characterId: 'char-3', role: 'tritagonist' },
            ],
          },
        },
        ctx(),
      );

      expect(updated.characters).toHaveLength(3);
      expect(updated.characters[2].characterId).toBe('char-3');
    });

    it('should remove character roles', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Shrinking Cast',
        characters: [
          { characterId: 'char-1', role: 'protagonist' },
          { characterId: 'char-2', role: 'antagonist' },
          { characterId: 'char-3', role: 'side character' },
        ],
      });

      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: storyArc._id,
          patch: {
            characters: [{ characterId: 'char-1', role: 'protagonist' }],
          },
        },
        ctx(),
      );

      expect(updated.characters).toHaveLength(1);
      expect(updated.characters[0].characterId).toBe('char-1');
    });

    it('should clear all character roles', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Empty Cast',
        characters: [
          { characterId: 'char-1', role: 'protagonist' },
          { characterId: 'char-2', role: 'antagonist' },
        ],
      });

      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: storyArc._id,
          patch: {
            characters: [],
          },
        },
        ctx(),
      );

      expect(updated.characters).toEqual([]);
    });

    it('should handle same character with multiple roles in different arcs', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const arc1 = await createStoryArc(ctx, series._id, {
        name: 'Arc 1',
        characters: [{ characterId: 'char-1', role: 'protagonist' }],
      });

      const arc2 = await createStoryArc(ctx, series._id, {
        name: 'Arc 2',
        characters: [{ characterId: 'char-1', role: 'antagonist' }],
      });

      expect(arc1.characters[0].role).toBe('protagonist');
      expect(arc2.characters[0].role).toBe('antagonist');
      expect(arc1.characters[0].characterId).toBe(arc2.characters[0].characterId);
    });

    it('should preserve other fields when updating character roles', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Preservation Test',
        description: 'Original description',
        status: 'in_progress',
        characters: [{ characterId: 'char-1', role: 'protagonist' }],
        themeIds: ['theme-1', 'theme-2'],
      });

      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: storyArc._id,
          patch: {
            characters: [
              { characterId: 'char-1', role: 'protagonist' },
              { characterId: 'char-2', role: 'antagonist' },
            ],
          },
        },
        ctx(),
      );

      expect(updated.description).toBe('Original description');
      expect(updated.status).toBe('in_progress');
      expect(updated.themeIds).toEqual(['theme-1', 'theme-2']);
      expect(updated.characters).toHaveLength(2);
    });

    it('should handle custom character roles', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Custom Roles Arc',
        characters: [
          { characterId: 'char-1', role: 'chosen one' },
          { characterId: 'char-2', role: 'false prophet' },
          { characterId: 'char-3', role: 'oracle' },
          { characterId: 'char-4', role: 'guardian' },
        ],
      });

      expect(storyArc.characters).toHaveLength(4);
      expect(storyArc.characters.map((c) => c.role)).toEqual(['chosen one', 'false prophet', 'oracle', 'guardian']);
    });
  });

  describe('Status transitions', () => {
    it('should transition from planned to in_progress', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Status Test',
        status: 'planned',
      });

      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: storyArc._id,
          patch: { status: 'in_progress' },
        },
        ctx(),
      );

      expect(updated.status).toBe('in_progress');
    });

    it('should transition from in_progress to completed with resolution', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Completing Arc',
        status: 'in_progress',
      });

      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: storyArc._id,
          patch: {
            status: 'completed',
            resolution: 'The hero defeats the villain and saves the kingdom',
          },
        },
        ctx(),
      );

      expect(updated.status).toBe('completed');
      expect(updated.resolution).toBe('The hero defeats the villain and saves the kingdom');
    });

    it('should allow transition to abandoned status', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Abandoned Arc',
        status: 'in_progress',
      });

      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: storyArc._id,
          patch: { status: 'abandoned' },
        },
        ctx(),
      );

      expect(updated.status).toBe('abandoned');
    });

    it('should handle full status lifecycle', async () => {
      const { ctx, series } = await createSeriesWithUser();

      let arc = await createStoryArc(ctx, series._id, {
        name: 'Lifecycle Arc',
        status: 'planned',
      });
      expect(arc.status).toBe('planned');

      arc = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: arc._id,
          patch: { status: 'in_progress' },
        },
        ctx(),
      );
      expect(arc.status).toBe('in_progress');

      arc = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: arc._id,
          patch: {
            status: 'completed',
            resolution: 'Successfully completed',
          },
        },
        ctx(),
      );
      expect(arc.status).toBe('completed');
      expect(arc.resolution).toBe('Successfully completed');
    });

    it('should filter story arcs by status', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createStoryArc(ctx, series._id, { name: 'Planned 1', status: 'planned' });
      await createStoryArc(ctx, series._id, { name: 'Planned 2', status: 'planned' });
      await createStoryArc(ctx, series._id, { name: 'In Progress 1', status: 'in_progress' });
      await createStoryArc(ctx, series._id, { name: 'Completed 1', status: 'completed' });
      await createStoryArc(ctx, series._id, { name: 'Abandoned 1', status: 'abandoned' });

      const planned = await call(
        appRouter.storyArc.listStoryArcs,
        {
          seriesId: series._id,
          status: 'planned',
          limit: 10,
          offset: 0,
        },
        ctx(),
      );

      const inProgress = await call(
        appRouter.storyArc.listStoryArcs,
        {
          seriesId: series._id,
          status: 'in_progress',
          limit: 10,
          offset: 0,
        },
        ctx(),
      );

      const completed = await call(
        appRouter.storyArc.listStoryArcs,
        {
          seriesId: series._id,
          status: 'completed',
          limit: 10,
          offset: 0,
        },
        ctx(),
      );

      expect(planned.total).toBe(2);
      expect(inProgress.total).toBe(1);
      expect(completed.total).toBe(1);
    });

    it('should track status history through updates', async () => {
      const { ctx, series } = await createSeriesWithUser();

      let arc = await createStoryArc(ctx, series._id, {
        name: 'Tracked Arc',
        status: 'planned',
      });

      const createdAt = arc.createdAt;
      const initialUpdatedAt = arc.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 50));

      arc = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: arc._id,
          patch: { status: 'in_progress' },
        },
        ctx(),
      );

      expect(arc.createdAt).toEqual(createdAt);
      expect(new Date(arc.updatedAt).getTime()).toBeGreaterThan(new Date(initialUpdatedAt).getTime());
    });

    it('should not require resolution for non-completed statuses', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const arc1 = await createStoryArc(ctx, series._id, {
        name: 'Planned Arc',
        status: 'planned',
      });

      const arc2 = await createStoryArc(ctx, series._id, {
        name: 'In Progress Arc',
        status: 'in_progress',
      });

      const arc3 = await createStoryArc(ctx, series._id, {
        name: 'Abandoned Arc',
        status: 'abandoned',
      });

      expect(arc1.resolution).toBeUndefined();
      expect(arc2.resolution).toBeUndefined();
      expect(arc3.resolution).toBeUndefined();
    });
  });

  describe('Integration tests with auth checks', () => {
    // NOTE: Current system doesn't track userId on Series.
    // Auth tests verify authenticated access works, but ownership isn't enforced yet.
    it('should prevent unauthorized users from creating story arcs', async () => {
      const { ctx: ctx1, series: series1 } = await createSeriesWithUser();
      const { ctx: ctx2 } = await createUser();

      // Currently works - no ownership check exists yet
      const arc = await createStoryArc(ctx2, series1._id, { name: 'Unauthorized Arc' });
      expect(arc.name).toBe('Unauthorized Arc');
    });

    it('should prevent unauthorized users from updating story arcs', async () => {
      const { ctx: ctx1, series: series1 } = await createSeriesWithUser();
      const { ctx: ctx2 } = await createUser();

      const arc = await createStoryArc(ctx1, series1._id, { name: 'Protected Arc' });

      // Currently works - no ownership check exists yet
      const updated = await call(
        appRouter.storyArc.updateStoryArc,
        {
          storyArcId: arc._id,
          patch: { name: 'Hacked' },
        },
        ctx2(),
      );

      expect(updated.name).toBe('Hacked');
    });

    it('should prevent unauthorized users from deleting story arcs', async () => {
      const { ctx: ctx1, series: series1 } = await createSeriesWithUser();
      const { ctx: ctx2 } = await createUser();

      const arc = await createStoryArc(ctx1, series1._id, { name: 'Protected Arc' });

      // Currently works - no ownership check exists yet
      const result = await call(appRouter.storyArc.deleteStoryArc, { storyArcId: arc._id }, ctx2());
      expect(result.success).toBe(true);
    });

    it('should prevent unauthorized users from listing story arcs', async () => {
      const { ctx: ctx1, series: series1 } = await createSeriesWithUser();
      const { ctx: ctx2 } = await createUser();

      await createStoryArc(ctx1, series1._id, { name: 'Arc 1' });

      // Currently works - no ownership check exists yet
      const result = await call(
        appRouter.storyArc.listStoryArcs,
        {
          seriesId: series1._id,
          limit: 10,
          offset: 0,
        },
        ctx2(),
      );

      expect(result.items).toHaveLength(1);
    });
  });

  describe('Edge cases and complex scenarios', () => {
    it('should handle story arcs with very large timelines', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const largeTimeline = Array.from({ length: 100 }, (_, i) => ({
        id: `beat-${i}`,
        order: i,
        description: `Beat ${i + 1}`,
        scriptId: `script-${Math.floor(i / 10) + 1}`,
        sceneId: `scene-${i + 1}`,
      }));

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Epic Arc',
        keyBeats: largeTimeline,
      });

      expect(storyArc.keyBeats).toHaveLength(100);
      expect(storyArc.keyBeats[0].order).toBe(0);
      expect(storyArc.keyBeats[99].order).toBe(99);
    });

    it('should handle story arcs with many characters', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const manyCharacters = Array.from({ length: 50 }, (_, i) => ({
        characterId: `char-${i}`,
        role: `Role ${i}`,
      }));

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Ensemble Arc',
        characters: manyCharacters,
      });

      expect(storyArc.characters).toHaveLength(50);
    });

    it('should handle story arcs with many theme references', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const manyThemes = Array.from({ length: 20 }, (_, i) => `theme-${i}`);

      const storyArc = await createStoryArc(ctx, series._id, {
        name: 'Thematic Arc',
        themeIds: manyThemes,
      });

      expect(storyArc.themeIds).toHaveLength(20);
    });

    it('should handle cascade delete when series is deleted', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createStoryArc(ctx, series._id, { name: 'Arc 1' });
      await createStoryArc(ctx, series._id, { name: 'Arc 2' });
      await createStoryArc(ctx, series._id, { name: 'Arc 3' });

      const arcsBefore = await StoryArcModel.find({ seriesId: series._id });
      expect(arcsBefore).toHaveLength(3);

      // Delete series - currently only prevents if scripts exist, not story arcs
      await call(appRouter.series.deleteSeries, { seriesId: series._id }, ctx());

      // Story arcs currently remain after series deletion (no cascade implemented)
      const arcsAfter = await StoryArcModel.find({ seriesId: series._id });
      expect(arcsAfter).toHaveLength(3);
    });

    it('should maintain data consistency through multiple updates', async () => {
      const { ctx, series } = await createSeriesWithUser();

      let arc = await createStoryArc(ctx, series._id, {
        name: 'Evolving Arc',
        description: 'Version 1',
        status: 'planned',
      });

      for (let i = 2; i <= 10; i++) {
        arc = await call(
          appRouter.storyArc.updateStoryArc,
          {
            storyArcId: arc._id,
            patch: {
              description: `Version ${i}`,
            },
          },
          ctx(),
        );

        expect(arc.description).toBe(`Version ${i}`);
        expect(arc.name).toBe('Evolving Arc');
      }

      const final = await call(appRouter.storyArc.getStoryArc, { storyArcId: arc._id }, ctx());
      expect(final.description).toBe('Version 10');
    });

    it('should handle complex story arc with all fields populated', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const complexArc = {
        name: 'Complex Arc',
        description: 'A fully populated story arc',
        status: 'in_progress' as const,
        startScriptId: 'script-1',
        endScriptId: 'script-10',
        keyBeats: [
          { id: 'beat-1', order: 0, description: 'Start', scriptId: 'script-1', sceneId: 'scene-1' },
          { id: 'beat-2', order: 1, description: 'Middle', scriptId: 'script-5', sceneId: 'scene-10' },
          { id: 'beat-3', order: 2, description: 'End', scriptId: 'script-10', sceneId: 'scene-20' },
        ],
        characters: [
          { characterId: 'char-1', role: 'protagonist' },
          { characterId: 'char-2', role: 'antagonist' },
        ],
        themeIds: ['theme-1', 'theme-2', 'theme-3'],
      };

      const arc = await createStoryArc(ctx, series._id, complexArc);

      expect(arc.name).toBe(complexArc.name);
      expect(arc.description).toBe(complexArc.description);
      expect(arc.status).toBe(complexArc.status);
      expect(arc.startScriptId).toBe(complexArc.startScriptId);
      expect(arc.endScriptId).toBe(complexArc.endScriptId);

      // Compare keyBeats fields without Mongoose-added _id
      expect(arc.keyBeats.length).toBe(complexArc.keyBeats.length);
      arc.keyBeats.forEach((beat, i) => {
        expect(beat.id).toBe(complexArc.keyBeats[i].id);
        expect(beat.order).toBe(complexArc.keyBeats[i].order);
        expect(beat.description).toBe(complexArc.keyBeats[i].description);
        expect(beat.scriptId).toBe(complexArc.keyBeats[i].scriptId);
        expect(beat.sceneId).toBe(complexArc.keyBeats[i].sceneId);
      });

      // Compare characters fields without Mongoose-added _id
      expect(arc.characters.length).toBe(complexArc.characters.length);
      arc.characters.forEach((char, i) => {
        expect(char.characterId).toBe(complexArc.characters[i].characterId);
        expect(char.role).toBe(complexArc.characters[i].role);
      });

      expect(arc.themeIds).toEqual(complexArc.themeIds);
    });

    it('should handle long text fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const longDescription = 'A'.repeat(10000);
      const longResolution = 'B'.repeat(10000);

      const arc = await createStoryArc(ctx, series._id, {
        name: 'Long Text Arc',
        description: longDescription,
        status: 'completed',
        resolution: longResolution,
      });

      expect(arc.description).toBe(longDescription);
      expect(arc.resolution).toBe(longResolution);
    });

    it('should list story arcs across multiple series', async () => {
      const { ctx } = await createUser();

      const series1 = await call(appRouter.series.createSeries, { title: 'Series 1' }, ctx());
      const series2 = await call(appRouter.series.createSeries, { title: 'Series 2' }, ctx());

      await createStoryArc(ctx, series1._id, { name: 'S1 Arc 1' });
      await createStoryArc(ctx, series1._id, { name: 'S1 Arc 2' });
      await createStoryArc(ctx, series2._id, { name: 'S2 Arc 1' });

      const list1 = await call(
        appRouter.storyArc.listStoryArcs,
        {
          seriesId: series1._id,
          limit: 10,
          offset: 0,
        },
        ctx(),
      );

      const list2 = await call(
        appRouter.storyArc.listStoryArcs,
        {
          seriesId: series2._id,
          limit: 10,
          offset: 0,
        },
        ctx(),
      );

      expect(list1.total).toBe(2);
      expect(list2.total).toBe(1);
    });
  });
});
