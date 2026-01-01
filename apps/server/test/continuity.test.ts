import { call } from '@orpc/server';
import { it, expect, describe } from 'bun:test';

import { AuditEntryModel } from '@~/db/models/audit-entry.model';

import {
  addAppearance,
  addRelationship,
  createCharacter,
  createLocation,
  createProp,
  createScript,
  createSeriesWithUser,
  createTimelineEntry,
} from './helpers/factories';
import { appRouter } from './helpers/instance';
import { createUser, expectErrorCode } from './helpers/utilities';

describe('Continuity API', () => {
  describe('continuityGraph', () => {
    it('should return empty graph for new series', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const graph = await call(appRouter.continuity.continuityGraph, { seriesId: series._id }, ctx());

      expect(graph.nodes).toBeArray();
      expect(graph.nodes.length).toBe(0);
      expect(graph.edges).toBeArray();
      expect(graph.edges.length).toBe(0);
    });

    it('should include characters in graph nodes', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createCharacter(ctx, series._id, { name: 'Hero' });
      await createCharacter(ctx, series._id, { name: 'Villain' });

      const graph = await call(appRouter.continuity.continuityGraph, { seriesId: series._id }, ctx());

      const characterNodes = graph.nodes.filter((n) => n.type === 'character');
      expect(characterNodes.length).toBe(2);
    });

    it('should include locations in graph nodes', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createLocation(ctx, series._id, { name: 'City' });

      const graph = await call(appRouter.continuity.continuityGraph, { seriesId: series._id }, ctx());

      const locationNodes = graph.nodes.filter((n) => n.type === 'location');
      expect(locationNodes.length).toBe(1);
    });

    it('should include props in graph nodes', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createProp(ctx, series._id, { name: 'Sword' });

      const graph = await call(appRouter.continuity.continuityGraph, { seriesId: series._id }, ctx());

      const propNodes = graph.nodes.filter((n) => n.type === 'prop');
      expect(propNodes.length).toBe(1);
    });

    it('should include scripts in graph nodes', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createScript(ctx, series._id, { title: 'Episode 1' });

      const graph = await call(appRouter.continuity.continuityGraph, { seriesId: series._id }, ctx());

      const scriptNodes = graph.nodes.filter((n) => n.type === 'script');
      expect(scriptNodes.length).toBe(1);
    });

    it('should include timeline entries in graph nodes', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createTimelineEntry(ctx, series._id, { label: 'Act 1' });

      const graph = await call(appRouter.continuity.continuityGraph, { seriesId: series._id }, ctx());

      const timelineNodes = graph.nodes.filter((n) => n.type === 'timeline');
      expect(timelineNodes.length).toBe(1);
    });

    it('should include relationship edges', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const char1 = await createCharacter(ctx, series._id, { name: 'Alice' });
      const char2 = await createCharacter(ctx, series._id, { name: 'Bob' });

      await addRelationship(ctx, {
        seriesId: series._id,
        characterId: char1._id,
        targetId: char2._id,
        type: 'friend',
      });

      const graph = await call(appRouter.continuity.continuityGraph, { seriesId: series._id }, ctx());

      const relationshipEdges = graph.edges.filter((e) => e.type === 'relationship');
      expect(relationshipEdges.length).toBe(1);
      expect(relationshipEdges[0].fromId).toBe(char1._id);
      expect(relationshipEdges[0].toId).toBe(char2._id);
    });

    it('should include appearance edges', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Episode 1' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      await addAppearance(ctx, {
        seriesId: series._id,
        characterId: character._id,
        scriptId: script._id,
        sceneRef: 'Scene 1',
      });

      const graph = await call(appRouter.continuity.continuityGraph, { seriesId: series._id }, ctx());

      const appearanceEdges = graph.edges.filter((e) => e.type === 'appearance');
      expect(appearanceEdges.length).toBe(1);
      expect(appearanceEdges[0].fromId).toBe(character._id);
      expect(appearanceEdges[0].toId).toBe(script._id);
    });

    it('should include location-of edges from appearances with locations', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Episode 1' });

      const location = await createLocation(ctx, series._id, { name: 'Beach' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      await addAppearance(ctx, {
        seriesId: series._id,
        characterId: character._id,
        scriptId: script._id,
        sceneRef: 'Scene 1',
        locationId: location._id,
      });

      const graph = await call(appRouter.continuity.continuityGraph, { seriesId: series._id }, ctx());

      const locationOfEdges = graph.edges.filter((e) => e.type === 'location-of');
      expect(locationOfEdges.length).toBe(1);
      expect(locationOfEdges[0].fromId).toBe(location._id);
      expect(locationOfEdges[0].toId).toBe(script._id);
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.continuity.continuityGraph, { seriesId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('appearancesByCharacter', () => {
    it('should return empty for character with no appearances', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      const appearances = await call(
        appRouter.continuity.appearancesByCharacter,
        { seriesId: series._id, characterId: character._id },
        ctx(),
      );

      expect(Array.isArray(appearances)).toBe(true);
      expect(appearances.length).toBe(0);
    });

    it('should return all appearances for a character', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script1 = await createScript(ctx, series._id, { title: 'Episode 1' });

      const script2 = await createScript(ctx, series._id, { title: 'Episode 2' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      await addAppearance(ctx, {
        seriesId: series._id,
        characterId: character._id,
        scriptId: script1._id,
        sceneRef: 'Scene 1',
      });

      await addAppearance(ctx, {
        seriesId: series._id,
        characterId: character._id,
        scriptId: script2._id,
        sceneRef: 'Scene 5',
      });

      const appearances = await call(
        appRouter.continuity.appearancesByCharacter,
        { seriesId: series._id, characterId: character._id },
        ctx(),
      );

      expect(appearances.length).toBe(2);
      expect(appearances.map((a) => a.scriptId)).toContain(script1._id);
      expect(appearances.map((a) => a.scriptId)).toContain(script2._id);
    });

    it('should include locationId in appearance data', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Episode 1' });

      const location = await createLocation(ctx, series._id, { name: 'Beach' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      await addAppearance(ctx, {
        seriesId: series._id,
        characterId: character._id,
        scriptId: script._id,
        sceneRef: 'Scene 1',
        locationId: location._id,
      });

      const appearances = await call(
        appRouter.continuity.appearancesByCharacter,
        { seriesId: series._id, characterId: character._id },
        ctx(),
      );

      expect(appearances[0].locationId).toBe(location._id);
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.continuity.appearancesByCharacter,
            { seriesId: '507f1f77bcf86cd799439011', characterId: '507f1f77bcf86cd799439012' },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });

    it('should fail when character does not exist', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.continuity.appearancesByCharacter,
            { seriesId: series._id, characterId: '507f1f77bcf86cd799439012' },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });
  });

  describe('auditListByEntity', () => {
    it('should return empty for entity with no audit entries', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const result = await call(
        appRouter.continuity.auditListByEntity,
        {
          seriesId: series._id,
          entityType: 'character',
          entityId: 'some-id',
          offset: 0,
          limit: 20,
        },
        ctx(),
      );

      expect(result.items).toBeArray();
      expect(result.items.length).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should return audit entries for an entity', async () => {
      const { ctx, user, series } = await createSeriesWithUser();

      // Manually create audit entries for testing
      await AuditEntryModel.create({
        seriesId: series._id,
        entityType: 'character',
        entityId: 'char-123',
        action: 'CREATE',
        actorId: user.id,
        timestamp: new Date(),
        after: { name: 'Hero' },
      });

      await AuditEntryModel.create({
        seriesId: series._id,
        entityType: 'character',
        entityId: 'char-123',
        action: 'UPDATE',
        actorId: user.id,
        timestamp: new Date(),
        before: { name: 'Hero' },
        after: { name: 'Super Hero' },
      });

      const result = await call(
        appRouter.continuity.auditListByEntity,
        {
          seriesId: series._id,
          entityType: 'character',
          entityId: 'char-123',
          offset: 0,
          limit: 20,
        },
        ctx(),
      );

      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should paginate results', async () => {
      const { ctx, user, series } = await createSeriesWithUser();

      // Create 5 audit entries
      for (let i = 0; i < 5; i++) {
        await AuditEntryModel.create({
          seriesId: series._id,
          entityType: 'character',
          entityId: 'char-123',
          action: 'UPDATE',
          actorId: user.id,
          timestamp: new Date(Date.now() - i * 1000),
        });
      }

      const page1 = await call(
        appRouter.continuity.auditListByEntity,
        {
          seriesId: series._id,
          entityType: 'character',
          entityId: 'char-123',
          offset: 0,
          limit: 2,
        },
        ctx(),
      );

      const page2 = await call(
        appRouter.continuity.auditListByEntity,
        {
          seriesId: series._id,
          entityType: 'character',
          entityId: 'char-123',
          offset: 2,
          limit: 2,
        },
        ctx(),
      );

      expect(page1.items.length).toBe(2);
      expect(page2.items.length).toBe(2);
      expect(page1.total).toBe(5);
      expect(page1.items[0]._id).not.toBe(page2.items[0]._id);
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.continuity.auditListByEntity,
            {
              seriesId: '507f1f77bcf86cd799439011',
              entityType: 'character',
              entityId: 'some-id',
              offset: 0,
              limit: 20,
            },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });
  });

  describe('auditListBySeries', () => {
    it('should return empty for series with no audit entries', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const result = await call(
        appRouter.continuity.auditListBySeries,
        { seriesId: series._id, offset: 0, limit: 20 },
        ctx(),
      );

      expect(result.items).toBeArray();
      expect(result.items.length).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should return all audit entries for a series', async () => {
      const { ctx, user, series } = await createSeriesWithUser();

      await AuditEntryModel.create({
        seriesId: series._id,
        entityType: 'character',
        entityId: 'char-1',
        action: 'CREATE',
        actorId: user.id,
        timestamp: new Date(),
      });

      await AuditEntryModel.create({
        seriesId: series._id,
        entityType: 'location',
        entityId: 'loc-1',
        action: 'CREATE',
        actorId: user.id,
        timestamp: new Date(),
      });

      const result = await call(
        appRouter.continuity.auditListBySeries,
        { seriesId: series._id, offset: 0, limit: 20 },
        ctx(),
      );

      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should order entries by timestamp descending', async () => {
      const { ctx, user, series } = await createSeriesWithUser();

      const oldDate = new Date('2020-01-01');
      const newDate = new Date('2025-01-01');

      await AuditEntryModel.create({
        seriesId: series._id,
        entityType: 'character',
        entityId: 'old',
        action: 'CREATE',
        actorId: user.id,
        timestamp: oldDate,
      });

      await AuditEntryModel.create({
        seriesId: series._id,
        entityType: 'character',
        entityId: 'new',
        action: 'CREATE',
        actorId: user.id,
        timestamp: newDate,
      });

      const result = await call(
        appRouter.continuity.auditListBySeries,
        { seriesId: series._id, offset: 0, limit: 20 },
        ctx(),
      );

      expect(result.items[0].entityId).toBe('new');
      expect(result.items[1].entityId).toBe('old');
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.continuity.auditListBySeries,
            { seriesId: '507f1f77bcf86cd799439011', offset: 0, limit: 20 },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });
  });
});
