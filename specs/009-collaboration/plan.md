# Implementation Plan: Multi-User Collaboration

**Branch**: `009-collaboration` | **Date**: 2026-03-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-collaboration/spec.md`

## Summary

Enable multi-user collaboration by introducing Workspaces as organizational containers for series, with role-based access control (Owner/Admin/Editor/Viewer), invitation-based team management, and workspace-scoped activity feeds. Builds on existing Better Auth authentication, Typegoose models, and audit infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.x (Bun 1.2.21 runtime)  
**Primary Dependencies**: Hono, oRPC, Typegoose/Mongoose, Better Auth, TanStack (Router/Query/Form), Valkey  
**Storage**: MongoDB via Mongoose/Typegoose  
**Testing**: Bun test runner with integration tests  
**Target Platform**: Web application (API + React SPA)  
**Project Type**: Monorepo (apps/server, apps/web, packages/shared)  
**Performance Goals**: 50ms p95 for permission checks, 500ms p95 for invitations, 2s first-page activity feed  
**Constraints**: NOT_FOUND error stance for access denial, cookie-based auth, Valkey caching for permissions  
**Scale/Scope**: Up to 100 members per workspace, 10,000 audit entries per workspace

## Constitution Check

### Contract-First (PASS)
New contracts required in `packages/shared/src/contract/`:
- `workspace.contract.ts`: createWorkspace, updateWorkspace, deleteWorkspace, getWorkspace, listWorkspaces, transferOwnership
- `workspace-member.contract.ts`: listMembers, updateMemberRole, removeMember, leaveWorkspace
- `invitation.contract.ts`: createInvitation, listInvitations, acceptInvitation, declineInvitation, revokeInvitation
- Update `series.contract.ts`: Add workspaceId to createSeries, filter listSeries by accessible workspaces, add transferSeries

Shared enums to add in `packages/shared/src/enums/`:
- `workspace-roles.ts`: WORKSPACE_ROLES enum (OWNER, ADMIN, EDITOR, VIEWER)
- `invitation-status.ts`: INVITATION_STATUS enum (PENDING, ACCEPTED, DECLINED, EXPIRED)
- Update `errors.ts`: Add workspace, invitation, and permission error codes

### Canon Continuity (PASS)
- Workspaces are access boundaries only, not canonical entities
- Series remains the canonical scope for KB entities (characters, locations, props, timelines)
- No changes to referential integrity within series
- workspaceId added to Series links series to workspace without affecting episode/scene relationships

### Collaboration & Access (PASS)
- Four-role hierarchy: Owner > Admin > Editor > Viewer
- NOT_FOUND stance: All inaccessible resources return NOT_FOUND (not FORBIDDEN)
- Permission checks cached in Valkey with 5-minute TTL
- Audit extended with workspaceId for activity aggregation
- All mutations logged with actorId

### Quality Gates (PASS)
- `bun run check-types`: Validate contract/implementation parity
- `bun run lint`: Code quality
- Integration tests:
  - Workspace CRUD with owner assignment
  - Invitation flow (create, accept, decline, expire)
  - Role permissions (each role can/cannot perform expected actions)
  - Series workspace transfer
  - Activity feed filtering

### Observability & Recovery (PASS)
- Structured logging for workspace mutations: create, update, delete, transfer
- Structured logging for invitation events: send, accept, decline, expire
- Workspace deletion blocked by dependent series (no cascade delete)
- Migration script to backfill workspaceId on existing series (assign to creator's personal workspace)

## Project Structure

### Documentation (this feature)

```text
specs/009-collaboration/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0: Technical research
├── data-model.md        # Phase 1: Entity definitions
├── quickstart.md        # Phase 1: Integration scenarios
├── contracts/           # Phase 1: OpenAPI/contract specs
└── tasks.md             # Phase 2: Actionable task breakdown
```

### Source Code (repository root)

```text
packages/shared/src/
├── contract/
│   ├── workspace.contract.ts       # Workspace CRUD procedures
│   ├── workspace-member.contract.ts # Member management procedures
│   ├── invitation.contract.ts      # Invitation procedures
│   └── series.contract.ts          # Updated with workspaceId
├── enums/
│   ├── workspace-roles.ts          # OWNER, ADMIN, EDITOR, VIEWER
│   ├── invitation-status.ts        # PENDING, ACCEPTED, DECLINED, EXPIRED
│   └── errors.ts                   # Extended with workspace/permission errors
└── schemas/
    └── workspace.schemas.ts        # Shared zod schemas

