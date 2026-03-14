import { base, protectedProcedure } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

const audit = GETTERS.AuditService;
const kb = GETTERS.KnowledgeBaseService;

export const knowledgeBaseRouter = base.knowledgeBase.router({
  searchKB: protectedProcedure.knowledgeBase.searchKB.handler(async ({ input }) =>
    kb().search(input.seriesId, input.query ?? '', input.limit, input.offset),
  ),

  // Character CRUD - nested under 'characters'
  characters: {
    create: protectedProcedure.knowledgeBase.characters.create.handler(async ({ input, context }) => {
      const result = await kb().createCharacter(
        input.seriesId,
        input.value as {
          name: string;
          description?: string;
          traits?: string[];
          avatarUrl?: string;
          relationships?: Array<{ targetId: string; type: string; note?: string }>;
          variations?: Array<{ scriptId: string; label: string; notes?: string }>;
          appearances?: Array<{ scriptId: string; sceneRef: string; locationId?: string }>;
        },
      );
      await audit().logCreate(input.seriesId, 'character', result._id, context.session.user.id, result.toObject());
      return result;
    }),

    update: protectedProcedure.knowledgeBase.characters.update.handler(async ({ input, context }) => {
      const before = await kb().getCharacter(input.id, input.seriesId);
      const result = await kb().updateCharacter(input.id, input.seriesId, input.patch);
      await audit().logUpdate(
        input.seriesId,
        'character',
        input.id,
        context.session.user.id,
        before.toObject(),
        result.toObject(),
      );
      return result;
    }),

    remove: protectedProcedure.knowledgeBase.characters.remove.handler(async ({ input, context }) => {
      const before = await kb().getCharacter(input.id, input.seriesId);
      const result = await kb().deleteCharacter(input.id, input.seriesId);
      await audit().logDelete(input.seriesId, 'character', input.id, context.session.user.id, before.toObject());
      return result;
    }),

    get: protectedProcedure.knowledgeBase.characters.get.handler(async ({ input }) =>
      kb().getCharacter(input.id, input.seriesId),
    ),

    list: protectedProcedure.knowledgeBase.characters.list.handler(async ({ input }) =>
      kb().listCharacters(input.seriesId, input.limit, input.offset),
    ),
  },

  // Location CRUD - nested under 'locations'
  locations: {
    create: protectedProcedure.knowledgeBase.locations.create.handler(async ({ input, context }) => {
      const result = await kb().createLocation(
        input.seriesId,
        input.value as { name: string; description?: string; tags?: string[] },
      );
      await audit().logCreate(input.seriesId, 'location', result._id, context.session.user.id, result.toObject());
      return result;
    }),

    update: protectedProcedure.knowledgeBase.locations.update.handler(async ({ input, context }) => {
      const before = await kb().getLocation(input.id, input.seriesId);
      const result = await kb().updateLocation(input.id, input.seriesId, input.patch);
      await audit().logUpdate(
        input.seriesId,
        'location',
        input.id,
        context.session.user.id,
        before.toObject(),
        result.toObject(),
      );
      return result;
    }),

    remove: protectedProcedure.knowledgeBase.locations.remove.handler(async ({ input, context }) => {
      const before = await kb().getLocation(input.id, input.seriesId);
      const result = await kb().deleteLocation(input.id, input.seriesId);
      await audit().logDelete(input.seriesId, 'location', input.id, context.session.user.id, before.toObject());
      return result;
    }),

    get: protectedProcedure.knowledgeBase.locations.get.handler(async ({ input }) =>
      kb().getLocation(input.id, input.seriesId),
    ),

    list: protectedProcedure.knowledgeBase.locations.list.handler(async ({ input }) =>
      kb().listLocations(input.seriesId, input.limit, input.offset),
    ),
  },

  // Prop CRUD - nested under 'props'
  props: {
    create: protectedProcedure.knowledgeBase.props.create.handler(async ({ input, context }) => {
      const result = await kb().createProp(input.seriesId, input.value);
      await audit().logCreate(input.seriesId, 'prop', result._id, context.session.user.id, result.toObject());
      return result;
    }),

    update: protectedProcedure.knowledgeBase.props.update.handler(async ({ input, context }) => {
      const before = await kb().getProp(input.id, input.seriesId);
      const result = await kb().updateProp(input.id, input.seriesId, input.patch);
      await audit().logUpdate(
        input.seriesId,
        'prop',
        input.id,
        context.session.user.id,
        before.toObject(),
        result.toObject(),
      );
      return result;
    }),

    remove: protectedProcedure.knowledgeBase.props.remove.handler(async ({ input, context }) => {
      const before = await kb().getProp(input.id, input.seriesId);
      const result = await kb().deleteProp(input.id, input.seriesId);
      await audit().logDelete(input.seriesId, 'prop', input.id, context.session.user.id, before.toObject());
      return result;
    }),

    get: protectedProcedure.knowledgeBase.props.get.handler(async ({ input }) =>
      kb().getProp(input.id, input.seriesId),
    ),

    list: protectedProcedure.knowledgeBase.props.list.handler(async ({ input }) =>
      kb().listProps(input.seriesId, input.limit, input.offset),
    ),
  },

  // Timeline CRUD - nested under 'timeline'
  timeline: {
    create: protectedProcedure.knowledgeBase.timeline.create.handler(async ({ input, context }) => {
      const result = await kb().createTimelineEntry(
        input.seriesId,
        input.value as {
          label: string;
          order?: number;
          timestamp?: string;
          links?: Array<{ entityType: string; entityId: string }>;
        },
      );
      await audit().logCreate(input.seriesId, 'timeline', result._id, context.session.user.id, result.toObject());
      return result;
    }),

    update: protectedProcedure.knowledgeBase.timeline.update.handler(async ({ input, context }) => {
      const before = await kb().getTimelineEntry(input.id, input.seriesId);
      const result = await kb().updateTimelineEntry(input.id, input.seriesId, input.patch);
      await audit().logUpdate(
        input.seriesId,
        'timeline',
        input.id,
        context.session.user.id,
        before.toObject(),
        result.toObject(),
      );
      return result;
    }),

    remove: protectedProcedure.knowledgeBase.timeline.remove.handler(async ({ input, context }) => {
      const before = await kb().getTimelineEntry(input.id, input.seriesId);
      const result = await kb().deleteTimelineEntry(input.id, input.seriesId);
      await audit().logDelete(input.seriesId, 'timeline', input.id, context.session.user.id, before.toObject());
      return result;
    }),

    get: protectedProcedure.knowledgeBase.timeline.get.handler(async ({ input }) =>
      kb().getTimelineEntry(input.id, input.seriesId),
    ),

    list: protectedProcedure.knowledgeBase.timeline.list.handler(async ({ input }) =>
      kb().listTimelineEntries(input.seriesId, input.limit, input.offset),
    ),
  },

  // WildCard CRUD - nested under 'wildcards'
  wildcards: {
    create: protectedProcedure.knowledgeBase.wildcards.create.handler(async ({ input, context }) => {
      const result = await kb().createWildCard(
        input.seriesId,
        input.value as { title: string; body?: string; tag?: string },
      );
      await audit().logCreate(input.seriesId, 'wildcard', result._id, context.session.user.id, result.toObject());
      return result;
    }),

    update: protectedProcedure.knowledgeBase.wildcards.update.handler(async ({ input, context }) => {
      const before = await kb().getWildCard(input.id, input.seriesId);
      const result = await kb().updateWildCard(input.id, input.seriesId, input.patch);
      await audit().logUpdate(
        input.seriesId,
        'wildcard',
        input.id,
        context.session.user.id,
        before.toObject(),
        result.toObject(),
      );
      return result;
    }),

    remove: protectedProcedure.knowledgeBase.wildcards.remove.handler(async ({ input, context }) => {
      const before = await kb().getWildCard(input.id, input.seriesId);
      const result = await kb().deleteWildCard(input.id, input.seriesId);
      await audit().logDelete(input.seriesId, 'wildcard', input.id, context.session.user.id, before.toObject());
      return result;
    }),

    get: protectedProcedure.knowledgeBase.wildcards.get.handler(async ({ input }) =>
      kb().getWildCard(input.id, input.seriesId),
    ),

    list: protectedProcedure.knowledgeBase.wildcards.list.handler(async ({ input }) =>
      kb().listWildCards(input.seriesId, input.limit, input.offset),
    ),
  },

  // Character relationships
  addRelationship: protectedProcedure.knowledgeBase.addRelationship.handler(async ({ input }) =>
    kb().addRelationship(input.seriesId, input.characterId, input.relationship),
  ),

  removeRelationship: protectedProcedure.knowledgeBase.removeRelationship.handler(async ({ input }) =>
    kb().removeRelationship(input.seriesId, input.characterId, input.targetId),
  ),

  // Character appearances
  addAppearance: protectedProcedure.knowledgeBase.addAppearance.handler(async ({ input }) =>
    kb().addAppearance(input.seriesId, input.characterId, input.appearance),
  ),

  removeAppearance: protectedProcedure.knowledgeBase.removeAppearance.handler(async ({ input }) =>
    kb().removeAppearance(input.seriesId, input.characterId, input.scriptId, input.sceneRef),
  ),

  // Character variations
  addVariation: protectedProcedure.knowledgeBase.addVariation.handler(async ({ input }) =>
    kb().addVariation(input.seriesId, input.characterId, input.variation),
  ),

  updateVariation: protectedProcedure.knowledgeBase.updateVariation.handler(async ({ input }) =>
    kb().updateVariation(input.seriesId, input.characterId, input.scriptId, input.label, input.patch),
  ),

  removeVariation: protectedProcedure.knowledgeBase.removeVariation.handler(async ({ input }) =>
    kb().removeVariation(input.seriesId, input.characterId, input.scriptId, input.label),
  ),
});
