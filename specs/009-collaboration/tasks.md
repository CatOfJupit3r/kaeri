# Tasks: Multi-User Collaboration

**Input**: Design documents from `/specs/009-collaboration/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Not explicitly requested in spec. Integration tests included in Polish phase for quality gates.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

**Constitution Hooks**: Contract definitions in `packages/shared`, NOT_FOUND stance enforcement, permission caching via Valkey, audit extension for activity tracking.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure and shared contracts/enums

- [x] T001 [P] Create workspace roles enum in `packages/shared/src/enums/workspace-roles.ts` with OWNER, ADMIN, EDITOR, VIEWER and ROLE_HIERARCHY
- [x] T002 [P] Create invitation status enum in `packages/shared/src/enums/invitation-status.ts` with PENDING, ACCEPTED, DECLINED, EXPIRED
- [x] T003 [P] Add workspace/invitation/permission error codes to `packages/shared/src/enums/errors.ts`
- [x] T004 [P] Create workspace contract in `packages/shared/src/contract/workspace.contract.ts` with CRUD procedures
- [x] T005 [P] Create workspace member contract in `packages/shared/src/contract/workspace-member.contract.ts` with role management procedures
- [x] T006 [P] Create invitation contract in `packages/shared/src/contract/invitation.contract.ts` with invite flow procedures
- [x] T007 Export new contracts from `packages/shared/src/contract/index.ts`
- [ ] T008 Run `bun run check-types` to validate contract schemas

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database models and permission infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 [P] Create Workspace model in `apps/server/src/db/models/workspace.model.ts` with Typegoose decorators
- [ ] T010 [P] Create WorkspaceMember model in `apps/server/src/db/models/workspace-member.model.ts` with compound index (workspaceId, userId)
- [ ] T011 [P] Create Invitation model in `apps/server/src/db/models/invitation.model.ts` with unique code index
- [ ] T012 Update Series model in `apps/server/src/db/models/series.model.ts` to make workspaceId required
- [ ] T013 Update AuditEntry model in `apps/server/src/db/models/audit-entry.model.ts` to add optional workspaceId field with index
- [ ] T014 Create collaboration feature directory `apps/server/src/features/collaboration/`
- [ ] T015 Create collaboration events file in `apps/server/src/features/collaboration/collaboration.events.ts`
- [ ] T016 Add collaboration service tokens to `apps/server/src/di/tokens.ts` (WorkspaceService, MemberService, InvitationService, PermissionService)
- [ ] T017 Create PermissionService in `apps/server/src/features/collaboration/permission.service.ts` with Valkey caching (50ms p95, 5-min TTL)
- [ ] T018 Register PermissionService in `apps/server/src/di/container.ts`

**Checkpoint**: Foundation ready - models exist, permission service available

---

## Phase 3: User Story 1 - Create and Manage Workspace (Priority: P1) 🎯 MVP

**Goal**: Users can create workspaces, view their list, update settings, and delete empty workspaces

**Independent Test**: Create workspace → appears in list → rename → verify persistence

### Implementation for User Story 1

- [ ] T019 [US1] Create WorkspaceService in `apps/server/src/features/collaboration/workspace.service.ts` with create, update, delete, get, list methods
- [ ] T020 [US1] Implement personal workspace auto-creation in WorkspaceService (isPersonal flag)
- [ ] T021 [US1] Create workspace router in `apps/server/src/features/collaboration/workspace.router.ts` implementing workspace contract
- [ ] T022 [US1] Register workspace router in `apps/server/src/routers/index.ts`
- [ ] T023 [US1] Add workspace deletion check for dependent series in WorkspaceService
- [ ] T024 [US1] Add structured logging for workspace mutations in WorkspaceService
- [ ] T025 [US1] Create Better Auth hook for personal workspace creation on user signup in `apps/server/src/lib/auth.ts`

**Checkpoint**: User Story 1 functional - workspaces can be created, listed, updated, deleted

---

## Phase 4: User Story 2 - Invite Team Members (Priority: P1)

**Goal**: Workspace owners/admins can invite users via email, invitees can accept/decline

**Independent Test**: Send invite → invitee receives code → accepts → appears in member list

### Implementation for User Story 2

- [ ] T026 [US2] Create InvitationService in `apps/server/src/features/collaboration/invitation.service.ts` with create, accept, decline, revoke, list, getByCode methods
- [ ] T027 [US2] Implement invitation code generation using nanoid in InvitationService
- [ ] T028 [US2] Implement invitation expiration check (7-day TTL) in InvitationService
- [ ] T029 [US2] Implement rate limiting (10/hour/workspace) using Valkey in InvitationService
- [ ] T030 [US2] Create invitation router in `apps/server/src/features/collaboration/invitation.router.ts` implementing invitation contract
- [ ] T031 [US2] Register invitation router in `apps/server/src/routers/index.ts`
- [ ] T032 [US2] Add pending invitation lookup on user registration (matching email) in auth hooks
- [ ] T033 [US2] Add structured logging for invitation events (send, accept, decline, expire)

**Checkpoint**: User Story 2 functional - invitations can be sent, accepted, declined

---

## Phase 5: User Story 3 - Role-Based Access Control (Priority: P1)

**Goal**: Members have roles determining permissions; role changes take effect immediately

**Independent Test**: Assign roles → verify each role can/cannot perform expected actions

### Implementation for User Story 3

- [ ] T034 [US3] Create MemberService in `apps/server/src/features/collaboration/member.service.ts` with listMembers, updateRole, removeMember, leave methods
- [ ] T035 [US3] Implement role update with permission checks in MemberService (Admin cannot modify Owner)
- [ ] T036 [US3] Implement ownership transfer in MemberService (Owner → Admin demotion)
- [ ] T037 [US3] Implement leave workspace with Owner protection in MemberService
- [ ] T038 [US3] Create member router in `apps/server/src/features/collaboration/member.router.ts` implementing workspace-member contract
- [ ] T039 [US3] Register member router in `apps/server/src/routers/index.ts`
- [ ] T040 [US3] Add Valkey cache invalidation on role changes in PermissionService
- [ ] T041 [US3] Update PermissionService with hasPermission helper using role hierarchy
- [ ] T042 [US3] Add NOT_FOUND stance enforcement in all collaboration routers for inaccessible resources

**Checkpoint**: User Story 3 functional - roles control access, changes are immediate

---

## Phase 6: User Story 4 - View Team Activity Feed (Priority: P2)

**Goal**: Team members see workspace-wide activity across all accessible series

**Independent Test**: Multiple users make changes → all appear in activity feed with attribution

### Implementation for User Story 4

- [ ] T043 [US4] Update AuditService in `apps/server/src/features/audit/audit.service.ts` to include workspaceId derived from series
- [ ] T044 [US4] Add getWorkspaceActivity method to AuditService with pagination (default 20, max 100)
- [ ] T045 [US4] Add activity endpoint to workspace router for workspace activity feed
- [ ] T046 [US4] Implement activity feed filtering by user's accessible series in AuditService
- [ ] T047 [US4] Add workspaceId index to existing AuditEntry queries for performance

**Checkpoint**: User Story 4 functional - activity feed shows workspace-wide changes

---

## Phase 7: User Story 5 - Transfer Series Between Workspaces (Priority: P2)

**Goal**: Series can be moved between workspaces while preserving all content

**Independent Test**: Transfer series → all scripts/KB/canvas preserved → new workspace members can access

### Implementation for User Story 5

- [ ] T048 [US5] Add transferSeries procedure to series contract in `packages/shared/src/contract/series.contract.ts`
- [ ] T049 [US5] Update SeriesService in `apps/server/src/features/series/series.service.ts` with transfer method and permission checks
- [ ] T050 [US5] Implement atomic workspace transfer with content preservation in SeriesService
- [ ] T051 [US5] Update series router to handle transfer endpoint
- [ ] T052 [US5] Update all series queries in SeriesService to filter by accessible workspaces
- [ ] T053 [US5] Add cache invalidation for series transfer events

**Checkpoint**: User Story 5 functional - series can be transferred with integrity

---

## Phase 8: User Story 6 - Real-Time Presence Awareness (Priority: P3)

**Goal**: Team members see who else is viewing the same series/script

**Independent Test**: Two users open same script → each sees other's presence indicator

### Implementation for User Story 6

- [ ] T054 [P] [US6] Add presence contract in `packages/shared/src/contract/presence.contract.ts` with heartbeat and getPresence procedures
- [ ] T055 [US6] Create PresenceService in `apps/server/src/features/collaboration/presence.service.ts` using Valkey with 60s TTL
- [ ] T056 [US6] Implement presence heartbeat endpoint in collaboration router
- [ ] T057 [US6] Implement getPresence endpoint returning active users per series/script
- [ ] T058 [US6] Add automatic presence expiration after 60 seconds of no heartbeat

**Checkpoint**: User Story 6 functional - presence indicators work across series

---

## Phase 9: Web UI (Cross-Cutting)

**Purpose**: Frontend components for all user stories

### Workspace UI (US1)

- [ ] T059 [P] [US1] Create workspace query hooks in `apps/web/src/hooks/queries/workspaces/use-workspaces.ts`
- [ ] T060 [P] [US1] Create workspace mutation hooks in `apps/web/src/hooks/mutations/workspaces/use-create-workspace.ts`
- [ ] T061 [P] [US1] Create WorkspaceCard component in `apps/web/src/components/workspaces/workspace-card.tsx`
- [ ] T062 [P] [US1] Create WorkspaceSwitcher component in `apps/web/src/components/workspaces/workspace-switcher.tsx`
- [ ] T063 [US1] Create workspace list route in `apps/web/src/routes/workspaces/index.tsx`
- [ ] T064 [US1] Create workspace dashboard route in `apps/web/src/routes/workspaces/$workspaceId/index.tsx`
- [ ] T065 [US1] Create workspace settings route in `apps/web/src/routes/workspaces/$workspaceId/settings.tsx`

### Invitation & Members UI (US2, US3)

- [ ] T066 [P] [US2] Create InviteDialog component in `apps/web/src/components/workspaces/invite-dialog.tsx`
- [ ] T067 [P] [US2] Create invitation acceptance route in `apps/web/src/routes/workspaces/invitations/$code.tsx`
- [ ] T068 [P] [US3] Create MemberList component in `apps/web/src/components/workspaces/member-list.tsx`
- [ ] T069 [US3] Create members management route in `apps/web/src/routes/workspaces/$workspaceId/members.tsx`
- [ ] T070 [US2] Create invitation mutation hooks in `apps/web/src/hooks/mutations/workspaces/use-invite-member.ts`
- [ ] T071 [US3] Create role update mutation hooks in `apps/web/src/hooks/mutations/workspaces/use-update-member-role.ts`

### Activity Feed UI (US4)

- [ ] T072 [P] [US4] Create ActivityFeed component in `apps/web/src/components/workspaces/activity-feed.tsx`
- [ ] T073 [US4] Create activity query hook in `apps/web/src/hooks/queries/workspaces/use-workspace-activity.ts`
- [ ] T074 [US4] Add activity feed tab to workspace dashboard

### Presence UI (US6)

- [ ] T075 [P] [US6] Create PresenceIndicator component in `apps/web/src/components/workspaces/presence-indicator.tsx`
- [ ] T076 [US6] Create presence hook with heartbeat in `apps/web/src/hooks/use-presence.ts`
- [ ] T077 [US6] Integrate presence indicators into series/script views

**Checkpoint**: All UI components implemented and connected to API

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, migration, and final validation

- [ ] T078 Create migration script for existing series workspaceId backfill in `apps/server/src/db/migrations/backfill-workspace-id.ts`
- [ ] T079 Create migration script for personal workspace creation for existing users
- [ ] T080 [P] Add integration test for workspace CRUD in `apps/server/test/features/collaboration/integration/workspace-crud.test.ts`
- [ ] T081 [P] Add integration test for invitation flow in `apps/server/test/features/collaboration/integration/invitation-flow.test.ts`
- [ ] T082 [P] Add integration test for role permissions in `apps/server/test/features/collaboration/integration/role-permissions.test.ts`
- [ ] T083 Run `bun run check-types` to validate all implementations
- [ ] T084 Run `bun run lint` and fix any issues
- [ ] T085 Run quickstart.md validation scenarios
- [ ] T086 Performance validation: verify permission checks < 50ms p95
- [ ] T087 Security audit: verify NOT_FOUND stance for all inaccessible resources

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion - BLOCKS all user stories
- **Phase 3-5 (US1-US3)**: Depend on Phase 2; can proceed in sequence P1 → P1 → P1
- **Phase 6-7 (US4-US5)**: Depend on Phase 2; can run parallel to Phase 3-5 if staffed
- **Phase 8 (US6)**: Depends on Phase 2; P3 priority - defer if needed
- **Phase 9 (Web UI)**: Can start after corresponding backend stories complete
- **Phase 10 (Polish)**: Depends on all story phases

### User Story Dependencies

| Story | Priority | Server Prereqs | Can Start After |
|-------|----------|----------------|-----------------|
| US1 - Workspace CRUD | P1 | Phase 2 | Phase 2 complete |
| US2 - Invitations | P1 | US1 | T022 (workspace router) |
| US3 - Roles/Permissions | P1 | US1, US2 | T031 (invitation router) |
| US4 - Activity Feed | P2 | Phase 2 | Phase 2 complete |
| US5 - Series Transfer | P2 | US1, US3 | T042 (permission helper) |
| US6 - Presence | P3 | Phase 2 | Phase 2 complete |

### Parallel Opportunities by Phase

**Phase 1** (all parallelizable):
```
T001, T002, T003 (enums) → parallel
T004, T005, T006 (contracts) → parallel
T007 (export) → after contracts
```

**Phase 2** (models parallelizable):
```
T009, T010, T011 (new models) → parallel
T012, T013 (model updates) → parallel after new models
T014-T018 (services) → sequential
```

**Phase 9** (UI parallelizable within story):
```
T059, T060, T061, T062 (US1 components) → parallel
T066, T067, T068 (US2/US3 components) → parallel
T072, T075 (US4/US6 components) → parallel
```

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup (contracts, enums) ✓
2. Complete Phase 2: Foundational (models, permission service) ✓
3. Complete Phase 3: US1 - Workspace Management ✓
4. Complete Phase 4: US2 - Invitations ✓
5. Complete Phase 5: US3 - Role-Based Access ✓
6. **STOP and VALIDATE**: Core collaboration works end-to-end
7. Complete Phase 9 (US1-US3 UI portions) ✓
8. Deploy/demo MVP

### Incremental Delivery (P2 Stories)

9. Add Phase 6: US4 - Activity Feed → Test → Deploy
10. Add Phase 7: US5 - Series Transfer → Test → Deploy
11. Complete remaining Phase 9 UI

### Deferred (P3)

12. Phase 8: US6 - Presence (can be skipped for initial release)

---

## Notes

- Total tasks: 87
- P1 User Stories (US1-US3): 24 tasks (core MVP)
- P2 User Stories (US4-US5): 10 tasks
- P3 User Story (US6): 5 tasks
- Web UI: 19 tasks
- Setup/Foundation/Polish: 29 tasks
- [P] tasks can run in parallel within their phase
- Commit after each task or logical group
- Run `bun run check-types` after each phase completion
