import { oc } from '@orpc/contract';
import z from 'zod';

import { workspaceRoleSchema } from '../enums/workspace-roles.enums';
import { authProcedure } from './procedures';

// --- Shared Schemas ---

export const workspaceSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  isPersonal: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const workspaceMemberSchema = z.object({
  _id: z.string(),
  workspaceId: z.string(),
  userId: z.string(),
  role: workspaceRoleSchema,
  joinedAt: z.coerce.date(),
  user: z
    .object({
      _id: z.string(),
      name: z.string(),
      email: z.string(),
      image: z.string().optional(),
    })
    .optional(),
});

export const workspaceWithMembershipSchema = workspaceSchema.extend({
  membership: workspaceMemberSchema.pick({ role: true, joinedAt: true }),
  memberCount: z.number(),
});

// --- Input Schemas ---

const createWorkspaceInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

const updateWorkspaceInputSchema = z.object({
  workspaceId: z.string(),
  patch: z
    .object({
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
    })
    .refine((v) => Object.keys(v).length > 0, 'At least one field is required'),
});

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// --- Procedures ---

const createWorkspace = authProcedure
  .route({
    path: '/create',
    method: 'POST',
    summary: 'Create a new workspace',
    description: 'Creates a workspace and assigns the creator as Owner.',
  })
  .input(createWorkspaceInputSchema)
  .output(workspaceWithMembershipSchema);

const updateWorkspace = authProcedure
  .route({
    path: '/update',
    method: 'PUT',
    summary: 'Update workspace settings',
    description: 'Updates workspace name or description. Requires Owner or Admin role.',
  })
  .input(updateWorkspaceInputSchema)
  .output(workspaceSchema);

const deleteWorkspace = authProcedure
  .route({
    path: '/delete',
    method: 'DELETE',
    summary: 'Delete a workspace',
    description: 'Deletes a workspace if empty. Requires Owner role. Cannot delete personal workspace.',
  })
  .input(z.object({ workspaceId: z.string() }))
  .output(z.object({ success: z.boolean() }));

const getWorkspace = authProcedure
  .route({
    path: '/get',
    method: 'GET',
    summary: 'Get workspace details',
    description: 'Returns workspace with membership info. Returns NOT_FOUND if user has no access.',
  })
  .input(z.object({ workspaceId: z.string() }))
  .output(workspaceWithMembershipSchema);

const listWorkspaces = authProcedure
  .route({
    path: '/list',
    method: 'GET',
    summary: 'List user workspaces',
    description: 'Returns all workspaces the user is a member of, including their personal workspace.',
  })
  .input(paginationSchema)
  .output(
    z.object({
      workspaces: z.array(workspaceWithMembershipSchema),
      total: z.number(),
    }),
  );

const transferOwnership = authProcedure
  .route({
    path: '/transfer-ownership',
    method: 'POST',
    summary: 'Transfer workspace ownership',
    description: 'Transfers Owner role to another Admin. Current owner becomes Admin. Requires Owner role.',
  })
  .input(
    z.object({
      workspaceId: z.string(),
      newOwnerId: z.string(),
    }),
  )
  .output(z.object({ success: z.boolean() }));

const getWorkspaceActivity = authProcedure
  .route({
    path: '/activity',
    method: 'GET',
    summary: 'Get workspace activity feed',
    description: 'Returns recent changes across all accessible series in the workspace.',
  })
  .input(
    z.object({
      workspaceId: z.string(),
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
    }),
  )
  .output(
    z.object({
      entries: z.array(
        z.object({
          _id: z.string(),
          seriesId: z.string(),
          seriesTitle: z.string().optional(),
          entityType: z.string(),
          entityId: z.string(),
          entityName: z.string().optional(),
          action: z.enum(['CREATE', 'UPDATE', 'DELETE']),
          actorId: z.string(),
          actorName: z.string().optional(),
          timestamp: z.coerce.date(),
        }),
      ),
      total: z.number(),
    }),
  );

const workspaceContract = oc.prefix('/workspace').router({
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspace,
  listWorkspaces,
  transferOwnership,
  getWorkspaceActivity,
});

export type Workspace = z.infer<typeof workspaceSchema>;
export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>;
export type WorkspaceWithMembership = z.infer<typeof workspaceWithMembershipSchema>;

export default workspaceContract;
