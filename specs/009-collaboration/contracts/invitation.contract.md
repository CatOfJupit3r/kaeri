# Invitation Contract Specification

## Schemas

```typescript
// packages/shared/src/enums/invitation-status.ts
import z from 'zod';

export const invitationStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED']);
export const INVITATION_STATUS = invitationStatusSchema.enum;
export type InvitationStatus = z.infer<typeof invitationStatusSchema>;
```

```typescript
// packages/shared/src/contract/invitation.contract.ts
import { oc } from '@orpc/contract';
import z from 'zod';
import { authProcedure, publicProcedure } from './procedures';
import { workspaceRoleSchema } from './workspace.contract';
import { invitationStatusSchema } from '../enums/invitation-status';

// --- Schemas ---

export const invitationSchema = z.object({
  _id: z.string(),
  workspaceId: z.string(),
  workspaceName: z.string(), // Populated for display
  invitedEmail: z.string().email(),
  invitedByUserId: z.string(),
  invitedByName: z.string(), // Populated for display
  role: workspaceRoleSchema.exclude(['OWNER']),
  code: z.string(),
  status: invitationStatusSchema,
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

const createInvitationInputSchema = z.object({
  workspaceId: z.string(),
  email: z.string().email(),
  role: workspaceRoleSchema.exclude(['OWNER']).default('EDITOR'),
});

// --- Procedures ---

const createInvitation = authProcedure
  .route({
    path: '/invitation/create',
    method: 'POST',
    summary: 'Create an invitation',
    description: 'Invites a user to workspace. Owner/Admin only. Rate limited to 10/hour.',
  })
  .input(createInvitationInputSchema)
  .output(invitationSchema);

const listInvitations = authProcedure
  .route({
    path: '/invitation/list',
    method: 'GET',
    summary: 'List workspace invitations',
    description: 'Returns pending and recent invitations for a workspace. Owner/Admin only.',
  })
  .input(z.object({
    workspaceId: z.string(),
    status: invitationStatusSchema.optional(),
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
  }))
  .output(z.object({
    invitations: z.array(invitationSchema),
    total: z.number(),
  }));

const getInvitationByCode = publicProcedure
  .route({
    path: '/invitation/get',
    method: 'GET',
    summary: 'Get invitation by code',
    description: 'Returns invitation details for acceptance page. No auth required.',
  })
  .input(z.object({ code: z.string() }))
  .output(invitationSchema.omit({ code: true }).extend({
    isExpired: z.boolean(),
    requiresSignup: z.boolean(), // True if invitedEmail is not registered
  }));

const acceptInvitation = authProcedure
  .route({
    path: '/invitation/accept',
    method: 'POST',
    summary: 'Accept an invitation',
    description: 'Accepts invitation and adds user to workspace. Email must match logged-in user.',
  })
  .input(z.object({ code: z.string() }))
  .output(z.object({
    success: z.boolean(),
    workspaceId: z.string(),
    role: workspaceRoleSchema,
  }));

const declineInvitation = authProcedure
  .route({
    path: '/invitation/decline',
    method: 'POST',
    summary: 'Decline an invitation',
    description: 'Declines invitation. Email must match logged-in user.',
  })
  .input(z.object({ code: z.string() }))
  .output(z.object({ success: z.boolean() }));

const revokeInvitation = authProcedure
  .route({
    path: '/invitation/revoke',
    method: 'DELETE',
    summary: 'Revoke an invitation',
    description: 'Revokes a pending invitation. Owner/Admin only.',
  })
  .input(z.object({
    workspaceId: z.string(),
    invitationId: z.string(),
  }))
  .output(z.object({ success: z.boolean() }));

const getMyInvitations = authProcedure
  .route({
    path: '/invitation/my-invitations',
    method: 'GET',
    summary: 'Get pending invitations for current user',
    description: 'Returns all pending invitations sent to the current user email.',
  })
  .input(z.object({}))
  .output(z.object({
    invitations: z.array(invitationSchema),
  }));

export const invitationContract = oc.router({
  createInvitation,
  listInvitations,
  getInvitationByCode,
  acceptInvitation,
  declineInvitation,
  revokeInvitation,
  getMyInvitations,
});
```

## Error Codes

```typescript
// Add to packages/shared/src/enums/errors.ts

INVITATION_NOT_FOUND: 'INVITATION_NOT_FOUND',
INVITATION_EXPIRED: 'INVITATION_EXPIRED',
INVITATION_ALREADY_ACCEPTED: 'INVITATION_ALREADY_ACCEPTED',
INVITATION_ALREADY_DECLINED: 'INVITATION_ALREADY_DECLINED',
INVITATION_EMAIL_MISMATCH: 'INVITATION_EMAIL_MISMATCH',
INVITATION_RATE_LIMITED: 'INVITATION_RATE_LIMITED',
INVITATION_ALREADY_EXISTS: 'INVITATION_ALREADY_EXISTS',
```

## Rate Limiting

Invitations are rate-limited per workspace:
- **Limit**: 10 invitations per hour per workspace
- **Key**: `ratelimit:invitation:{workspaceId}`
- **TTL**: 1 hour
- **Implementation**: Valkey counter with TTL

```typescript
// Rate limit check in invitation service
const rateLimitKey = buildCacheKey('ratelimit', 'invitation', workspaceId);
const count = await valkey.incr(rateLimitKey);
if (count === 1) {
  await valkey.expire(rateLimitKey, 3600); // 1 hour TTL
}
if (count > 10) {
  throw ORPCTooManyRequestsError(errorCodes.INVITATION_RATE_LIMITED);
}
```
