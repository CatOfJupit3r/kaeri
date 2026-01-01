import { call } from '@orpc/server';
import { it, expect, describe } from 'bun:test';

import {
  addAppearance,
  addRelationship,
  createCharacter,
  createLocation,
  createProp,
  createScript,
  createSeriesWithUser,
  createTimelineEntry,
  createWildcard,
  upsertCanvas,
} from './helpers/factories';
import { appRouter } from './helpers/instance';
import { createUser, expectErrorCode } from './helpers/utilities';

describe('Export API', () => {
  describe('exportScriptPdf', () => {
    it('should return success metadata for valid script', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'My Script' });

      // Add some content
      await call(
        appRouter.scripts.saveScriptContent,
        { scriptId: script._id, content: 'FADE IN:\n\nEXT. BEACH - DAY' },
        ctx(),
      );

      const result = await call(appRouter.export.exportScriptPdf, { scriptId: script._id }, ctx());

      expect(result.ok).toBe(true);
      expect(result.fileType).toBe('application/pdf');
    });

    it('should fail when script does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.export.exportScriptPdf, { scriptId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });

    it('should work with script that has no content', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Empty Script' });

      // Note: Currently the implementation doesn't check for empty content
      // This test documents current behavior
      const result = await call(appRouter.export.exportScriptPdf, { scriptId: script._id }, ctx());

      expect(result.ok).toBe(true);
    });
  });

  describe('exportSeriesJson', () => {
    it('should export empty series data', async () => {
      const { ctx, series } = await createSeriesWithUser({ title: 'Empty Series', genre: 'Drama' });

      const result = await call(appRouter.export.exportSeriesJson, { seriesId: series._id }, ctx());

      expect(result.series._id).toBe(series._id);
      expect(result.series.title).toBe('Empty Series');
      expect(result.series.genre).toBe('Drama');
      expect(result.scripts).toBeArray();
      expect(result.scripts.length).toBe(0);
      expect(result.characters).toBeArray();
      expect(result.characters.length).toBe(0);
      expect(result.locations).toBeArray();
      expect(result.locations.length).toBe(0);
      expect(result.props).toBeArray();
      expect(result.props.length).toBe(0);
      expect(result.timeline).toBeArray();
      expect(result.timeline.length).toBe(0);
      expect(result.wildcards).toBeArray();
      expect(result.wildcards.length).toBe(0);
      expect(result.canvas.nodes).toBeArray();
      expect(result.canvas.edges).toBeArray();
    });

    it('should export series with scripts', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createScript(ctx, series._id, { title: 'Script 1', authors: ['John'] });
      await createScript(ctx, series._id, { title: 'Script 2', genre: 'Action' });

      const result = await call(appRouter.export.exportSeriesJson, { seriesId: series._id }, ctx());

      expect(result.scripts.length).toBe(2);
      expect(result.scripts.map((s) => s.title)).toContain('Script 1');
      expect(result.scripts.map((s) => s.title)).toContain('Script 2');
    });

    it('should export series with characters and relationships', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const char1 = await createCharacter(ctx, series._id, { name: 'Hero', traits: ['brave'] });

      const char2 = await createCharacter(ctx, series._id, { name: 'Sidekick' });

      await addRelationship(ctx, {
        seriesId: series._id,
        characterId: char1._id,
        targetId: char2._id,
        type: 'friend',
      });

      const result = await call(appRouter.export.exportSeriesJson, { seriesId: series._id }, ctx());

      expect(result.characters.length).toBe(2);
      const hero = result.characters.find((c) => c.name === 'Hero');
      expect(hero?.relationships?.length).toBe(1);
      expect(hero?.relationships?.[0].targetId).toBe(char2._id);
    });

    it('should export series with locations', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createLocation(ctx, series._id, { name: 'City', description: 'A big city', tags: ['urban'] });

      const result = await call(appRouter.export.exportSeriesJson, { seriesId: series._id }, ctx());

      expect(result.locations.length).toBe(1);
      expect(result.locations[0].name).toBe('City');
      expect(result.locations[0].tags).toEqual(['urban']);
    });

    it('should export series with props', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createProp(ctx, series._id, { name: 'Sword', description: 'Magic sword' });

      const result = await call(appRouter.export.exportSeriesJson, { seriesId: series._id }, ctx());

      expect(result.props.length).toBe(1);
      expect(result.props[0].name).toBe('Sword');
    });

    it('should export series with timeline entries', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createTimelineEntry(ctx, series._id, { label: 'Act 1', order: 1 });
      await createTimelineEntry(ctx, series._id, { label: 'Act 2', order: 2 });

      const result = await call(appRouter.export.exportSeriesJson, { seriesId: series._id }, ctx());

      expect(result.timeline.length).toBe(2);
    });

    it('should export series with wildcards', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createWildcard(ctx, series._id, {
        title: 'Research Note',
        body: 'Important info',
        tag: 'research',
      });

      const result = await call(appRouter.export.exportSeriesJson, { seriesId: series._id }, ctx());

      expect(result.wildcards.length).toBe(1);
      expect(result.wildcards[0].title).toBe('Research Note');
      expect(result.wildcards[0].tag).toBe('research');
    });

    it('should export series with canvas data', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await upsertCanvas(
        ctx,
        series._id,
        [
          { _id: 'node-1', type: 'text', content: 'Idea', position: { x: 0, y: 0 } },
          { _id: 'node-2', type: 'shape', content: 'Box', position: { x: 100, y: 100 } },
        ],
        [{ _id: 'edge-1', sourceId: 'node-1', targetId: 'node-2', label: 'connects' }],
      );

      const result = await call(appRouter.export.exportSeriesJson, { seriesId: series._id }, ctx());

      expect(result.canvas.nodes.length).toBe(2);
      expect(result.canvas.edges.length).toBe(1);
    });

    it('should export appearances from characters', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Episode 1' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      await addAppearance(ctx, {
        seriesId: series._id,
        characterId: character._id,
        scriptId: script._id,
        sceneRef: 'Scene 1',
      });

      const result = await call(appRouter.export.exportSeriesJson, { seriesId: series._id }, ctx());

      expect(result.appearances.length).toBe(1);
      expect(result.appearances[0].scriptId).toBe(script._id);
      expect(result.appearances[0].sceneRef).toBe('Scene 1');
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.export.exportSeriesJson, { seriesId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });

    it('should export complete series with all entity types', async () => {
      const { ctx, series } = await createSeriesWithUser({
        title: 'Complete Series',
        genre: 'Sci-Fi',
        logline: 'An epic adventure',
      });

      // Create scripts
      const script = await createScript(ctx, series._id, { title: 'Pilot' });

      // Create KB entities
      const character = await createCharacter(ctx, series._id, {
        name: 'Captain',
        traits: ['brave', 'smart'],
      });

      const location = await createLocation(ctx, series._id, { name: 'Spaceship', tags: ['interior'] });

      await createProp(ctx, series._id, { name: 'Laser Gun' });

      await createTimelineEntry(ctx, series._id, { label: 'Launch Day', order: 1 });

      await createWildcard(ctx, series._id, { title: 'Tech Notes', tag: 'research' });

      // Add appearance
      await addAppearance(ctx, {
        seriesId: series._id,
        characterId: character._id,
        scriptId: script._id,
        sceneRef: 'Scene 1',
        locationId: location._id,
      });

      // Add canvas
      await upsertCanvas(ctx, series._id, [
        { _id: 'canvas-node', type: 'text', content: 'Plot', position: { x: 0, y: 0 } },
      ]);

      const result = await call(appRouter.export.exportSeriesJson, { seriesId: series._id }, ctx());

      // Verify complete export
      expect(result.series.title).toBe('Complete Series');
      expect(result.series.genre).toBe('Sci-Fi');
      expect(result.scripts.length).toBe(1);
      expect(result.characters.length).toBe(1);
      expect(result.locations.length).toBe(1);
      expect(result.props.length).toBe(1);
      expect(result.timeline.length).toBe(1);
      expect(result.wildcards.length).toBe(1);
      expect(result.appearances.length).toBe(1);
      expect(result.canvas.nodes.length).toBe(1);
    });
  });
});
