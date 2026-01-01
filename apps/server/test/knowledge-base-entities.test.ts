import { call } from '@orpc/server';
import { it, expect, describe } from 'bun:test';

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

describe('Knowledge Base API - Locations', () => {
  describe('createLocation', () => {
    it('should create a location with required fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const location = await createLocation(ctx, series._id, { name: 'New York City' });

      expect(location).toBeDefined();
      expect(location._id).toBeDefined();
      expect(location.seriesId).toBe(series._id);
      expect(location.name).toBe('New York City');
      expect(location.appearances).toEqual([]);
    });

    it('should create a location with optional fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const location = await createLocation(ctx, series._id, {
        name: 'Beach House',
        description: 'A secluded beach house on the coast',
        tags: ['exterior', 'day', 'romantic'],
      });

      expect(location.name).toBe('Beach House');
      expect(location.description).toBe('A secluded beach house on the coast');
      expect(location.tags).toEqual(['exterior', 'day', 'romantic']);
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(() => createLocation(ctx, '507f1f77bcf86cd799439011', { name: 'Orphan' }), 'NOT_FOUND');
    });

    it('should fail when name is empty', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(() => createLocation(ctx, series._id, { name: '   ' }), 'BAD_REQUEST');
    });
  });

  describe('getLocation', () => {
    it('should get an existing location', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const created = await createLocation(ctx, series._id, {
        name: 'Central Park',
        description: 'Famous park',
      });

      const fetched = await call(
        appRouter.knowledgeBase.locations.get,
        { id: created._id, seriesId: series._id },
        ctx(),
      );

      expect(fetched._id).toBe(created._id);
      expect(fetched.name).toBe('Central Park');
      expect(fetched.description).toBe('Famous park');
    });

    it('should return NOT_FOUND for non-existent location', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(
        () =>
          call(appRouter.knowledgeBase.locations.get, { id: '507f1f77bcf86cd799439011', seriesId: series._id }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('updateLocation', () => {
    it('should update location fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const location = await createLocation(ctx, series._id, { name: 'Original' });

      const updated = await call(
        appRouter.knowledgeBase.locations.update,
        {
          id: location._id,
          seriesId: series._id,
          patch: { name: 'Updated', description: 'New desc', tags: ['urban'] },
        },
        ctx(),
      );

      expect(updated.name).toBe('Updated');
      expect(updated.description).toBe('New desc');
      expect(updated.tags).toEqual(['urban']);
    });

    it('should fail when location does not exist', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.knowledgeBase.locations.update,
            { id: '507f1f77bcf86cd799439011', seriesId: series._id, patch: { name: 'New' } },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });
  });

  describe('deleteLocation', () => {
    it('should delete an existing location', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const location = await createLocation(ctx, series._id, { name: 'To Delete' });

      const result = await call(
        appRouter.knowledgeBase.locations.remove,
        { id: location._id, seriesId: series._id },
        ctx(),
      );

      expect(result.success).toBe(true);

      await expectErrorCode(
        () => call(appRouter.knowledgeBase.locations.get, { id: location._id, seriesId: series._id }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('listLocations', () => {
    it('should return locations for a series', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createLocation(ctx, series._id, { name: 'Location 1' });
      await createLocation(ctx, series._id, { name: 'Location 2' });

      const result = await call(
        appRouter.knowledgeBase.locations.list,
        { seriesId: series._id, limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should paginate correctly', async () => {
      const { ctx, series } = await createSeriesWithUser();

      for (let i = 1; i <= 5; i++) {
        await createLocation(ctx, series._id, { name: `Location ${i}` });
      }

      const page1 = await call(
        appRouter.knowledgeBase.locations.list,
        { seriesId: series._id, limit: 2, offset: 0 },
        ctx(),
      );

      const page2 = await call(
        appRouter.knowledgeBase.locations.list,
        { seriesId: series._id, limit: 2, offset: 2 },
        ctx(),
      );

      expect(page1.items.length).toBe(2);
      expect(page2.items.length).toBe(2);
      expect(page1.total).toBe(5);
      expect(page1.items[0]._id).not.toBe(page2.items[0]._id);
    });
  });
});

describe('Knowledge Base API - Props', () => {
  describe('createProp', () => {
    it('should create a prop with required fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const prop = await createProp(ctx, series._id, { name: 'Magic Sword' });

      expect(prop).toBeDefined();
      expect(prop._id).toBeDefined();
      expect(prop.seriesId).toBe(series._id);
      expect(prop.name).toBe('Magic Sword');
      expect(prop.associations).toEqual([]);
    });

    it('should create a prop with description', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const prop = await createProp(ctx, series._id, {
        name: 'Ancient Ring',
        description: 'A mystical ring with unknown powers',
      });

      expect(prop.name).toBe('Ancient Ring');
      expect(prop.description).toBe('A mystical ring with unknown powers');
    });

    it('should fail when name is empty', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(() => createProp(ctx, series._id, { name: '   ' }), 'BAD_REQUEST');
    });
  });

  describe('getProp', () => {
    it('should get an existing prop', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const created = await createProp(ctx, series._id, {
        name: 'Golden Key',
        description: 'Opens secret doors',
      });

      const fetched = await call(appRouter.knowledgeBase.props.get, { id: created._id, seriesId: series._id }, ctx());

      expect(fetched._id).toBe(created._id);
      expect(fetched.name).toBe('Golden Key');
    });

    it('should return NOT_FOUND for non-existent prop', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(
        () => call(appRouter.knowledgeBase.props.get, { id: '507f1f77bcf86cd799439011', seriesId: series._id }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('updateProp', () => {
    it('should update prop fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const prop = await createProp(ctx, series._id, { name: 'Original' });

      const updated = await call(
        appRouter.knowledgeBase.props.update,
        {
          id: prop._id,
          seriesId: series._id,
          patch: { name: 'Updated Prop', description: 'New description' },
        },
        ctx(),
      );

      expect(updated.name).toBe('Updated Prop');
      expect(updated.description).toBe('New description');
    });

    it('should fail when prop does not exist', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.knowledgeBase.props.update,
            { id: '507f1f77bcf86cd799439011', seriesId: series._id, patch: { name: 'New' } },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });
  });

  describe('deleteProp', () => {
    it('should delete an existing prop', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const prop = await createProp(ctx, series._id, { name: 'To Delete' });

      const result = await call(appRouter.knowledgeBase.props.remove, { id: prop._id, seriesId: series._id }, ctx());

      expect(result.success).toBe(true);

      await expectErrorCode(
        () => call(appRouter.knowledgeBase.props.get, { id: prop._id, seriesId: series._id }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('listProps', () => {
    it('should return props for a series', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createProp(ctx, series._id, { name: 'Prop 1' });
      await createProp(ctx, series._id, { name: 'Prop 2' });

      const result = await call(
        appRouter.knowledgeBase.props.list,
        { seriesId: series._id, limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
    });
  });
});

describe('Knowledge Base API - Timeline', () => {
  describe('createTimelineEntry', () => {
    it('should create a timeline entry with required fields', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      const entry = await call(
        appRouter.knowledgeBase.timeline.create,
        { seriesId: series._id, value: { label: 'Chapter 1 Events' } },
        ctx(),
      );

      expect(entry).toBeDefined();
      expect(entry._id).toBeDefined();
      expect(entry.seriesId).toBe(series._id);
      expect(entry.label).toBe('Chapter 1 Events');
      expect(entry.links).toEqual([]);
    });

    it('should create a timeline entry with optional fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const entry = await createTimelineEntry(ctx, series._id, {
        label: 'Battle Scene',
        order: 5,
        timestamp: '2020-06-15T14:30:00Z',
        links: [
          { entityType: 'character', entityId: 'char-123' },
          { entityType: 'location', entityId: 'loc-456' },
        ],
      });

      expect(entry.label).toBe('Battle Scene');
      expect(entry.order).toBe(5);
      expect(entry.timestamp).toBe('2020-06-15T14:30:00Z');
      expect(entry.links?.length).toBe(2);
    });

    it('should fail when label is empty', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(() => createTimelineEntry(ctx, series._id, { label: '   ' }), 'BAD_REQUEST');
    });
  });

  describe('getTimelineEntry', () => {
    it('should get an existing timeline entry', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const created = await createTimelineEntry(ctx, series._id, { label: 'Get Me', order: 1 });

      const fetched = await call(
        appRouter.knowledgeBase.timeline.get,
        { id: created._id, seriesId: series._id },
        ctx(),
      );

      expect(fetched._id).toBe(created._id);
      expect(fetched.label).toBe('Get Me');
      expect(fetched.order).toBe(1);
    });

    it('should return NOT_FOUND for non-existent entry', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(
        () =>
          call(appRouter.knowledgeBase.timeline.get, { id: '507f1f77bcf86cd799439011', seriesId: series._id }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('updateTimelineEntry', () => {
    it('should update timeline entry fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const entry = await createTimelineEntry(ctx, series._id, { label: 'Original', order: 1 });

      const updated = await call(
        appRouter.knowledgeBase.timeline.update,
        {
          id: entry._id,
          seriesId: series._id,
          patch: { label: 'Updated', order: 2 },
        },
        ctx(),
      );

      expect(updated.label).toBe('Updated');
      expect(updated.order).toBe(2);
    });
  });

  describe('deleteTimelineEntry', () => {
    it('should delete an existing timeline entry', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const entry = await createTimelineEntry(ctx, series._id, { label: 'To Delete' });

      const result = await call(
        appRouter.knowledgeBase.timeline.remove,
        { id: entry._id, seriesId: series._id },
        ctx(),
      );

      expect(result.success).toBe(true);
    });
  });

  describe('listTimelineEntries', () => {
    it('should return timeline entries ordered by order field', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createTimelineEntry(ctx, series._id, { label: 'Third', order: 3 });
      await createTimelineEntry(ctx, series._id, { label: 'First', order: 1 });
      await createTimelineEntry(ctx, series._id, { label: 'Second', order: 2 });

      const result = await call(
        appRouter.knowledgeBase.timeline.list,
        { seriesId: series._id, limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(3);
      expect(result.items[0].label).toBe('First');
      expect(result.items[1].label).toBe('Second');
      expect(result.items[2].label).toBe('Third');
    });
  });
});

describe('Knowledge Base API - WildCards', () => {
  describe('createWildCard', () => {
    it('should create a wildcard with required fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const wildcard = await createWildcard(ctx, series._id, { title: 'Plot Twist Idea' });

      expect(wildcard).toBeDefined();
      expect(wildcard._id).toBeDefined();
      expect(wildcard.seriesId).toBe(series._id);
      expect(wildcard.title).toBe('Plot Twist Idea');
    });

    it('should create a wildcard with all fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const wildcard = await createWildcard(ctx, series._id, {
        title: 'Research Note',
        body: 'Detailed research about historical accuracy...',
        tag: 'research',
      });

      expect(wildcard.title).toBe('Research Note');
      expect(wildcard.body).toBe('Detailed research about historical accuracy...');
      expect(wildcard.tag).toBe('research');
    });

    it('should fail when title is empty', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(() => createWildcard(ctx, series._id, { title: '   ' }), 'BAD_REQUEST');
    });
  });

  describe('getWildCard', () => {
    it('should get an existing wildcard', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const created = await createWildcard(ctx, series._id, { title: 'Get Me', body: 'Content' });

      const fetched = await call(
        appRouter.knowledgeBase.wildcards.get,
        { id: created._id, seriesId: series._id },
        ctx(),
      );

      expect(fetched._id).toBe(created._id);
      expect(fetched.title).toBe('Get Me');
      expect(fetched.body).toBe('Content');
    });

    it('should return NOT_FOUND for non-existent wildcard', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(
        () =>
          call(appRouter.knowledgeBase.wildcards.get, { id: '507f1f77bcf86cd799439011', seriesId: series._id }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('updateWildCard', () => {
    it('should update wildcard fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const wildcard = await createWildcard(ctx, series._id, { title: 'Original' });

      const updated = await call(
        appRouter.knowledgeBase.wildcards.update,
        {
          id: wildcard._id,
          seriesId: series._id,
          patch: { title: 'Updated', body: 'New content', tag: 'important' },
        },
        ctx(),
      );

      expect(updated.title).toBe('Updated');
      expect(updated.body).toBe('New content');
      expect(updated.tag).toBe('important');
    });
  });

  describe('deleteWildCard', () => {
    it('should delete an existing wildcard', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const wildcard = await createWildcard(ctx, series._id, { title: 'To Delete' });

      const result = await call(
        appRouter.knowledgeBase.wildcards.remove,
        { id: wildcard._id, seriesId: series._id },
        ctx(),
      );

      expect(result.success).toBe(true);
    });
  });

  describe('listWildCards', () => {
    it('should return wildcards for a series', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createWildcard(ctx, series._id, { title: 'Note 1' });
      await createWildcard(ctx, series._id, { title: 'Note 2' });

      const result = await call(
        appRouter.knowledgeBase.wildcards.list,
        { seriesId: series._id, limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
    });
  });
});

describe('Knowledge Base API - Search', () => {
  describe('searchKB', () => {
    it('should search across all entity types', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createCharacter(ctx, series._id, { name: 'Test Hero' });
      await createLocation(ctx, series._id, { name: 'Test Location' });
      await createProp(ctx, series._id, { name: 'Test Prop' });

      const result = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'Test', limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBeGreaterThanOrEqual(3);
      expect(result.items.some((i) => i._type === 'character')).toBe(true);
      expect(result.items.some((i) => i._type === 'location')).toBe(true);
      expect(result.items.some((i) => i._type === 'prop')).toBe(true);
    });

    it('should filter by search query', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createCharacter(ctx, series._id, { name: 'Alice' });
      await createCharacter(ctx, series._id, { name: 'Bob' });

      const result = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'Alice', limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(1);
      const character = result.items[0];
      expect(character._type === 'character' && character.name === 'Alice').toBe(true);
    });

    it('should return empty when no match', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createCharacter(ctx, series._id, { name: 'John' });

      const result = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'XYZ123', limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(0);
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

    it('should be case insensitive', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createCharacter(ctx, series._id, { name: 'UPPERCASE NAME' });

      const result = await call(
        appRouter.knowledgeBase.searchKB,
        { seriesId: series._id, query: 'uppercase', limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(1);
      const character = result.items[0];
      expect(character._type === 'character' && character.name === 'UPPERCASE NAME').toBe(true);
    });
  });
});
