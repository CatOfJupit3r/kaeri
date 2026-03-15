import { oc } from '@orpc/contract';
import z from 'zod';

import { invitationStatusSchema } from '../enums/invitation-status.enums';
import { workspaceRoleSchema } from '../enums/workspace-roles.enums';
import { authProcedure } from './procedures';

// --- Schemas ---

// Exclude OWNER from invitable roles - ownership is transferred, not invited
const invitableRoleSchema = workspaceRoleSchema.exclude(['OWNER']);

export const invitationSchema = z.object({
  _id: z.string(),
  workspaceId: z.string(),
  workspaceName: z.string(),
  invitedEmail: z.string().email(),
  invitedByUserId: z.string(),
  invitedByName: z.string(),
  role: invitableRoleSchema,
  code: z.string(),
  status: invitationStatusSchema,
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

const invitationPreviewSchema = invitationSchema.omit({ code: true }).extend({
  isExpired: z.boolean(),
  requiresSignup: z.boolean(),
});

// --- Input Schemas ---

const createInvitationInputSchema = z.object({
  workspaceId: z.string(),
  email: z.string().email('Invalid email address'),
  role: invitableRoleSchema.default('EDITOR'),
});

const listInvitationsInputSchema = z.object({
  workspaceId: z.string(),
  status: invitationStatusSchema.optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// --- Procedures ---

const createInvitation = authProcedure
  .route({
    path: '/create',
    method: 'POST',
    summary: 'Create an invitation',
    description:
      'Invites a user to workspace by email. Requires Owner or Admin. Rate limited to 10/hour per workspace.',
  })
  .input(createInvitationInputSchema)
  .output(invitationSchema);

const listInvitations = authProcedure
  .route({
    path: '/list',
    method: 'GET',
    summary: 'List workspace invitations',
    description: 'Returns pending and recent invitations for a workspace. Requires Owner or Admin.',
  })
  .input(listInvitationsInputSchema)
  .output(
    z.object({
      invitations: z.array(invitationSchema),
      total: z.number(),
    }),
  );

const getInvitationByCode = authProcedure
  .route({
    path: '/get',
    method: 'GET',
    summary: 'Get invitation by code',
    description: 'Returns invitation details for acceptance page.',
  })
  .input(z.object({ code: z.string() }))
  .output(invitationPreviewSchema);

const acceptInvitation = authProcedure
  .route({
    path: '/accept',
    method: 'POST',
    summary: 'Accept an invitation',
    description: 'Accepts invitation and adds user to workspace. Email must match logged-in user.',
  })
  .input(z.object({ code: z.string() }))
  .output(
    z.object({
      success: z.boolean(),
      workspaceId: z.string(),
      role: workspaceRoleSchema,
    }),
  );

const declineInvitation = authProcedure
  .route({
    path: '/decline',
    method: 'POST',
    summary: 'Decline an invitation',
    description: 'Declines invitation. Email must match logged-in user.',
  })
  .input(z.object({ code: z.string() }))
  .output(z.object({ success: z.boolean() }));

const revokeInvitation = authProcedure
  .route({
    path: '/revoke',
    method: 'DELETE',
    summary: 'Revoke an invitation',
    description: 'Revokes a pending invitation. Requires Owner or Admin.',
  })
  .input(
    z.object({
      workspaceId: z.string(),
      invitationId: z.string(),
    }),
  )
  .output(z.object({ success: z.boolean() }));

const getMyInvitations = authProcedure
  .route({
    path: '/my-invitations',
    method: 'GET',
    summary: 'Get pending invitations for current user',
    description: 'Returns all pending invitations sent to the current user email.',
  })
  .input(z.object({}))
  .output(
    z.object({
      invitations: z.array(invitationSchema),
    }),
  );

const invitationContract = oc.prefix('/invitation').router({
  createInvitation,
  listInvitations,
  getInvitationByCode,
  acceptInvitation,
  declineInvitation,
  revokeInvitation,
  getMyInvitations,
});

export type Invitation = z.infer<typeof invitationSchema>;
export type InvitationPreview = z.infer<typeof invitationPreviewSchema>;

export default invitationContract;
