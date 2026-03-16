import type { mongoose } from '@typegoose/typegoose';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { username } from 'better-auth/plugins';
import type Redis from 'ioredis';
import { isNil } from 'lodash-es';
import { inject, singleton } from 'tsyringe';

import { INVITATION_STATUS, WORKSPACE_ROLES } from '@kaeri/shared';

import env from '@~/constants/env';
import { InvitationModel } from '@~/db/models/invitation.model';
import { UserProfileModel } from '@~/db/models/user-profile.model';
import { WorkspaceMemberModel } from '@~/db/models/workspace-member.model';
import { WorkspaceModel } from '@~/db/models/workspace.model';
import { TOKENS } from '@~/di/tokens';

import type { iWithLogger, LoggerFactory, LoggerType } from '../logger/logger.types';
import { devImpersonatePlugin } from './better-auth-plugins/dev-impersonate.plugin';

const createInstance = (db: mongoose.mongo.Db, logger: LoggerType, valkey: Redis | Nil) =>
  betterAuth({
    database: mongodbAdapter(db),
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [process.env.CORS_ORIGIN ?? ''],
    plugins: [username(), devImpersonatePlugin()],
    secondaryStorage: !isNil(valkey)
      ? {
          get: async (key) => valkey.get(key),
          set: async (key, value, ttl) => {
            if (ttl) await valkey.set(key, value, 'EX', ttl);
            else await valkey.set(key, value);
          },
          delete: async (key) => {
            await valkey.del(key);
          },
        }
      : undefined,
    emailAndPassword: {
      enabled: true,
    },
    telemetry: {
      enabled: false,
    },
    basePath: '/auth',
    advanced: {
      defaultCookieAttributes: {
        sameSite: 'none',
        secure: true,
        httpOnly: true,
      },
    },
    experimental: {
      joins: true,
    },
    databaseHooks: {
      user: {
        create: {
          async after(user) {
            // Create user profile
            try {
              await UserProfileModel.create({ userId: user.id });
            } catch (e) {
              logger.error('Please pay attention to this error! User profile creation failed.', { error: e });
            }

            // Create personal workspace for new user
            try {
              const workspace = await WorkspaceModel.create({
                name: `${user.name}'s Workspace`,
                isPersonal: true,
                creatorId: user.id,
              });

              await WorkspaceMemberModel.create({
                workspaceId: workspace._id,
                userId: user.id,
                role: WORKSPACE_ROLES.OWNER,
                joinedAt: new Date(),
              });

              logger.info('Personal workspace created for new user', { userId: user.id, workspaceId: workspace._id });
            } catch (e) {
              logger.error('Personal workspace creation failed', { error: e, userId: user.id });
            }

            // Auto-accept pending invitations for this email
            try {
              const pendingInvitations = await InvitationModel.find({
                invitedEmail: user.email.toLowerCase(),
                status: INVITATION_STATUS.PENDING,
                expiresAt: { $gt: new Date() },
              });

              // Process invitations in parallel
              await Promise.all(
                pendingInvitations.map(async (invitation) => {
                  // Check if user is already a member
                  const existingMember = await WorkspaceMemberModel.findOne({
                    workspaceId: invitation.workspaceId,
                    userId: user.id,
                  });

                  if (!existingMember) {
                    await WorkspaceMemberModel.create({
                      workspaceId: invitation.workspaceId,
                      userId: user.id,
                      role: invitation.role,
                      joinedAt: new Date(),
                    });

                    await InvitationModel.updateOne(
                      { _id: invitation._id },
                      { status: INVITATION_STATUS.ACCEPTED, acceptedAt: new Date() },
                    );

                    logger.info('Auto-accepted pending invitation for new user', {
                      userId: user.id,
                      invitationId: invitation._id,
                      workspaceId: invitation.workspaceId,
                    });
                  }
                }),
              );
            } catch (e) {
              logger.error('Pending invitation processing failed', { error: e, userId: user.id });
            }
          },
        },
      },
    },
  });

@singleton()
export class AuthService implements iWithLogger {
  public readonly logger: iWithLogger['logger'];

  private instance: ReturnType<typeof createInstance> | null = null;

  constructor(@inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.create('auth');
  }

  public connect(db: mongoose.mongo.Db, valkey: Redis | Nil) {
    this.instance = createInstance(db, this.logger, valkey);
  }

  public getInstance() {
    if (!this.instance) throw new Error('AuthService not initialized. Call connect() first.');

    return this.instance;
  }
}
