import { call } from '@orpc/server';
import { describe, expect, it } from 'bun:test';

import { INVITATION_STATUS, WORKSPACE_ROLES } from '@kaeri/shared';

import { InvitationModel } from '@~/db/models/invitation.model';
import { WorkspaceMemberModel } from '@~/db/models/workspace-member.model';

import { appRouter } from '../../helpers/instance';
import { createUser, expectErrorCode } from '../../helpers/utilities';

describe('Invitation Flow', () => {
  describe('createInvitation', () => {
    it('should create invitation for valid email', async () => {
      const { ctx } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Invite Test' }, ctx());

      const invitation = await call(
        appRouter.invitation.createInvitation,
        {
          workspaceId: workspace._id,
          email: 'newmember@example.com',
          role: WORKSPACE_ROLES.EDITOR,
        },
        ctx(),
      );

      expect(invitation).toBeDefined();
      expect(invitation._id).toBeDefined();
      expect(invitation.code).toBeDefined();
      expect(invitation.invitedEmail).toBe('newmember@example.com');
      expect(invitation.role).toBe(WORKSPACE_ROLES.EDITOR);
      expect(invitation.status).toBe(INVITATION_STATUS.PENDING);
    });

    it('should not allow inviting with invalid role', async () => {
      const { ctx } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Owner Invite Test' }, ctx());

      // OWNER is not a valid invitable role - this should fail at the schema level
      await expectErrorCode(
        () =>
          call(
            appRouter.invitation.createInvitation,
            {
              workspaceId: workspace._id,
              email: 'newowner@example.com',
              // @ts-expect-error - Testing invalid role
              role: WORKSPACE_ROLES.OWNER,
            },
            ctx(),
          ),
        'BAD_REQUEST',
      );
    });

    it('should not allow non-admin to create invitation', async () => {
      const { ctx: ownerCtx } = await createUser();
      const { ctx: editorCtx, user: editor } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Editor Invite Test' }, ownerCtx());

      // Add editor to workspace
      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: editor.id,
        role: WORKSPACE_ROLES.EDITOR,
        joinedAt: new Date(),
      });

      await expectErrorCode(
        () =>
          call(
            appRouter.invitation.createInvitation,
            {
              workspaceId: workspace._id,
              email: 'another@example.com',
            },
            editorCtx(),
          ),
        'FORBIDDEN',
      );
    });

    it('should allow admin to create invitation', async () => {
      const { ctx: ownerCtx } = await createUser();
      const { ctx: adminCtx, user: admin } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Admin Invite Test' }, ownerCtx());

      // Add admin to workspace
      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: admin.id,
        role: WORKSPACE_ROLES.ADMIN,
        joinedAt: new Date(),
      });

      const invitation = await call(
        appRouter.invitation.createInvitation,
        {
          workspaceId: workspace._id,
          email: 'fromadmin@example.com',
        },
        adminCtx(),
      );

      expect(invitation).toBeDefined();
      expect(invitation.invitedEmail).toBe('fromadmin@example.com');
    });
  });

  describe('getInvitationByCode', () => {
    it('should return invitation details by code', async () => {
      const { ctx } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Code Test' }, ctx());

      const invitation = await call(
        appRouter.invitation.createInvitation,
        {
          workspaceId: workspace._id,
          email: 'bycode@example.com',
          role: WORKSPACE_ROLES.VIEWER,
        },
        ctx(),
      );

      // Anyone with the code can view it
      const { ctx: inviteeCtx } = await createUser({
        email: 'bycode@example.com',
        name: 'Invitee',
        password: 'test123',
      });

      const fetched = await call(appRouter.invitation.getInvitationByCode, { code: invitation.code }, inviteeCtx());

      expect(fetched.workspaceName).toBe('Code Test');
      expect(fetched.role).toBe(WORKSPACE_ROLES.VIEWER);
      expect(fetched.isExpired).toBe(false);
    });

    it('should return NOT_FOUND for invalid code', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.invitation.getInvitationByCode, { code: 'invalid-code' }, ctx()),
        'NOT_FOUND',
      );
    });
  });

  describe('acceptInvitation', () => {
    it('should add user to workspace on accept', async () => {
      const { ctx: ownerCtx } = await createUser();
      const inviteeEmail = `accept-test-${Date.now()}@example.com`;

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Accept Test' }, ownerCtx());

      const invitation = await call(
        appRouter.invitation.createInvitation,
        {
          workspaceId: workspace._id,
          email: inviteeEmail,
          role: WORKSPACE_ROLES.EDITOR,
        },
        ownerCtx(),
      );

      // Create user with matching email
      const { ctx: inviteeCtx, user: invitee } = await createUser({
        email: inviteeEmail,
        name: 'Invitee',
        password: 'test123',
      });

      const result = await call(appRouter.invitation.acceptInvitation, { code: invitation.code }, inviteeCtx());

      expect(result.success).toBe(true);
      expect(result.workspaceId).toBe(workspace._id);
      expect(result.role).toBe(WORKSPACE_ROLES.EDITOR);

      // Verify membership
      const membership = await WorkspaceMemberModel.findOne({
        workspaceId: workspace._id,
        userId: invitee.id,
      });
      expect(membership).toBeDefined();
      expect(membership?.role).toBe(WORKSPACE_ROLES.EDITOR);
    });

    it('should update invitation status to ACCEPTED', async () => {
      const { ctx: ownerCtx } = await createUser();
      const inviteeEmail = `status-test-${Date.now()}@example.com`;

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Status Test' }, ownerCtx());

      const invitation = await call(
        appRouter.invitation.createInvitation,
        {
          workspaceId: workspace._id,
          email: inviteeEmail,
        },
        ownerCtx(),
      );

      const { ctx: inviteeCtx } = await createUser({
        email: inviteeEmail,
        name: 'Invitee',
        password: 'test123',
      });

      await call(appRouter.invitation.acceptInvitation, { code: invitation.code }, inviteeCtx());

      const updated = await InvitationModel.findById(invitation._id);
      expect(updated?.status).toBe(INVITATION_STATUS.ACCEPTED);
    });

    it('should fail if email does not match', async () => {
      const { ctx: ownerCtx } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Email Mismatch Test' }, ownerCtx());

      const invitation = await call(
        appRouter.invitation.createInvitation,
        {
          workspaceId: workspace._id,
          email: 'invited@example.com',
        },
        ownerCtx(),
      );

      // Different user tries to accept
      const { ctx: wrongUserCtx } = await createUser({
        email: 'wrong@example.com',
        name: 'Wrong User',
        password: 'test123',
      });

      await expectErrorCode(
        () => call(appRouter.invitation.acceptInvitation, { code: invitation.code }, wrongUserCtx()),
        'FORBIDDEN',
      );
    });
  });

  describe('declineInvitation', () => {
    it('should decline invitation', async () => {
      const { ctx: ownerCtx } = await createUser();
      const inviteeEmail = `decline-test-${Date.now()}@example.com`;

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Decline Test' }, ownerCtx());

      const invitation = await call(
        appRouter.invitation.createInvitation,
        {
          workspaceId: workspace._id,
          email: inviteeEmail,
        },
        ownerCtx(),
      );

      const { ctx: inviteeCtx } = await createUser({
        email: inviteeEmail,
        name: 'Decliner',
        password: 'test123',
      });

      const result = await call(appRouter.invitation.declineInvitation, { code: invitation.code }, inviteeCtx());

      expect(result.success).toBe(true);

      const updated = await InvitationModel.findById(invitation._id);
      expect(updated?.status).toBe(INVITATION_STATUS.DECLINED);
    });
  });

  describe('revokeInvitation', () => {
    it('should revoke pending invitation', async () => {
      const { ctx } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Revoke Test' }, ctx());

      const invitation = await call(
        appRouter.invitation.createInvitation,
        {
          workspaceId: workspace._id,
          email: 'torevoke@example.com',
        },
        ctx(),
      );

      const result = await call(
        appRouter.invitation.revokeInvitation,
        { workspaceId: workspace._id, invitationId: invitation._id },
        ctx(),
      );

      expect(result.success).toBe(true);

      const deleted = await InvitationModel.findById(invitation._id);
      expect(deleted).toBeNull();
    });

    it('should not allow non-admin to revoke', async () => {
      const { ctx: ownerCtx } = await createUser();
      const { ctx: editorCtx, user: editor } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Revoke Permission Test' }, ownerCtx());

      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: editor.id,
        role: WORKSPACE_ROLES.EDITOR,
        joinedAt: new Date(),
      });

      const invitation = await call(
        appRouter.invitation.createInvitation,
        {
          workspaceId: workspace._id,
          email: 'torevoke@example.com',
        },
        ownerCtx(),
      );

      await expectErrorCode(
        () =>
          call(
            appRouter.invitation.revokeInvitation,
            { workspaceId: workspace._id, invitationId: invitation._id },
            editorCtx(),
          ),
        'FORBIDDEN',
      );
    });
  });

  describe('listInvitations', () => {
    it('should list workspace invitations', async () => {
      const { ctx } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'List Test' }, ctx());

      await call(
        appRouter.invitation.createInvitation,
        { workspaceId: workspace._id, email: 'list1@example.com' },
        ctx(),
      );
      await call(
        appRouter.invitation.createInvitation,
        { workspaceId: workspace._id, email: 'list2@example.com' },
        ctx(),
      );

      const result = await call(appRouter.invitation.listInvitations, { workspaceId: workspace._id }, ctx());

      expect(result.invitations.length).toBe(2);
      expect(result.total).toBe(2);
    });
  });
});
