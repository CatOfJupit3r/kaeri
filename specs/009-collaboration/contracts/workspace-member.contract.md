# Workspace Member Contract Specification

## Schemas

```typescript
// packages/shared/src/contract/workspace-member.contract.ts
import { oc } from '@orpc/contract';
import z from 'zod';
import { authProcedure } from './procedures';
import { workspaceRoleSchema, workspaceMemberSchema } from './workspace.contract';

// --- Procedures ---

const listMembers = authProcedure
  .route({
    path: '/workspace/members/list',
    method: 'GET',
    summary: 'List workspace members',
    description: 'Returns all members of a workspace with their roles.',
  })
  .input(z.object({
    workspaceId: z.string(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
  }))
  .output(z.object({
    members: z.array(workspaceMemberSchema),
    total: z.number(),
  }));

const updateMemberRole = authProcedure
  .route({
    path: '/workspace/members/update-role',
    method: 'PUT',
    summary: 'Update member role',
    description: 'Changes a member role. Owner/Admin only. Cannot modify Owner role.',
  })
  .input(z.object({
    workspaceId: z.string(),
    userId: z.string(),
    newRole: workspaceRoleSchema.exclude(['OWNER']), // Cannot assign OWNER via this endpoint
  }))
  .output(workspaceMemberSchema);

const removeMember = authProcedure
  .route({
    path: '/workspace/members/remove',
    method: 'DELETE',
    summary: 'Remove a member',
    description: 'Removes a member from workspace. Owner/Admin only. Cannot remove Owner.',
  })
  .input(z.object({
    workspaceId: z.string(),
    userId: z.string(),
  }))
  .output(z.object({ success: z.boolean() }));

const leaveWorkspace = authProcedure
  .route({
    path: '/workspace/leave',
    method: 'POST',
    summary: 'Leave a workspace',
    description: 'Removes self from workspace. Owner must transfer ownership first.',
  })
  .input(z.object({ workspaceId: z.string() }))
  .output(z.object({ success: z.boolean() }));

export const workspaceMemberContract = oc.router({
  listMembers,
  updateMemberRole,
  removeMember,
  leaveWorkspace,
});
```

## Error Codes

```typescript
// Add to packages/shared/src/enums/errors.ts

MEMBER_NOT_FOUND: 'MEMBER_NOT_FOUND',
CANNOT_REMOVE_OWNER: 'CANNOT_REMOVE_OWNER',
CANNOT_LEAVE_AS_OWNER: 'CANNOT_LEAVE_AS_OWNER',
CANNOT_MODIFY_OWN_ROLE: 'CANNOT_MODIFY_OWN_ROLE',
USER_ALREADY_MEMBER: 'USER_ALREADY_MEMBER',
```
