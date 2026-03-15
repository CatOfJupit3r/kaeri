# Integration Quickstart: Multi-User Collaboration

**Branch**: `009-collaboration` | **Date**: 2026-03-15

This document provides integration scenarios for testing the collaboration feature end-to-end.

## Prerequisites

- MongoDB running (docker-compose.dev.yml)
- Server running at http://localhost:3000
- At least two test user accounts

## Scenario 1: Workspace Creation & Setup

### Steps

1. **Create a workspace**
   ```typescript
   // POST /api/rpc/workspace/createWorkspace
   const workspace = await tanstackRPC.workspace.createWorkspace.call({
     input: { name: 'My Writing Team', description: 'Collaboration workspace' }
   });
   // Returns: { _id, name, description, membership: { role: 'OWNER' }, memberCount: 1 }
   ```

2. **Verify personal workspace exists**
   ```typescript
   // GET /api/rpc/workspace/listWorkspaces
   const { workspaces } = await tanstackRPC.workspace.listWorkspaces.call({ input: {} });
   // Should include personal workspace (isPersonal: true) and new team workspace
   ```

3. **Update workspace**
   ```typescript
   // PUT /api/rpc/workspace/updateWorkspace
   await tanstackRPC.workspace.updateWorkspace.call({
     input: {
       workspaceId: workspace._id,
       patch: { name: 'Updated Team Name' }
     }
   });
   ```

### Verification
- [ ] Workspace created with creator as OWNER
- [ ] Personal workspace auto-created for new users
- [ ] Workspace appears in list
- [ ] Update persists

---

## Scenario 2: Team Invitation Flow

### Steps

1. **Send invitation (as Owner)**
   ```typescript
   // POST /api/rpc/invitation/createInvitation
   const invite = await tanstackRPC.invitation.createInvitation.call({
     input: {
       workspaceId: workspace._id,
       email: 'collaborator@example.com',
       role: 'EDITOR'
     }
   });
   // Returns: { _id, code, status: 'PENDING', expiresAt, ... }
   ```

2. **View invitation (public, by code)**
   ```typescript
   // GET /api/rpc/invitation/getInvitationByCode
   const details = await tanstackRPC.invitation.getInvitationByCode.call({
     input: { code: invite.code }
   });
   // Returns: { workspaceName, invitedByName, role, isExpired, requiresSignup }
   ```

3. **Accept invitation (logged in as invitee)**
   ```typescript
   // POST /api/rpc/invitation/acceptInvitation
   const result = await tanstackRPC.invitation.acceptInvitation.call({
     input: { code: invite.code }
   });
   // Returns: { success: true, workspaceId, role: 'EDITOR' }
   ```

4. **Verify membership**
   ```typescript
   // GET /api/rpc/workspace/listMembers
   const { members } = await tanstackRPC.workspaceMember.listMembers.call({
     input: { workspaceId: workspace._id }
   });
   // Should include both Owner and new Editor
   ```

### Verification
- [ ] Invitation created with unique code
- [ ] Invitation visible via public endpoint (no auth)
- [ ] Acceptance adds member with correct role
- [ ] Owner sees new member in list
- [ ] Rate limiting enforced (10/hour/workspace)

---

## Scenario 3: Role-Based Permissions

### Steps

1. **Viewer attempts edit (should fail)**
   ```typescript
   // As Viewer, try to create series
   try {
     await tanstackRPC.series.createSeries.call({
       input: { title: 'New Series', workspaceId: workspace._id }
     });
   } catch (error) {
     // Expect: NOT_FOUND (viewer can see series but not workspace to create)
   }
   ```

2. **Editor creates series (should succeed)**
   ```typescript
   // As Editor
   const series = await tanstackRPC.series.createSeries.call({
     input: { title: 'New Series', workspaceId: workspace._id }
   });
   // Returns: series object
   ```

3. **Editor attempts delete (should fail)**
   ```typescript
   // As Editor, try to delete series
   try {
     await tanstackRPC.series.deleteSeries.call({
       input: { seriesId: series._id }
     });
   } catch (error) {
     // Expect: FORBIDDEN (editor exists but lacks delete permission)
   }
   ```

4. **Admin changes role**
   ```typescript
   // As Admin, upgrade Editor to Admin
   await tanstackRPC.workspaceMember.updateMemberRole.call({
     input: {
       workspaceId: workspace._id,
       userId: editorUserId,
       newRole: 'ADMIN'
     }
   });
   ```

### Role Permission Matrix Test

