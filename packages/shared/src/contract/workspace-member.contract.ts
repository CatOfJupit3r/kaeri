import { oc } from '@orpc/contract';
import z from 'zod';

import { workspaceRoleSchema } from '../enums/workspace-roles.enums';
import { authProcedure } from './procedures';
import { workspaceMemberSchema } from './workspace.contract';

// --- Input Schemas ---

const listMembersInputSchema = z.object({
  workspaceId: z.string(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

// Exclude OWNER from assignable roles - ownership is transferred, not assigned
const assignableRoleSchema = workspaceRoleSchema.exclude(['OWNER']);

const updateMemberRoleInputSchema = z.object({
  workspaceId: z.string(),
  userId: z.string(),
  newRole: assignableRoleSchema,
});

const removeMemberInputSchema = z.object({
  workspaceId: z.string(),
  userId: z.string(),
});

// --- Procedures ---

const listMembers = authProcedure
  .route({
    path: '/list',
    method: 'GET',
    summary: 'List workspace members',
    description: 'Returns all members of a workspace with their roles. Requires workspace membership.',
  })
  .input(listMembersInputSchema)
  .output(
    z.object({
      members: z.array(workspaceMemberSchema),
      total: z.number(),
    }),
  );

const updateMemberRole = authProcedure
  .route({
    path: '/update-role',
    method: 'PUT',
    summary: 'Update member role',
    description: 'Changes a member role. Requires Owner or Admin. Cannot modify Owner role.',
  })
  .input(updateMemberRoleInputSchema)
  .output(workspaceMemberSchema);

const removeMember = authProcedure
  .route({
    path: '/remove',
    method: 'DELETE',
    summary: 'Remove a member',
    description: 'Removes a member from workspace. Requires Owner or Admin. Cannot remove Owner.',
  })
  .input(removeMemberInputSchema)
  .output(z.object({ success: z.boolean() }));

const leaveWorkspace = authProcedure
  .route({
    path: '/leave',
    method: 'POST',
    summary: 'Leave a workspace',
    description: 'Removes self from workspace. Owner must transfer ownership first.',
  })
  .input(z.object({ workspaceId: z.string() }))
  .output(z.object({ success: z.boolean() }));

const workspaceMemberContract = oc.prefix('/workspace/members').router({
  listMembers,
  updateMemberRole,
  removeMember,
  leaveWorkspace,
});

export default workspaceMemberContract;
