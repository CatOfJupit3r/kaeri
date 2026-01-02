import { call } from '@orpc/server';
import { describe, expect, it } from 'bun:test';

import {
  createCharacter,
  createLocation,
  createProp,
  createSeriesWithUser,
  createTimelineEntry,
  createWildcard,
} from './helpers/factories';
import { appRouter } from './helpers/instance';
import { createUser, expectErrorCode } from './helpers/utilities';

describe('Knowledge Base API - Search', () => {
  describe('searchKB', () => {
    it('should search across all entity types', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createCharacter(ctx, series._id, { name: 'Test Character' });
      await createLocation(ctx, series._id, { name: 'Test Location' });
      await createProp(ctx, series._id, { name: 'Test Prop' });
      await createTimelineEntry(ctx, series._id, { label: 'Test Timeline' });
      await createWildcard(ctx, series._id, { title: 'Test Wildcard' });

      const result = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'Test', limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(5);
      expect(result.total).toBe(5);

      const types = result.items.map((item) => item._type);
      expect(types).toContain('character');
      expect(types).toContain('location');
      expect(types).toContain('prop');
      expect(types).toContain('timeline');
      expect(types).toContain('wildcard');
    });

    it('should filter results by search query', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createCharacter(ctx, series._id, { name: 'John Doe' });
      await createCharacter(ctx, series._id, { name: 'Jane Smith' });
      await createLocation(ctx, series._id, { name: 'New York' });

      const result = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'John', limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(1);
      expect(result.items[0]._type).toBe('character');
      if (result.items[0]._type === 'character') {
        expect(result.items[0].name).toBe('John Doe');
      }
    });

    it('should be case-insensitive', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createCharacter(ctx, series._id, { name: 'Alice Wonder' });

      const result = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'alice', limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(1);
      if (result.items[0]._type === 'character') {
        expect(result.items[0].name).toBe('Alice Wonder');
      }
    });

    it('should return empty results for non-matching query', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createCharacter(ctx, series._id, { name: 'Bob Builder' });

      const result = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'NonExistent', limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should paginate search results', async () => {
      const { ctx, series } = await createSeriesWithUser();

      for (let i = 1; i <= 5; i++) {
        await createCharacter(ctx, series._id, { name: `Test Character ${i}` });
      }

      const page1 = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'Test', limit: 2, offset: 0 },
        ctx(),
      );

      const page2 = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'Test', limit: 2, offset: 2 },
        ctx(),
      );

      expect(page1.items.length).toBe(2);
      expect(page2.items.length).toBe(2);
      expect(page1.items[0]._id).not.toBe(page2.items[0]._id);
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.knowledgeBase.searchKB,
            { seriesId: '507f1f77bcf86cd799439011', query: 'test', limit: 20, offset: 0 },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });

    it('should search timeline entries by label', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createTimelineEntry(ctx, series._id, { label: 'Battle of Winterfell', order: 1 });
      await createTimelineEntry(ctx, series._id, { label: 'Wedding Day', order: 2 });

      const result = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'Battle', limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(1);
      expect(result.items[0]._type).toBe('timeline');
      if (result.items[0]._type === 'timeline') {
        expect(result.items[0].label).toBe('Battle of Winterfell');
      }
    });

    it('should search wildcards by title', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createWildcard(ctx, series._id, { title: 'Plot Twist Idea' });
      await createWildcard(ctx, series._id, { title: 'Character Motivation' });

      const result = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'Plot', limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(1);
      expect(result.items[0]._type).toBe('wildcard');
      if (result.items[0]._type === 'wildcard') {
        expect(result.items[0].title).toBe('Plot Twist Idea');
      }
    });

    it('should return results with correct discriminated union type', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const character = await createCharacter(ctx, series._id, { name: 'Search Test', description: 'A test char' });
      const location = await createLocation(ctx, series._id, { name: 'Search Test Location', tags: ['urban'] });

      const result = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'Search Test', limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(2);

      const charResult = result.items.find((item) => item._type === 'character');
      const locResult = result.items.find((item) => item._type === 'location');

      expect(charResult).toBeDefined();
      expect(locResult).toBeDefined();

      if (charResult && charResult._type === 'character') {
        expect(charResult.name).toBe('Search Test');
        expect(charResult.description).toBe('A test char');
      }

      if (locResult && locResult._type === 'location') {
        expect(locResult.name).toBe('Search Test Location');
        expect(locResult.tags).toEqual(['urban']);
      }
    });
  });
});
