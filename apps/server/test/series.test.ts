import { call } from '@orpc/server';
import { it, expect, describe } from 'bun:test';

import { createScript, createSeries, createSeriesWithUser } from './helpers/factories';
import { appRouter } from './helpers/instance';
import { createUser, expectErrorCode } from './helpers/utilities';

describe('Series API', () => {
  describe('createSeries', () => {
    it('should create a series with required fields', async () => {
      const { ctx } = await createUser();

      const series = await createSeries(ctx, { title: 'My Test Series' });

      expect(series).toBeDefined();
      expect(series._id).toBeDefined();
      expect(series.title).toBe('My Test Series');
      expect(series.lastEditedAt).toBeDefined();
    });

    it('should create a series with all optional fields', async () => {
      const { ctx } = await createUser();

      const series = await createSeries(ctx, {
        title: 'Full Series',
        genre: 'Drama',
        logline: 'A compelling story about...',
        coverUrl: 'https://example.com/cover.jpg',
      });

      expect(series).toBeDefined();
      expect(series.title).toBe('Full Series');
      expect(series.genre).toBe('Drama');
      expect(series.logline).toBe('A compelling story about...');
      expect(series.coverUrl).toBe('https://example.com/cover.jpg');
    });

    it('should fail when title is empty', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(() => call(appRouter.series.createSeries, { title: '' }, ctx()), 'BAD_REQUEST');
    });

    it('should fail when title is whitespace only', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(() => call(appRouter.series.createSeries, { title: '   ' }, ctx()), 'BAD_REQUEST');
    });

    it('should set lastEditedAt on creation', async () => {
      const { ctx } = await createUser();
      const before = new Date();

      const series = await createSeries(ctx, { title: 'Timestamp Test' });

      const after = new Date();
      expect(new Date(series.lastEditedAt).getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(new Date(series.lastEditedAt).getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('getSeries', () => {
    it('should get an existing series', async () => {
      const { ctx } = await createUser();

      const created = await createSeries(ctx, { title: 'Get Test', genre: 'Comedy' });

      const fetched = await call(appRouter.series.getSeries, { seriesId: created._id }, ctx());

      expect(fetched._id).toBe(created._id);
      expect(fetched.title).toBe('Get Test');
      expect(fetched.genre).toBe('Comedy');
    });

    it('should return NOT_FOUND for non-existent series', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.series.getSeries, { seriesId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });

    it('should return NOT_FOUND for invalid ID format', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(() => call(appRouter.series.getSeries, { seriesId: 'invalid-id' }, ctx()), 'NOT_FOUND');
    });
  });

  describe('updateSeries', () => {
    it('should update series title', async () => {
      const { ctx } = await createUser();

      const created = await createSeries(ctx, { title: 'Original Title' });

      const updated = await call(
        appRouter.series.updateSeries,
        { seriesId: created._id, patch: { title: 'Updated Title' } },
        ctx(),
      );

      expect(updated.title).toBe('Updated Title');
    });

    it('should update multiple fields at once', async () => {
      const { ctx } = await createUser();

      const created = await createSeries(ctx, { title: 'Original' });

      const updated = await call(
        appRouter.series.updateSeries,
        {
          seriesId: created._id,
          patch: {
            title: 'New Title',
            genre: 'Horror',
            logline: 'New logline',
          },
        },
        ctx(),
      );

      expect(updated.title).toBe('New Title');
      expect(updated.genre).toBe('Horror');
      expect(updated.logline).toBe('New logline');
    });

    it('should update lastEditedAt on modification', async () => {
      const { ctx } = await createUser();

      const created = await createSeries(ctx, { title: 'Timestamp Series' });

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await call(
        appRouter.series.updateSeries,
        { seriesId: created._id, patch: { title: 'Updated' } },
        ctx(),
      );

      expect(new Date(updated.lastEditedAt).getTime()).toBeGreaterThan(new Date(created.lastEditedAt).getTime());
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () =>
          call(appRouter.series.updateSeries, { seriesId: '507f1f77bcf86cd799439011', patch: { title: 'New' } }, ctx()),
        'NOT_FOUND',
      );
    });

    it('should preserve unmodified fields', async () => {
      const { ctx } = await createUser();

      const created = await createSeries(ctx, {
        title: 'Keep This',
        genre: 'Drama',
        logline: 'Original logline',
      });

      const updated = await call(
        appRouter.series.updateSeries,
        { seriesId: created._id, patch: { genre: 'Comedy' } },
        ctx(),
      );

      expect(updated.title).toBe('Keep This');
      expect(updated.genre).toBe('Comedy');
      expect(updated.logline).toBe('Original logline');
    });
  });

  describe('deleteSeries', () => {
    it('should delete an existing series without dependencies', async () => {
      const { ctx } = await createUser();

      const created = await createSeries(ctx, { title: 'To Delete' });

      const result = await call(appRouter.series.deleteSeries, { seriesId: created._id }, ctx());

      expect(result.success).toBe(true);

      // Verify deletion
      await expectErrorCode(() => call(appRouter.series.getSeries, { seriesId: created._id }, ctx()), 'NOT_FOUND');
    });

    it('should fail when series has scripts', async () => {
      const { ctx } = await createUser();

      const series = await createSeries(ctx, { title: 'Series With Scripts' });

      // Create a script in the series
      await createScript(ctx, series._id, { title: 'Test Script' });

      await expectErrorCode(
        () => call(appRouter.series.deleteSeries, { seriesId: series._id }, ctx()),
        'UNPROCESSABLE_CONTENT',
      );
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.series.deleteSeries, { seriesId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('listSeries', () => {
    it('should return empty list when no series exist', async () => {
      const { ctx } = await createUser();

      const result = await call(appRouter.series.listSeries, { limit: 20, offset: 0 }, ctx());

      expect(result.items).toBeArray();
      expect(result.items.length).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should return created series', async () => {
      const { ctx } = await createUser();

      await createSeries(ctx, { title: 'Series 1' });
      await createSeries(ctx, { title: 'Series 2' });

      const result = await call(appRouter.series.listSeries, { limit: 20, offset: 0 }, ctx());

      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should paginate results correctly', async () => {
      const { ctx } = await createUser();

      // Create 5 series
      for (let i = 1; i <= 5; i++) {
        await createSeries(ctx, { title: `Series ${i}` });
      }

      const page1 = await call(appRouter.series.listSeries, { limit: 2, offset: 0 }, ctx());

      expect(page1.items.length).toBe(2);
      expect(page1.total).toBe(5);

      const page2 = await call(appRouter.series.listSeries, { limit: 2, offset: 2 }, ctx());

      expect(page2.items.length).toBe(2);
      expect(page2.total).toBe(5);

      // Different items
      expect(page1.items[0]._id).not.toBe(page2.items[0]._id);
    });

    it('should order by lastEditedAt descending', async () => {
      const { ctx } = await createUser();

      const s1 = await createSeries(ctx, { title: 'First' });
      await new Promise((r) => setTimeout(r, 10));
      const s2 = await createSeries(ctx, { title: 'Second' });
      await new Promise((r) => setTimeout(r, 10));
      const s3 = await createSeries(ctx, { title: 'Third' });

      const result = await call(appRouter.series.listSeries, { limit: 20, offset: 0 }, ctx());

      // Most recently edited first
      expect(result.items[0]._id).toBe(s3._id);
      expect(result.items[1]._id).toBe(s2._id);
      expect(result.items[2]._id).toBe(s1._id);
    });
  });

  describe('exportSeriesSummary', () => {
    it('should export series with scripts metadata', async () => {
      const { ctx } = await createUser();

      const series = await createSeries(ctx, { title: 'Export Test', genre: 'Action' });

      await createScript(ctx, series._id, { title: 'Script 1' });
      await createScript(ctx, series._id, { title: 'Script 2' });

      const result = await call(appRouter.series.exportSeriesSummary, { seriesId: series._id }, ctx());

      expect(result.series._id).toBe(series._id);
      expect(result.series.title).toBe('Export Test');
      expect(result.scripts.length).toBe(2);
      expect(result.scripts.map((s) => s.title)).toContain('Script 1');
      expect(result.scripts.map((s) => s.title)).toContain('Script 2');
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.series.exportSeriesSummary, { seriesId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });

    it('should return empty scripts array when no scripts exist', async () => {
      const { ctx } = await createUser();

      const series = await createSeries(ctx, { title: 'No Scripts' });

      const result = await call(appRouter.series.exportSeriesSummary, { seriesId: series._id }, ctx());

      expect(result.scripts).toBeArray();
      expect(result.scripts.length).toBe(0);
    });
  });
});
