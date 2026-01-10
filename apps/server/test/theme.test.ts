import { call } from '@orpc/server';
import { it, expect, describe, beforeEach } from 'bun:test';

import { createSeries, createSeriesWithUser } from './helpers/factories';
import { appRouter } from './helpers/instance';
import { createUser, expectErrorCode } from './helpers/utilities';

describe('Theme API', () => {
  describe('createTheme', () => {
    it('should create a theme with required fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await call(
        appRouter.theme.createTheme,
        {
          seriesId: series._id,
          value: {
            name: 'Identity and Self-Discovery',
          },
        },
        ctx(),
      );

      expect(theme).toBeDefined();
      expect(theme._id).toBeDefined();
      expect(theme.seriesId).toBe(series._id);
      expect(theme.name).toBe('Identity and Self-Discovery');
      expect(theme.visualMotifs).toEqual([]);
      expect(theme.relatedCharacters).toEqual([]);
      expect(theme.evolution).toEqual([]);
      expect(theme.appearances).toEqual([]);
    });

    it('should create a theme with all optional fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await call(
        appRouter.theme.createTheme,
        {
          seriesId: series._id,
          value: {
            name: 'Redemption',
            description: 'The journey of a character seeking redemption for past actions',
            color: '#FF5733',
            visualMotifs: ['mirrors', 'rain', 'sunrise'],
            relatedCharacters: [
              { characterId: 'char-1', connection: 'Primary arc' },
              { characterId: 'char-2', connection: 'Catalyst' },
            ],
            evolution: [
              { scriptId: 'script-1', notes: 'Introduction of theme through flashbacks' },
              { scriptId: 'script-2', notes: 'Theme reaches climax' },
            ],
            appearances: [
              { scriptId: 'script-1', sceneRef: 'scene-3', quote: 'I can still make this right' },
              { scriptId: 'script-2', sceneRef: 'scene-7' },
            ],
          },
        },
        ctx(),
      );

      expect(theme).toBeDefined();
      expect(theme.name).toBe('Redemption');
      expect(theme.description).toBe('The journey of a character seeking redemption for past actions');
      expect(theme.color).toBe('#FF5733');
      expect(theme.visualMotifs).toEqual(['mirrors', 'rain', 'sunrise']);
      expect(theme.relatedCharacters).toHaveLength(2);
      expect(theme.relatedCharacters![0].characterId).toBe('char-1');
      expect(theme.evolution).toHaveLength(2);
      expect(theme.appearances).toHaveLength(2);
      expect(theme.appearances![0].quote).toBe('I can still make this right');
    });

    it('should fail when name is empty', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.theme.createTheme,
            {
              seriesId: series._id,
              value: {
                name: '',
              },
            },
            ctx(),
          ),
        'BAD_REQUEST',
      );
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.theme.createTheme,
            {
              seriesId: '507f1f77bcf86cd799439011',
              value: {
                name: 'Lost Theme',
              },
            },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });
  });

  describe('getTheme', () => {
    it('should get an existing theme', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const created = await call(
        appRouter.theme.createTheme,
        {
          seriesId: series._id,
          value: {
            name: 'Hope',
            description: 'The enduring power of hope',
          },
        },
        ctx(),
      );

      const fetched = await call(appRouter.theme.getTheme, { themeId: created._id }, ctx());

      expect(fetched._id).toBe(created._id);
      expect(fetched.name).toBe('Hope');
      expect(fetched.description).toBe('The enduring power of hope');
    });

    it('should return NOT_FOUND for non-existent theme', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.theme.getTheme, { themeId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('updateTheme', () => {
    it('should update theme name', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await call(
        appRouter.theme.createTheme,
        {
          seriesId: series._id,
          value: {
            name: 'Original Name',
          },
        },
        ctx(),
      );

      const updated = await call(
        appRouter.theme.updateTheme,
        {
          themeId: theme._id,
          patch: {
            name: 'Updated Name',
          },
        },
        ctx(),
      );

      expect(updated.name).toBe('Updated Name');
      expect(updated._id).toBe(theme._id);
    });

    it('should update multiple fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await call(
        appRouter.theme.createTheme,
        {
          seriesId: series._id,
          value: {
            name: 'Courage',
          },
        },
        ctx(),
      );

      const updated = await call(
        appRouter.theme.updateTheme,
        {
          themeId: theme._id,
          patch: {
            name: 'Bravery',
            description: 'Finding courage in the face of fear',
            color: '#FFA500',
            visualMotifs: ['fire', 'lion'],
          },
        },
        ctx(),
      );

      expect(updated.name).toBe('Bravery');
      expect(updated.description).toBe('Finding courage in the face of fear');
      expect(updated.color).toBe('#FFA500');
      expect(updated.visualMotifs).toEqual(['fire', 'lion']);
    });

    it('should fail when updating name to empty string', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await call(
        appRouter.theme.createTheme,
        {
          seriesId: series._id,
          value: {
            name: 'Valid Name',
          },
        },
        ctx(),
      );

      await expectErrorCode(
        () =>
          call(
            appRouter.theme.updateTheme,
            {
              themeId: theme._id,
              patch: {
                name: '',
              },
            },
            ctx(),
          ),
        'BAD_REQUEST',
      );
    });

    it('should return NOT_FOUND for non-existent theme', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.theme.updateTheme,
            {
              themeId: '507f1f77bcf86cd799439011',
              patch: {
                name: 'New Name',
              },
            },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });
  });

  describe('deleteTheme', () => {
    it('should delete an existing theme', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await call(
        appRouter.theme.createTheme,
        {
          seriesId: series._id,
          value: {
            name: 'To Delete',
          },
        },
        ctx(),
      );

      const result = await call(appRouter.theme.deleteTheme, { themeId: theme._id }, ctx());

      expect(result.success).toBe(true);

      await expectErrorCode(() => call(appRouter.theme.getTheme, { themeId: theme._id }, ctx()), 'NOT_FOUND');
    });

    it('should return NOT_FOUND for non-existent theme', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.theme.deleteTheme, { themeId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('listThemes', () => {
    it('should list themes for a series', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await call(
        appRouter.theme.createTheme,
        {
          seriesId: series._id,
          value: { name: 'Theme A' },
        },
        ctx(),
      );

      await call(
        appRouter.theme.createTheme,
        {
          seriesId: series._id,
          value: { name: 'Theme B' },
        },
        ctx(),
      );

      await call(
        appRouter.theme.createTheme,
        {
          seriesId: series._id,
          value: { name: 'Theme C' },
        },
        ctx(),
      );

      const result = await call(
        appRouter.theme.listThemes,
        {
          seriesId: series._id,
          limit: 20,
          offset: 0,
        },
        ctx(),
      );

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.items.map((t) => t.name).sort()).toEqual(['Theme A', 'Theme B', 'Theme C']);
    });

    it('should return empty list for series with no themes', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const result = await call(
        appRouter.theme.listThemes,
        {
          seriesId: series._id,
          limit: 20,
          offset: 0,
        },
        ctx(),
      );

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should paginate themes correctly', async () => {
      const { ctx, series } = await createSeriesWithUser();

      for (let i = 1; i <= 5; i++) {
        await call(
          appRouter.theme.createTheme,
          {
            seriesId: series._id,
            value: { name: `Theme ${i}` },
          },
          ctx(),
        );
      }

      const page1 = await call(
        appRouter.theme.listThemes,
        {
          seriesId: series._id,
          limit: 2,
          offset: 0,
        },
        ctx(),
      );

      expect(page1.items).toHaveLength(2);
      expect(page1.total).toBe(5);

      const page2 = await call(
        appRouter.theme.listThemes,
        {
          seriesId: series._id,
          limit: 2,
          offset: 2,
        },
        ctx(),
      );

      expect(page2.items).toHaveLength(2);
      expect(page2.total).toBe(5);

      const allNames = [...page1.items, ...page2.items].map((t) => t.name);
      expect(new Set(allNames).size).toBe(4);
    });

    it('should return NOT_FOUND for non-existent series', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.theme.listThemes,
            {
              seriesId: '507f1f77bcf86cd799439011',
              limit: 20,
              offset: 0,
            },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });

    it('should only list themes for the specified series', async () => {
      const { ctx } = await createUser();

      const series1 = await createSeries(ctx, { title: 'Series 1' });
      const series2 = await createSeries(ctx, { title: 'Series 2' });

      await call(
        appRouter.theme.createTheme,
        {
          seriesId: series1._id,
          value: { name: 'Theme S1-1' },
        },
        ctx(),
      );

      await call(
        appRouter.theme.createTheme,
        {
          seriesId: series1._id,
          value: { name: 'Theme S1-2' },
        },
        ctx(),
      );

      await call(
        appRouter.theme.createTheme,
        {
          seriesId: series2._id,
          value: { name: 'Theme S2-1' },
        },
        ctx(),
      );

      const result1 = await call(
        appRouter.theme.listThemes,
        {
          seriesId: series1._id,
          limit: 20,
          offset: 0,
        },
        ctx(),
      );

      const result2 = await call(
        appRouter.theme.listThemes,
        {
          seriesId: series2._id,
          limit: 20,
          offset: 0,
        },
        ctx(),
      );

      expect(result1.items).toHaveLength(2);
      expect(result1.total).toBe(2);
      expect(result2.items).toHaveLength(1);
      expect(result2.total).toBe(1);
    });
  });

  describe('Theme with complex nested data', () => {
    it('should preserve all nested data through create/get cycle', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const themeData = {
        name: 'Complex Theme',
        description: 'A theme with all fields populated',
        color: '#123456',
        visualMotifs: ['motif1', 'motif2', 'motif3'],
        relatedCharacters: [
          { characterId: 'char-1', connection: 'Protagonist journey' },
          { characterId: 'char-2', connection: 'Antagonist contrast' },
        ],
        evolution: [
          { scriptId: 'script-1', notes: 'First appearance' },
          { scriptId: 'script-2', notes: 'Development' },
          { scriptId: 'script-3', notes: 'Resolution' },
        ],
        appearances: [
          { scriptId: 'script-1', sceneRef: 'S1-E1', quote: 'Opening quote' },
          { scriptId: 'script-2', sceneRef: 'S1-E5' },
          { scriptId: 'script-3', sceneRef: 'S2-E10', quote: 'Closing quote' },
        ],
      };

      const created = await call(
        appRouter.theme.createTheme,
        {
          seriesId: series._id,
          value: themeData,
        },
        ctx(),
      );

      const fetched = await call(appRouter.theme.getTheme, { themeId: created._id }, ctx());

      expect(fetched.name).toBe(themeData.name);
      expect(fetched.description).toBe(themeData.description);
      expect(fetched.color).toBe(themeData.color);
      expect(fetched.visualMotifs).toEqual(themeData.visualMotifs);
      expect(fetched.relatedCharacters).toEqual(themeData.relatedCharacters);
      expect(fetched.evolution).toEqual(themeData.evolution);
      expect(fetched.appearances).toEqual(themeData.appearances);
    });

    it('should update nested arrays independently', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await call(
        appRouter.theme.createTheme,
        {
          seriesId: series._id,
          value: {
            name: 'Nested Theme',
            visualMotifs: ['old1', 'old2'],
            evolution: [{ scriptId: 'script-1', notes: 'Original notes' }],
          },
        },
        ctx(),
      );

      const updated = await call(
        appRouter.theme.updateTheme,
        {
          themeId: theme._id,
          patch: {
            visualMotifs: ['new1', 'new2', 'new3'],
          },
        },
        ctx(),
      );

      expect(updated.visualMotifs).toEqual(['new1', 'new2', 'new3']);
      expect(updated.evolution).toEqual([{ scriptId: 'script-1', notes: 'Original notes' }]);
    });
  });
});
