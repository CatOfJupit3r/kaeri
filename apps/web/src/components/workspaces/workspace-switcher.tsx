import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { LuBuilding2, LuCheck, LuChevronDown, LuCrown, LuPlus } from 'react-icons/lu';

import { PAGE_SIZES } from '@kaeri/shared';

import { Button } from '@~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@~/components/ui/dropdown-menu';
import { useWorkspaces } from '@~/hooks/queries/use-workspaces';

interface iWorkspaceSwitcherProps {
  currentWorkspaceId?: string;
  onCreateWorkspace?: () => void;
}

export function WorkspaceSwitcher({ currentWorkspaceId, onCreateWorkspace }: iWorkspaceSwitcherProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Use SELECT page size for dropdown data - higher initial load for workspace list
  const { data, isLoading } = useWorkspaces({ limit: PAGE_SIZES.SELECT });

  const workspaces = data?.workspaces ?? [];
  const currentWorkspace = workspaces.find((w) => w._id === currentWorkspaceId);

  const handleSelectWorkspace = (workspaceId: string) => {
    setIsOpen(false);
    void navigate({ to: '/workspaces/$workspaceId', params: { workspaceId } });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between gap-2" disabled={isLoading}>
          {currentWorkspace ? (
            <div className="flex items-center gap-2 truncate">
              {currentWorkspace.isPersonal ? (
                <LuCrown className="h-4 w-4 shrink-0 text-amber-500" />
              ) : (
                <LuBuilding2 className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">{currentWorkspace.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select workspace</span>
          )}
          <LuChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* Personal workspace first */}
          {workspaces
            .filter((w) => w.isPersonal)
            .map((workspace) => (
              <WorkspaceItem
                key={workspace._id}
                workspace={workspace}
                isSelected={workspace._id === currentWorkspaceId}
                onSelect={handleSelectWorkspace}
              />
            ))}

          {/* Team workspaces */}
          {workspaces.filter((w) => !w.isPersonal).length > 0 && (
            <>
              <DropdownMenuSeparator />
              {workspaces
                .filter((w) => !w.isPersonal)
                .map((workspace) => (
                  <WorkspaceItem
                    key={workspace._id}
                    workspace={workspace}
                    isSelected={workspace._id === currentWorkspaceId}
                    onSelect={handleSelectWorkspace}
                  />
                ))}
            </>
          )}
        </DropdownMenuGroup>

        {onCreateWorkspace ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setIsOpen(false);
                onCreateWorkspace();
              }}
            >
              <LuPlus className="h-4 w-4" />
              Create workspace
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface iWorkspaceItemProps {
  workspace: {
    _id: string;
    name: string;
    isPersonal: boolean;
    memberCount: number;
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function WorkspaceItem({ workspace, isSelected, onSelect }: iWorkspaceItemProps) {
  return (
    <DropdownMenuItem onClick={() => onSelect(workspace._id)}>
      <div className="flex w-full items-center gap-2">
        {workspace.isPersonal ? (
          <LuCrown className="h-4 w-4 shrink-0 text-amber-500" />
        ) : (
          <LuBuilding2 className="h-4 w-4 shrink-0" />
        )}
        <span className="flex-1 truncate">{workspace.name}</span>
        {isSelected ? <LuCheck className="h-4 w-4 shrink-0" /> : null}
      </div>
    </DropdownMenuItem>
  );
}
