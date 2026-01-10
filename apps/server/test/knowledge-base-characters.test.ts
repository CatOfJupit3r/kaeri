import { call } from '@orpc/server';
import { it, expect, describe } from 'bun:test';

import {
  addAppearance,
  addRelationship,
  createCharacter,
  createLocation,
  createScript,
  createSeries,
  createSeriesWithUser,
} from './helpers/factories';
import { appRouter } from './helpers/instance';
import { createUser, expectErrorCode } from './helpers/utilities';

describe('Knowledge Base API - Characters', () => {
  describe('createCharacter', () => {
    it('should create a character with required fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const character = await createCharacter(ctx, series._id, { name: 'John Doe' });

      expect(character).toBeDefined();
      expect(character._id).toBeDefined();
      expect(character.seriesId).toBe(series._id);
      expect(character.name).toBe('John Doe');
      expect(character.relationships).toEqual([]);
      expect(character.variations).toEqual([]);
      expect(character.appearances).toEqual([]);
    });

    it('should create a character with all optional fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const character = await createCharacter(ctx, series._id, {
        name: 'Jane Smith',
        description: 'A brilliant scientist',
        traits: ['intelligent', 'curious', 'brave'],
        avatarUrl: 'https://example.com/jane.jpg',
      });

      expect(character.name).toBe('Jane Smith');
      expect(character.description).toBe('A brilliant scientist');
      expect(character.traits).toEqual(['intelligent', 'curious', 'brave']);
      expect(character.avatarUrl).toBe('https://example.com/jane.jpg');
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(() => createCharacter(ctx, '507f1f77bcf86cd799439011', { name: 'Orphan' }), 'NOT_FOUND');
    });

    it('should fail when name is empty', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(() => createCharacter(ctx, series._id, { name: '' }), 'BAD_REQUEST');
    });

    it('should fail when name is whitespace only', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(() => createCharacter(ctx, series._id, { name: '   ' }), 'BAD_REQUEST');
    });
  });

  describe('getCharacter', () => {
    it('should get an existing character', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const created = await createCharacter(ctx, series._id, {
        name: 'Fetch Me',
        description: 'Test',
      });

      const fetched = await call(
        appRouter.knowledgeBase.characters.get,
        { id: created._id, seriesId: series._id },
        ctx(),
      );

      expect(fetched._id).toBe(created._id);
      expect(fetched.name).toBe('Fetch Me');
      expect(fetched.description).toBe('Test');
    });

    it('should return NOT_FOUND for non-existent character', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(
        () =>
          call(appRouter.knowledgeBase.characters.get, { id: '507f1f77bcf86cd799439011', seriesId: series._id }, ctx()),
        'NOT_FOUND',
      );
    });

    it('should return NOT_FOUND for character in different series', async () => {
      const { ctx } = await createUser();

      const series1 = await createSeries(ctx, { title: 'Series 1' });
      const series2 = await createSeries(ctx, { title: 'Series 2' });

      const character = await createCharacter(ctx, series1._id, { name: 'Character 1' });

      await expectErrorCode(
        () => call(appRouter.knowledgeBase.characters.get, { id: character._id, seriesId: series2._id }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('updateCharacter', () => {
    it('should update character fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const character = await createCharacter(ctx, series._id, {
        name: 'Original',
        description: 'Original desc',
      });

      const updated = await call(
        appRouter.knowledgeBase.characters.update,
        {
          id: character._id,
          seriesId: series._id,
          patch: { name: 'Updated', description: 'New desc', traits: ['brave'] },
        },
        ctx(),
      );

      expect(updated.name).toBe('Updated');
      expect(updated.description).toBe('New desc');
      expect(updated.traits).toEqual(['brave']);
    });

    it('should preserve unmodified fields', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const character = await createCharacter(ctx, series._id, {
        name: 'Original',
        description: 'Keep this',
        traits: ['smart'],
      });

      const updated = await call(
        appRouter.knowledgeBase.characters.update,
        { id: character._id, seriesId: series._id, patch: { name: 'New Name' } },
        ctx(),
      );

      expect(updated.name).toBe('New Name');
      expect(updated.description).toBe('Keep this');
      expect(updated.traits).toEqual(['smart']);
    });

    it('should fail when character does not exist', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.knowledgeBase.characters.update,
            { id: '507f1f77bcf86cd799439011', seriesId: series._id, patch: { name: 'New' } },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });
  });

  describe('deleteCharacter', () => {
    it('should delete an existing character', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const character = await createCharacter(ctx, series._id, { name: 'To Delete' });

      const result = await call(
        appRouter.knowledgeBase.characters.remove,
        { id: character._id, seriesId: series._id },
        ctx(),
      );

      expect(result.success).toBe(true);

      // Verify deletion
      await expectErrorCode(
        () => call(appRouter.knowledgeBase.characters.get, { id: character._id, seriesId: series._id }, ctx()),
        'NOT_FOUND',
      );
    });

    it('should fail when character does not exist', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await expectErrorCode(
        () =>
          call(
            appRouter.knowledgeBase.characters.remove,
            { id: '507f1f77bcf86cd799439011', seriesId: series._id },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });
  });

  describe('listCharacters', () => {
    it('should return empty list when no characters exist', async () => {
      const { ctx, series } = await createSeriesWithUser({ title: 'Empty Series' });

      const result = await call(
        appRouter.knowledgeBase.characters.list,
        { seriesId: series._id, limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items).toBeArray();
      expect(result.items.length).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should return characters for a series', async () => {
      const { ctx, series } = await createSeriesWithUser();

      await createCharacter(ctx, series._id, { name: 'Character 1' });
      await createCharacter(ctx, series._id, { name: 'Character 2' });

      const result = await call(
        appRouter.knowledgeBase.characters.list,
        { seriesId: series._id, limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should paginate results correctly', async () => {
      const { ctx, series } = await createSeriesWithUser();

      for (let i = 1; i <= 5; i++) {
        await createCharacter(ctx, series._id, { name: `Character ${i}` });
      }

      const page1 = await call(
        appRouter.knowledgeBase.characters.list,
        { seriesId: series._id, limit: 2, offset: 0 },
        ctx(),
      );

      expect(page1.items.length).toBe(2);
      expect(page1.total).toBe(5);

      const page2 = await call(
        appRouter.knowledgeBase.characters.list,
        { seriesId: series._id, limit: 2, offset: 2 },
        ctx(),
      );

      expect(page2.items.length).toBe(2);
      expect(page1.items[0]._id).not.toBe(page2.items[0]._id);
    });

    it('should only return characters for the specified series', async () => {
      const { ctx } = await createUser();

      const series1 = await createSeries(ctx, { title: 'Series 1' });
      const series2 = await createSeries(ctx, { title: 'Series 2' });

      await createCharacter(ctx, series1._id, { name: 'Char for S1' });
      await createCharacter(ctx, series2._id, { name: 'Char for S2' });

      const result = await call(
        appRouter.knowledgeBase.characters.list,
        { seriesId: series1._id, limit: 20, offset: 0 },
        ctx(),
      );

      expect(result.items.length).toBe(1);
      expect(result.items[0].name).toBe('Char for S1');
    });
  });

  describe('Character Relationships', () => {
    it('should add a relationship between characters', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const char1 = await createCharacter(ctx, series._id, { name: 'Alice' });
      const char2 = await createCharacter(ctx, series._id, { name: 'Bob' });

      const result = await addRelationship(ctx, {
        seriesId: series._id,
        characterId: char1._id,
        targetId: char2._id,
        type: 'sibling',
        note: 'Older brother',
      });

      expect(result.relationships).toBeDefined();
      expect(result.relationships?.length).toBe(1);
      expect(result.relationships?.[0].targetId).toBe(char2._id);
      expect(result.relationships?.[0].type).toBe('sibling');
      expect(result.relationships?.[0].note).toBe('Older brother');
    });

    it('should fail when target character does not exist', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const char1 = await createCharacter(ctx, series._id, { name: 'Alice' });

      await expectErrorCode(
        () =>
          addRelationship(ctx, {
            seriesId: series._id,
            characterId: char1._id,
            targetId: '507f1f77bcf86cd799439011',
            type: 'friend',
          }),
        'NOT_FOUND',
      );
    });

    it('should add multiple relationships to a character', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const char1 = await createCharacter(ctx, series._id, { name: 'Main' });
      const char2 = await createCharacter(ctx, series._id, { name: 'Friend' });
      const char3 = await createCharacter(ctx, series._id, { name: 'Rival' });

      await addRelationship(ctx, {
        seriesId: series._id,
        characterId: char1._id,
        targetId: char2._id,
        type: 'friend',
      });

      const result = await addRelationship(ctx, {
        seriesId: series._id,
        characterId: char1._id,
        targetId: char3._id,
        type: 'rival',
      });

      expect(result.relationships?.length).toBe(2);
    });

    it('should remove a relationship', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const char1 = await createCharacter(ctx, series._id, { name: 'Alice' });
      const char2 = await createCharacter(ctx, series._id, { name: 'Bob' });

      await addRelationship(ctx, {
        seriesId: series._id,
        characterId: char1._id,
        targetId: char2._id,
        type: 'friend',
      });

      const result = await call(
        appRouter.knowledgeBase.removeRelationship,
        { seriesId: series._id, characterId: char1._id, targetId: char2._id },
        ctx(),
      );

      expect(result.relationships?.length).toBe(0);
    });
  });

  describe('Character Appearances', () => {
    it('should add an appearance', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Script 1' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      const result = await addAppearance(ctx, {
        seriesId: series._id,
        characterId: character._id,
        scriptId: script._id,
        sceneRef: 'Scene 1',
      });

      expect(result.appearances?.length).toBe(1);
      expect(result.appearances?.[0].scriptId).toBe(script._id);
      expect(result.appearances?.[0].sceneRef).toBe('Scene 1');
    });

    it('should add appearance with location', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Script 1' });

      const location = await createLocation(ctx, series._id, { name: 'Beach' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      const result = await addAppearance(ctx, {
        seriesId: series._id,
        characterId: character._id,
        scriptId: script._id,
        sceneRef: 'Scene 5',
        locationId: location._id,
      });

      expect(result.appearances?.[0].locationId).toBe(location._id);
    });

    it('should remove an appearance', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Script 1' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      await addAppearance(ctx, {
        seriesId: series._id,
        characterId: character._id,
        scriptId: script._id,
        sceneRef: 'Scene 1',
      });

      const result = await call(
        appRouter.knowledgeBase.removeAppearance,
        {
          seriesId: series._id,
          characterId: character._id,
          scriptId: script._id,
          sceneRef: 'Scene 1',
        },
        ctx(),
      );

      expect(result.appearances?.length).toBe(0);
    });
  });

  describe('Character Variations', () => {
    it('should add a variation', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Alt Timeline' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      const result = await call(
        appRouter.knowledgeBase.addVariation,
        {
          seriesId: series._id,
          characterId: character._id,
          variation: { scriptId: script._id, label: 'Evil Version', notes: 'Corrupted hero' },
        },
        ctx(),
      );

      expect(result.variations?.length).toBe(1);
      expect(result.variations?.[0].label).toBe('Evil Version');
      expect(result.variations?.[0].notes).toBe('Corrupted hero');
    });

    it('should remove a variation', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Alt Timeline' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      await call(
        appRouter.knowledgeBase.addVariation,
        {
          seriesId: series._id,
          characterId: character._id,
          variation: { scriptId: script._id, label: 'Young Version' },
        },
        ctx(),
      );

      const result = await call(
        appRouter.knowledgeBase.removeVariation,
        {
          seriesId: series._id,
          characterId: character._id,
          scriptId: script._id,
          label: 'Young Version',
        },
        ctx(),
      );

      expect(result.variations?.length).toBe(0);
    });

    it('should update a variation', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Alt Timeline' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      await call(
        appRouter.knowledgeBase.addVariation,
        {
          seriesId: series._id,
          characterId: character._id,
          variation: { scriptId: script._id, label: 'Original Label', notes: 'Original notes' },
        },
        ctx(),
      );

      const result = await call(
        appRouter.knowledgeBase.updateVariation,
        {
          seriesId: series._id,
          characterId: character._id,
          scriptId: script._id,
          label: 'Original Label',
          patch: { label: 'Updated Label', notes: 'Updated notes' },
        },
        ctx(),
      );

      expect(result.variations?.length).toBe(1);
      expect(result.variations?.[0].label).toBe('Updated Label');
      expect(result.variations?.[0].notes).toBe('Updated notes');
      expect(result.variations?.[0].scriptId).toBe(script._id);
    });

    it('should return NOT_FOUND when updating non-existent variation', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Alt Timeline' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      await expectErrorCode(
        () =>
          call(
            appRouter.knowledgeBase.updateVariation,
            {
              seriesId: series._id,
              characterId: character._id,
              scriptId: script._id,
              label: 'Non-existent',
              patch: { notes: 'Will fail' },
            },
            ctx(),
          ),
        'NOT_FOUND',
      );
    });
  });

  describe('Character Variation Age and Appearance', () => {
    it('should add a variation with age and appearance', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Alt Timeline' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      const result = await call(
        appRouter.knowledgeBase.addVariation,
        {
          seriesId: series._id,
          characterId: character._id,
          variation: {
            scriptId: script._id,
            label: 'Young Version',
            notes: 'Character in their youth',
            age: 25,
            appearance: 'Tall with dark hair and piercing blue eyes',
          },
        },
        ctx(),
      );

      expect(result.variations?.length).toBe(1);
      expect(result.variations?.[0].label).toBe('Young Version');
      expect(result.variations?.[0].notes).toBe('Character in their youth');
      expect(result.variations?.[0].age).toBe(25);
      expect(result.variations?.[0].appearance).toBe('Tall with dark hair and piercing blue eyes');
    });

    it('should add a variation with age as string', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Alt Timeline' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      const result = await call(
        appRouter.knowledgeBase.addVariation,
        {
          seriesId: series._id,
          characterId: character._id,
          variation: {
            scriptId: script._id,
            label: 'Old Version',
            age: '60s',
            appearance: 'Gray hair and weathered face',
          },
        },
        ctx(),
      );

      expect(result.variations?.length).toBe(1);
      expect(result.variations?.[0].age).toBe('60s');
      expect(result.variations?.[0].appearance).toBe('Gray hair and weathered face');
    });

    it('should update variation age and appearance', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Alt Timeline' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      await call(
        appRouter.knowledgeBase.addVariation,
        {
          seriesId: series._id,
          characterId: character._id,
          variation: {
            scriptId: script._id,
            label: 'Mid-life',
            age: 40,
            appearance: 'Starting to show age',
          },
        },
        ctx(),
      );

      const result = await call(
        appRouter.knowledgeBase.updateVariation,
        {
          seriesId: series._id,
          characterId: character._id,
          scriptId: script._id,
          label: 'Mid-life',
          patch: {
            age: 45,
            appearance: 'Distinguished gray at temples',
          },
        },
        ctx(),
      );

      expect(result.variations?.length).toBe(1);
      expect(result.variations?.[0].age).toBe(45);
      expect(result.variations?.[0].appearance).toBe('Distinguished gray at temples');
    });

    it('should allow optional age and appearance', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Alt Timeline' });

      const character = await createCharacter(ctx, series._id, { name: 'Hero' });

      const result = await call(
        appRouter.knowledgeBase.addVariation,
        {
          seriesId: series._id,
          characterId: character._id,
          variation: {
            scriptId: script._id,
            label: 'Basic Version',
            notes: 'No age or appearance specified',
          },
        },
        ctx(),
      );

      expect(result.variations?.length).toBe(1);
      expect(result.variations?.[0].label).toBe('Basic Version');
      expect(result.variations?.[0].age).toBeUndefined();
      expect(result.variations?.[0].appearance).toBeUndefined();
    });
  });

  describe('Create and Update with Appearances', () => {
    it('should create a character with appearances', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Episode 1' });
      const location = await createLocation(ctx, series._id, { name: 'Café' });

      const character = await createCharacter(ctx, series._id, {
        name: 'Hero',
        appearances: [
          { scriptId: script._id, sceneRef: 'Scene 1', locationId: location._id },
          { scriptId: script._id, sceneRef: 'Scene 5' },
        ],
      });

      expect(character.appearances?.length).toBe(2);
      expect(character.appearances?.[0].scriptId).toBe(script._id);
      expect(character.appearances?.[0].sceneRef).toBe('Scene 1');
      expect(character.appearances?.[0].locationId).toBe(location._id);
      expect(character.appearances?.[1].sceneRef).toBe('Scene 5');
      expect(character.appearances?.[1].locationId).toBeUndefined();
    });

    it('should update character appearances via patch', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script1 = await createScript(ctx, series._id, { title: 'Episode 1' });
      const script2 = await createScript(ctx, series._id, { title: 'Episode 2' });

      const character = await createCharacter(ctx, series._id, {
        name: 'Hero',
        appearances: [{ scriptId: script1._id, sceneRef: 'Scene 1' }],
      });

      expect(character.appearances?.length).toBe(1);

      const updated = await call(
        appRouter.knowledgeBase.characters.update,
        {
          id: character._id,
          seriesId: series._id,
          patch: {
            appearances: [
              { scriptId: script1._id, sceneRef: 'Scene 1' },
              { scriptId: script2._id, sceneRef: 'Scene 3' },
            ],
          },
        },
        ctx(),
      );

      expect(updated.appearances?.length).toBe(2);
      expect(updated.appearances?.[1].scriptId).toBe(script2._id);
    });

    it('should create character with relationships and appearances', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Episode 1' });
      const char2 = await createCharacter(ctx, series._id, { name: 'Friend' });

      const character = await createCharacter(ctx, series._id, {
        name: 'Hero',
        relationships: [{ targetId: char2._id, type: 'friend', note: 'Best friend' }],
        appearances: [{ scriptId: script._id, sceneRef: 'Scene 1' }],
      });

      expect(character.relationships?.length).toBe(1);
      expect(character.relationships?.[0].targetId).toBe(char2._id);
      expect(character.appearances?.length).toBe(1);
      expect(character.appearances?.[0].scriptId).toBe(script._id);
    });

    it('should clear appearances by passing empty array', async () => {
      const { ctx, series } = await createSeriesWithUser();

      const script = await createScript(ctx, series._id, { title: 'Episode 1' });

      const character = await createCharacter(ctx, series._id, {
        name: 'Hero',
        appearances: [{ scriptId: script._id, sceneRef: 'Scene 1' }],
      });

      expect(character.appearances?.length).toBe(1);

      const updated = await call(
        appRouter.knowledgeBase.characters.update,
        {
          id: character._id,
          seriesId: series._id,
          patch: {
            appearances: [],
          },
        },
        ctx(),
      );

      expect(updated.appearances?.length).toBe(0);
    });
  });
});