| Role   | Create Series | Edit Series | Delete Series | Invite | Remove Members |
|--------|---------------|-------------|---------------|--------|----------------|
| VIEWER | ✗             | ✗           | ✗             | ✗      | ✗              |
| EDITOR | ✓             | ✓           | ✗             | ✗      | ✗              |
| ADMIN  | ✓             | ✓           | ✓             | ✓      | ✓*             |
| OWNER  | ✓             | ✓           | ✓             | ✓      | ✓              |

*Admin cannot remove Owner

### Verification
- [ ] Each role has correct access level
- [ ] Permission changes take effect immediately
- [ ] NOT_FOUND for inaccessible resources
- [ ] FORBIDDEN for insufficient permissions within accessible resources

---

## Scenario 4: Series Workspace Transfer

### Steps

1. **Create series in personal workspace**
   ```typescript
   const personalWs = workspaces.find(w => w.isPersonal);
   const series = await tanstackRPC.series.createSeries.call({
     input: { title: 'My Script', workspaceId: personalWs._id }
   });
   ```

2. **Transfer to team workspace**
   ```typescript
   await tanstackRPC.series.transferSeries.call({
     input: {
       seriesId: series._id,
       toWorkspaceId: teamWorkspace._id
     }
   });
   ```

3. **Verify transfer**
   ```typescript
   const updated = await tanstackRPC.series.getSeries.call({
     input: { seriesId: series._id }
   });
   expect(updated.workspaceId).toBe(teamWorkspace._id);
   
   // Team members can now access
   // As team Editor:
   const seriesList = await tanstackRPC.series.listSeries.call({ input: {} });
   expect(seriesList.series.some(s => s._id === series._id)).toBe(true);
   ```

### Verification
- [ ] Transfer requires Admin+ in both workspaces
- [ ] All content (scripts, KB, canvas) preserved
- [ ] Series no longer visible in source workspace
- [ ] Team members gain access based on their role

---

## Scenario 5: Activity Feed

### Steps

1. **Perform various actions**
   ```typescript
   // Create character, edit script, add scene (as different users)
   await tanstackRPC.knowledgeBase.createCharacter.call({ ... });
   await tanstackRPC.scripts.updateScript.call({ ... });
   await tanstackRPC.scenes.createScene.call({ ... });
   ```

2. **Fetch activity feed**
   ```typescript
   const activity = await tanstackRPC.workspace.getActivity.call({
     input: {
       workspaceId: workspace._id,
       limit: 20,
       offset: 0
     }
   });
   // Returns: { entries: [...], total: N }
   ```

3. **Verify filtering**
   ```typescript
   // As Viewer with limited series access
   const viewerActivity = await tanstackRPC.workspace.getActivity.call({
     input: { workspaceId: workspace._id }
   });
   // Should only show activity for series viewer can access
   ```

### Verification
- [ ] Activity includes actor, action, entity, timestamp
- [ ] Feed respects series-level access control
- [ ] Pagination works correctly
- [ ] First page loads within 2s for large workspaces

---

## Scenario 6: Edge Cases

### Ownership Transfer

```typescript
// As Owner, transfer to Admin
await tanstackRPC.workspace.transferOwnership.call({
  input: {
    workspaceId: workspace._id,
    newOwnerId: adminUserId
  }
});
// Original owner becomes Admin
// New owner is now OWNER
```

### Self-Leave

```typescript
// Editor leaves workspace
await tanstackRPC.workspaceMember.leaveWorkspace.call({
  input: { workspaceId: workspace._id }
});
// Editor removed from workspace
// Cannot access workspace content anymore
```

### Owner Cannot Leave

```typescript
// Owner attempts to leave
try {
  await tanstackRPC.workspaceMember.leaveWorkspace.call({
    input: { workspaceId: workspace._id }
  });
} catch (error) {
  // Expect: CANNOT_LEAVE_AS_OWNER
}
```

### Expired Invitation

```typescript
// After 7 days
try {
  await tanstackRPC.invitation.acceptInvitation.call({
    input: { code: oldInvite.code }
  });
} catch (error) {
  // Expect: INVITATION_EXPIRED
}
```

---

## Test Data Fixtures

```typescript
// Deterministic test users
const testUsers = {
  owner: { email: 'owner@test.kaeri.dev', name: 'Test Owner' },
  admin: { email: 'admin@test.kaeri.dev', name: 'Test Admin' },
  editor: { email: 'editor@test.kaeri.dev', name: 'Test Editor' },
  viewer: { email: 'viewer@test.kaeri.dev', name: 'Test Viewer' },
};

// Deterministic workspace
const testWorkspace = {
  name: 'Integration Test Workspace',
  description: 'For automated testing',
};
```
