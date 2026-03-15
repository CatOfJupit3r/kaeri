# Feature Specification: Multi-User Collaboration

**Feature Branch**: `009-collaboration`  
**Created**: 2026-03-15  
**Status**: Draft  
**Input**: Multi-user collaboration allowing multiple users to work on the same project with workspaces, team management, roles, permissions, and real-time collaboration

## Overview

This feature enables multiple users to collaborate on screenwriting projects within Kaeri. It introduces Workspaces as organizational containers for series, Team management with role-based access control, and foundation for real-time collaboration features.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Manage Workspace (Priority: P1)

A writer creates a personal workspace to organize their series and optionally invite collaborators. The workspace acts as a top-level container that groups related series and defines who can access them.

**Why this priority**: Workspaces are the foundational container for all collaboration features. Without workspaces, there is no logical boundary for team access and permissions.

**Independent Test**: A user can create a workspace, view it in their workspace list, rename it, and see series assigned to it. This delivers organizational value even before inviting team members.

**Acceptance Scenarios**:

1. **Given** an authenticated user with no workspaces, **When** they create a workspace with a name, **Then** the workspace appears in their list and they become the owner.
2. **Given** an existing workspace, **When** the owner updates the workspace name, **Then** the change persists and is visible on next load.
3. **Given** a workspace with no series, **When** the owner deletes the workspace, **Then** it is removed from their list.
4. **Given** a workspace with series, **When** the owner attempts to delete it, **Then** they receive a warning about dependent series and must confirm or migrate them first.

---

### User Story 2 - Invite Team Members (Priority: P1)

A workspace owner invites collaborators via email. Invitees receive an invitation that, once accepted, grants them access to the workspace and its series based on their assigned role.

**Why this priority**: Team invitation is the core enabler of collaboration. Without it, workspaces remain single-user and the feature provides no multi-user value.

**Independent Test**: An owner can send an invitation, the invitee receives it, accepts it, and gains access to the workspace. The inviter sees the new member in the team list.

**Acceptance Scenarios**:

1. **Given** a workspace owner, **When** they invite a user by email with an Editor role, **Then** an invitation is created with a unique code and the invitee receives notification.
2. **Given** a pending invitation, **When** the invitee accepts it, **Then** they are added to the workspace with the assigned role and can see workspace series.
3. **Given** a pending invitation, **When** the invitee declines it, **Then** the invitation is marked as declined and the owner is notified.
4. **Given** a pending invitation older than 7 days, **When** the invitee attempts to accept, **Then** the invitation is marked expired and they must request a new one.
5. **Given** an invitation to a non-existent user, **When** that person registers with the invited email, **Then** they can see and accept the pending invitation after signup.

---

### User Story 3 - Role-Based Access Control (Priority: P1)

Workspace members have roles (Owner, Admin, Editor, Viewer) that determine their permissions across workspace series. Permissions govern who can create, edit, view, or delete series and their content (scripts, knowledge base, canvas).

**Why this priority**: Access control is critical for trust and security in collaborative environments. Without proper permissions, users cannot safely share work.

**Independent Test**: Assign different roles to team members and verify each role can only perform permitted actions. A Viewer cannot edit; an Editor cannot delete the workspace.

**Acceptance Scenarios**:

1. **Given** a workspace with an Owner and an Editor, **When** the Editor attempts to delete a series, **Then** the operation fails with a permission error.
2. **Given** a workspace with a Viewer, **When** the Viewer opens a series, **Then** they can read scripts and knowledge base but cannot modify anything.
3. **Given** a workspace Owner, **When** they change a member's role from Viewer to Editor, **Then** the member gains edit permissions immediately.
4. **Given** a workspace Admin, **When** they attempt to remove the Owner, **Then** the operation fails as Owner role is protected.
5. **Given** a workspace with multiple Admins, **When** one Admin removes another Admin, **Then** the removal succeeds and the demoted user loses Admin privileges.

---

### User Story 4 - View Team Activity Feed (Priority: P2)

Team members can view a workspace activity feed showing recent changes across all workspace series. This leverages the existing audit system to display who changed what and when.

**Why this priority**: Activity visibility builds trust and coordination among team members. It depends on the audit infrastructure already in place but enhances it with team context.

**Independent Test**: Multiple users make changes to series content and all changes appear in the activity feed with correct attribution.

**Acceptance Scenarios**:

