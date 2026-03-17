import { call } from '@orpc/server';
import { describe, expect, it } from 'bun:test';

import { WORKSPACE_ROLES } from '@kaeri/shared';

import { WorkspaceMemberModel } from '@~/db/models/workspace-member.model';
import { WorkspaceModel } from '@~/db/models/workspace.model';

import { appRouter } from '../../helpers/instance';
import { createUser, expectErrorCode } from '../../helpers/utilities';

describe('Workspace CRUD', () => {
  describe('createWorkspace', () => {
    it('should create a team workspace with name', async () => {
      const { ctx } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'My Team Workspace' }, ctx());

      expect(workspace).toBeDefined();
      expect(workspace._id).toBeDefined();
      expect(workspace.name).toBe('My Team Workspace');
      expect(workspace.isPersonal).toBe(false);
    });

    it('should create workspace with description', async () => {
      const { ctx } = await createUser();

      const workspace = await call(
        appRouter.workspace.createWorkspace,
        { name: 'Team Space', description: 'A workspace for collaboration' },
        ctx(),
      );

      expect(workspace.description).toBe('A workspace for collaboration');
    });

    it('should add creator as owner', async () => {
      const { ctx, user } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Owner Test' }, ctx());

      const membership = await WorkspaceMemberModel.findOne({
        workspaceId: workspace._id,
        userId: user.id,
      });

      expect(membership).toBeDefined();
      expect(membership?.role).toBe(WORKSPACE_ROLES.OWNER);
    });

    it('should fail with empty name', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(() => call(appRouter.workspace.createWorkspace, { name: '' }, ctx()), 'BAD_REQUEST');
    });
  });

  describe('getWorkspace', () => {
    it('should get workspace by ID', async () => {
      const { ctx } = await createUser();

      const created = await call(appRouter.workspace.createWorkspace, { name: 'Get Test' }, ctx());

      const fetched = await call(appRouter.workspace.getWorkspace, { workspaceId: created._id }, ctx());

      expect(fetched._id).toBe(created._id);
      expect(fetched.name).toBe('Get Test');
      expect(fetched.membership.role).toBe(WORKSPACE_ROLES.OWNER);
    });

    it('should return NOT_FOUND for non-existent workspace', async () => {
      const { ctx } = await createUser();

      await expectErrorCode(
        () => call(appRouter.workspace.getWorkspace, { workspaceId: '507f1f77bcf86cd799439011' }, ctx()),
        'NOT_FOUND',
      );
    });

    it('should return NOT_FOUND for workspace user is not member of', async () => {
      const { ctx: userACtx } = await createUser();
      const { ctx: userBCtx } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Private Workspace' }, userACtx());

      await expectErrorCode(
        () => call(appRouter.workspace.getWorkspace, { workspaceId: workspace._id }, userBCtx()),
        'NOT_FOUND',
      );
    });
  });

  describe('listWorkspaces', () => {
    it('should list user workspaces including personal workspace', async () => {
      const { ctx } = await createUser();

      // Create a team workspace
      await call(appRouter.workspace.createWorkspace, { name: 'Team One' }, ctx());
      await call(appRouter.workspace.createWorkspace, { name: 'Team Two' }, ctx());

      const result = await call(appRouter.workspace.listWorkspaces, {}, ctx());

      // Should include personal workspace + 2 team workspaces
      expect(result.workspaces.length).toBeGreaterThanOrEqual(3);
      expect(result.workspaces.some((w) => w.isPersonal)).toBe(true);
      expect(result.workspaces.some((w) => w.name === 'Team One')).toBe(true);
      expect(result.workspaces.some((w) => w.name === 'Team Two')).toBe(true);
    });

    it('should only list workspaces user is member of', async () => {
      const { ctx: userACtx } = await createUser();
      const { ctx: userBCtx } = await createUser();

      // User A creates a workspace
      await call(appRouter.workspace.createWorkspace, { name: 'Only A' }, userACtx());

      // User B lists workspaces
      const result = await call(appRouter.workspace.listWorkspaces, {}, userBCtx());

      expect(result.workspaces.every((w) => w.name !== 'Only A')).toBe(true);
    });
  });

  describe('updateWorkspace', () => {
    it('should update workspace name', async () => {
      const { ctx } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Original Name' }, ctx());

      const updated = await call(
        appRouter.workspace.updateWorkspace,
        { workspaceId: workspace._id, patch: { name: 'New Name' } },
        ctx(),
      );

      expect(updated.name).toBe('New Name');
    });

    it('should update workspace description', async () => {
      const { ctx } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'Desc Test' }, ctx());

      const updated = await call(
        appRouter.workspace.updateWorkspace,
        { workspaceId: workspace._id, patch: { description: 'New description' } },
        ctx(),
      );

      expect(updated.description).toBe('New description');
    });

    it('should fail to update non-member workspace', async () => {
      const { ctx: userACtx } = await createUser();
      const { ctx: userBCtx } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'A Only' }, userACtx());

      await expectErrorCode(
        () =>
          call(
            appRouter.workspace.updateWorkspace,
            { workspaceId: workspace._id, patch: { name: 'Hacked' } },
            userBCtx(),
          ),
        'NOT_FOUND',
      );
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete empty team workspace', async () => {
      const { ctx } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'To Delete' }, ctx());

      await call(appRouter.workspace.deleteWorkspace, { workspaceId: workspace._id }, ctx());

      const deleted = await WorkspaceModel.findById(workspace._id);
      expect(deleted).toBeNull();
    });

    it('should delete workspace membership on deletion', async () => {
      const { ctx, user } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'To Delete' }, ctx());

      await call(appRouter.workspace.deleteWorkspace, { workspaceId: workspace._id }, ctx());

      const membership = await WorkspaceMemberModel.findOne({
        workspaceId: workspace._id,
        userId: user.id,
      });
      expect(membership).toBeNull();
    });

    it('should not delete personal workspace', async () => {
      const { ctx } = await createUser();

      // Get personal workspace
      const result = await call(appRouter.workspace.listWorkspaces, {}, ctx());
      const personal = result.workspaces.find((w) => w.isPersonal);

      expect(personal).toBeDefined();

      await expectErrorCode(
        () => call(appRouter.workspace.deleteWorkspace, { workspaceId: personal!._id }, ctx()),
        'BAD_REQUEST',
      );
    });

    it('should not allow non-owner to delete workspace', async () => {
      const { ctx: ownerCtx } = await createUser();
      const { ctx: memberCtx, user: member } = await createUser();

      const workspace = await call(appRouter.workspace.createWorkspace, { name: 'To Delete' }, ownerCtx());

      // Add member as EDITOR
      await WorkspaceMemberModel.create({
        workspaceId: workspace._id,
        userId: member.id,
        role: WORKSPACE_ROLES.EDITOR,
        joinedAt: new Date(),
      });

      await expectErrorCode(
        () => call(appRouter.workspace.deleteWorkspace, { workspaceId: workspace._id }, memberCtx()),
        'FORBIDDEN',
      );
    });
  });

  describe('personal workspace creation', () => {
    it('should create personal workspace on user signup', async () => {
      const { ctx, user } = await createUser();

      const result = await call(appRouter.workspace.listWorkspaces, {}, ctx());
      const personal = result.workspaces.find((w) => w.isPersonal);

      expect(personal).toBeDefined();
      expect(personal?.name).toContain(user.name);
    });
  });
});
