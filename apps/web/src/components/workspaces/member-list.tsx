import { useState } from 'react';
import { LuCrown, LuEllipsisVertical, LuShield, LuUserMinus } from 'react-icons/lu';

import { ROLE_HIERARCHY, WORKSPACE_ROLES } from '@kaeri/shared';
import type { WorkspaceRole } from '@kaeri/shared';

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
import { Avatar, AvatarFallback, AvatarImage } from '@~/components/ui/avatar';
import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@~/components/ui/dropdown-menu';
import { useRemoveMember, useUpdateMemberRole } from '@~/hooks/mutations/use-workspace-members';
import { useWorkspaceMembers } from '@~/hooks/queries/use-workspace-members';
import type { WorkspaceMember } from '@~/hooks/queries/use-workspace-members';

interface iMemberListProps {
  workspaceId: string;
  currentUserRole: WorkspaceRole;
}

const roleBadgeVariant: Record<WorkspaceRole, 'default' | 'secondary' | 'outline'> = {
  [WORKSPACE_ROLES.OWNER]: 'default',
  [WORKSPACE_ROLES.ADMIN]: 'secondary',
  [WORKSPACE_ROLES.EDITOR]: 'outline',
  [WORKSPACE_ROLES.VIEWER]: 'outline',
};

const assignableRoles: Exclude<WorkspaceRole, 'OWNER'>[] = [
  WORKSPACE_ROLES.ADMIN,
  WORKSPACE_ROLES.EDITOR,
  WORKSPACE_ROLES.VIEWER,
];

export function MemberList({ workspaceId, currentUserRole }: iMemberListProps) {
  const { data, isPending, error } = useWorkspaceMembers(workspaceId);
  const [removingMember, setRemovingMember] = useState<WorkspaceMember | null>(null);

  const canManageMembers = currentUserRole === WORKSPACE_ROLES.OWNER || currentUserRole === WORKSPACE_ROLES.ADMIN;

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* eslint-disable react/no-array-index-key */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
            {/* eslint-enable react/no-array-index-key */}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load members: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const members = data?.members ?? [];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Members ({data?.total ?? 0})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <MemberItem
                key={member._id}
                member={member}
                workspaceId={workspaceId}
                currentUserRole={currentUserRole}
                canManage={Boolean(canManageMembers && ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[member.role])}
                onRemove={() => setRemovingMember(member)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <RemoveMemberDialog member={removingMember} workspaceId={workspaceId} onClose={() => setRemovingMember(null)} />
    </>
  );
}

interface iMemberItemProps {
  member: WorkspaceMember;
  workspaceId: string;
  currentUserRole: WorkspaceRole;
  canManage: boolean;
  onRemove: () => void;
}

function MemberItem({ member, workspaceId, currentUserRole: _currentUserRole, canManage, onRemove }: iMemberItemProps) {
  const { updateMemberRole, isPending } = useUpdateMemberRole();
  const isOwner = member.role === WORKSPACE_ROLES.OWNER;

  const handleRoleChange = (newRole: Exclude<WorkspaceRole, 'OWNER'>) => {
    updateMemberRole({ workspaceId, userId: member.userId, newRole });
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={member.user?.image} />
        <AvatarFallback>{member.user?.name?.charAt(0).toUpperCase() ?? '?'}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{member.user?.name ?? 'Unknown'}</span>
          {isOwner ? <LuCrown className="h-4 w-4 text-amber-500" /> : null}
        </div>
        <p className="text-sm text-muted-foreground">{member.user?.email}</p>
      </div>

      <Badge variant={roleBadgeVariant[member.role]}>{member.role}</Badge>

      {canManage && !isOwner ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isPending}>
              <LuEllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {assignableRoles.map((role) => (
              <DropdownMenuItem key={role} onClick={() => handleRoleChange(role)} disabled={role === member.role}>
                <LuShield className="mr-2 h-4 w-4" />
                {role}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onRemove}>
              <LuUserMinus className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

interface iRemoveMemberDialogProps {
  member: WorkspaceMember | null;
  workspaceId: string;
  onClose: () => void;
}

function RemoveMemberDialog({ member, workspaceId, onClose }: iRemoveMemberDialogProps) {
  const { removeMember, isPending } = useRemoveMember();

  const handleRemove = () => {
    if (!member) return;
    removeMember({ workspaceId, userId: member.userId }, { onSettled: onClose });
  };

  return (
    <AlertDialog open={!!member} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{member?.user?.name ?? 'this member'}</strong> from the workspace?
            They will lose access to all workspace content.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRemove} disabled={isPending}>
            {isPending ? 'Removing...' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
