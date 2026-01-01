import { call } from '@orpc/server';
import { it, expect, describe } from 'bun:test';

import {
  addAppearance,
  addRelationship,
  createCharacter,
  createLocation,
  createProp,
  createScript,
  createSeries,
  createSeriesWithUser,
  upsertCanvas,
} from './helpers/factories';
import { appRouter } from './helpers/instance';
import { createUser, expectErrorCode } from './helpers/utilities';

/**
 * Integration tests that test complete workflows across multiple features.
 * These tests validate the overall system behavior and data consistency.
 */
describe('Integration Tests', () => {
  describe('Complete Series Workflow', () => {
    it('should support full series creation and management workflow', async () => {
      const { ctx, series } = await createSeriesWithUser({
        title: 'My Screenplay',
        genre: 'Drama',
        logline: 'A story of redemption',
      });

      expect(series._id).toBeDefined();

      // 2. Create scripts in the series
      const script1 = await createScript(ctx, series._id, {
        title: 'Episode 1: The Beginning',
        authors: ['John Doe'],
      });

      const script2 = await createScript(ctx, series._id, { title: 'Episode 2: The Journey' });

      // 3. Add content to scripts
      await call(
        appRouter.scripts.saveScriptContent,
        {
          scriptId: script1._id,
          content: 'FADE IN:\n\nEXT. CITY - DAY\n\nA bustling city street.',
        },
        ctx(),
      );

      // 4. Create KB entities
      const hero = await createCharacter(ctx, series._id, {
        name: 'John',
        description: 'The protagonist',
        traits: ['brave', 'kind'],
      });

      const mentor = await createCharacter(ctx, series._id, { name: 'Sarah', description: 'The mentor' });

      const city = await createLocation(ctx, series._id, {
        name: 'New York',
        description: 'Where the story begins',
      });

      // 5. Create relationships
      await addRelationship(ctx, {
        seriesId: series._id,
        characterId: hero._id,
        targetId: mentor._id,
        type: 'mentor',
        note: 'Sarah guides John',
      });

      // 6. Create appearances
      await addAppearance(ctx, {
        seriesId: series._id,
        characterId: hero._id,
        scriptId: script1._id,
        sceneRef: 'Scene 1',
        locationId: city._id,
      });

      // 7. Add canvas nodes
      await upsertCanvas(
        ctx,
        series._id,
        [
          { _id: 'plot-1', type: 'text', content: 'Act 1', position: { x: 0, y: 0 } },
          { _id: 'plot-2', type: 'text', content: 'Act 2', position: { x: 200, y: 0 } },
        ],
        [{ _id: 'act-link', sourceId: 'plot-1', targetId: 'plot-2', label: 'leads to' }],
      );

      // 8. Verify continuity graph
      const graph = await call(appRouter.continuity.continuityGraph, { seriesId: series._id }, ctx());

      expect(graph.nodes.length).toBeGreaterThan(0);
      expect(graph.edges.length).toBeGreaterThan(0);

      // 9. Export the series
      const exportData = await call(appRouter.export.exportSeriesJson, { seriesId: series._id }, ctx());

      expect(exportData.series.title).toBe('My Screenplay');
      expect(exportData.scripts.length).toBe(2);
      expect(exportData.characters.length).toBe(2);
      expect(exportData.locations.length).toBe(1);
      expect(exportData.canvas.nodes.length).toBe(2);
      expect(exportData.canvas.edges.length).toBe(1);
      expect(exportData.appearances.length).toBe(1);

      // 10. Export script PDF
      const pdfResult = await call(appRouter.export.exportScriptPdf, { scriptId: script1._id }, ctx());

      expect(pdfResult.ok).toBe(true);
    });
  });

  describe('Character Continuity Workflow', () => {
    it('should track character across multiple scripts and scenes', async () => {
      const { ctx, series } = await createSeriesWithUser({ title: 'Multi-Episode Series' });

      // Create multiple scripts
      const ep1 = await createScript(ctx, series._id, { title: 'Episode 1' });
      const ep2 = await createScript(ctx, series._id, { title: 'Episode 2' });
      const ep3 = await createScript(ctx, series._id, { title: 'Episode 3' });

      // Create character
      const hero = await createCharacter(ctx, series._id, { name: 'Hero' });

      // Add appearances across episodes
      await addAppearance(ctx, {
        seriesId: series._id,
        characterId: hero._id,
        scriptId: ep1._id,
        sceneRef: 'Opening',
      });
      await addAppearance(ctx, {
        seriesId: series._id,
        characterId: hero._id,
        scriptId: ep1._id,
        sceneRef: 'Climax',
      });
      await addAppearance(ctx, {
        seriesId: series._id,
        characterId: hero._id,
        scriptId: ep2._id,
        sceneRef: 'Mid-point',
      });
      await addAppearance(ctx, {
        seriesId: series._id,
        characterId: hero._id,
        scriptId: ep3._id,
        sceneRef: 'Finale',
      });

      // Verify appearances
      const appearances = await call(
        appRouter.continuity.appearancesByCharacter,
        { seriesId: series._id, characterId: hero._id },
        ctx(),
      );

      expect(appearances.length).toBe(4);
      expect(appearances.filter((a) => a.scriptId === ep1._id).length).toBe(2);
      expect(appearances.filter((a) => a.scriptId === ep2._id).length).toBe(1);
      expect(appearances.filter((a) => a.scriptId === ep3._id).length).toBe(1);

      // Verify graph includes all connections
      const graph = await call(appRouter.continuity.continuityGraph, { seriesId: series._id }, ctx());

      const appearanceEdges = graph.edges.filter((e) => e.type === 'appearance');
      expect(appearanceEdges.length).toBe(4);
    });
  });

  describe('Character Network Workflow', () => {
    it('should support complex character relationship networks', async () => {
      const { ctx, series } = await createSeriesWithUser({ title: 'Character Network Test' });

      // Create a network of characters
      const alice = await createCharacter(ctx, series._id, { name: 'Alice' });
      const bob = await createCharacter(ctx, series._id, { name: 'Bob' });
      const carol = await createCharacter(ctx, series._id, { name: 'Carol' });
      const david = await createCharacter(ctx, series._id, { name: 'David' });

      // Create relationships (network structure)
      await addRelationship(ctx, {
        seriesId: series._id,
        characterId: alice._id,
        targetId: bob._id,
        type: 'friend',
      });
      await addRelationship(ctx, {
        seriesId: series._id,
        characterId: alice._id,
        targetId: carol._id,
        type: 'sibling',
      });
      await addRelationship(ctx, {
        seriesId: series._id,
        characterId: bob._id,
        targetId: david._id,
        type: 'colleague',
      });
      await addRelationship(ctx, {
        seriesId: series._id,
        characterId: carol._id,
        targetId: david._id,
        type: 'rival',
      });

      // Verify graph
      const graph = await call(appRouter.continuity.continuityGraph, { seriesId: series._id }, ctx());

      const characterNodes = graph.nodes.filter((n) => n.type === 'character');
      expect(characterNodes.length).toBe(4);

      const relationshipEdges = graph.edges.filter((e) => e.type === 'relationship');
      expect(relationshipEdges.length).toBe(4);

      // Verify Alice has 2 relationships
      const aliceChar = await call(
        appRouter.knowledgeBase.characters.get,
        { id: alice._id, seriesId: series._id },
        ctx(),
      );
      expect(aliceChar.relationships?.length).toBe(2);
    });
  });

  describe('Data Isolation Between Series', () => {
    it('should completely isolate data between different series', async () => {
      const { ctx } = await createUser();

      // Create two separate series
      const series1 = await createSeries(ctx, { title: 'Series One' });
      const series2 = await createSeries(ctx, { title: 'Series Two' });

      // Add data to series 1
      await createScript(ctx, series1._id, { title: 'S1 Script' });
      await createCharacter(ctx, series1._id, { name: 'S1 Character' });
      await createLocation(ctx, series1._id, { name: 'S1 Location' });

      // Add data to series 2
      await createScript(ctx, series2._id, { title: 'S2 Script A' });
      await createScript(ctx, series2._id, { title: 'S2 Script B' });
      await createCharacter(ctx, series2._id, { name: 'S2 Character' });

      // Verify isolation in scripts
      const s1Scripts = await call(
        appRouter.scripts.listScriptsBySeries,
        { seriesId: series1._id, limit: 20, offset: 0 },
        ctx(),
      );
      const s2Scripts = await call(
        appRouter.scripts.listScriptsBySeries,
        { seriesId: series2._id, limit: 20, offset: 0 },
        ctx(),
      );

      expect(s1Scripts.items.length).toBe(1);
      expect(s2Scripts.items.length).toBe(2);

      // Verify isolation in KB entities
      const s1Chars = await call(
        appRouter.knowledgeBase.characters.list,
        { seriesId: series1._id, limit: 20, offset: 0 },
        ctx(),
      );
      const s2Chars = await call(
        appRouter.knowledgeBase.characters.list,
        { seriesId: series2._id, limit: 20, offset: 0 },
        ctx(),
      );

      expect(s1Chars.items.length).toBe(1);
      expect(s2Chars.items.length).toBe(1);

      // Verify isolation in continuity graph
      const s1Graph = await call(appRouter.continuity.continuityGraph, { seriesId: series1._id }, ctx());
      const s2Graph = await call(appRouter.continuity.continuityGraph, { seriesId: series2._id }, ctx());

      // S1 has 1 script, 1 character, 1 location = 3 nodes
      // S2 has 2 scripts, 1 character = 3 nodes
      const s1NodeNames = s1Graph.nodes.map((n) => (n as any).name || (n as any).title);
      const s2NodeNames = s2Graph.nodes.map((n) => (n as any).name || (n as any).title);

      expect(s1NodeNames).toContain('S1 Character');
      expect(s1NodeNames).toContain('S1 Location');
      expect(s1NodeNames).not.toContain('S2 Character');

      expect(s2NodeNames).toContain('S2 Character');
      expect(s2NodeNames).not.toContain('S1 Character');
    });
  });

  describe('Script Content Workflow', () => {
    it('should handle autosave-like content updates', async () => {
      const { ctx, series } = await createSeriesWithUser({ title: 'Writing Session' });

      const script = await createScript(ctx, series._id, { title: 'Chapter 1' });

      // Simulate autosave intervals
      const contents = [
        'FADE IN:',
        'FADE IN:\n\nEXT. PARK - DAY',
        'FADE IN:\n\nEXT. PARK - DAY\n\nJOHN walks through the park.',
        'FADE IN:\n\nEXT. PARK - DAY\n\nJOHN walks through the park.\n\nJOHN\nWhat a beautiful day.',
      ];

      let lastEditedAt = script.lastEditedAt;

      for (const content of contents) {
        await new Promise((r) => setTimeout(r, 5));

        const result = await call(appRouter.scripts.saveScriptContent, { scriptId: script._id, content }, ctx());

        expect(new Date(result.lastEditedAt).getTime()).toBeGreaterThanOrEqual(new Date(lastEditedAt).getTime());
        lastEditedAt = result.lastEditedAt;
      }

      // Verify final content
      const finalScript = await call(appRouter.scripts.getScript, { scriptId: script._id }, ctx());

      expect(finalScript.content).toBe(contents[contents.length - 1]);
    });
  });

  describe('Search Across Entity Types', () => {
    it('should find entities by partial name match', async () => {
      const { ctx, series } = await createSeriesWithUser({ title: 'Search Test' });

      await createCharacter(ctx, series._id, { name: 'John Smith' });
      await createCharacter(ctx, series._id, { name: 'Jane Johnson' });
      await createLocation(ctx, series._id, { name: 'Johnson Estate' });
      await createProp(ctx, series._id, { name: 'Old Journal' });

      // Search for "John" - should find John Smith, Jane Johnson, Johnson Estate
      const johnResults = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'John', limit: 20, offset: 0 },
        ctx(),
      );

      expect(johnResults.items.length).toBe(3);

      // Search for "Smith" - should only find John Smith
      const smithResults = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'Smith', limit: 20, offset: 0 },
        ctx(),
      );

      expect(smithResults.items.length).toBe(1);
      expect(smithResults.items[0]._type === 'character' && smithResults.items[0].name).toBe('John Smith');
    });
  });

  describe('Error Handling Consistency', () => {
    it('should consistently return NOT_FOUND for missing resources', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Error Test' }, ctx());

      const nonExistentId = '507f1f77bcf86cd799439011';

      // Test all entity types return correct NOT_FOUND error
      const testCases = [
        { name: 'series', fn: () => call(appRouter.series.getSeries, { seriesId: nonExistentId }, ctx()) },
        { name: 'script', fn: () => call(appRouter.scripts.getScript, { scriptId: nonExistentId }, ctx()) },
        {
          name: 'character',
          fn: () => call(appRouter.knowledgeBase.characters.get, { id: nonExistentId, seriesId: series._id }, ctx()),
        },
        {
          name: 'location',
          fn: () => call(appRouter.knowledgeBase.locations.get, { id: nonExistentId, seriesId: series._id }, ctx()),
        },
        {
          name: 'prop',
          fn: () => call(appRouter.knowledgeBase.props.get, { id: nonExistentId, seriesId: series._id }, ctx()),
        },
        {
          name: 'timeline',
          fn: () => call(appRouter.knowledgeBase.timeline.get, { id: nonExistentId, seriesId: series._id }, ctx()),
        },
        {
          name: 'wildcard',
          fn: () => call(appRouter.knowledgeBase.wildcards.get, { id: nonExistentId, seriesId: series._id }, ctx()),
        },
      ];

      for (const testCase of testCases) {
        await expectErrorCode(testCase.fn, 'NOT_FOUND');
      }
    });
  });

  describe('Cascade Operations', () => {
    it('should delete script without affecting other entities', async () => {
      const { ctx, series } = await createSeriesWithUser({ title: 'Cascade Test' });

      const script1 = await createScript(ctx, series._id, { title: 'Script 1' });
      const script2 = await createScript(ctx, series._id, { title: 'Script 2' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      // Add appearances to both scripts
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
        sceneRef: 'Scene 1',
      });

      // Delete script 1
      await call(appRouter.scripts.deleteScript, { scriptId: script1._id }, ctx());

      // Script 2 should still exist
      const remainingScript = await call(appRouter.scripts.getScript, { scriptId: script2._id }, ctx());
      expect(remainingScript.title).toBe('Script 2');

      // Character should still exist with appearances
      // (Note: appearances referencing deleted script are orphaned but character exists)
      const char = await call(
        appRouter.knowledgeBase.characters.get,
        { id: character._id, seriesId: series._id },
        ctx(),
      );
      expect(char.name).toBe('Hero');
    });
  });

  describe('Pagination Edge Cases', () => {
    it('should handle offset beyond available results', async () => {
      const { ctx, series } = await createSeriesWithUser({ title: 'Pagination Test' });

      await createCharacter(ctx, series._id, { name: 'Char 1' });
      await createCharacter(ctx, series._id, { name: 'Char 2' });

      const result = await call(
        appRouter.knowledgeBase.characters.list,
        { seriesId: series._id, limit: 10, offset: 100 },
        ctx(),
      );

      expect(result.items.length).toBe(0);
      expect(result.total).toBe(2);
    });

    it('should handle limit of 1', async () => {
      const { ctx, series } = await createSeriesWithUser({ title: 'Single Item Test' });

      for (let i = 1; i <= 5; i++) {
        await createCharacter(ctx, series._id, { name: `Character ${i}` });
      }

      const page1 = await call(
        appRouter.knowledgeBase.characters.list,
        { seriesId: series._id, limit: 1, offset: 0 },
        ctx(),
      );
      const page2 = await call(
        appRouter.knowledgeBase.characters.list,
        { seriesId: series._id, limit: 1, offset: 1 },
        ctx(),
      );

      expect(page1.items.length).toBe(1);
      expect(page2.items.length).toBe(1);
      expect(page1.items[0]._id).not.toBe(page2.items[0]._id);
      expect(page1.total).toBe(5);
    });
  });
});
