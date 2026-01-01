import { call } from '@orpc/server';
import { it, expect, describe } from 'bun:test';

import { createScript, createSeriesWithUser } from './helpers/factories';
import { appRouter } from './helpers/instance';
import { createUser, expectErrorCode } from './helpers/utilities';

describe('Scripts API', () => {
  describe('createScript', () => {
    it('should create a script with required fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'My Script' });

      expect(script).toBeDefined();
      expect(script._id).toBeDefined();
      expect(script.seriesId).toBe(series._id);
      expect(script.title).toBe('My Script');
      expect(script.content).toBe('');
      expect(script.contentVersion).toBe(1);
      expect(script.lastEditedAt).toBeDefined();
    });

    it('should create a script with all optional fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, {
        title: 'Full Script',
        authors: ['John Doe', 'Jane Smith'],
        genre: 'Drama',
        logline: 'A powerful story',
        coverUrl: 'https://example.com/cover.jpg',
      });

      expect(script.title).toBe('Full Script');
      expect(script.authors).toEqual(['John Doe', 'Jane Smith']);
      expect(script.genre).toBe('Drama');
      expect(script.logline).toBe('A powerful story');
      expect(script.coverUrl).toBe('https://example.com/cover.jpg');
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => createScript(ctx, '507f1f77bcf86cd799439011', { title: 'Orphan Script' }),
        'NOT_FOUND',
      );
    });

    it('should fail when title is empty', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(() => createScript(ctx, series._id, { title: '' }), 'BAD_REQUEST');
    });

    it('should fail when title is whitespace only', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(() => createScript(ctx, series._id, { title: '   ' }), 'BAD_REQUEST');
    });

    it('should update series lastEditedAt when script is created', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      await new Promise((r) => setTimeout(r, 10));

      await call(appRouter.scripts.createScript, { seriesId: series._id, title: 'New Script' }, ctx());

      const updatedSeries = await call(appRouter.series.getSeries, { seriesId: series._id }, ctx());

      expect(new Date(updatedSeries.lastEditedAt).getTime()).toBeGreaterThan(new Date(series.lastEditedAt).getTime());
    });
  });

  describe('getScript', () => {
    it('should get an existing script', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      const created = await call(
        appRouter.scripts.createScript,
        { seriesId: series._id, title: 'Get Me', genre: 'Action' },
        ctx(),
      );

      const fetched = await call(appRouter.scripts.getScript, { scriptId: created._id }, ctx());

      expect(fetched._id).toBe(created._id);
      expect(fetched.title).toBe('Get Me');
      expect(fetched.genre).toBe('Action');
      expect(fetched.seriesId).toBe(series._id);
    });

    it('should return NOT_FOUND for non-existent script', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.scripts.getScript, { scriptId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });

    it('should include content when fetching script', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Content Test' });

      await call(
        appRouter.scripts.saveScriptContent,
        { scriptId: script._id, content: 'FADE IN:\n\nEXT. BEACH - DAY' },
        ctx(),
      );

      const fetched = await call(appRouter.scripts.getScript, { scriptId: script._id }, ctx());

      expect(fetched.content).toBe('FADE IN:\n\nEXT. BEACH - DAY');
    });
  });

  describe('updateScript', () => {
    it('should update script title', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Original' });

      const updated = await call(
        appRouter.scripts.updateScript,
        { scriptId: script._id, patch: { title: 'Updated Title' } },
        ctx(),
      );

      expect(updated.title).toBe('Updated Title');
    });

    it('should update multiple fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Original' });

      const updated = await call(
        appRouter.scripts.updateScript,
        {
          scriptId: script._id,
          patch: {
            title: 'New Title',
            authors: ['New Author'],
            genre: 'Thriller',
            logline: 'A suspenseful tale',
          },
        },
        ctx(),
      );

      expect(updated.title).toBe('New Title');
      expect(updated.authors).toEqual(['New Author']);
      expect(updated.genre).toBe('Thriller');
      expect(updated.logline).toBe('A suspenseful tale');
    });

    it('should fail when script does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.scripts.updateScript,
            { scriptId: '507f1f77bcf86cd799439011', patch: { title: 'New' } },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });

    it('should update lastEditedAt on modification', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      const script = await call(
        appRouter.scripts.createScript,
        { seriesId: series._id, title: 'Timestamp Test' },
        ctx(),
      );

      await new Promise((r) => setTimeout(r, 10));

      const updated = await call(
        appRouter.scripts.updateScript,
        { scriptId: script._id, patch: { title: 'Updated' } },
        ctx(),
      );

      expect(new Date(updated.lastEditedAt).getTime()).toBeGreaterThan(new Date(script.lastEditedAt).getTime());
    });

    it('should update series lastEditedAt when script is updated', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Test Script' });

      await new Promise((r) => setTimeout(r, 10));

      await call(appRouter.scripts.updateScript, { scriptId: script._id, patch: { title: 'Updated Script' } }, ctx());

      const updatedSeries = await call(appRouter.series.getSeries, { seriesId: series._id }, ctx());

      expect(new Date(updatedSeries.lastEditedAt).getTime()).toBeGreaterThan(new Date(series.lastEditedAt).getTime());
    });
  });

  describe('deleteScript', () => {
    it('should delete an existing script', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'To Delete' });

      const result = await call(appRouter.scripts.deleteScript, { scriptId: script._id }, ctx());

      expect(result.success).toBe(true);

      // Verify deletion
      try {
        await call(appRouter.scripts.getScript, { scriptId: script._id }, ctx());
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND');
      }
    });

    it('should fail when script does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.scripts.deleteScript, { scriptId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });

    it('should update series lastEditedAt when script is deleted', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'To Delete' });

      const seriesBeforeDelete = await call(appRouter.series.getSeries, { seriesId: series._id }, ctx());

      await new Promise((r) => setTimeout(r, 10));

      await call(appRouter.scripts.deleteScript, { scriptId: script._id }, ctx());

      const seriesAfterDelete = await call(appRouter.series.getSeries, { seriesId: series._id }, ctx());

      expect(new Date(seriesAfterDelete.lastEditedAt).getTime()).toBeGreaterThan(
        new Date(seriesBeforeDelete.lastEditedAt).getTime(),
      );
    });
  });

  describe('listScriptsBySeries', () => {
    it('should return empty list when no scripts exist', async () => {
      const { ctx, series } = await createSeriesWithUser({ title: 'Empty Series' });

      const result = await call(
        appRouter.scripts.listScriptsBySeries,
        { seriesId: series._id, limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items).toBeArray();
      expect(result.items.length).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should return scripts for a series', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createScript(ctx, series._id, { title: 'Script 1' });
      await createScript(ctx, series._id, { title: 'Script 2' });

      const result = await call(
        appRouter.scripts.listScriptsBySeries,
        { seriesId: series._id, limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.scripts.listScriptsBySeries,
            { seriesId: '507f1f77bcf86cd799439011', limit: 20, offset: 0 },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });

    it('should paginate results correctly', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      for (let i = 1; i <= 5; i++) {
        await call(appRouter.scripts.createScript, { seriesId: series._id, title: `Script ${i}` }, ctx());
      }

      const page1 = await call(
        appRouter.scripts.listScriptsBySeries,
        { seriesId: series._id, limit: 2, offset: 0 },
        ctx(),
      );

      expect(page1.items.length).toBe(2);
      expect(page1.total).toBe(5);

      const page2 = await call(
        appRouter.scripts.listScriptsBySeries,
        { seriesId: series._id, limit: 2, offset: 2 },
        ctx(),
      );

      expect(page2.items.length).toBe(2);
      expect(page1.items[0]._id).not.toBe(page2.items[0]._id);
    });

    it('should only return scripts for the specified series', async () => {
      const { ctx } = await createUser();

      const series1 = await call(appRouter.series.createSeries, { title: 'Series 1' }, ctx());
      const series2 = await call(appRouter.series.createSeries, { title: 'Series 2' }, ctx());

      await call(appRouter.scripts.createScript, { seriesId: series1._id, title: 'Script for S1' }, ctx());
      await call(appRouter.scripts.createScript, { seriesId: series2._id, title: 'Script for S2' }, ctx());

      const result = await call(
        appRouter.scripts.listScriptsBySeries,
        { seriesId: series1._id, limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(1);
      expect(result.items[0].title).toBe('Script for S1');
    });
  });

  describe('saveScriptContent', () => {
    it('should save script content', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      const script = await call(appRouter.scripts.createScript, { seriesId: series._id, title: 'Content Test' }, ctx());

      const content = 'FADE IN:\n\nEXT. CITY - NIGHT\n\nThe skyline glitters.';

      const result = await call(appRouter.scripts.saveScriptContent, { scriptId: script._id, content }, ctx());

      expect(result.lastEditedAt).toBeDefined();

      // Verify content was saved
      const fetched = await call(appRouter.scripts.getScript, { scriptId: script._id }, ctx());

      expect(fetched.content).toBe(content);
    });

    it('should update lastEditedAt on content save', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      const script = await call(appRouter.scripts.createScript, { seriesId: series._id, title: 'Save Test' }, ctx());

      await new Promise((r) => setTimeout(r, 10));

      const result = await call(
        appRouter.scripts.saveScriptContent,
        { scriptId: script._id, content: 'New content' },
        ctx(),
      );

      expect(new Date(result.lastEditedAt).getTime()).toBeGreaterThan(new Date(script.lastEditedAt).getTime());
    });

    it('should fail when script does not exist', async () => {
      const { ctx } = await createUser();

      try {
        await call(
          appRouter.scripts.saveScriptContent,
          { scriptId: '507f1f77bcf86cd799439011', content: 'Content' },
          ctx(),
        );
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND');
      }
    });

    it('should save empty content', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      const script = await call(
        appRouter.scripts.createScript,
        { seriesId: series._id, title: 'Empty Content' },
        ctx(),
      );

      // First save some content
      await call(appRouter.scripts.saveScriptContent, { scriptId: script._id, content: 'Some content' }, ctx());

      // Then save empty
      await call(appRouter.scripts.saveScriptContent, { scriptId: script._id, content: '' }, ctx());

      const fetched = await call(appRouter.scripts.getScript, { scriptId: script._id }, ctx());

      expect(fetched.content).toBe('');
    });

    it('should handle large content', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      const script = await call(appRouter.scripts.createScript, { seriesId: series._id, title: 'Large Script' }, ctx());

      // Create ~100KB of content (roughly 120 pages)
      const largeContent = 'INT. SCENE - DAY\n\nDialogue continues.\n\n'.repeat(5000);

      const result = await call(
        appRouter.scripts.saveScriptContent,
        { scriptId: script._id, content: largeContent },
        ctx(),
      );

      expect(result.lastEditedAt).toBeDefined();

      const fetched = await call(appRouter.scripts.getScript, { scriptId: script._id }, ctx());

      expect(fetched.content).toBe(largeContent);
    });

    it('should accept cursor position parameter', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      const script = await call(appRouter.scripts.createScript, { seriesId: series._id, title: 'Cursor Test' }, ctx());

      const result = await call(
        appRouter.scripts.saveScriptContent,
        {
          scriptId: script._id,
          content: 'Line 1\nLine 2\nLine 3',
          cursor: { line: 2, column: 5 },
        },
        ctx(),
      );

      expect(result.lastEditedAt).toBeDefined();
    });

    it('should update series lastEditedAt on content save', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      const script = await call(
        appRouter.scripts.createScript,
        { seriesId: series._id, title: 'Series Update Test' },
        ctx(),
      );

      const seriesBefore = await call(appRouter.series.getSeries, { seriesId: series._id }, ctx());

      await new Promise((r) => setTimeout(r, 10));

      await call(appRouter.scripts.saveScriptContent, { scriptId: script._id, content: 'New content' }, ctx());

      const seriesAfter = await call(appRouter.series.getSeries, { seriesId: series._id }, ctx());

      expect(new Date(seriesAfter.lastEditedAt).getTime()).toBeGreaterThan(
        new Date(seriesBefore.lastEditedAt).getTime(),
      );
    });
  });
});
