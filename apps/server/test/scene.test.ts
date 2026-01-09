import { call } from '@orpc/server';
import { describe, expect, it } from 'bun:test';

import { createScript, createSeries, createSeriesWithUser } from './helpers/factories';
import { appRouter } from './helpers/instance';
import { createUser, expectErrorCode } from './helpers/utilities';

describe('Scene API', () => {
  describe('createScene', () => {
    it('should create a scene with required fields', async () => {
      const { ctx, series } = await createSeriesWithUser();
      const script = await createScript(ctx, series._id, { title: 'Test Script' });

      const scene = await call(
        appRouter.scene.createScene,
        {
          seriesId: series._id,
          scriptId: script._id,
          heading: 'INT. COFFEE SHOP - DAY',
        },
        ctx(),
      );

      expect(scene).toBeDefined();
      expect(scene._id).toBeDefined();
      expect(scene.seriesId).toBe(series._id);
      expect(scene.scriptId).toBe(script._id);
      expect(scene.sceneNumber).toBe(1);
      expect(scene.heading).toBe('INT. COFFEE SHOP - DAY');
      expect(scene.beats).toEqual([]);
      expect(scene.characterIds).toEqual([]);
      expect(scene.propIds).toEqual([]);
      expect(scene.lastEditedAt).toBeDefined();
    });

    it('should create a scene with all optional fields', async () => {
      const { ctx, series } = await createSeriesWithUser();
      const script = await createScript(ctx, series._id);

      const scene = await call(
        appRouter.scene.createScene,
        {
          seriesId: series._id,
          scriptId: script._id,
          heading: 'EXT. PARK - MORNING',
          locationId: 'loc123',
          timeOfDay: 'Morning',
          duration: '5 minutes',
          emotionalTone: 'Tense',
          conflict: 'Character A confronts Character B',
          beats: [
            { order: 0, description: 'Establish location' },
            { order: 1, description: 'Characters enter' },
          ],
          characterIds: ['char1', 'char2'],
          propIds: ['prop1'],
          lighting: 'Natural daylight',
          sound: 'Birds chirping',
          camera: 'Wide shot',
          storyNotes: 'Important scene for character development',
          storyboardUrl: 'https://example.com/storyboard.jpg',
        },
        ctx(),
      );

      expect(scene.heading).toBe('EXT. PARK - MORNING');
      expect(scene.locationId).toBe('loc123');
      expect(scene.timeOfDay).toBe('Morning');
      expect(scene.duration).toBe('5 minutes');
      expect(scene.emotionalTone).toBe('Tense');
      expect(scene.conflict).toBe('Character A confronts Character B');
      expect(scene.beats).toHaveLength(2);
      expect(scene.beats[0].order).toBe(0);
      expect(scene.beats[0].description).toBe('Establish location');
      expect(scene.characterIds).toEqual(['char1', 'char2']);
      expect(scene.propIds).toEqual(['prop1']);
      expect(scene.lighting).toBe('Natural daylight');
      expect(scene.sound).toBe('Birds chirping');
      expect(scene.camera).toBe('Wide shot');
      expect(scene.storyNotes).toBe('Important scene for character development');
      expect(scene.storyboardUrl).toBe('https://example.com/storyboard.jpg');
    });

    it('should auto-generate sequential scene numbers', async () => {
      const { ctx, series } = await createSeriesWithUser();
      const script = await createScript(ctx, series._id);

      const scene1 = await call(
        appRouter.scene.createScene,
        {
          seriesId: series._id,
          scriptId: script._id,
          heading: 'Scene 1',
        },
        ctx(),
      );

      const scene2 = await call(
        appRouter.scene.createScene,
        {
          seriesId: series._id,
          scriptId: script._id,
          heading: 'Scene 2',
        },
        ctx(),
      );

      const scene3 = await call(
        appRouter.scene.createScene,
        {
          seriesId: series._id,
          scriptId: script._id,
          heading: 'Scene 3',
        },
        ctx(),
      );

      expect(scene1.sceneNumber).toBe(1);
      expect(scene2.sceneNumber).toBe(2);
      expect(scene3.sceneNumber).toBe(3);
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.scene.createScene,
            {
              seriesId: '507f1f77bcf86cd799439011',
              scriptId: '507f1f77bcf86cd799439012',
              heading: 'Scene',
            },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });

    it('should fail when script does not exist', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.scene.createScene,
            {
              seriesId: series._id,
              scriptId: '507f1f77bcf86cd799439011',
              heading: 'Scene',
            },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });

    it('should fail when script does not belong to series', async () => {
      const { ctx: ctx1, series: series1 } = await createSeriesWithUser();
      const { ctx: ctx2, series: series2 } = await createSeriesWithUser();
      const script = await createScript(ctx2, series2._id);

      await expectErrorCode(
        () =>
          call(
            appRouter.scene.createScene,
            {
              seriesId: series1._id,
              scriptId: script._id,
              heading: 'Scene',
            },
            ctx1(),
          ),
        'BAD_REQUEST',
      );
    });

    it('should fail when heading is empty', async () => {
      const { ctx, series } = await createSeriesWithUser();
      const script = await createScript(ctx, series._id);

      await expectErrorCode(
        () =>
          call(
            appRouter.scene.createScene,
            {
              seriesId: series._id,
              scriptId: script._id,
              heading: '',
            },
            ctx(),
          ),
        'BAD_REQUEST',
      );
    });

    it('should update series and script lastEditedAt when scene is created', async () => {
      const { ctx } = await createUser();
      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());
      const script = await call(appRouter.scripts.createScript, { seriesId: series._id, title: 'Test Script' }, ctx());

      await new Promise((r) => setTimeout(r, 10));

      await call(
        appRouter.scene.createScene,
        {
          seriesId: series._id,
          scriptId: script._id,
          heading: 'New Scene',
        },
        ctx(),
      );

      const updatedSeries = await call(appRouter.series.getSeries, { seriesId: series._id }, ctx());
      const updatedScript = await call(appRouter.scripts.getScript, { scriptId: script._id }, ctx());

      expect(new Date(updatedSeries.lastEditedAt).getTime()).toBeGreaterThan(new Date(series.lastEditedAt).getTime());
      expect(new Date(updatedScript.lastEditedAt).getTime()).toBeGreaterThan(new Date(script.lastEditedAt).getTime());
    });
  });

  describe('getScene', () => {
    it('should get an existing scene', async () => {
      const { ctx, series } = await createSeriesWithUser();
      const script = await createScript(ctx, series._id);

      const created = await call(
        appRouter.scene.createScene,
        {
          seriesId: series._id,
          scriptId: script._id,
          heading: 'Get Me',
          emotionalTone: 'Dramatic',
        },
        ctx(),
      );

      const fetched = await call(appRouter.scene.getScene, { sceneId: created._id }, ctx());

      expect(fetched._id).toBe(created._id);
      expect(fetched.heading).toBe('Get Me');
      expect(fetched.emotionalTone).toBe('Dramatic');
      expect(fetched.sceneNumber).toBe(1);
    });

    it('should return NOT_FOUND for non-existent scene', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.scene.getScene, { sceneId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('updateScene', () => {
    it('should update scene heading', async () => {
      const { ctx, series } = await createSeriesWithUser();
      const script = await createScript(ctx, series._id);
      const scene = await call(
        appRouter.scene.createScene,
        {
          seriesId: series._id,
          scriptId: script._id,
          heading: 'Original Heading',
        },
        ctx(),
      );

      const updated = await call(
        appRouter.scene.updateScene,
        {
          sceneId: scene._id,
          patch: { heading: 'Updated Heading' },
        },
        ctx(),
      );

      expect(updated.heading).toBe('Updated Heading');
      expect(updated.sceneNumber).toBe(scene.sceneNumber);
    });

    it('should update multiple fields', async () => {
      const { ctx, series } = await createSeriesWithUser();
      const script = await createScript(ctx, series._id);
      const scene = await call(
        appRouter.scene.createScene,
        {
          seriesId: series._id,
          scriptId: script._id,
          heading: 'Original',
        },
        ctx(),
      );

      const updated = await call(
        appRouter.scene.updateScene,
        {
          sceneId: scene._id,
          patch: {
            heading: 'Updated',
            timeOfDay: 'Night',
            emotionalTone: 'Suspenseful',
            beats: [{ order: 0, description: 'New beat' }],
            characterIds: ['char1', 'char2'],
          },
        },
        ctx(),
      );

      expect(updated.heading).toBe('Updated');
      expect(updated.timeOfDay).toBe('Night');
      expect(updated.emotionalTone).toBe('Suspenseful');
      expect(updated.beats).toHaveLength(1);
      expect(updated.beats[0].description).toBe('New beat');
      expect(updated.characterIds).toEqual(['char1', 'char2']);
    });

    it('should return NOT_FOUND for non-existent scene', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.scene.updateScene,
            {
              sceneId: '507f1f77bcf86cd799439011',
              patch: { heading: 'Updated' },
            },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });

    it('should update series and script lastEditedAt', async () => {
      const { ctx } = await createUser();
      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());
      const script = await call(appRouter.scripts.createScript, { seriesId: series._id, title: 'Test Script' }, ctx());
      const scene = await call(
        appRouter.scene.createScene,
        {
          seriesId: series._id,
          scriptId: script._id,
          heading: 'Original',
        },
        ctx(),
      );

      await new Promise((r) => setTimeout(r, 10));

      await call(appRouter.scene.updateScene, { sceneId: scene._id, patch: { heading: 'Updated' } }, ctx());

      const updatedSeries = await call(appRouter.series.getSeries, { seriesId: series._id }, ctx());
      const updatedScript = await call(appRouter.scripts.getScript, { scriptId: script._id }, ctx());

      expect(new Date(updatedSeries.lastEditedAt).getTime()).toBeGreaterThan(new Date(series.lastEditedAt).getTime());
      expect(new Date(updatedScript.lastEditedAt).getTime()).toBeGreaterThan(new Date(script.lastEditedAt).getTime());
    });
  });

  describe('deleteScene', () => {
    it('should delete an existing scene', async () => {
      const { ctx, series } = await createSeriesWithUser();
      const script = await createScript(ctx, series._id);
      const scene = await call(
        appRouter.scene.createScene,
        {
          seriesId: series._id,
          scriptId: script._id,
          heading: 'Delete Me',
        },
        ctx(),
      );

      const result = await call(appRouter.scene.deleteScene, { sceneId: scene._id }, ctx());

      expect(result.success).toBe(true);

      await expectErrorCode(() => call(appRouter.scene.getScene, { sceneId: scene._id }, ctx()), 'NOT_FOUND');
    });

    it('should return NOT_FOUND for non-existent scene', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.scene.deleteScene, { sceneId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });

    it('should update series and script lastEditedAt', async () => {
      const { ctx } = await createUser();
      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());
      const script = await call(appRouter.scripts.createScript, { seriesId: series._id, title: 'Test Script' }, ctx());
      const scene = await call(
        appRouter.scene.createScene,
        {
          seriesId: series._id,
          scriptId: script._id,
          heading: 'Delete Me',
        },
        ctx(),
      );

      await new Promise((r) => setTimeout(r, 10));

      await call(appRouter.scene.deleteScene, { sceneId: scene._id }, ctx());

      const updatedSeries = await call(appRouter.series.getSeries, { seriesId: series._id }, ctx());
      const updatedScript = await call(appRouter.scripts.getScript, { scriptId: script._id }, ctx());

      expect(new Date(updatedSeries.lastEditedAt).getTime()).toBeGreaterThan(new Date(series.lastEditedAt).getTime());
      expect(new Date(updatedScript.lastEditedAt).getTime()).toBeGreaterThan(new Date(script.lastEditedAt).getTime());
    });
  });

  describe('listScenesByScript', () => {
    it('should list scenes for a script ordered by scene number', async () => {
      const { ctx, series } = await createSeriesWithUser();
      const script = await createScript(ctx, series._id);

      await call(
        appRouter.scene.createScene,
        { seriesId: series._id, scriptId: script._id, heading: 'Scene 1' },
        ctx(),
      );
      await call(
        appRouter.scene.createScene,
        { seriesId: series._id, scriptId: script._id, heading: 'Scene 2' },
        ctx(),
      );
      await call(
        appRouter.scene.createScene,
        { seriesId: series._id, scriptId: script._id, heading: 'Scene 3' },
        ctx(),
      );

      const result = await call(
        appRouter.scene.listScenesByScript,
        { scriptId: script._id, limit: 10, offset: 0 },
        ctx(),
      );

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.items[0].sceneNumber).toBe(1);
      expect(result.items[1].sceneNumber).toBe(2);
      expect(result.items[2].sceneNumber).toBe(3);
      expect(result.items[0].heading).toBe('Scene 1');
      expect(result.items[1].heading).toBe('Scene 2');
      expect(result.items[2].heading).toBe('Scene 3');
    });

    it('should return empty list for script with no scenes', async () => {
      const { ctx, series } = await createSeriesWithUser();
      const script = await createScript(ctx, series._id);

      const result = await call(
        appRouter.scene.listScenesByScript,
        { scriptId: script._id, limit: 10, offset: 0 },
        ctx(),
      );

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle pagination', async () => {
      const { ctx, series } = await createSeriesWithUser();
      const script = await createScript(ctx, series._id);

      for (let i = 1; i <= 5; i++) {
        await call(
          appRouter.scene.createScene,
          { seriesId: series._id, scriptId: script._id, heading: `Scene ${i}` },
          ctx(),
        );
      }

      const page1 = await call(
        appRouter.scene.listScenesByScript,
        { scriptId: script._id, limit: 2, offset: 0 },
        ctx(),
      );
      const page2 = await call(
        appRouter.scene.listScenesByScript,
        { scriptId: script._id, limit: 2, offset: 2 },
        ctx(),
      );

      expect(page1.items).toHaveLength(2);
      expect(page1.total).toBe(5);
      expect(page1.items[0].sceneNumber).toBe(1);
      expect(page1.items[1].sceneNumber).toBe(2);

      expect(page2.items).toHaveLength(2);
      expect(page2.total).toBe(5);
      expect(page2.items[0].sceneNumber).toBe(3);
      expect(page2.items[1].sceneNumber).toBe(4);
    });

    it('should return NOT_FOUND for non-existent script', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.scene.listScenesByScript,
            { scriptId: '507f1f77bcf86cd799439011', limit: 10, offset: 0 },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });

    it('should only include summary fields', async () => {
      const { ctx, series } = await createSeriesWithUser();
      const script = await createScript(ctx, series._id);

      await call(
        appRouter.scene.createScene,
        {
          seriesId: series._id,
          scriptId: script._id,
          heading: 'Scene 1',
          emotionalTone: 'Happy',
          conflict: 'Test conflict',
          storyNotes: 'These are story notes',
        },
        ctx(),
      );

      const result = await call(
        appRouter.scene.listScenesByScript,
        { scriptId: script._id, limit: 10, offset: 0 },
        ctx(),
      );

      expect(result.items).toHaveLength(1);
      const scene = result.items[0];
      expect(scene.heading).toBe('Scene 1');
      expect(scene.emotionalTone).toBe('Happy');
      expect(scene.sceneNumber).toBe(1);
      // Summary should not include conflict or storyNotes
      expect((scene as any).conflict).toBeUndefined();
      expect((scene as any).storyNotes).toBeUndefined();
    });
  });

  describe('scene number uniqueness', () => {
    it('should maintain unique scene numbers per script', async () => {
      const { ctx, series } = await createSeriesWithUser();
      const script1 = await createScript(ctx, series._id, { title: 'Script 1' });
      const script2 = await createScript(ctx, series._id, { title: 'Script 2' });

      const scene1 = await call(
        appRouter.scene.createScene,
        { seriesId: series._id, scriptId: script1._id, heading: 'Script 1 Scene 1' },
        ctx(),
      );
      const scene2 = await call(
        appRouter.scene.createScene,
        { seriesId: series._id, scriptId: script2._id, heading: 'Script 2 Scene 1' },
        ctx(),
      );
      const scene3 = await call(
        appRouter.scene.createScene,
        { seriesId: series._id, scriptId: script1._id, heading: 'Script 1 Scene 2' },
        ctx(),
      );

      expect(scene1.sceneNumber).toBe(1);
      expect(scene2.sceneNumber).toBe(1); // Same scene number but different script
      expect(scene3.sceneNumber).toBe(2);
      expect(scene1.scriptId).toBe(script1._id);
      expect(scene2.scriptId).toBe(script2._id);
      expect(scene3.scriptId).toBe(script1._id);
    });
  });
});
