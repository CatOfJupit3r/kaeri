import { inject, injectable } from 'tsyringe';

import type { WorkspaceRole } from '@kaeri/shared';
import { errorCodes, ROLE_HIERARCHY } from '@kaeri/shared';

import { WorkspaceMemberModel } from '@~/db/models/workspace-member.model';
import { TOKENS } from '@~/di/tokens';
import type { iWithLogger, LoggerFactory } from '@~/features/logger/logger.types';
import { buildCacheKey, CACHE_TTL } from '@~/features/valkey/valkey.constants';
import type { ValkeyService } from '@~/features/valkey/valkey.service';
import { ORPCForbiddenError, ORPCNotFoundError } from '@~/lib/orpc-error-wrapper';

import type { TypedEventBus } from '../events/event-bus';
import { COLLABORATION_EVENTS } from './collaboration.events';

interface iCachedMembership {
  _id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
}

/**
 * PermissionService handles role-based access control with Valkey caching.
 *
 * Key features:
 * - 5-minute TTL for permission cache (configurable)
 * - Automatic cache invalidation on role changes
 * - NOT_FOUND stance for inaccessible resources
 */
@injectable()
export class PermissionService implements iWithLogger {
  public logger: ReturnType<LoggerFactory['create']>;

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.ValkeyService) private readonly valkey: ValkeyService,
    @inject(TOKENS.EventBus) private readonly eventBus: TypedEventBus,
  ) {
    this.logger = loggerFactory.create('permission-service');
    this.setupEventListeners();
  }

  /**
   * Get a user's membership in a workspace.
   * Uses cache for performance (5-minute TTL).
   */
  public async getMembership(workspaceId: string, userId: string): Promise<iCachedMembership | null> {
    const cacheKey = buildCacheKey.workspaceMember(workspaceId, userId);

    // Try cache first
    const cached = await this.valkey.cacheGet<iCachedMembership | 'null'>(cacheKey);
    if (cached === 'null') {
      return null;
    }
    if (cached) {
      return cached;
    }

    // Cache miss - query DB
    const member = await WorkspaceMemberModel.findOne({ workspaceId, userId }).lean();

    if (member) {
      const membership: iCachedMembership = {
        _id: member._id,
        workspaceId: member.workspaceId,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt.toISOString(),
      };
      await this.valkey.cacheSet(cacheKey, membership, CACHE_TTL.PERMISSION);
      return membership;
    }

    // Cache the "not a member" result too to avoid repeated DB queries
    await this.valkey.cacheSet(cacheKey, 'null', CACHE_TTL.PERMISSION);
    return null;
  }

  /**
   * Check if a user has at least the specified role in a workspace.
   * Returns true if user's role >= requiredRole in the hierarchy.
   */
  public async hasPermission(workspaceId: string, userId: string, requiredRole: WorkspaceRole): Promise<boolean> {
    const membership = await this.getMembership(workspaceId, userId);
    if (!membership) return false;
    return ROLE_HIERARCHY[membership.role] >= ROLE_HIERARCHY[requiredRole];
  }

  /**
   * Require that a user has at least the specified role.
   * Throws ORPCNotFoundError if not a member (NOT_FOUND stance).
   * Throws ORPCForbiddenError if insufficient permissions.
   */
  public async requirePermission(
    workspaceId: string,
    userId: string,
    requiredRole: WorkspaceRole,
  ): Promise<iCachedMembership> {
    const membership = await this.getMembership(workspaceId, userId);

    if (!membership) {
      // NOT_FOUND stance: don't reveal workspace exists
      throw ORPCNotFoundError(errorCodes.WORKSPACE_NOT_FOUND);
    }

    if (ROLE_HIERARCHY[membership.role] < ROLE_HIERARCHY[requiredRole]) {
      throw ORPCForbiddenError(errorCodes.INSUFFICIENT_PERMISSIONS);
    }

    return membership;
  }

  /**
   * Require that a user is a member of the workspace (any role).
   * Throws ORPCNotFoundError if not a member.
   */
  public async requireMembership(workspaceId: string, userId: string): Promise<iCachedMembership> {
    const membership = await this.getMembership(workspaceId, userId);

    if (!membership) {
      throw ORPCNotFoundError(errorCodes.WORKSPACE_NOT_FOUND);
    }

    return membership;
  }

  /**
   * Check if a user can manage another user in the workspace.
   * Rules:
   * - Owner can manage anyone
   * - Admin can manage Editor and Viewer
   * - Cannot manage someone with equal or higher role
   * - Cannot manage self
   */
  public async canManageUser(workspaceId: string, actorId: string, targetUserId: string): Promise<boolean> {
    if (actorId === targetUserId) {
      return false;
    }

    const [actorMembership, targetMembership] = await Promise.all([
      this.getMembership(workspaceId, actorId),
      this.getMembership(workspaceId, targetUserId),
    ]);

    if (!actorMembership || !targetMembership) {
      return false;
    }

    // Cannot manage someone with equal or higher role
    return ROLE_HIERARCHY[actorMembership.role] > ROLE_HIERARCHY[targetMembership.role];
  }

  /**
   * Invalidate permission cache for a specific user in a workspace.
   */
  public async invalidateCache(workspaceId: string, userId: string) {
    const cacheKey = buildCacheKey.workspaceMember(workspaceId, userId);
    await this.valkey.cacheDel(cacheKey);
    this.logger.debug('Permission cache invalidated', { workspaceId, userId });
  }

  /**
   * Invalidate user's workspace list cache.
   */
  public async invalidateUserWorkspacesCache(userId: string) {
    const cacheKey = buildCacheKey.userWorkspaces(userId);
    await this.valkey.cacheDel(cacheKey);
  }

  /**
   * Setup event listeners for automatic cache invalidation.
   */
  private setupEventListeners() {
    this.eventBus.on(COLLABORATION_EVENTS.MEMBER_ADDED, async (payload) => {
      await this.invalidateCache(payload.workspaceId, payload.userId);
      await this.invalidateUserWorkspacesCache(payload.userId);
    });

    this.eventBus.on(COLLABORATION_EVENTS.MEMBER_REMOVED, async (payload) => {
      await this.invalidateCache(payload.workspaceId, payload.userId);
      await this.invalidateUserWorkspacesCache(payload.userId);
    });

    this.eventBus.on(COLLABORATION_EVENTS.MEMBER_ROLE_CHANGED, async (payload) => {
      await this.invalidateCache(payload.workspaceId, payload.userId);
    });

    this.eventBus.on(COLLABORATION_EVENTS.OWNERSHIP_TRANSFERRED, async (payload) => {
      await this.invalidateCache(payload.workspaceId, payload.oldOwnerId);
      await this.invalidateCache(payload.workspaceId, payload.newOwnerId);
    });
  }
}
