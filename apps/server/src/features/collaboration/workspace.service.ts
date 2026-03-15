import { inject, injectable } from 'tsyringe';

import type { WorkspaceRole } from '@kaeri/shared';
import { errorCodes, WORKSPACE_ROLES } from '@kaeri/shared';

import { SeriesModel } from '@~/db/models/series.model';
import { WorkspaceMemberModel } from '@~/db/models/workspace-member.model';
import { WorkspaceModel } from '@~/db/models/workspace.model';
import type { WorkspaceDoc } from '@~/db/models/workspace.model';
import { TOKENS } from '@~/di/tokens';
import type { iWithLogger, LoggerFactory } from '@~/features/logger/logger.types';
import type { ValkeyService } from '@~/features/valkey/valkey.service';
import {
  ORPCBadRequestError,
  ORPCForbiddenError,
  ORPCNotFoundError,
  ORPCUnprocessableContentError,
} from '@~/lib/orpc-error-wrapper';

import type { TypedEventBus } from '../events/event-bus';
import { COLLABORATION_EVENTS } from './collaboration.events';
import { PermissionService } from './permission.service';

interface iCreateWorkspaceInput {
  name: string;
  description?: string;
}

interface iUpdateWorkspacePatch {
  name?: string;
  description?: string;
}

interface iWorkspaceWithMembership {
  _id: string;
  name: string;
  description?: string;
  isPersonal: boolean;
  createdAt: Date;
  updatedAt: Date;
  membership: {
    role: WorkspaceRole;
    joinedAt: Date;
  };
  memberCount: number;
}

interface iActivityEntry {
  _id: string;
  seriesId: string;
  seriesTitle?: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  actorId: string;
  actorName?: string;
  timestamp: Date;
}

/**
 * WorkspaceService handles workspace CRUD operations.
 */
