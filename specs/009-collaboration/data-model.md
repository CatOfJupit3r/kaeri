# Data Model: Multi-User Collaboration

**Branch**: `009-collaboration` | **Date**: 2026-03-15

## Entity Definitions

### Workspace

Organizational container for series that defines team access boundaries.

```typescript
interface Workspace {
  _id: string;              // UUID (ObjectIdString)
  name: string;             // Required, display name
  description?: string;     // Optional description
  createdAt: Date;          // Timestamp
  updatedAt: Date;          // Timestamp
}
```

**Indexes:**
- `_id` (primary)

**Constraints:**
- `name` is required and non-empty
- One Owner per workspace (enforced at application level via WorkspaceMember)

---

### WorkspaceMember

Join entity linking users to workspaces with their assigned role.

```typescript
type WorkspaceRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';

interface WorkspaceMember {
  _id: string;              // UUID (ObjectIdString)
  workspaceId: string;      // FK to Workspace
  userId: string;           // FK to User (Better Auth)
  role: WorkspaceRole;      // Permission level
  joinedAt: Date;           // When member was added
}
```

**Indexes:**
- `_id` (primary)
- `(workspaceId, userId)` (unique compound) - One membership per user per workspace
- `workspaceId` - Fast lookup of workspace members
- `userId` - Fast lookup of user's workspaces

**Constraints:**
- Exactly one member with `role: 'OWNER'` per workspace
- `workspaceId` must reference valid Workspace
- `userId` must reference valid User

---

### Invitation

Pending invitation to join a workspace.

```typescript
type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

interface Invitation {
  _id: string;              // UUID (ObjectIdString)
  workspaceId: string;      // FK to Workspace
  invitedEmail: string;     // Email of invitee (may not exist as user yet)
  invitedByUserId: string;  // FK to User who sent invite
  role: WorkspaceRole;      // Role to assign on acceptance (not OWNER)
  code: string;             // Unique, URL-safe invitation code
  status: InvitationStatus; // Current state
  expiresAt: Date;          // Expiration timestamp (7 days from creation)
  acceptedAt?: Date;        // When accepted (if applicable)
  createdAt: Date;          // Timestamp
}
```

**Indexes:**
- `_id` (primary)
- `code` (unique) - Invitation lookup by code
- `workspaceId` - List invitations for workspace
- `invitedEmail` - Find pending invitations for email on signup
- `status` - Filter by status
- `expiresAt` - Expiration cleanup queries

**Constraints:**
- `code` must be unique and cryptographically random
- `role` cannot be 'OWNER' (ownership is transferred, not invited)
- `expiresAt` defaults to createdAt + 7 days

---

### Series (Updated)

Add workspace association to existing Series model.

```typescript
interface Series {
  // ... existing fields ...
  workspaceId: string;      // FK to Workspace (NEW - required)
  // workspaceId already reserved in model, now required
}
```

**Migration:**
- Backfill existing series with creator's personal workspace ID
- Create personal workspace for each existing user during migration

---

### AuditEntry (Updated)

Add workspace association for activity aggregation.

```typescript
interface AuditEntry {
  // ... existing fields ...
  workspaceId?: string;     // FK to Workspace (NEW - optional for backward compat)
}
```

**Indexes:**
- Add `workspaceId` index for workspace activity feed queries

**Migration:**
- No backfill required (existing entries remain without workspaceId)
- New entries will include workspaceId derived from series.workspaceId

---

## Relationships

```
┌─────────────┐
│    User     │ (Better Auth)
└──────┬──────┘
       │ 1
       │
       │ N (membership)
       ▼
┌─────────────────────┐         ┌─────────────┐
│  WorkspaceMember    │◄───────►│  Workspace  │
│  - userId           │    N:1  │             │
│  - workspaceId      │         │             │
│  - role             │         └──────┬──────┘
└─────────────────────┘                │ 1
                                       │
                                       │ N (contains)
                                       ▼
                                ┌─────────────┐
                                │   Series    │
                                │ - workspaceId│
                                └──────┬──────┘
                                       │ 1
                                       │
                                       │ N (has)
                                       ▼
                               ┌──────────────┐
                               │  AuditEntry  │
                               │ - workspaceId│
                               └──────────────┘

┌─────────────────────┐
│    Invitation       │
│  - workspaceId ────►│ Workspace
│  - invitedEmail     │
│  - invitedByUserId ►│ User
└─────────────────────┘
```

## Role Permissions Matrix

| Action                     | Owner | Admin | Editor | Viewer |
|----------------------------|-------|-------|--------|--------|
| View workspace             | ✓     | ✓     | ✓      | ✓      |
| Update workspace settings  | ✓     | ✓     | ✗      | ✗      |
| Delete workspace           | ✓     | ✗     | ✗      | ✗      |
| Transfer ownership         | ✓     | ✗     | ✗      | ✗      |
| Invite members             | ✓     | ✓     | ✗      | ✗      |
| Remove members             | ✓     | ✓*    | ✗      | ✗      |
| Update member roles        | ✓     | ✓*    | ✗      | ✗      |
| Create series              | ✓     | ✓     | ✓      | ✗      |
| Edit series/content        | ✓     | ✓     | ✓      | ✗      |
| Delete series              | ✓     | ✓     | ✗      | ✗      |
| View series/content        | ✓     | ✓     | ✓      | ✓      |
| Transfer series out        | ✓     | ✓     | ✗      | ✗      |
| View activity feed         | ✓     | ✓     | ✓      | ✓      |

*Admin cannot modify Owner role or remove Owner.

## Valkey Cache Keys

Permission checks will use Valkey caching with the following key patterns:

```
workspace:member:{workspaceId}:{userId}        → WorkspaceMember | null (5min TTL)
workspace:members:{workspaceId}                → WorkspaceMember[] (5min TTL)
user:workspaces:{userId}                       → Workspace[] (5min TTL)
```

Cache invalidation events:
- `workspace:created` → Invalidate `user:workspaces:{creatorId}`
- `workspace:deleted` → Invalidate `workspace:*:{workspaceId}`, `user:workspaces:*`
- `member:added` → Invalidate `workspace:member*:{workspaceId}`, `user:workspaces:{userId}`
- `member:removed` → Same as added
- `member:role-changed` → Invalidate `workspace:member:{workspaceId}:{userId}`
