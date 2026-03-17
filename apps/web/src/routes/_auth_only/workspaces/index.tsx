import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { LuPlus } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { CreateWorkspaceDialog } from '@~/components/workspaces/create-workspace-dialog';
import { WorkspaceCard } from '@~/components/workspaces/workspace-card';
import { useWorkspaces, workspacesListQueryOptions } from '@~/hooks/queries/use-workspaces';

export const Route = createFileRoute('/_auth_only/workspaces/')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(workspacesListQueryOptions());
  },
  component: WorkspacesPage,
});

function WorkspacesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data, isPending, error } = useWorkspaces();

  if (isPending) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* eslint-disable react/no-array-index-key */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg border-2 border-muted bg-muted" />
          ))}
          {/* eslint-enable react/no-array-index-key */}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-destructive">Failed to load workspaces: {error.message}</div>
      </div>
    );
  }

  const workspaces = data?.workspaces ?? [];
  const personalWorkspace = workspaces.find((w) => w.isPersonal);
  const teamWorkspaces = workspaces.filter((w) => !w.isPersonal);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workspaces</h1>
          <p className="text-muted-foreground">Manage your personal and team workspaces</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <LuPlus className="mr-2 h-4 w-4" />
          New Workspace
        </Button>
      </div>

      {personalWorkspace ? (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Personal Workspace</h2>
          <div className="max-w-md">
            <WorkspaceCard workspace={personalWorkspace} />
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-xl font-semibold">Team Workspaces</h2>
        {teamWorkspaces.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
            <h3 className="mb-2 text-lg font-medium">No team workspaces yet</h3>
            <p className="mb-4 text-muted-foreground">
              Create a workspace to collaborate with your team on scripts and projects.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <LuPlus className="mr-2 h-4 w-4" />
              Create Workspace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teamWorkspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace._id}
                workspace={workspace}
                onSettings={() => {
                  // Navigate to settings
                }}
              />
            ))}
          </div>
        )}
      </section>

      <CreateWorkspaceDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}