@injectable()
export class WorkspaceService implements iWithLogger {
  public logger: ReturnType<LoggerFactory['create']>;

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.ValkeyService) private readonly valkey: ValkeyService,
    @inject(TOKENS.EventBus) private readonly eventBus: TypedEventBus,
    @inject(TOKENS.PermissionService) private readonly permissionService: PermissionService,
  ) {
    this.logger = loggerFactory.create('workspace-service');
  }

  /**
   * Create a new workspace and assign creator as Owner.
   */
  public async create(userId: string, input: iCreateWorkspaceInput): Promise<iWorkspaceWithMembership> {
    if (!input.name?.trim()) {
      throw ORPCBadRequestError(errorCodes.WORKSPACE_NAME_REQUIRED);
    }

    const workspace = await WorkspaceModel.create({
      name: input.name.trim(),
      description: input.description?.trim(),
      isPersonal: false,
      creatorId: userId,
    });

    // Create owner membership
    const membership = await WorkspaceMemberModel.create({
      workspaceId: workspace._id,
      userId,
      role: WORKSPACE_ROLES.OWNER,
      joinedAt: new Date(),
    });

    this.logger.info('Workspace created', { workspaceId: workspace._id, userId });
    this.eventBus.emit(COLLABORATION_EVENTS.WORKSPACE_CREATED, { workspaceId: workspace._id, creatorId: userId });

    return {
      _id: workspace._id,
      name: workspace.name,
      description: workspace.description,
      isPersonal: workspace.isPersonal,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      membership: {
        role: membership.role,
        joinedAt: membership.joinedAt,
      },
      memberCount: 1,
    };
  }

  /**
   * Create a personal workspace for a user (auto-created on first login).
   */
  public async createPersonal(userId: string, userName: string): Promise<WorkspaceDoc> {
    // Check if personal workspace already exists
    const existing = await WorkspaceModel.findOne({ creatorId: userId, isPersonal: true });
    if (existing) {
      return existing;
    }

    const workspace = await WorkspaceModel.create({
      name: `${userName}'s Workspace`,
      isPersonal: true,
      creatorId: userId,
    });

    await WorkspaceMemberModel.create({
      workspaceId: workspace._id,
      userId,
      role: WORKSPACE_ROLES.OWNER,
      joinedAt: new Date(),
    });

    this.logger.info('Personal workspace created', { workspaceId: workspace._id, userId });
    return workspace;
  }

  /**
   * Get workspace by ID with membership info for the user.
   */
  public async get(workspaceId: string, userId: string): Promise<iWorkspaceWithMembership> {
    const membership = await this.permissionService.requireMembership(workspaceId, userId);

    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw ORPCNotFoundError(errorCodes.WORKSPACE_NOT_FOUND);
    }

    const memberCount = await WorkspaceMemberModel.countDocuments({ workspaceId });

    return {
      _id: workspace._id,
      name: workspace.name,
      description: workspace.description,
      isPersonal: workspace.isPersonal,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      membership: {
        role: membership.role,
        joinedAt: new Date(membership.joinedAt),
      },
      memberCount,
    };
  }

  /**
   * List all workspaces the user is a member of.
   */
  public async list(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ workspaces: iWorkspaceWithMembership[]; total: number }> {
    const memberships = await WorkspaceMemberModel.find({ userId }).sort({ joinedAt: -1 }).skip(offset).limit(limit);

    const total = await WorkspaceMemberModel.countDocuments({ userId });

    if (memberships.length === 0) {
      return { workspaces: [], total };
    }

    const workspaceIds = memberships.map((m) => m.workspaceId);
    const workspaces = await WorkspaceModel.find({ _id: { $in: workspaceIds } });
    const workspaceMap = new Map(workspaces.map((w) => [w._id, w]));

    // Get member counts for all workspaces
    const memberCounts = await WorkspaceMemberModel.aggregate([
      { $match: { workspaceId: { $in: workspaceIds } } },
      { $group: { _id: '$workspaceId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>(memberCounts.map((c) => [c._id, c.count]));

    const result: iWorkspaceWithMembership[] = [];
    for (const membership of memberships) {
      const workspace = workspaceMap.get(membership.workspaceId);
      if (workspace) {
        result.push({
          _id: workspace._id,
          name: workspace.name,
          description: workspace.description,
          isPersonal: workspace.isPersonal,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
          membership: {
            role: membership.role,
            joinedAt: membership.joinedAt,
          },
          memberCount: countMap.get(workspace._id) ?? 1,
        });
      }
    }

    return { workspaces: result, total };
  }

  /**
   * Update workspace settings.
   * Requires Owner or Admin role.
   */
  public async update(workspaceId: string, userId: string, patch: iUpdateWorkspacePatch): Promise<WorkspaceDoc> {
    await this.permissionService.requirePermission(workspaceId, userId, WORKSPACE_ROLES.ADMIN);

    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw ORPCNotFoundError(errorCodes.WORKSPACE_NOT_FOUND);
    }

    if (patch.name !== undefined) {
      workspace.name = patch.name.trim();
    }
    if (patch.description !== undefined) {
      workspace.description = patch.description.trim() || undefined;
    }

    await workspace.save();
    this.logger.info('Workspace updated', { workspaceId });
    this.eventBus.emit(COLLABORATION_EVENTS.WORKSPACE_UPDATED, { workspaceId, updatedById: userId });

    return workspace;
  }

  /**
   * Delete a workspace.
   * Requires Owner role. Cannot delete personal workspace.
   */
  public async delete(workspaceId: string, userId: string): Promise<{ success: boolean }> {
    await this.permissionService.requirePermission(workspaceId, userId, WORKSPACE_ROLES.OWNER);

    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw ORPCNotFoundError(errorCodes.WORKSPACE_NOT_FOUND);
    }

    if (workspace.isPersonal) {
      throw ORPCForbiddenError(errorCodes.WORKSPACE_CANNOT_DELETE_PERSONAL);
    }

    // Check for dependent series
    const seriesCount = await SeriesModel.countDocuments({ workspaceId });
    if (seriesCount > 0) {
      throw ORPCUnprocessableContentError(errorCodes.WORKSPACE_DELETE_HAS_SERIES);
    }

    // Delete all memberships
    await WorkspaceMemberModel.deleteMany({ workspaceId });

    // Delete workspace
    await WorkspaceModel.deleteOne({ _id: workspaceId });

    this.logger.info('Workspace deleted', { workspaceId });
    this.eventBus.emit(COLLABORATION_EVENTS.WORKSPACE_DELETED, { workspaceId, deletedById: userId });

    return { success: true };
  }

  /**
   * Transfer workspace ownership to another Admin.
   * Current owner becomes Admin.
   */
  public async transferOwnership(
    workspaceId: string,
    currentOwnerId: string,
    newOwnerId: string,
  ): Promise<{ success: boolean }> {
    await this.permissionService.requirePermission(workspaceId, currentOwnerId, WORKSPACE_ROLES.OWNER);

    if (currentOwnerId === newOwnerId) {
      throw ORPCBadRequestError(errorCodes.INVALID_INPUT);
    }

    // Verify new owner is an Admin
    const newOwnerMembership = await WorkspaceMemberModel.findOne({ workspaceId, userId: newOwnerId });
    if (!newOwnerMembership) {
      throw ORPCNotFoundError(errorCodes.MEMBER_NOT_FOUND);
    }
    if (newOwnerMembership.role !== WORKSPACE_ROLES.ADMIN) {
      throw ORPCBadRequestError(errorCodes.WORKSPACE_TRANSFER_TARGET_NOT_ADMIN);
    }

    // Transfer ownership atomically
    await WorkspaceMemberModel.updateOne(
      { workspaceId, userId: currentOwnerId },
      { $set: { role: WORKSPACE_ROLES.ADMIN } },
    );
    await WorkspaceMemberModel.updateOne(
      { workspaceId, userId: newOwnerId },
      { $set: { role: WORKSPACE_ROLES.OWNER } },
    );

    this.logger.info('Workspace ownership transferred', { workspaceId, from: currentOwnerId, to: newOwnerId });
    this.eventBus.emit(COLLABORATION_EVENTS.OWNERSHIP_TRANSFERRED, {
      workspaceId,
      oldOwnerId: currentOwnerId,
      newOwnerId,
    });

    return { success: true };
  }

  /**
   * Get workspace activity feed.
   */
  public async getActivity(
    workspaceId: string,
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ entries: iActivityEntry[]; total: number }> {
    await this.permissionService.requireMembership(workspaceId, userId);

    // Import AuditEntryModel here to avoid circular dependency
    const { AuditEntryModel } = await import('@~/db/models/audit-entry.model');

    const entries = await AuditEntryModel.find({ workspaceId })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const total = await AuditEntryModel.countDocuments({ workspaceId });

    // TODO: Enrich with actor names and entity names

    return {
      entries: entries.map((e) => ({
        _id: e._id,
        seriesId: e.seriesId,
        entityType: e.entityType,
        entityId: e.entityId,
        action: e.action,
        actorId: e.actorId,
        timestamp: e.timestamp,
      })),
      total,
    };
  }
}
