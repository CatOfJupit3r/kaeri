import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { LuActivity, LuArrowLeft, LuSettings, LuUserPlus, LuUsers } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@~/components/ui/tabs';
import { ActivityFeed } from '@~/components/workspaces/activity-feed';
import { InviteDialog } from '@~/components/workspaces/invite-dialog';
import { MemberList } from '@~/components/workspaces/member-list';
import { useWorkspace, workspaceQueryOptions } from '@~/hooks/queries/use-workspace';
import { workspaceActivityQueryOptions } from '@~/hooks/queries/use-workspace-activity';

export const Route = createFileRoute('/_auth_only/workspaces/$workspaceId/')({
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(workspaceQueryOptions(params.workspaceId)),
      context.queryClient.ensureQueryData(workspaceActivityQueryOptions(params.workspaceId)),
    ]);
  },
  component: WorkspaceDashboard,
});

function WorkspaceDashboard() {
  const { workspaceId } = Route.useParams();
  const { data: workspace, isPending, error } = useWorkspace(workspaceId);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  if (isPending) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-96 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-destructive">Failed to load workspace: {error?.message ?? 'Not found'}</div>
      </div>
    );
  }

  const isOwnerOrAdmin = workspace.membership.role === 'OWNER' || workspace.membership.role === 'ADMIN';

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/workspaces">
              <LuArrowLeft className="mr-2 h-4 w-4" />
              Back to Workspaces
            </Link>
          </Button>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{workspace.name}</h1>
            {workspace.description ? <p className="mt-1 text-muted-foreground">{workspace.description}</p> : null}
          </div>

          {isOwnerOrAdmin ? (
            <Button variant="outline" asChild>
              <Link to="/workspaces/$workspaceId/settings" params={{ workspaceId }}>
                <LuSettings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <LuUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspace.memberCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspace.membership.role}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Joined</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(workspace.membership.joinedAt).toLocaleDateString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">
            <LuActivity className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="members">
            <LuUsers className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-4">
          <ActivityFeed workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          {isOwnerOrAdmin ? (
            <div className="mb-4 flex justify-end">
              <Button onClick={() => setIsInviteDialogOpen(true)}>
                <LuUserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </div>
          ) : null}
          <MemberList workspaceId={workspaceId} currentUserRole={workspace.membership.role} />
        </TabsContent>
      </Tabs>

      <InviteDialog
        workspaceId={workspaceId}
        workspaceName={workspace.name}
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />
    </div>
  );
}