apps/server/src/
├── db/models/
│   ├── workspace.model.ts          # Workspace Typegoose model
│   ├── workspace-member.model.ts   # Member join entity
│   ├── invitation.model.ts         # Invitation model
│   └── series.model.ts             # Updated with workspaceId
├── features/
│   └── collaboration/
│       ├── workspace.service.ts    # Workspace business logic
│       ├── workspace.router.ts     # oRPC handlers
│       ├── member.service.ts       # Member management logic
│       ├── member.router.ts        # Member oRPC handlers
│       ├── invitation.service.ts   # Invitation logic
│       ├── invitation.router.ts    # Invitation oRPC handlers
│       ├── permission.service.ts   # Permission checks (cached)
│       └── collaboration.events.ts # Event definitions
├── routers/
│   └── index.ts                    # Register collaboration routers
└── di/
    └── tokens.ts                   # Add collaboration service tokens

apps/server/test/
└── features/collaboration/
    ├── workspace.service.test.ts
    ├── invitation.service.test.ts
    ├── permission.service.test.ts
    └── integration/
        ├── workspace-crud.test.ts
        ├── invitation-flow.test.ts
        └── role-permissions.test.ts

apps/web/src/
├── hooks/
│   ├── queries/workspaces/
│   │   ├── use-workspaces.ts
│   │   └── use-workspace.ts
│   └── mutations/workspaces/
│       ├── use-create-workspace.ts
│       ├── use-invite-member.ts
│       └── use-update-member-role.ts
├── routes/
│   ├── workspaces/
│   │   ├── index.tsx               # Workspace list
│   │   ├── $workspaceId/
│   │   │   ├── index.tsx           # Workspace dashboard
│   │   │   ├── settings.tsx        # Workspace settings
│   │   │   └── members.tsx         # Member management
│   │   └── invitations/
│   │       └── $code.tsx           # Accept invitation page
└── components/
    └── workspaces/
        ├── workspace-card.tsx
        ├── workspace-switcher.tsx
        ├── member-list.tsx
        ├── invite-dialog.tsx
        └── activity-feed.tsx
```

**Structure Decision**: Feature-based structure under `apps/server/src/features/collaboration/` following existing patterns (e.g., `features/series/`, `features/audit/`). Web components grouped under `components/workspaces/` with corresponding hooks and routes.

## Implementation Phases

### Phase 0: Research (Pre-requisites)
- Confirm Valkey caching patterns for permission checks
- Research invitation code generation (secure random)
- Review existing audit service for workspace extension
- Validate Better Auth session access in context

### Phase 1: Core Infrastructure
1. **Shared contracts** (workspace, member, invitation)
2. **Enums and errors** (roles, status, error codes)
3. **Database models** (workspace, workspace-member, invitation)
4. **Update Series model** with workspaceId field
5. **Permission service** with Valkey caching

### Phase 2: Workspace Management
1. Workspace CRUD service and router
2. Personal workspace auto-creation on first login
3. Workspace listing scoped to user membership

### Phase 3: Team & Invitations
1. Invitation service (create, accept, decline, expire)
2. Member management service (add, remove, update role)
3. Leave workspace / transfer ownership

### Phase 4: Series Integration
1. Update series queries to filter by accessible workspaces
2. Series transfer between workspaces
3. Migration: backfill workspaceId on existing series

### Phase 5: Activity & Presence (P2/P3)
1. Extend audit entries with workspaceId
2. Workspace activity feed endpoint
3. (P3) Presence tracking via Valkey

### Phase 6: Web UI
1. Workspace switcher and list
2. Member management UI
3. Invitation flow (send, accept page)
4. Activity feed component

## Complexity Tracking

No constitution violations requiring justification. The design:
- Follows contract-first approach
- Uses existing DI patterns
- Extends audit system non-destructively
- Applies NOT_FOUND stance consistently
- Uses Valkey for performance-critical permission checks
