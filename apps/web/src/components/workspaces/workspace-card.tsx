import { Link } from '@tanstack/react-router';
import { LuCrown, LuSettings, LuUsers } from 'react-icons/lu';

import { WORKSPACE_ROLES } from '@kaeri/shared';
import type { WorkspaceRole } from '@kaeri/shared';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@~/components/ui/card';
import type { WorkspaceWithMembership } from '@~/hooks/queries/use-workspaces';

interface iWorkspaceCardProps {
  workspace: WorkspaceWithMembership;
  onSettings?: () => void;
}

const roleBadgeVariant: Record<WorkspaceRole, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  [WORKSPACE_ROLES.OWNER]: 'default',
  [WORKSPACE_ROLES.ADMIN]: 'secondary',
  [WORKSPACE_ROLES.EDITOR]: 'outline',
  [WORKSPACE_ROLES.VIEWER]: 'outline',
};

export function WorkspaceCard({ workspace, onSettings }: iWorkspaceCardProps) {
  const isOwner = workspace.membership.role === WORKSPACE_ROLES.OWNER;
  const isAdmin = workspace.membership.role === WORKSPACE_ROLES.ADMIN;
  const canManage = isOwner || isAdmin;

  return (
    <Card className="group relative">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              {workspace.name}
              {workspace.isPersonal ? <LuCrown className="h-4 w-4 text-amber-500" /> : null}
            </CardTitle>
          </div>
          <Badge variant={roleBadgeVariant[workspace.membership.role]}>{workspace.membership.role}</Badge>
        </div>
        {workspace.description ? <CardDescription>{workspace.description}</CardDescription> : null}
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LuUsers className="h-4 w-4" />
          <span>
            {workspace.memberCount} {workspace.memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/workspaces/$workspaceId" params={{ workspaceId: workspace._id }}>
            Open
          </Link>
        </Button>

        {canManage && onSettings ? (
          <Button variant="ghost" size="sm" onClick={onSettings}>
            <LuSettings className="h-4 w-4" />
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
