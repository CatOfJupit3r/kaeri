import { formatDistanceToNow } from 'date-fns';
import { useRef, useState } from 'react';
import {
  LuBookmark,
  LuCheck,
  LuClock,
  LuHistory,
  LuLoader,
  LuPencil,
  LuRotateCcw,
  LuTrash2,
  LuX,
} from 'react-icons/lu';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
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
import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Input } from '@~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@~/components/ui/popover';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { Skeleton } from '@~/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@~/components/ui/tooltip';

import {
  useCreateScriptVersion,
  useDeleteScriptVersion,
  useRestoreScriptVersion,
  useScriptVersions,
  useUpdateScriptVersion,
} from '../hooks';
import type { ScriptVersionSummary } from '../hooks';

interface iVersionHistoryPanelProps {
  scriptId: string;
  onPreviewVersion?: (versionId: string) => void;
  activePreviewId?: string | null;
}

export function VersionHistoryPanel({ scriptId, onPreviewVersion, activePreviewId }: iVersionHistoryPanelProps) {
  const { data, isPending, error } = useScriptVersions(scriptId, 50);
  const { createVersion, isPending: isCreating } = useCreateScriptVersion();
  const { restoreVersion, isPending: isRestoring } = useRestoreScriptVersion();
  const { deleteVersion, isPending: isDeleting } = useDeleteScriptVersion();
  const { updateVersion, isPending: isUpdating } = useUpdateScriptVersion();
  const [restoreTarget, setRestoreTarget] = useState<ScriptVersionSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScriptVersionSummary | null>(null);
  const [isSavePopoverOpen, setIsSavePopoverOpen] = useState(false);
  const [versionName, setVersionName] = useState('');

  const handleCreateVersion = (name?: string) => {
    createVersion(
      { scriptId, name: name ?? undefined },
      {
        onSuccess: (result) => {
          toastSuccess('Version saved', `Snapshot v${result.version} created`);
          setIsSavePopoverOpen(false);
          setVersionName('');
        },
        onError: (err) => {
          toastORPCError('Failed to save version', err);
        },
      },
    );
  };

  const handleRestore = () => {
    if (!restoreTarget) return;
    restoreVersion({ scriptId, versionId: restoreTarget._id }, { onSettled: () => setRestoreTarget(null) });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteVersion({ scriptId, versionId: deleteTarget._id }, { onSettled: () => setDeleteTarget(null) });
  };

  const handleRename = (versionId: string, name: string) => {
    updateVersion({ scriptId, versionId, name });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <LuHistory className="h-4 w-4" />
          Versions
        </div>
        <Popover open={isSavePopoverOpen} onOpenChange={setIsSavePopoverOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={isCreating}>
                    {isCreating ? (
                      <LuLoader className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <LuBookmark className="mr-1 h-3 w-3" />
                    )}
                    Save version
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Snapshot current content as a version</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent align="end" className="w-64 p-3">
            <div className="space-y-2">
              <p className="text-xs font-medium">Version name (optional)</p>
              <Input
                placeholder="e.g. Before Act 2 rewrite"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                maxLength={100}
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateVersion(versionName);
                }}
              />
              <div className="flex justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setIsSavePopoverOpen(false);
                    setVersionName('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleCreateVersion(versionName)}
                  disabled={isCreating}
                >
                  {isCreating ? <LuLoader className="mr-1 h-3 w-3 animate-spin" /> : null}
                  Save
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <ScrollArea className="flex-1">
        <VersionListContent
          isPending={isPending}
          error={error}
          items={data?.items}
          activePreviewId={activePreviewId}
          isRestoring={isRestoring}
          isDeleting={isDeleting}
          isUpdating={isUpdating}
          onPreviewVersion={onPreviewVersion}
          onRestoreTarget={setRestoreTarget}
          onDeleteTarget={setDeleteTarget}
          onRename={handleRename}
        />
      </ScrollArea>

      {/* Restore confirmation dialog */}
      <AlertDialog open={restoreTarget !== null} onOpenChange={(open) => !open && setRestoreTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore version {restoreTarget?.version}?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current content will be saved as a safety snapshot before restoring. You can always go back to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? <LuLoader className="mr-2 h-4 w-4 animate-spin" /> : null}
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete version {deleteTarget?.version}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The version snapshot will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? <LuLoader className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface iVersionListContentProps {
  isPending: boolean;
  error: Error | null;
  items: ScriptVersionSummary[] | undefined;
  activePreviewId?: string | null;
  isRestoring: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  onPreviewVersion?: (versionId: string) => void;
  onRestoreTarget: (version: ScriptVersionSummary) => void;
  onDeleteTarget: (version: ScriptVersionSummary) => void;
  onRename: (versionId: string, name: string) => void;
}

const SKELETON_KEYS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'];

function VersionListContent({
  isPending,
  error,
  items,
  activePreviewId,
  isRestoring,
  isDeleting,
  isUpdating,
  onPreviewVersion,
  onRestoreTarget,
  onDeleteTarget,
  onRename,
}: iVersionListContentProps) {
  if (isPending) {
    return (
      <div className="space-y-3 p-3">
        {SKELETON_KEYS.map((key) => (
          <div key={key} className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-3 text-sm text-destructive">Failed to load versions</div>;
  }

  if (!items?.length) {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
        <LuHistory className="h-8 w-8" />
        <p>No versions yet</p>
        <p className="text-xs">Save a version to start tracking changes</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {items.map((version) => (
        <VersionItem
          key={version._id}
          version={version}
          isActive={activePreviewId === version._id}
          isRestoring={isRestoring}
          isDeleting={isDeleting}
          isUpdating={isUpdating}
          onPreview={() => onPreviewVersion?.(version._id)}
          onRestore={() => onRestoreTarget(version)}
          onDelete={() => onDeleteTarget(version)}
          onRename={(name) => onRename(version._id, name)}
        />
      ))}
    </div>
  );
}

interface iVersionItemProps {
  version: ScriptVersionSummary;
  isActive: boolean;
  isRestoring: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  onPreview: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}

function VersionItem({
  version,
  isActive,
  isRestoring,
  isDeleting,
  isUpdating,
  onPreview,
  onRestore,
  onDelete,
  onRename,
}: iVersionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(version.name ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmitRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== version.name) {
      onRename(trimmed);
    }
    setIsEditing(false);
  };

  const handleStartRename = () => {
    setEditName(version.name ?? '');
    setIsEditing(true);
    // Focus after render
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div
      className={`group rounded-md border px-3 py-2 transition-colors ${
        isActive ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border hover:bg-muted/50'
      }`}
    >
      {isEditing ? (
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            maxLength={100}
            className="h-6 flex-1 text-xs"
            placeholder="Version name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmitRename();
              if (e.key === 'Escape') setIsEditing(false);
            }}
          />
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleSubmitRename} disabled={isUpdating}>
            <LuCheck className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsEditing(false)}>
            <LuX className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <button type="button" className="w-full text-left" onClick={onPreview}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              v{version.version}
              {version.name ? ` — ${version.name}` : ''}
            </span>
            <Badge variant={version.autoGenerated ? 'secondary' : 'default'} className="text-[10px]">
              {version.autoGenerated ? 'auto' : 'manual'}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <LuClock className="h-3 w-3" />
            {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
            {version.wordCount != null ? <span>· {version.wordCount} words</span> : null}
          </div>
        </button>
      )}
      <div className="mt-1.5 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleStartRename} title="Rename">
          <LuPencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={onDelete}
          disabled={isDeleting}
          title="Delete"
        >
          <LuTrash2 className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onRestore} disabled={isRestoring}>
          <LuRotateCcw className="mr-1 h-3 w-3" />
          Restore
        </Button>
      </div>
    </div>
  );
}