1. **Given** a workspace with activity, **When** a member views the activity feed, **Then** they see recent changes across all accessible series with actor, action, timestamp.
2. **Given** a series with restricted viewers, **When** a viewer checks the feed, **Then** they only see activity for series they can access (no leakage of restricted series names).
3. **Given** high activity volume, **When** a member loads the feed, **Then** results are paginated and load within 2 seconds for the first page.

---

### User Story 5 - Transfer Series Between Workspaces (Priority: P2)

A series owner can transfer a series from one workspace to another (or from personal to workspace). This enables flexible project organization as team structures evolve.

**Why this priority**: Organizational flexibility is important but less urgent than core collaboration. Users can work around this by recreating series initially.

**Independent Test**: Transfer a series from personal workspace to a team workspace; all scripts and KB content remain intact and accessible to the new workspace members.

**Acceptance Scenarios**:

1. **Given** a series in a personal workspace, **When** the owner transfers it to a team workspace where they have Admin rights, **Then** the series appears in the team workspace and disappears from personal.
2. **Given** a series with linked KB entities, **When** transferred, **Then** all characters, locations, props, and canvas nodes remain associated with the series.
3. **Given** a transferred series, **When** team members access it, **Then** their permissions are determined by their workspace role, not the original owner.

---

### User Story 6 - Real-Time Presence Awareness (Priority: P3)

Team members see who else is currently viewing or editing the same series, script, or scene. This reduces editing conflicts and improves coordination.

**Why this priority**: Real-time presence is a "nice to have" that enhances UX but is not required for basic collaboration. Users can coordinate via external tools initially.

**Independent Test**: Two users open the same script; each sees the other's avatar/cursor indicating presence. When one leaves, the other's UI updates.

**Acceptance Scenarios**:

1. **Given** two users in the same series, **When** User A opens a script, **Then** User B sees User A's presence indicator on that script.
2. **Given** a user viewing a scene, **When** they navigate away, **Then** their presence indicator is removed within 5 seconds.
3. **Given** intermittent network, **When** connection drops, **Then** presence is marked stale after 30 seconds and removed after 60 seconds.

---

### Edge Cases

- **Concurrent Role Changes**: If two admins simultaneously try to change the same member's role, last-write-wins applies and the final state is persisted.
- **Self-Removal**: A user cannot remove themselves from a workspace; they must ask an Admin or leave explicitly via a "Leave Workspace" action.
- **Owner Leaving**: The Owner cannot leave a workspace without transferring ownership to another Admin first.
- **Orphan Series**: If a user is removed from a workspace, series they created remain in the workspace but ownership metadata may be marked as "former member."
- **Invitation Spam**: Rate limit invitation sends to 10 per hour per workspace to prevent abuse.
- **Cross-Workspace References**: KB entities cannot reference entities from other workspaces; the system enforces referential integrity within workspace boundaries.
- **Large Teams**: Workspaces with more than 50 members paginate the member list and batch permission checks for performance.

## Requirements *(mandatory)*

### Functional Requirements

#### Workspace Management
- **FR-001**: System MUST allow authenticated users to create workspaces with a required name and optional description.
- **FR-002**: System MUST automatically assign the creator as workspace Owner with full permissions.
- **FR-003**: System MUST allow workspace Owners and Admins to update workspace name and description.
- **FR-004**: System MUST prevent workspace deletion when dependent series exist, or require explicit confirmation to cascade delete/orphan.
- **FR-005**: System MUST support a "personal" workspace created automatically for each user on first login to hold their individual series.

#### Team Membership
- **FR-006**: System MUST allow workspace Owners and Admins to invite users by email address.
- **FR-007**: System MUST generate unique, time-limited (7 days) invitation codes for each invite.
- **FR-008**: System MUST allow invitees to accept or decline invitations.
- **FR-009**: System MUST notify invitees of pending invitations via in-app notification (email notification is future scope).
- **FR-010**: System MUST handle invitations to unregistered emails: store invitation and surface it upon registration with matching email.
- **FR-011**: System MUST allow members to leave a workspace voluntarily (except Owner without ownership transfer).
- **FR-012**: System MUST allow Owners and Admins to remove members (except Owner).

#### Role-Based Access Control
- **FR-013**: System MUST support exactly four roles: Owner (one per workspace), Admin, Editor, Viewer.
- **FR-014**: System MUST enforce role permissions as follows:
  - **Owner**: Full access including workspace deletion, ownership transfer, and all Admin capabilities.
  - **Admin**: Manage members, change roles (except Owner), create/edit/delete series, manage workspace settings.
  - **Editor**: Create, edit, and read series and all content (scripts, KB, canvas). Cannot delete series or manage members.
  - **Viewer**: Read-only access to all series and content. Cannot create or modify anything.
