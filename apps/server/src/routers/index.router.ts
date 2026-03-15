import { User, Session } from '@~/db/models/auth.model';
import { coreBase, corePublic } from '@~/lib/orpc';

export const indexRouter = coreBase.index.router({
  healthCheck: corePublic.index.healthCheck.handler(async () => ({ status: 'OK' })),

  metrics: corePublic.index.metrics.handler(async () => {
    const now = new Date();

    const [totalUsers, activeSessions] = await Promise.all([
      User.countDocuments(),
      Session.countDocuments({ expiresAt: { $gt: now } }),
    ]);

    return {
      totalUsers,
      activeSessions,
    };
  }),
});
