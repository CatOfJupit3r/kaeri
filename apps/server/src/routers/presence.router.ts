import { collaborationBase, collaborationProtected } from '@~/lib/orpc';
import { GETTERS } from '@~/routers/di-getter';

export const presenceRouter = collaborationBase.presence.router({
  heartbeat: collaborationProtected.presence.heartbeat.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    return GETTERS.PresenceService().heartbeat(userId, input.targetType, input.targetId, input.context);
  }),

  getPresence: collaborationProtected.presence.getPresence.handler(async ({ input }) => {
    const result = await GETTERS.PresenceService().getPresence(input.targetType, input.targetId);
    return {
      targetType: result.targetType,
      targetId: result.targetId,
      users: result.users.map((u) => ({
        userId: u.userId,
        targetType: u.targetType,
        targetId: u.targetId,
        context: u.context,
        lastSeen: new Date(u.lastSeen),
        user: u.user,
      })),
      count: result.count,
    };
  }),

  getSeriesPresence: collaborationProtected.presence.getSeriesPresence.handler(async ({ input }) => {
    const result = await GETTERS.PresenceService().getSeriesPresence(input.seriesId);

    const formatAggregate = (agg: NonNullable<typeof result.series>) => ({
      targetType: agg.targetType,
      targetId: agg.targetId,
      users: agg.users.map((u) => ({
        userId: u.userId,
        targetType: u.targetType,
        targetId: u.targetId,
        context: u.context,
        lastSeen: new Date(u.lastSeen),
        user: u.user,
      })),
      count: agg.count,
    });

    return {
      series: result.series ? formatAggregate(result.series) : undefined,
      scripts: result.scripts.map(formatAggregate),
      scenes: result.scenes.map(formatAggregate),
      totalUniqueUsers: result.totalUniqueUsers,
    };
  }),

  clearPresence: collaborationProtected.presence.clearPresence.handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    return GETTERS.PresenceService().clearPresence(userId, input.targetType, input.targetId);
  }),
});
