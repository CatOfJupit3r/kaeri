import { customAlphabet } from 'nanoid';
import { inject, injectable } from 'tsyringe';

import type { InvitationStatus, WorkspaceRole } from '@kaeri/shared';
import { errorCodes, INVITATION_EXPIRATION_DAYS, INVITATION_STATUS, WORKSPACE_ROLES } from '@kaeri/shared';

import { InvitationModel } from '@~/db/models/invitation.model';
import type { InvitationDoc } from '@~/db/models/invitation.model';
import { WorkspaceMemberModel } from '@~/db/models/workspace-member.model';
import { WorkspaceModel } from '@~/db/models/workspace.model';
import { TOKENS } from '@~/di/tokens';
import type { iWithLogger, LoggerFactory } from '@~/features/logger/logger.types';
import { buildCacheKey, CACHE_TTL } from '@~/features/valkey/valkey.constants';
import type { ValkeyService } from '@~/features/valkey/valkey.service';
import {
  ORPCConflictError,
  ORPCForbiddenError,
  ORPCGoneError,
  ORPCNotFoundError,
  ORPCTooManyRequestsError,
} from '@~/lib/orpc-error-wrapper';

import type { TypedEventBus } from '../events/event-bus';
import { COLLABORATION_EVENTS } from './collaboration.events';
import { MemberService } from './member.service';
import { PermissionService } from './permission.service';

// URL-safe alphabet for invitation codes
const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 21);

const RATE_LIMIT_MAX_PER_HOUR = 20;

interface iCreateInvitationInput {
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
}

// Role type for invitations - excludes OWNER since ownership is transferred, not invited
type InvitableRole = Exclude<WorkspaceRole, 'OWNER'>;

interface iInvitationWithWorkspace {
  _id: string;
  workspaceId: string;
  invitedEmail: string;
  invitedByUserId: string;
  role: InvitableRole;
  code: string;
  status: InvitationStatus;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  workspace: {
    _id: string;
    name: string;
  };
}

/**
 * InvitationService handles workspace invitation operations.
 */
