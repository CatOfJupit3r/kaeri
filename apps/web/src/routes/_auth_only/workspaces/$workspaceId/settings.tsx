import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { LuArrowLeft, LuTrash2 } from 'react-icons/lu';
import z from 'zod';

import { WORKSPACE_ROLES } from '@kaeri/shared';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@~/components/ui/alert-dialog';
import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@~/components/ui/card';
import { useAppForm } from '@~/components/ui/field';
import { Separator } from '@~/components/ui/separator';
import { useDeleteWorkspace } from '@~/hooks/mutations/use-delete-workspace';
import { useUpdateWorkspace } from '@~/hooks/mutations/use-update-workspace';
import { useWorkspace, workspaceQueryOptions } from '@~/hooks/queries/use-workspace';

export const Route = createFileRoute('/_auth_only/workspaces/$workspaceId/settings')({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(workspaceQueryOptions(params.workspaceId));
  },
  component: WorkspaceSettings,
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less'),
});

function WorkspaceSettings() {
  const navigate = useNavigate();
  const { workspaceId } = Route.useParams();
  const { data: workspace, isPending: isLoadingWorkspace } = useWorkspace(workspaceId);
  const { updateWorkspace, isPending: isUpdating } = useUpdateWorkspace();
  const { deleteWorkspace, isPending: isDeleting } = useDeleteWorkspace();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useAppForm({
    defaultValues: {
      name: workspace?.name ?? '',
      description: workspace?.description ?? '',
    },
    onSubmit: async ({ value }) => {
      updateWorkspace({
        workspaceId,
        patch: {
          name: value.name,
          description: value.description || undefined,
        },
      });
    },
    validators: {
      onSubmit: updateWorkspaceSchema,
    },
  });

  const handleDelete = () => {
    deleteWorkspace(
      { workspaceId },
      {
        onSuccess: () => {
          void navigate({ to: '/workspaces' });
        },
      },
    );
  };

  if (isLoadingWorkspace || !workspace) {
    return (
      <div className="container mx-auto max-w-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-64 rounded bg-muted" />
        </div>
      </div>
    );
  }

  const isOwner = workspace.membership.role === WORKSPACE_ROLES.OWNER;
  const isAdmin = workspace.membership.role === WORKSPACE_ROLES.ADMIN;
  const canEdit = isOwner || isAdmin;

  if (!canEdit) {
    return (
      <div className="container mx-auto max-w-2xl p-6">
        <p className="text-destructive">You don not have permission to access workspace settings.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/workspaces/$workspaceId" params={{ workspaceId }}>
            <LuArrowLeft className="mr-2 h-4 w-4" />
            Back to Workspace
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-6">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/workspaces/$workspaceId" params={{ workspaceId }}>
            <LuArrowLeft className="mr-2 h-4 w-4" />
            Back to Workspace
          </Link>
        </Button>

        <h1 className="text-3xl font-bold">Workspace Settings</h1>
        <p className="text-muted-foreground">Manage your workspace configuration</p>
      </div>

      {/* General Settings */}
      <form.AppForm>
        <Card className="mb-8">
          <form.Form className="space-y-0">
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>Update your workspace name and description</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form.AppField name="name" validators={{ onChange: updateWorkspaceSchema.shape.name }}>
                {(field) => <field.TextField label="Name" />}
              </form.AppField>

              <form.AppField name="description" validators={{ onChange: updateWorkspaceSchema.shape.description }}>
                {(field) => (
                  <field.TextareaField label="Description" placeholder="A brief description of your workspace..." />
                )}
              </form.AppField>
            </CardContent>

            <CardFooter>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form.Form>
        </Card>
      </form.AppForm>

      {/* Danger Zone */}
      {isOwner && !workspace.isPersonal ? (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>

          <CardContent>
            <Separator className="mb-4" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Workspace</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this workspace. This action cannot be undone.
                </p>
              </div>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <LuTrash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{workspace.name}</strong>? This will remove all members and cannot
              be undone. Any series in this workspace must be transferred first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Workspace'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
