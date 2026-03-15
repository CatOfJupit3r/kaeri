# Workspace Contract Specification

## Schemas

```typescript
// packages/shared/src/enums/workspace-roles.ts
import z from 'zod';

export const workspaceRoleSchema = z.enum(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER']);
export const WORKSPACE_ROLES = workspaceRoleSchema.enum;
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;

// Role hierarchy for permission checks (higher = more permissions)
export const ROLE_HIERARCHY = {
  [WORKSPACE_ROLES.OWNER]: 4,
  [WORKSPACE_ROLES.ADMIN]: 3,
  [WORKSPACE_ROLES.EDITOR]: 2,
  [WORKSPACE_ROLES.VIEWER]: 1,
} as const;
```

```typescript
// packages/shared/src/contract/workspace.contract.ts
import { oc } from '@orpc/contract';
import z from 'zod';
import { authProcedure } from './procedures';
import { workspaceRoleSchema } from '../enums/workspace-roles';

// --- Schemas ---

export const workspaceSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const workspaceMemberSchema = z.object({
  _id: z.string(),
  workspaceId: z.string(),
  userId: z.string(),
  role: workspaceRoleSchema,
  joinedAt: z.coerce.date(),
  user: z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().optional(),
  }).optional(),
});

export const workspaceWithMembershipSchema = workspaceSchema.extend({
  membership: workspaceMemberSchema.pick({ role: true, joinedAt: true }),
  memberCount: z.number(),
});

const createWorkspaceInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const updateWorkspaceInputSchema = z.object({
  workspaceId: z.string(),
  patch: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
  }).refine(v => Object.keys(v).length > 0, 'At least one field required'),
});

// --- Procedures ---

const createWorkspace = authProcedure
  .route({
    path: '/workspace/create',
    method: 'POST',
    summary: 'Create a new workspace',
    description: 'Creates a workspace and assigns the creator as Owner.',
  })
  .input(createWorkspaceInputSchema)
  .output(workspaceWithMembershipSchema);

const updateWorkspace = authProcedure
  .route({
    path: '/workspace/update',
    method: 'PUT',
    summary: 'Update workspace settings',
    description: 'Updates workspace name or description. Requires Owner or Admin role.',
  })
  .input(updateWorkspaceInputSchema)
  .output(workspaceSchema);

const deleteWorkspace = authProcedure
  .route({
    path: '/workspace/delete',
    method: 'DELETE',
    summary: 'Delete a workspace',
    description: 'Deletes a workspace if empty. Requires Owner role.',
  })
  .input(z.object({ workspaceId: z.string() }))
  .output(z.object({ success: z.boolean() }));

const getWorkspace = authProcedure
  .route({
    path: '/workspace/get',
    method: 'GET',
    summary: 'Get workspace details',
    description: 'Returns workspace with membership info. Returns NOT_FOUND if user has no access.',
  })
  .input(z.object({ workspaceId: z.string() }))
  .output(workspaceWithMembershipSchema);

const listWorkspaces = authProcedure
  .route({
    path: '/workspace/list',
    method: 'GET',
    summary: 'List user workspaces',
    description: 'Returns all workspaces the user is a member of.',
  })
  .input(z.object({
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
  }))
  .output(z.object({
    workspaces: z.array(workspaceWithMembershipSchema),
    total: z.number(),
  }));

const transferOwnership = authProcedure
  .route({
    path: '/workspace/transfer-ownership',
    method: 'POST',
    summary: 'Transfer workspace ownership',
    description: 'Transfers Owner role to another Admin. Current owner becomes Admin.',
  })
  .input(z.object({
    workspaceId: z.string(),
    newOwnerId: z.string(),
  }))
  .output(z.object({ success: z.boolean() }));

export const workspaceContract = oc.router({
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspace,
  listWorkspaces,
  transferOwnership,
});
```

## Error Codes

```typescript
// Add to packages/shared/src/enums/errors.ts

// Workspace errors
WORKSPACE_NOT_FOUND: 'WORKSPACE_NOT_FOUND',
WORKSPACE_NAME_REQUIRED: 'WORKSPACE_NAME_REQUIRED',
WORKSPACE_DELETE_HAS_SERIES: 'WORKSPACE_DELETE_HAS_SERIES',
WORKSPACE_TRANSFER_TARGET_NOT_ADMIN: 'WORKSPACE_TRANSFER_TARGET_NOT_ADMIN',

// Permission errors
INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
CANNOT_MODIFY_OWNER: 'CANNOT_MODIFY_OWNER',
```
