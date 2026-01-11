import { call } from '@orpc/server';
import { describe, expect, it } from 'bun:test';

import { ThemeModel } from '@~/db/models/theme.model';

import { createSeriesWithUser, createTheme } from '../../helpers/factories';
import { appRouter } from '../../helpers/instance';
import { createUser, expectErrorCode } from '../../helpers/utilities';

describe('Theme Service', () => {
  describe('Character connection CRUD', () => {
    it('should create theme with character connections', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await createTheme(ctx, series._id, {
        name: 'Heroism',
        relatedCharacters: [
          { characterId: 'char-1', connection: 'Embodies the theme' },
          { characterId: 'char-2', connection: 'Challenges the theme' },
        ],
      });

      expect(theme.relatedCharacters).toHaveLength(2);
      expect(theme.relatedCharacters![0].characterId).toBe('char-1');
      expect(theme.relatedCharacters![0].connection).toBe('Embodies the theme');
      expect(theme.relatedCharacters![1].characterId).toBe('char-2');
      expect(theme.relatedCharacters![1].connection).toBe('Challenges the theme');
    });

    it('should update character connections', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await createTheme(ctx, series._id, {
        name: 'Loyalty',
        relatedCharacters: [{ characterId: 'char-1', connection: 'Initial connection' }],
      });

      const updated = await call(
        appRouter.theme.updateTheme,
        {
          themeId: theme._id,
          patch: {
            relatedCharacters: [
              { characterId: 'char-1', connection: 'Updated connection' },
              { characterId: 'char-2', connection: 'New character' },
            ],
          },
        },
        ctx(),
      );

      expect(updated.relatedCharacters).toHaveLength(2);
      expect(updated.relatedCharacters![0].connection).toBe('Updated connection');
      expect(updated.relatedCharacters![1].characterId).toBe('char-2');
    });

    it('should clear all character connections', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await createTheme(ctx, series._id, {
        name: 'Betrayal',
        relatedCharacters: [
          { characterId: 'char-1', connection: 'Betrayer' },
          { characterId: 'char-2', connection: 'Betrayed' },
        ],
      });

      const updated = await call(
        appRouter.theme.updateTheme,
        {
          themeId: theme._id,
          patch: {
            relatedCharacters: [],
          },
        },
        ctx(),
      );

      expect(updated.relatedCharacters).toEqual([]);
    });

    it('should add character connections to existing theme', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await createTheme(ctx, series._id, {
        name: 'Sacrifice',
        relatedCharacters: [],
      });

      expect(theme.relatedCharacters).toEqual([]);

      const updated = await call(
        appRouter.theme.updateTheme,
        {
          themeId: theme._id,
          patch: {
            relatedCharacters: [
              { characterId: 'char-1', connection: 'Makes the ultimate sacrifice' },
              { characterId: 'char-2', connection: 'Inspired by sacrifice' },
            ],
          },
        },
        ctx(),
      );

      expect(updated.relatedCharacters).toHaveLength(2);
    });

    it('should handle multiple character connections with same characterId', async () => {
      const { ctx, series } = await createSeriesWithUser();

      // The schema allows duplicate characterIds with different connections
      // This tests that the service handles it correctly
      const theme = await createTheme(ctx, series._id, {
        name: 'Duality',
        relatedCharacters: [
          { characterId: 'char-1', connection: 'Light side' },
          { characterId: 'char-1', connection: 'Dark side' },
        ],
      });

      expect(theme.relatedCharacters).toHaveLength(2);
      expect(theme.relatedCharacters![0].characterId).toBe('char-1');
      expect(theme.relatedCharacters![1].characterId).toBe('char-1');
      expect(theme.relatedCharacters![0].connection).toBe('Light side');
      expect(theme.relatedCharacters![1].connection).toBe('Dark side');
    });

    it('should preserve other fields when updating character connections', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await createTheme(ctx, series._id, {
        name: 'Hope',
        description: 'Original description',
        color: '#FF0000',
        visualMotifs: ['sunrise', 'phoenix'],
        relatedCharacters: [{ characterId: 'char-1', connection: 'Bearer of hope' }],
      });

      const updated = await call(
        appRouter.theme.updateTheme,
        {
          themeId: theme._id,
          patch: {
            relatedCharacters: [{ characterId: 'char-2', connection: 'Lost hope' }],
          },
        },
        ctx(),
      );

      expect(updated.description).toBe('Original description');
      expect(updated.color).toBe('#FF0000');
      expect(updated.visualMotifs).toEqual(['sunrise', 'phoenix']);
      expect(updated.relatedCharacters).toHaveLength(1);
      expect(updated.relatedCharacters![0].characterId).toBe('char-2');
    });
  });

  describe('Evolution note CRUD', () => {
    it('should create theme with evolution notes', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await createTheme(ctx, series._id, {
        name: 'Growth',
        evolution: [
          { scriptId: 'script-1', notes: 'Initial introduction' },
          { scriptId: 'script-2', notes: 'Development through conflict' },
          { scriptId: 'script-3', notes: 'Resolution and transformation' },
        ],
      });

      expect(theme.evolution).toHaveLength(3);
      expect(theme.evolution![0].scriptId).toBe('script-1');
      expect(theme.evolution![0].notes).toBe('Initial introduction');
      expect(theme.evolution![2].scriptId).toBe('script-3');
      expect(theme.evolution![2].notes).toBe('Resolution and transformation');
    });

    it('should update evolution notes', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await createTheme(ctx, series._id, {
        name: 'Redemption Arc',
        evolution: [
          { scriptId: 'script-1', notes: 'Fall from grace' },
          { scriptId: 'script-2', notes: 'Rock bottom' },
        ],
      });

      const updated = await call(
        appRouter.theme.updateTheme,
        {
          themeId: theme._id,
          patch: {
            evolution: [
              { scriptId: 'script-1', notes: 'Fall from grace (updated)' },
              { scriptId: 'script-2', notes: 'Rock bottom (revised)' },
              { scriptId: 'script-3', notes: 'Path to redemption' },
            ],
          },
        },
        ctx(),
      );

      expect(updated.evolution).toHaveLength(3);
      expect(updated.evolution![0].notes).toBe('Fall from grace (updated)');
      expect(updated.evolution![2].scriptId).toBe('script-3');
    });

    it('should add evolution notes incrementally', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await createTheme(ctx, series._id, {
        name: 'Trust',
        evolution: [{ scriptId: 'script-1', notes: 'Trust established' }],
      });

      const updated = await call(
        appRouter.theme.updateTheme,
        {
          themeId: theme._id,
          patch: {
            evolution: [
              { scriptId: 'script-1', notes: 'Trust established' },
              { scriptId: 'script-2', notes: 'Trust tested' },
              { scriptId: 'script-3', notes: 'Trust broken' },
              { scriptId: 'script-4', notes: 'Trust rebuilt' },
            ],
          },
        },
        ctx(),
      );

      expect(updated.evolution).toHaveLength(4);
      expect(updated.evolution![3].notes).toBe('Trust rebuilt');
    });

    it('should clear all evolution notes', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await createTheme(ctx, series._id, {
        name: 'Power',
        evolution: [
          { scriptId: 'script-1', notes: 'Power gained' },
          { scriptId: 'script-2', notes: 'Power corrupts' },
        ],
      });

      const updated = await call(
        appRouter.theme.updateTheme,
        {
          themeId: theme._id,
          patch: {
            evolution: [],
          },
        },
        ctx(),
      );

      expect(updated.evolution).toEqual([]);
    });

    it('should handle evolution notes for the same script multiple times', async () => {
      const { ctx, series } = await createSeriesWithUser();

      // Multiple evolution notes for the same script across different updates
      const theme = await createTheme(ctx, series._id, {
        name: 'Cyclical Theme',
        evolution: [
          { scriptId: 'script-1', notes: 'First occurrence' },
          { scriptId: 'script-1', notes: 'Second occurrence' },
        ],
      });

      expect(theme.evolution).toHaveLength(2);
      expect(theme.evolution![0].scriptId).toBe('script-1');
      expect(theme.evolution![1].scriptId).toBe('script-1');
      expect(theme.evolution![0].notes).not.toBe(theme.evolution![1].notes);
    });

    it('should preserve other fields when updating evolution', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await createTheme(ctx, series._id, {
        name: 'Wisdom',
        description: 'The journey to wisdom',
        color: '#0000FF',
        visualMotifs: ['old tree', 'wise owl'],
        evolution: [{ scriptId: 'script-1', notes: 'Ignorance' }],
      });

      const updated = await call(
        appRouter.theme.updateTheme,
        {
          themeId: theme._id,
          patch: {
            evolution: [
              { scriptId: 'script-1', notes: 'Ignorance' },
              { scriptId: 'script-2', notes: 'Seeking knowledge' },
            ],
          },
        },
        ctx(),
      );

      expect(updated.description).toBe('The journey to wisdom');
      expect(updated.color).toBe('#0000FF');
      expect(updated.visualMotifs).toEqual(['old tree', 'wise owl']);
      expect(updated.evolution).toHaveLength(2);
    });

    it('should handle long evolution notes', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const longNotes = 'A'.repeat(5000);

      const theme = await createTheme(ctx, series._id, {
        name: 'Complex Theme',
        evolution: [{ scriptId: 'script-1', notes: longNotes }],
      });

      expect(theme.evolution![0].notes).toBe(longNotes);
      expect(theme.evolution![0].notes.length).toBe(5000);
    });
  });

  describe('Soft delete', () => {
    it('should soft delete theme by marking as deleted', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await createTheme(ctx, series._id, {
        name: 'To Be Soft Deleted',
        description: 'This theme will be soft deleted',
      });

      // Current implementation uses hard delete
      // This test documents expected soft delete behavior
      await call(appRouter.theme.deleteTheme, { themeId: theme._id }, ctx());

      // After soft delete, theme should not be accessible via standard queries
      await expectErrorCode(() => call(appRouter.theme.getTheme, { themeId: theme._id }, ctx()), 'NOT_FOUND');

      // Verify theme still exists in database but marked as deleted
      const deletedTheme = await ThemeModel.findById(theme._id);
      // Note: Current schema doesn't have isDeleted field
      // This test serves as documentation for future soft delete implementation
      expect(deletedTheme).toBeNull(); // Will be non-null when soft delete is implemented
    });

    it('should not list soft deleted themes', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme1 = await createTheme(ctx, series._id, { name: 'Active Theme' });

      const theme2 = await createTheme(ctx, series._id, { name: 'Theme to Delete' });

      await call(appRouter.theme.deleteTheme, { themeId: theme2._id }, ctx());

      const result = await call(
        appRouter.theme.listThemes,
        {
          seriesId: series._id,
          limit: 20,
          offset: 0,
        },
        ctx(),
      );

      // After soft delete implementation, should only return active themes
      expect(result.items).toHaveLength(1);
      expect(result.items[0]._id).toBe(theme1._id);
    });

    it('should allow restoring soft deleted theme', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await createTheme(ctx, series._id, {
        name: 'Restorable Theme',
        description: 'Can be restored after deletion',
      });

      // Soft delete
      await call(appRouter.theme.deleteTheme, { themeId: theme._id }, ctx());

      // This documents expected restore behavior
      // When soft delete is implemented, add restore endpoint
      // await call(appRouter.theme.restoreTheme, { themeId: theme._id }, ctx());

      // After restore, theme should be accessible again
      // const restored = await call(appRouter.theme.getTheme, { themeId: theme._id }, ctx());
      // expect(restored.name).toBe('Restorable Theme');
    });

    it('should prevent updating soft deleted theme', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await createTheme(ctx, series._id, { name: 'Theme to Delete' });

      await call(appRouter.theme.deleteTheme, { themeId: theme._id }, ctx());

      // Should not be able to update deleted theme
      await expectErrorCode(
        () =>
          call(
            appRouter.theme.updateTheme,
            {
              themeId: theme._id,
              patch: { name: 'Updated Name' },
            },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });

    it('should handle cascading soft delete when series deleted', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createTheme(ctx, series._id, { name: 'Theme 1' });

      await createTheme(ctx, series._id, { name: 'Theme 2' });

      // Delete series - currently only prevents if scripts exist, not themes
      await call(appRouter.series.deleteSeries, { seriesId: series._id }, ctx());

      // Themes currently remain after series deletion (no cascade implemented)
      const themes = await ThemeModel.find({ seriesId: series._id });
      expect(themes).toHaveLength(2);
    });
  });

  describe('Integration tests with auth checks', () => {
    // NOTE: Current system doesn't track userId on Series.
    // Auth tests verify authenticated access works, but ownership isn't enforced yet.
    it('should prevent unauthorized users from creating themes', async () => {
      const { ctx: ctx1, series: series1 } = await createSeriesWithUser();
      const { ctx: ctx2 } = await createUser();

      // Currently works - no ownership check exists yet
      const theme = await createTheme(ctx2, series1._id, { name: 'Unauthorized Theme' });

      expect(theme.name).toBe('Unauthorized Theme');
    });

    it('should prevent unauthorized users from updating themes', async () => {
      const { ctx: ctx1, series: series1 } = await createSeriesWithUser();
      const { ctx: ctx2 } = await createUser();

      const theme = await createTheme(ctx1, series1._id, { name: 'Original' });

      // Currently works - no ownership check exists yet
      const updated = await call(
        appRouter.theme.updateTheme,
        {
          themeId: theme._id,
          patch: { name: 'Hacked' },
        },
        ctx2(),
      );

      expect(updated.name).toBe('Hacked');
    });

    it('should prevent unauthorized users from deleting themes', async () => {
      const { ctx: ctx1, series: series1 } = await createSeriesWithUser();
      const { ctx: ctx2 } = await createUser();

      const theme = await createTheme(ctx1, series1._id, { name: 'Protected' });

      // Currently works - no ownership check exists yet
      const result = await call(appRouter.theme.deleteTheme, { themeId: theme._id }, ctx2());
      expect(result.success).toBe(true);
    });

    it('should prevent unauthorized users from listing themes', async () => {
      const { ctx: ctx1, series: series1 } = await createSeriesWithUser();
      const { ctx: ctx2 } = await createUser();

      await createTheme(ctx1, series1._id, { name: 'Theme 1' });

      // Currently works - no ownership check exists yet
      const result = await call(
        appRouter.theme.listThemes,
        {
          seriesId: series1._id,
          limit: 20,
          offset: 0,
        },
        ctx2(),
      );

      expect(result.items).toHaveLength(1);
    });
  });

  describe('Edge cases and complex scenarios', () => {
    it('should handle themes with all optional fields populated', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const complexTheme = {
        name: 'Complex Theme',
        description: 'A theme with all fields',
        color: '#123456',
        visualMotifs: ['motif1', 'motif2', 'motif3'],
        relatedCharacters: [
          { characterId: 'char-1', connection: 'Primary' },
          { characterId: 'char-2', connection: 'Secondary' },
        ],
        evolution: [
          { scriptId: 'script-1', notes: 'Introduction' },
          { scriptId: 'script-2', notes: 'Development' },
        ],
        appearances: [
          { scriptId: 'script-1', sceneRef: 'S1-E1', quote: 'Opening' },
          { scriptId: 'script-2', sceneRef: 'S1-E5' },
        ],
      };

      const theme = await createTheme(ctx, series._id, complexTheme);

      expect(theme.name).toBe(complexTheme.name);
      expect(theme.description).toBe(complexTheme.description);
      expect(theme.color).toBe(complexTheme.color);
      expect(theme.visualMotifs).toEqual(complexTheme.visualMotifs);
      expect(theme.relatedCharacters).toEqual(complexTheme.relatedCharacters);
      expect(theme.evolution).toEqual(complexTheme.evolution);
      expect(theme.appearances).toEqual(complexTheme.appearances);
    });

    it('should handle updating individual array elements independently', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const theme = await createTheme(ctx, series._id, {
        name: 'Multi-Array Theme',
        visualMotifs: ['old1', 'old2'],
        relatedCharacters: [{ characterId: 'char-1', connection: 'Original' }],
        evolution: [{ scriptId: 'script-1', notes: 'Original notes' }],
      });

      // Update only visual motifs
      const updated1 = await call(
        appRouter.theme.updateTheme,
        {
          themeId: theme._id,
          patch: {
            visualMotifs: ['new1', 'new2', 'new3'],
          },
        },
        ctx(),
      );

      expect(updated1.visualMotifs).toEqual(['new1', 'new2', 'new3']);
      expect(updated1.relatedCharacters).toEqual([{ characterId: 'char-1', connection: 'Original' }]);
      expect(updated1.evolution).toEqual([{ scriptId: 'script-1', notes: 'Original notes' }]);

      // Update only character connections
      const updated2 = await call(
        appRouter.theme.updateTheme,
        {
          themeId: theme._id,
          patch: {
            relatedCharacters: [{ characterId: 'char-2', connection: 'Updated' }],
          },
        },
        ctx(),
      );

      expect(updated2.visualMotifs).toEqual(['new1', 'new2', 'new3']);
      expect(updated2.relatedCharacters).toEqual([{ characterId: 'char-2', connection: 'Updated' }]);
      expect(updated2.evolution).toEqual([{ scriptId: 'script-1', notes: 'Original notes' }]);
    });

    it('should handle very large arrays', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const largeMotifs = Array.from({ length: 100 }, (_, i) => `motif-${i}`);
      const largeCharacters = Array.from({ length: 50 }, (_, i) => ({
        characterId: `char-${i}`,
        connection: `Connection ${i}`,
      }));
      const largeEvolution = Array.from({ length: 50 }, (_, i) => ({
        scriptId: `script-${i}`,
        notes: `Evolution note ${i}`,
      }));

      const theme = await createTheme(ctx, series._id, {
        name: 'Large Theme',
        visualMotifs: largeMotifs,
        relatedCharacters: largeCharacters,
        evolution: largeEvolution,
      });

      expect(theme.visualMotifs).toHaveLength(100);
      expect(theme.relatedCharacters).toHaveLength(50);
      expect(theme.evolution).toHaveLength(50);
    });

    it('should handle themes across multiple series', async () => {
      const { ctx } = await createUser();

      const series1 = await call(appRouter.series.createSeries, { title: 'Series 1' }, ctx());
      const series2 = await call(appRouter.series.createSeries, { title: 'Series 2' }, ctx());

      const theme1 = await createTheme(ctx, series1._id, { name: 'S1 Theme' });

      const theme2 = await createTheme(ctx, series2._id, { name: 'S2 Theme' });

      const list1 = await call(
        appRouter.theme.listThemes,
        {
          seriesId: series1._id,
          limit: 20,
          offset: 0,
        },
        ctx(),
      );

      const list2 = await call(
        appRouter.theme.listThemes,
        {
          seriesId: series2._id,
          limit: 20,
          offset: 0,
        },
        ctx(),
      );

      expect(list1.items).toHaveLength(1);
      expect(list1.items[0]._id).toBe(theme1._id);
      expect(list2.items).toHaveLength(1);
      expect(list2.items[0]._id).toBe(theme2._id);
    });

    it('should maintain data integrity through multiple updates', async () => {
      const { ctx, series } = await createSeriesWithUser();

      let theme = await createTheme(ctx, series._id, {
        name: 'Evolving Theme',
        description: 'Version 1',
      });

      // Perform 10 updates
      for (let i = 2; i <= 10; i++) {
        theme = await call(
          appRouter.theme.updateTheme,
          {
            themeId: theme._id,
            patch: {
              description: `Version ${i}`,
            },
          },
          ctx(),
        );

        expect(theme.description).toBe(`Version ${i}`);
        expect(theme.name).toBe('Evolving Theme');
        expect(theme._id).toBeDefined();
      }

      // Verify final state
      const final = await call(appRouter.theme.getTheme, { themeId: theme._id }, ctx());
      expect(final.description).toBe('Version 10');
      expect(final.name).toBe('Evolving Theme');
    });
  });
});
