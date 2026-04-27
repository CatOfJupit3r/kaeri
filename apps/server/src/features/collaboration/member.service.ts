import { inject, injectable } from 'tsyringe';

import type { WorkspaceRole } from '@kaeri/shared';
import { errorCodes, ROLE_HIERARCHY, WORKSPACE_ROLES } from '@kaeri/shared';

import { WorkspaceMemberModel } from '@~/db/models/workspace-member.model';
import type { WorkspaceMemberDoc } from '@~/db/models/workspace-member.model';
import { WorkspaceModel } from '@~/db/models/workspace.model';
import { TOKENS } from '@~/di/tokens';
import type { iWithLogger, LoggerFactory } from '@~/features/logger/logger.types';
import { ORPCForbiddenError, ORPCNotFoundError } from '@~/lib/orpc-error-wrapper';

import type { TypedEventBus } from '../events/event-bus';
import type { AuthUserLookupService } from './auth-user-lookup.service';
import { COLLABORATION_EVENTS } from './collaboration.events';
import { PermissionService } from './permission.service';

interface iMemberWithUser {
  _id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: Date;
  user: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
}

/**
 * MemberService handles workspace member operations.
 */
@injectable()
export class MemberService implements iWithLogger {
  public logger: ReturnType<LoggerFactory['create']>;

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.EventBus) private readonly eventBus: TypedEventBus,
    @inject(TOKENS.PermissionService) private readonly permissionService: PermissionService,
    @inject(TOKENS.AuthUserLookupService) private readonly authUserLookup: AuthUserLookupService,
  ) {
    this.logger = loggerFactory.create('member-service');
  }

  /**
   * List all members of a workspace with user info.
   */
  public async listMembers(
    userId: string,
    workspaceId: string,
    options: { limit?: number; cursor?: string } = {},
  ): Promise<{ members: iMemberWithUser[]; nextCursor?: string; total: number }> {
    // Verify user has access to workspace
    await this.permissionService.requireMembership(workspaceId, userId);

    const limit = Math.min(options.limit ?? 50, 100);
    const query = options.cursor ? { workspaceId, _id: { $gt: options.cursor } } : { workspaceId };

    const [members, total] = await Promise.all([
      WorkspaceMemberModel.find(query)
        .sort({ _id: 1 })
        .limit(limit + 1)
        .lean(),
      WorkspaceMemberModel.countDocuments({ workspaceId }),
    ]);

    const hasMore = members.length > limit;
    const resultMembers = hasMore ? members.slice(0, limit) : members;

    // Fetch user details from Better Auth's user collection
    const userIds = resultMembers.map((m) => m.userId);
    const usersMap = await this.authUserLookup.getUsersByIds(userIds);

    const membersWithUsers: iMemberWithUser[] = resultMembers.map((member) => {
      const user = usersMap.get(member.userId);
      return {
        _id: member._id,
        workspaceId: member.workspaceId,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        user: {
          _id: member.userId,
          name: user?.name ?? 'Unknown User',
          email: user?.email ?? '',
        },
      };
    });

    return {
      members: membersWithUsers,
      nextCursor: hasMore ? resultMembers[resultMembers.length - 1]._id : undefined,
      total,
    };
  }

  /**
   * Update a member's role within a workspace.
   */
  public async updateMemberRole(
    actorId: string,
    workspaceId: string,
    targetUserId: string,
    newRole: WorkspaceRole,
  ): Promise<WorkspaceMemberDoc> {
    // Verify actor has Admin or Owner permission
    await this.permissionService.requirePermission(workspaceId, actorId, WORKSPACE_ROLES.ADMIN);

    // Cannot modify own role
    if (actorId === targetUserId) {
      throw ORPCForbiddenError(errorCodes.CANNOT_MODIFY_OWN_ROLE);
    }

    const targetMember = await WorkspaceMemberModel.findOne({ workspaceId, userId: targetUserId });
    if (!targetMember) {
      throw ORPCNotFoundError(errorCodes.MEMBER_NOT_FOUND);
    }

    // Cannot modify owner role (owner must transfer ownership first)
    if (targetMember.role === WORKSPACE_ROLES.OWNER) {
      throw ORPCForbiddenError(errorCodes.CANNOT_MODIFY_OWNER_ROLE);
    }

    // Cannot assign owner role through role update
    if (newRole === WORKSPACE_ROLES.OWNER) {
      throw ORPCForbiddenError(errorCodes.CANNOT_MODIFY_OWNER_ROLE);
    }

    // Verify actor can manage the target (hierarchy check)
    const canManage = await this.permissionService.canManageUser(workspaceId, actorId, targetUserId);
    if (!canManage) {
      throw ORPCForbiddenError(errorCodes.CANNOT_MODIFY_OWNER_ROLE);
    }

    // Ensure actor isn't assigning a role higher than their own
    const actorMembership = await this.permissionService.getMembership(workspaceId, actorId);
    if (actorMembership && ROLE_HIERARCHY[newRole] >= ROLE_HIERARCHY[actorMembership.role]) {
      if (actorMembership.role !== WORKSPACE_ROLES.OWNER) {
        throw ORPCForbiddenError(errorCodes.CANNOT_MODIFY_OWNER_ROLE);
      }
    }

    const previousRole = targetMember.role;
    targetMember.role = newRole;
    await targetMember.save();

    // Invalidate permission cache for target user
    await this.permissionService.invalidateCache(workspaceId, targetUserId);

    this.logger.info('Member role updated', {
      workspaceId,
      targetUserId,
      previousRole,
      newRole,
      actorId,
    });

    this.eventBus.emit(COLLABORATION_EVENTS.MEMBER_ROLE_CHANGED, {
      workspaceId,
      userId: targetUserId,
      previousRole,
      newRole,
      changedById: actorId,
    });

    return targetMember;
  }

  /**
   * Remove a member from a workspace.
   */
  public async removeMember(actorId: string, workspaceId: string, targetUserId: string) {
    // Verify actor has Admin or Owner permission
    await this.permissionService.requirePermission(workspaceId, actorId, WORKSPACE_ROLES.ADMIN);

    const targetMember = await WorkspaceMemberModel.findOne({ workspaceId, userId: targetUserId });
    if (!targetMember) {
      throw ORPCNotFoundError(errorCodes.MEMBER_NOT_FOUND);
    }

    // Cannot remove the owner
    if (targetMember.role === WORKSPACE_ROLES.OWNER) {
      throw ORPCForbiddenError(errorCodes.CANNOT_REMOVE_OWNER);
    }

    // Verify actor can manage the target
    const canManage = await this.permissionService.canManageUser(workspaceId, actorId, targetUserId);
    if (!canManage) {
      throw ORPCForbiddenError(errorCodes.CANNOT_REMOVE_OWNER);
    }

    await WorkspaceMemberModel.deleteOne({ workspaceId, userId: targetUserId });

    // Invalidate permission cache
    await this.permissionService.invalidateCache(workspaceId, targetUserId);

    this.logger.info('Member removed', { workspaceId, targetUserId, actorId });

    this.eventBus.emit(COLLABORATION_EVENTS.MEMBER_REMOVED, {
      workspaceId,
      userId: targetUserId,
      removedById: actorId,
    });
  }

  /**
   * Leave a workspace voluntarily.
   */
  public async leaveWorkspace(userId: string, workspaceId: string) {
    const membership = await WorkspaceMemberModel.findOne({ workspaceId, userId });
    if (!membership) {
      throw ORPCNotFoundError(errorCodes.MEMBER_NOT_FOUND);
    }

    // Owner cannot leave - must transfer ownership first
    if (membership.role === WORKSPACE_ROLES.OWNER) {
      throw ORPCForbiddenError(errorCodes.CANNOT_LEAVE_AS_OWNER);
    }

    // Check if this is a personal workspace
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (workspace?.isPersonal) {
      throw ORPCForbiddenError(errorCodes.WORKSPACE_CANNOT_DELETE_PERSONAL);
    }

    await WorkspaceMemberModel.deleteOne({ workspaceId, userId });

    // Invalidate permission cache
    await this.permissionService.invalidateCache(workspaceId, userId);

    this.logger.info('Member left workspace', { workspaceId, userId });

    this.eventBus.emit(COLLABORATION_EVENTS.MEMBER_REMOVED, {
      workspaceId,
      userId,
      removedById: userId,
    });
  }

  /**
   * Add a member to a workspace (used by invitation acceptance).
   */
  public async addMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
    invitedById?: string,
  ): Promise<WorkspaceMemberDoc> {
    // Check if already a member
    const existing = await WorkspaceMemberModel.findOne({ workspaceId, userId });
    if (existing) {
      throw ORPCForbiddenError(errorCodes.USER_ALREADY_MEMBER);
    }

    const member = await WorkspaceMemberModel.create({
      workspaceId,
      userId,
      role,
      joinedAt: new Date(),
    });

    this.logger.info('Member added', { workspaceId, userId, role, invitedById });

    this.eventBus.emit(COLLABORATION_EVENTS.MEMBER_ADDED, {
      workspaceId,
      userId,
      role,
      invitedById,
    });

    return member;
  }
}