@injectable()
export class InvitationService implements iWithLogger {
  public logger: ReturnType<LoggerFactory['create']>;

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.ValkeyService) private readonly valkey: ValkeyService,
    @inject(TOKENS.EventBus) private readonly eventBus: TypedEventBus,
    @inject(TOKENS.PermissionService) private readonly permissionService: PermissionService,
    @inject(TOKENS.MemberService) private readonly memberService: MemberService,
  ) {
    this.logger = loggerFactory.create('invitation-service');
  }

  /**
   * Create a new invitation.
   */
  public async create(userId: string, input: iCreateInvitationInput): Promise<InvitationDoc> {
    // Rate limiting check
    const rateLimitKey = buildCacheKey.invitationRateLimit(userId);
    const currentCount = await this.valkey.cacheGet<number>(rateLimitKey);
    if (currentCount !== null && currentCount !== undefined && currentCount >= RATE_LIMIT_MAX_PER_HOUR) {
      throw ORPCTooManyRequestsError(errorCodes.INVITATION_RATE_LIMITED);
    }

    // Verify actor has permission (Admin or Owner)
    await this.permissionService.requirePermission(input.workspaceId, userId, WORKSPACE_ROLES.ADMIN);

    // Cannot invite to be owner
    if (input.role === WORKSPACE_ROLES.OWNER) {
      throw ORPCForbiddenError(errorCodes.CANNOT_MODIFY_OWNER_ROLE);
    }

    // Check if email already has pending invitation
    const existingInvitation = await InvitationModel.findOne({
      workspaceId: input.workspaceId,
      invitedEmail: input.email.toLowerCase(),
      status: INVITATION_STATUS.PENDING,
    });
    if (existingInvitation) {
      throw ORPCConflictError(errorCodes.INVITATION_ALREADY_EXISTS);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRATION_DAYS);

    const invitation = await InvitationModel.create({
      workspaceId: input.workspaceId,
      invitedEmail: input.email.toLowerCase(),
      invitedByUserId: userId,
      role: input.role,
      code: generateCode(),
      status: INVITATION_STATUS.PENDING,
      expiresAt,
    });

    // Increment rate limit counter
    const newCount = (currentCount ?? 0) + 1;
    await this.valkey.cacheSet(rateLimitKey, newCount, CACHE_TTL.RATE_LIMIT);

    this.logger.info('Invitation created', {
      invitationId: invitation._id,
      workspaceId: input.workspaceId,
      invitedEmail: input.email,
      invitedByUserId: userId,
    });

    this.eventBus.emit(COLLABORATION_EVENTS.INVITATION_SENT, {
      invitationId: invitation._id,
      workspaceId: input.workspaceId,
      email: input.email,
      invitedById: userId,
    });

    return invitation;
  }

  /**
   * List invitations for a workspace.
   */
  public async listForWorkspace(
    userId: string,
    workspaceId: string,
    options: { status?: InvitationStatus; limit?: number; cursor?: string } = {},
  ): Promise<{ invitations: InvitationDoc[]; nextCursor?: string }> {
    // Verify actor has permission (Admin or Owner)
    await this.permissionService.requirePermission(workspaceId, userId, WORKSPACE_ROLES.ADMIN);

    const limit = Math.min(options.limit ?? 50, 100);
    const query: Record<string, unknown> = { workspaceId };

    if (options.status) {
      query.status = options.status;
    }

    if (options.cursor) {
      query._id = { $gt: options.cursor };
    }

    const invitations = await InvitationModel.find(query)
      .sort({ _id: 1 })
      .limit(limit + 1);

    const hasMore = invitations.length > limit;
    const results = hasMore ? invitations.slice(0, limit) : invitations;

    return {
      invitations: results,
      nextCursor: hasMore ? results[results.length - 1]._id : undefined,
    };
  }

  /**
   * Get invitation by code (for accepting).
   */
  public async getByCode(code: string): Promise<iInvitationWithWorkspace> {
    const invitation = await InvitationModel.findOne({ code }).lean();
    if (!invitation) {
      throw ORPCNotFoundError(errorCodes.INVITATION_NOT_FOUND);
    }

    const workspace = await WorkspaceModel.findById(invitation.workspaceId).lean();
    if (!workspace) {
      throw ORPCNotFoundError(errorCodes.WORKSPACE_NOT_FOUND);
    }

    return {
      _id: invitation._id,
      workspaceId: invitation.workspaceId,
      invitedEmail: invitation.invitedEmail,
      invitedByUserId: invitation.invitedByUserId,
      role: invitation.role,
      code: invitation.code,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
      createdAt: invitation.createdAt,
      workspace: {
        _id: workspace._id,
        name: workspace.name,
      },
    };
  }

  /**
   * Accept an invitation.
   */
  public async accept(userId: string, userEmail: string, code: string) {
    const invitation = await InvitationModel.findOne({ code });
    if (!invitation) {
      throw ORPCNotFoundError(errorCodes.INVITATION_NOT_FOUND);
    }

    // Check if invitation is pending
    if (invitation.status !== INVITATION_STATUS.PENDING) {
      if (invitation.status === INVITATION_STATUS.ACCEPTED) {
        throw ORPCGoneError(errorCodes.INVITATION_ALREADY_ACCEPTED);
      }
      if (invitation.status === INVITATION_STATUS.DECLINED) {
        throw ORPCGoneError(errorCodes.INVITATION_ALREADY_DECLINED);
      }
      if (invitation.status === INVITATION_STATUS.EXPIRED || invitation.status === INVITATION_STATUS.REVOKED) {
        throw ORPCGoneError(errorCodes.INVITATION_EXPIRED);
      }
    }

    // Check expiration
    if (invitation.expiresAt < new Date()) {
      invitation.status = INVITATION_STATUS.EXPIRED;
      await invitation.save();
      throw ORPCGoneError(errorCodes.INVITATION_EXPIRED);
    }

    // Verify email match
    if (invitation.invitedEmail.toLowerCase() !== userEmail.toLowerCase()) {
      throw ORPCForbiddenError(errorCodes.INVITATION_EMAIL_MISMATCH);
    }

    // Check if user is already a member
    const existingMember = await WorkspaceMemberModel.findOne({
      workspaceId: invitation.workspaceId,
      userId,
    });
    if (existingMember) {
      // Already a member - mark invitation as accepted and return
      invitation.status = INVITATION_STATUS.ACCEPTED;
      invitation.acceptedAt = new Date();
      await invitation.save();
      throw ORPCConflictError(errorCodes.USER_ALREADY_MEMBER);
    }

    // Add member
    await this.memberService.addMember(invitation.workspaceId, userId, invitation.role, invitation.invitedByUserId);

    // Update invitation status
    invitation.status = INVITATION_STATUS.ACCEPTED;
    invitation.acceptedAt = new Date();
    await invitation.save();

    this.logger.info('Invitation accepted', {
      invitationId: invitation._id,
      workspaceId: invitation.workspaceId,
      userId,
    });

    this.eventBus.emit(COLLABORATION_EVENTS.INVITATION_ACCEPTED, {
      invitationId: invitation._id,
      workspaceId: invitation.workspaceId,
      userId,
    });
  }

  /**
   * Decline an invitation.
   */
  public async decline(userEmail: string, code: string) {
    const invitation = await InvitationModel.findOne({ code });
    if (!invitation) {
      throw ORPCNotFoundError(errorCodes.INVITATION_NOT_FOUND);
    }

    // Check if invitation is pending
    if (invitation.status !== INVITATION_STATUS.PENDING) {
      if (invitation.status === INVITATION_STATUS.ACCEPTED) {
        throw ORPCGoneError(errorCodes.INVITATION_ALREADY_ACCEPTED);
      }
      if (invitation.status === INVITATION_STATUS.DECLINED) {
        throw ORPCGoneError(errorCodes.INVITATION_ALREADY_DECLINED);
      }
      throw ORPCGoneError(errorCodes.INVITATION_EXPIRED);
    }

    // Verify email match
    if (invitation.invitedEmail.toLowerCase() !== userEmail.toLowerCase()) {
      throw ORPCForbiddenError(errorCodes.INVITATION_EMAIL_MISMATCH);
    }

    invitation.status = INVITATION_STATUS.DECLINED;
    await invitation.save();

    this.logger.info('Invitation declined', {
      invitationId: invitation._id,
      workspaceId: invitation.workspaceId,
    });

    this.eventBus.emit(COLLABORATION_EVENTS.INVITATION_DECLINED, {
      invitationId: invitation._id,
      workspaceId: invitation.workspaceId,
    });
  }

  /**
   * Revoke an invitation.
   */
  public async revoke(userId: string, invitationId: string) {
    const invitation = await InvitationModel.findById(invitationId);
    if (!invitation) {
      throw ORPCNotFoundError(errorCodes.INVITATION_NOT_FOUND);
    }

    // Verify actor has permission (Admin or Owner)
    await this.permissionService.requirePermission(invitation.workspaceId, userId, WORKSPACE_ROLES.ADMIN);

    if (invitation.status !== INVITATION_STATUS.PENDING) {
      throw ORPCGoneError(errorCodes.INVITATION_EXPIRED);
    }

    invitation.status = INVITATION_STATUS.REVOKED;
    await invitation.save();

    this.logger.info('Invitation revoked', {
      invitationId: invitation._id,
      workspaceId: invitation.workspaceId,
      revokedById: userId,
    });

    this.eventBus.emit(COLLABORATION_EVENTS.INVITATION_REVOKED, {
      invitationId: invitation._id,
      workspaceId: invitation.workspaceId,
      revokedById: userId,
    });
  }

  /**
   * List invitations received by the current user.
   */
  public async listMyInvitations(
    userEmail: string,
    options: { limit?: number; cursor?: string } = {},
  ): Promise<{ invitations: iInvitationWithWorkspace[]; nextCursor?: string }> {
    const limit = Math.min(options.limit ?? 50, 100);
    const query: Record<string, unknown> = {
      invitedEmail: userEmail.toLowerCase(),
      status: INVITATION_STATUS.PENDING,
      expiresAt: { $gt: new Date() },
    };

    if (options.cursor) {
      query._id = { $gt: options.cursor };
    }

    const invitations = await InvitationModel.find(query)
      .sort({ _id: 1 })
      .limit(limit + 1)
      .lean();

    const hasMore = invitations.length > limit;
    const results = hasMore ? invitations.slice(0, limit) : invitations;

    // Fetch workspace details
    const workspaceIds = [...new Set(results.map((inv) => inv.workspaceId))];
    const workspaces = await WorkspaceModel.find({ _id: { $in: workspaceIds } }).lean();
    const workspaceMap = new Map(workspaces.map((ws) => [ws._id, ws]));

    const invitationsWithWorkspace: iInvitationWithWorkspace[] = [];
    for (const inv of results) {
      const workspace = workspaceMap.get(inv.workspaceId);
      if (workspace) {
        invitationsWithWorkspace.push({
          _id: inv._id,
          workspaceId: inv.workspaceId,
          invitedEmail: inv.invitedEmail,
          invitedByUserId: inv.invitedByUserId,
          role: inv.role as InvitableRole,
          code: inv.code,
          status: inv.status,
          expiresAt: inv.expiresAt,
          acceptedAt: inv.acceptedAt,
          createdAt: inv.createdAt,
          workspace: {
            _id: workspace._id,
            name: workspace.name,
          },
        });
      }
    }

    return {
      invitations: invitationsWithWorkspace,
      nextCursor: hasMore ? results[results.length - 1]._id : undefined,
    };
  }
}