- **FR-015**: System MUST allow Owners to transfer ownership to another Admin (and demote themselves to Admin).
- **FR-016**: System MUST return NOT_FOUND for any resource a user cannot access, per AUTH_ERROR_STANCE.md.

#### Series Association
- **FR-017**: System MUST associate each series with exactly one workspace (using existing `workspaceId` field).
- **FR-018**: System MUST allow series creators to transfer series between workspaces where they have Admin rights in the destination.
- **FR-019**: System MUST preserve all series content (scripts, KB entities, canvas) during workspace transfer.
- **FR-020**: System MUST update existing series queries to filter by workspaces the user can access.

#### Activity & Audit
- **FR-021**: System MUST extend existing audit entries to include `workspaceId` for workspace-level activity aggregation.
- **FR-022**: System MUST provide a workspace activity feed endpoint returning recent changes across all accessible series.
- **FR-023**: Activity feed MUST filter by user's accessible series (no leakage of restricted content).
- **FR-024**: Activity feed MUST support pagination (default 20 items, max 100).

#### Presence (P3 - Future)
- **FR-025**: System SHOULD track user presence per series/script using Valkey (existing Redis-compatible cache).
- **FR-026**: System SHOULD expose presence data via a dedicated endpoint or WebSocket channel.
- **FR-027**: Presence data MUST expire automatically after 60 seconds of no heartbeat.

### Non-Functional Requirements

- **NFR-001**: Invitation operations MUST complete within 500ms p95.
- **NFR-002**: Permission checks MUST complete within 50ms p95 (cached via Valkey).
- **NFR-003**: Activity feed first page MUST load within 2 seconds for workspaces with up to 10,000 audit entries.
- **NFR-004**: System MUST support workspaces with up to 100 members without pagination degradation.
- **NFR-005**: System MUST rate-limit invitation sends to 10 per hour per workspace.

### Key Entities

- **Workspace**: Organizational container for series. Attributes: id (UUID), name (required), description, createdAt, updatedAt. Relationships: has many WorkspaceMembers and Series.
- **WorkspaceMember**: Join entity linking users to workspaces. Attributes: id, workspaceId, userId, role (Owner/Admin/Editor/Viewer), joinedAt. Indexes: (workspaceId, userId) unique.
- **Invitation**: Pending invite to a workspace. Attributes: id, workspaceId, invitedEmail, invitedByUserId, role, code (unique), status (pending/accepted/declined/expired), expiresAt, createdAt.
- **Series (updated)**: Add `workspaceId` field (already reserved in model). Update all queries to scope by accessible workspaces.
- **AuditEntry (updated)**: Add `workspaceId` field for aggregation. Existing audit entries without workspace can be backfilled on migration.

### Constitution Alignment

- **Contracts**: New oRPC contracts in `packages/shared/src/contract/workspace.contract.ts` for workspace CRUD, `invitation.contract.ts` for invite management, and `workspace-member.contract.ts` for role management. Update `series.contract.ts` to include workspace scoping. All schemas exported via shared enums.
- **Canonical continuity**: Workspaces do not affect canonical KB entities directly. Series ownership and KB integrity remain unchanged; workspace is purely an access control boundary. Timeline ordering and character relationships stay within series scope.
- **Access & collaboration**: Four-role hierarchy with NOT_FOUND stance for inaccessible resources. Audit entries extended for workspace activity tracking. All mutations logged with actorId.
- **Quality gates**: `bun run check-types`, `bun run lint`, integration tests for workspace CRUD, invitation flows, and permission boundaries. Fixtures for multi-user scenarios.
- **Observability/recovery**: Structured logging for workspace mutations and invitation events. Workspace deletion either blocked by dependencies or logged with cascade details for recovery.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a workspace and invite a collaborator in under 3 minutes.
- **SC-002**: Invited users can accept an invitation and access shared series within 30 seconds of acceptance.
- **SC-003**: Permission changes (role updates) take effect within 5 seconds and are reflected on the user's next action.
- **SC-004**: Activity feed loads first page within 2 seconds for workspaces with 10+ series and 1,000+ recent changes.
- **SC-005**: 100% of permission-denied actions return NOT_FOUND (not FORBIDDEN) to prevent information leakage.
- **SC-006**: Zero data loss during series transfer between workspaces (all scripts, KB entities, canvas nodes preserved).
- **SC-007**: System handles 50 concurrent users in a single workspace without degradation in response times.
