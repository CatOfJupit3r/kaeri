# Technical Research: Multi-User Collaboration

**Branch**: `009-collaboration` | **Date**: 2026-03-15

## Resolved Technical Decisions

### 1. Valkey Caching for Permissions

**Decision**: Use Valkey (Redis-compatible) for caching permission checks.

**Rationale**:
- Valkey already integrated (`apps/server/src/features/valkey/`)
- Permission checks are frequent (every API call) and expensive (DB join)
- 5-minute TTL provides good balance of freshness vs performance

**Pattern**:
```typescript
// Check permission with cache
async function hasPermission(workspaceId: string, userId: string, requiredRole: WorkspaceRole): Promise<boolean> {
  const cacheKey = buildCacheKey('workspace', 'member', workspaceId, userId);
  
  // Try cache first
  const cached = await valkey.get(cacheKey);
  if (cached) {
    const member = JSON.parse(cached) as WorkspaceMember | null;
    return member ? ROLE_HIERARCHY[member.role] >= ROLE_HIERARCHY[requiredRole] : false;
  }
  
  // Cache miss - query DB
  const member = await WorkspaceMemberModel.findOne({ workspaceId, userId });
  await valkey.setex(cacheKey, 300, JSON.stringify(member)); // 5 min TTL
  
  return member ? ROLE_HIERARCHY[member.role] >= ROLE_HIERARCHY[requiredRole] : false;
}
```

**Alternatives Considered**:
- In-memory cache: Rejected - doesn't scale across server instances
- No cache: Rejected - permission checks on every request would be too slow

---

### 2. Invitation Code Generation

**Decision**: Use `nanoid` with custom URL-safe alphabet, 21 characters.

**Rationale**:
- 21 chars with 64-char alphabet = ~126 bits of entropy (sufficient)
- URL-safe allows direct embedding in links
- Collision probability negligible at scale

**Pattern**:
```typescript
import { nanoid, customAlphabet } from 'nanoid';

const generateInviteCode = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  21
);

// Usage
const code = generateInviteCode(); // e.g., "V1StGXR8_Z5jdHi6B-myT"
```

**Alternatives Considered**:
- UUID: Rejected - longer, contains hyphens, harder to type
- Sequential IDs: Rejected - predictable, security risk
- Shorter codes: Rejected - higher collision risk

---

### 3. Personal Workspace Handling

**Decision**: Auto-create personal workspace on first login; mark with `isPersonal: true` flag.

**Rationale**:
- Every user needs a default workspace for their series
- Personal workspace cannot be deleted or have members modified
- Simplifies migration of existing series

**Pattern**:
```typescript
// In auth hooks (Better Auth afterCreate)
auth.on('afterUserCreate', async ({ user }) => {
  await workspaceService.createPersonal(user._id, `${user.name}'s Workspace`);
});

// Personal workspace has special rules
interface Workspace {
  // ...
  isPersonal: boolean; // If true: cannot delete, cannot invite, single member
}
```

**Migration**:
```typescript
// One-time migration for existing users
const users = await UserModel.find({});
for (const user of users) {
  const existing = await WorkspaceMemberModel.findOne({ userId: user._id });
  if (!existing) {
    await workspaceService.createPersonal(user._id);
  }
}

// Backfill series.workspaceId
const series = await SeriesModel.find({ workspaceId: { $exists: false } });
for (const s of series) {
  const personalWs = await WorkspaceModel.findOne({ creatorId: s.creatorId, isPersonal: true });
  if (personalWs) {
    s.workspaceId = personalWs._id;
    await s.save();
  }
}
```

---

### 4. Audit Extension Approach

**Decision**: Add optional `workspaceId` field to AuditEntry; derive from series on write.

**Rationale**:
- Backward compatible - existing entries remain valid
- Enables workspace-level activity feed without schema migration
- workspaceId derivable from series.workspaceId at write time

**Pattern**:
```typescript
// In audit service
async logCreate(seriesId: string, ...) {
  const series = await SeriesModel.findById(seriesId);
  await AuditEntryModel.create({
    seriesId,
    workspaceId: series?.workspaceId, // Derived
    // ... rest
  });
}

// Activity feed query
async getWorkspaceActivity(workspaceId: string, { limit, offset }) {
  return AuditEntryModel
    .find({ workspaceId })
    .sort({ timestamp: -1 })
    .skip(offset)
    .limit(limit);
}
```

---

### 5. NOT_FOUND vs FORBIDDEN Strategy

**Decision**: Always return NOT_FOUND for resources user cannot access; use FORBIDDEN only within accessible resources.

**Rationale**:
- Per AUTH_ERROR_STANCE.md and constitution
- Prevents information leakage about resource existence
- Consistent with existing patterns in series/KB handlers

**Pattern**:
```typescript
// Workspace access check
const member = await getMemberOrNull(workspaceId, userId);
if (!member) {
  // User not a member - don't reveal workspace exists
  throw ORPCNotFoundError(errorCodes.WORKSPACE_NOT_FOUND);
}

// Once we know user is member, can use FORBIDDEN for permission issues
if (ROLE_HIERARCHY[member.role] < ROLE_HIERARCHY.ADMIN) {
  throw ORPCForbiddenError(errorCodes.INSUFFICIENT_PERMISSIONS);
}
```

---

### 6. Series Workspace Transfer

**Decision**: Atomic update with referential integrity check.

**Rationale**:
- Transfer must be all-or-nothing
- User must have Admin+ in destination workspace
- KB entities remain linked to series (no cross-workspace refs after transfer)

**Pattern**:
```typescript
async transferSeries(seriesId: string, toWorkspaceId: string, userId: string) {
  // Verify permissions in both workspaces
  const series = await SeriesModel.findById(seriesId);
  if (!series) throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
  
  await this.requirePermission(series.workspaceId, userId, 'ADMIN');
  await this.requirePermission(toWorkspaceId, userId, 'ADMIN');
  
  // Atomic update
  await SeriesModel.updateOne(
    { _id: seriesId },
    { $set: { workspaceId: toWorkspaceId } }
  );
  
  // Invalidate caches
  this.eventBus.emit('series:transferred', { seriesId, fromWorkspaceId: series.workspaceId, toWorkspaceId });
}
```

---

## Open Questions (P3 Features - Deferred)

### Real-Time Presence

**Options**:
1. **WebSocket via Hono upgrade** - Native, but adds complexity
2. **Server-Sent Events (SSE)** - Simpler, one-way only
3. **External service (Pusher/Ably)** - Managed, adds dependency

**Recommendation**: Defer to P3. Initial MVP can poll presence endpoint every 10 seconds.

### Conflict Resolution

**Options**:
1. **Last-write-wins** - Simple, sufficient for most cases
2. **OT/CRDT** - Complex, needed for true real-time editing

**Recommendation**: Implement last-write-wins for MVP. Real-time collaborative editing (Google Docs style) is out of scope for this spec.
