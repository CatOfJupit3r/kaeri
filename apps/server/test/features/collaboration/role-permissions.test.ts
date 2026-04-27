import { call } from '@orpc/server';
import { describe, expect, it } from 'vitest';

import { WORKSPACE_ROLES } from '@kaeri/shared';

import { WorkspaceMemberModel } from '@~/db/models/workspace-member.model';

import { appRouter } from '../../helpers/instance';
import { createUser, expectErrorCode } from '../../helpers/utilities';

describe('Role Permissions', () => {
  describe('role hierarchy', () => {
    it('owner should be able to update admin to editor', async () => {
      const { ctx: ownerCtx } = await createUser();
      const { user: admin } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Hierarchy Test' }, ownerCtx());

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: admin.id,
        role: WORKSPACE_ROLES.ADMIN,
        joinedAt: new Date(),
      });

      const updated = await call(
        appRouter.workspaceMember.updateMemberRole,
        { workspaceId: workspace._id, userId: admin.id, newRole: WORKSPACE_ROLES.EDITOR },
        ownerCtx(),
      );

      expect(updated.role).toBe(WORKSPACE_ROLES.EDITOR);
    });

    it('admin should be able to update editor to viewer', async () => {
      const { ctx: ownerCtx } = await createUser();
      const { ctx: adminCtx, user: admin } = await createUser();
      const { user: editor } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Admin Update Test' }, ownerCtx());

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: admin.id,
        role: WORKSPACE_ROLES.ADMIN,
        joinedAt: new Date(),
      });

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: editor.id,
        role: WORKSPACE_ROLES.EDITOR,
        joinedAt: new Date(),
      });

      const updated = await call(
        appRouter.workspaceMember.updateMemberRole,
        { workspaceId: workspace._id, userId: editor.id, newRole: WORKSPACE_ROLES.VIEWER },
        adminCtx(),
      );

      expect(updated.role).toBe(WORKSPACE_ROLES.VIEWER);
    });

    it('admin should NOT be able to update owner', async () => {
      const { ctx: ownerCtx, user: owner } = await createUser();
      const { ctx: adminCtx, user: admin } = await createUser();

      const workspace = await call(
        appRouter.workspace.createWorkspace,
        { name: 'Admin Cannot Update Owner' },
        ownerCtx(),
      );

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: admin.id,
        role: WORKSPACE_ROLES.ADMIN,
        joinedAt: new Date(),
      });

      // Admin trying to demote owner should fail
      await expectErrorCode(
        () =>
          call(
            appRouter.workspaceMember.updateMemberRole,
            { workspaceId: workspace._id, userId: owner.id, newRole: WORKSPACE_ROLES.ADMIN },
            adminCtx(),
          ),
        'FORBIDDEN',
      );
    });

    it('admin should NOT be able to update another admin', async () => {
      const { ctx: ownerCtx } = await createUser();
      const { ctx: admin1Ctx, user: admin1 } = await createUser();
      const { user: admin2 } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Admin vs Admin' }, ownerCtx());

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: admin1.id,
        role: WORKSPACE_ROLES.ADMIN,
        joinedAt: new Date(),
      });

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: admin2.id,
        role: WORKSPACE_ROLES.ADMIN,
        joinedAt: new Date(),
      });

      // Admin1 trying to demote Admin2 should fail (same level)
      await expectErrorCode(
        () =>
          call(
            appRouter.workspaceMember.updateMemberRole,
            { workspaceId: workspace._id, userId: admin2.id, newRole: WORKSPACE_ROLES.EDITOR },
            admin1Ctx(),
          ),
        'FORBIDDEN',
      );
    });

    it('editor should NOT be able to update any roles', async () => {
      const { ctx: ownerCtx } = await createUser();
      const { ctx: editorCtx, user: editor } = await createUser();
      const { user: viewer } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Editor Cannot Update' }, ownerCtx());

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: editor.id,
        role: WORKSPACE_ROLES.EDITOR,
        joinedAt: new Date(),
      });

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: viewer.id,
        role: WORKSPACE_ROLES.VIEWER,
        joinedAt: new Date(),
      });

      await expectErrorCode(
        () =>
          call(
            appRouter.workspaceMember.updateMemberRole,
            { workspaceId: workspace._id, userId: viewer.id, newRole: WORKSPACE_ROLES.EDITOR },
            editorCtx(),
          ),
        'FORBIDDEN',
      );
    });
  });

  describe('removeMember', () => {
    it('owner should be able to remove admin', async () => {
      const { ctx: ownerCtx } = await createUser();
      const { user: admin } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Remove Admin Test' }, ownerCtx());

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: admin.id,
        role: WORKSPACE_ROLES.ADMIN,
        joinedAt: new Date(),
      });

      const result = await call(
        appRouter.workspaceMember.removeMember,
        { workspaceId: workspace._id, userId: admin.id },
        ownerCtx(),
      );

      expect(result.success).toBe(true);

      const membership = await WorkspaceMemberModel.findOne({
        workspaceId: workspace._id,
        userId: admin.id,
      });
      expect(membership).toBeNull();
    });

    it('admin should NOT be able to remove owner', async () => {
      const { ctx: ownerCtx, user: owner } = await createUser();
      const { ctx: adminCtx, user: admin } = await createUser();

      const workspace = await call(
        appRouter.workspace.createWorkspace,
        { name: 'Admin Cannot Remove Owner' },
        ownerCtx(),
      );

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: admin.id,
        role: WORKSPACE_ROLES.ADMIN,
        joinedAt: new Date(),
      });

      await expectErrorCode(
        () =>
          call(appRouter.workspaceMember.removeMember, { workspaceId: workspace._id, userId: owner.id }, adminCtx()),
        'FORBIDDEN',
      );
    });

    it('editor should NOT be able to remove anyone', async () => {
      const { ctx: ownerCtx } = await createUser();
      const { ctx: editorCtx, user: editor } = await createUser();
      const { user: viewer } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Editor Cannot Remove' }, ownerCtx());

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: editor.id,
        role: WORKSPACE_ROLES.EDITOR,
        joinedAt: new Date(),
      });

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: viewer.id,
        role: WORKSPACE_ROLES.VIEWER,
        joinedAt: new Date(),
      });

      await expectErrorCode(
        () =>
          call(appRouter.workspaceMember.removeMember, { workspaceId: workspace._id, userId: viewer.id }, editorCtx()),
        'FORBIDDEN',
      );
    });
  });

  describe('leaveWorkspace', () => {
    it('member should be able to leave workspace', async () => {
      const { ctx: ownerCtx } = await createUser();
      const { ctx: editorCtx, user: editor } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Leave Test' }, ownerCtx());

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: editor.id,
        role: WORKSPACE_ROLES.EDITOR,
        joinedAt: new Date(),
      });

      const result = await call(appRouter.workspaceMember.leaveWorkspace, { workspaceId: workspace._id }, editorCtx());

      expect(result.success).toBe(true);

      const membership = await WorkspaceMemberModel.findOne({
        workspaceId: workspace._id,
        userId: editor.id,
      });
      expect(membership).toBeNull();
    });

    it('owner should NOT be able to leave workspace', async () => {
      const { ctx: ownerCtx } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Owner Cannot Leave' }, ownerCtx());

      await expectErrorCode(
        () => call(appRouter.workspaceMember.leaveWorkspace, { workspaceId: workspace._id }, ownerCtx()),
        'BAD_REQUEST',
      );
    });
  });

  describe('listMembers', () => {
    it('member should be able to list workspace members', async () => {
      const { ctx: ownerCtx, user: owner } = await createUser();
      const { ctx: editorCtx, user: editor } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'List Members Test' }, ownerCtx());

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: editor.id,
        role: WORKSPACE_ROLES.EDITOR,
        joinedAt: new Date(),
      });

      const result = await call(appRouter.workspaceMember.listMembers, { workspaceId: workspace._id }, editorCtx());

      expect(result.members.length).toBe(2);
      expect(result.total).toBe(2);
      expect(result.members.some((m) => m.userId === owner.id)).toBe(true);
      expect(result.members.some((m) => m.userId === editor.id)).toBe(true);
    });

    it('non-member should get NOT_FOUND for listMembers', async () => {
      const { ctx: ownerCtx } = await createUser();
      const { ctx: nonMemberCtx } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Non-Member List Test' }, ownerCtx());

      // NOT_FOUND because user shouldn't know workspace exists
      await expectErrorCode(
        () => call(appRouter.workspaceMember.listMembers, { workspaceId: workspace._id }, nonMemberCtx()),
        'NOT_FOUND',
      );
    });
  });

  describe('NOT_FOUND stance', () => {
    it('should return NOT_FOUND for non-member attempting to update role', async () => {
      const { ctx: ownerCtx } = await createUser();
      const { ctx: nonMemberCtx } = await createUser();
      const { user: editor } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'NOT_FOUND Stance Test' }, ownerCtx());

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: editor.id,
        role: WORKSPACE_ROLES.EDITOR,
        joinedAt: new Date(),
      });

      // Non-member should get NOT_FOUND, not FORBIDDEN
      await expectErrorCode(
        () =>
          call(
            appRouter.workspaceMember.updateMemberRole,
            { workspaceId: workspace._id, userId: editor.id, newRole: WORKSPACE_ROLES.VIEWER },
            nonMemberCtx(),
          ),
        'NOT_FOUND',
      );
    });

    it('should return NOT_FOUND for non-member attempting to remove member', async () => {
      const { ctx: ownerCtx } = await createUser();
      const { ctx: nonMemberCtx } = await createUser();
      const { user: editor } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'NOT_FOUND Remove Test' }, ownerCtx());

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: editor.id,
        role: WORKSPACE_ROLES.EDITOR,
        joinedAt: new Date(),
      });

      await expectErrorCode(
        () =>
          call(
            appRouter.workspaceMember.removeMember,
            { workspaceId: workspace._id, userId: editor.id },
            nonMemberCtx(),
          ),
        'NOT_FOUND',
      );
    });
  });
});
