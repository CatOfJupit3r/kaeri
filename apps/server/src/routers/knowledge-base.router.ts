import { base, protectedProcedure } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const knowledgeBaseRouter = base.knowledgeBase.router({
  searchKB: protectedProcedure.knowledgeBase.searchKB.handler(async ({ input }) =>
    GETTERS.KnowledgeBaseService().search(input.seriesId, input.query ?? '', input.limit, input.offset),
  ),

  // Character CRUD - nested under 'characters'
  characters: {
    create: protectedProcedure.knowledgeBase.characters.create.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().createCharacter(
        input.seriesId,
        input.value as { name: string; description?: string; traits?: string[]; avatarUrl?: string },
      ),
    ),

    update: protectedProcedure.knowledgeBase.characters.update.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().updateCharacter(input.id, input.seriesId, input.patch),
    ),

    remove: protectedProcedure.knowledgeBase.characters.remove.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().deleteCharacter(input.id, input.seriesId),
    ),

    get: protectedProcedure.knowledgeBase.characters.get.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().getCharacter(input.id, input.seriesId),
    ),

    list: protectedProcedure.knowledgeBase.characters.list.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().listCharacters(input.seriesId, input.limit, input.offset),
    ),
  },

  // Location CRUD - nested under 'locations'
  locations: {
    create: protectedProcedure.knowledgeBase.locations.create.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().createLocation(
        input.seriesId,
        input.value as { name: string; description?: string; tags?: string[] },
      ),
    ),

    update: protectedProcedure.knowledgeBase.locations.update.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().updateLocation(input.id, input.seriesId, input.patch),
    ),

    remove: protectedProcedure.knowledgeBase.locations.remove.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().deleteLocation(input.id, input.seriesId),
    ),

    get: protectedProcedure.knowledgeBase.locations.get.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().getLocation(input.id, input.seriesId),
    ),

    list: protectedProcedure.knowledgeBase.locations.list.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().listLocations(input.seriesId, input.limit, input.offset),
    ),
  },

  // Prop CRUD - nested under 'props'
  props: {
    create: protectedProcedure.knowledgeBase.props.create.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().createProp(input.seriesId, input.value as { name: string; description?: string }),
    ),

    update: protectedProcedure.knowledgeBase.props.update.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().updateProp(input.id, input.seriesId, input.patch),
    ),

    remove: protectedProcedure.knowledgeBase.props.remove.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().deleteProp(input.id, input.seriesId),
    ),

    get: protectedProcedure.knowledgeBase.props.get.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().getProp(input.id, input.seriesId),
    ),

    list: protectedProcedure.knowledgeBase.props.list.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().listProps(input.seriesId, input.limit, input.offset),
    ),
  },

  // Timeline CRUD - nested under 'timeline'
  timeline: {
    create: protectedProcedure.knowledgeBase.timeline.create.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().createTimelineEntry(
        input.seriesId,
        input.value as {
          label: string;
          order?: number;
          timestamp?: string;
          links?: Array<{ entityType: string; entityId: string }>;
        },
      ),
    ),

    update: protectedProcedure.knowledgeBase.timeline.update.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().updateTimelineEntry(input.id, input.seriesId, input.patch),
    ),

    remove: protectedProcedure.knowledgeBase.timeline.remove.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().deleteTimelineEntry(input.id, input.seriesId),
    ),

    get: protectedProcedure.knowledgeBase.timeline.get.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().getTimelineEntry(input.id, input.seriesId),
    ),

    list: protectedProcedure.knowledgeBase.timeline.list.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().listTimelineEntries(input.seriesId, input.limit, input.offset),
    ),
  },

  // WildCard CRUD - nested under 'wildcards'
  wildcards: {
    create: protectedProcedure.knowledgeBase.wildcards.create.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().createWildCard(
        input.seriesId,
        input.value as { title: string; body?: string; tag?: string },
      ),
    ),

    update: protectedProcedure.knowledgeBase.wildcards.update.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().updateWildCard(input.id, input.seriesId, input.patch),
    ),

    remove: protectedProcedure.knowledgeBase.wildcards.remove.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().deleteWildCard(input.id, input.seriesId),
    ),

    get: protectedProcedure.knowledgeBase.wildcards.get.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().getWildCard(input.id, input.seriesId),
    ),

    list: protectedProcedure.knowledgeBase.wildcards.list.handler(async ({ input }) =>
      GETTERS.KnowledgeBaseService().listWildCards(input.seriesId, input.limit, input.offset),
    ),
  },

  // Character relationships
  addRelationship: protectedProcedure.knowledgeBase.addRelationship.handler(async ({ input }) =>
    GETTERS.KnowledgeBaseService().addRelationship(input.seriesId, input.characterId, input.relationship),
  ),

  removeRelationship: protectedProcedure.knowledgeBase.removeRelationship.handler(async ({ input }) =>
    GETTERS.KnowledgeBaseService().removeRelationship(input.seriesId, input.characterId, input.targetId),
  ),

  // Character appearances
  addAppearance: protectedProcedure.knowledgeBase.addAppearance.handler(async ({ input }) =>
    GETTERS.KnowledgeBaseService().addAppearance(input.seriesId, input.characterId, input.appearance),
  ),

  removeAppearance: protectedProcedure.knowledgeBase.removeAppearance.handler(async ({ input }) =>
    GETTERS.KnowledgeBaseService().removeAppearance(input.seriesId, input.characterId, input.scriptId, input.sceneRef),
  ),

  // Character variations
  addVariation: protectedProcedure.knowledgeBase.addVariation.handler(async ({ input }) =>
    GETTERS.KnowledgeBaseService().addVariation(input.seriesId, input.characterId, input.variation),
  ),

  removeVariation: protectedProcedure.knowledgeBase.removeVariation.handler(async ({ input }) =>
    GETTERS.KnowledgeBaseService().removeVariation(input.seriesId, input.characterId, input.scriptId, input.label),
  ),
});
