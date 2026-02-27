import { useCallback, useState } from 'react';
import { LuCopy, LuLoader, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';

import { toastError, toastSuccess } from '@~/components/toastifications';
import { Button } from '@~/components/ui/button';
import { Card } from '@~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@~/components/ui/dialog';

import { useDeleteExportPreset } from '../hooks/mutations/use-delete-export-preset';
import { useDuplicateExportPreset } from '../hooks/mutations/use-duplicate-export-preset';
import { useExportPresets } from '../hooks/queries/use-export-presets';
import type { ExportPreset } from '../hooks/queries/use-export-presets';
import { ExportPresetForm } from './export-preset-form';

interface iExportPresetManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportPresetManager({ isOpen, onClose }: iExportPresetManagerProps) {
  const { data: presets, isPending: isLoading, refetch } = useExportPresets();
  const { deletePresetAsync, isPending: isDeleting } = useDeleteExportPreset();
  const { duplicatePresetAsync, isPending: isDuplicating } = useDuplicateExportPreset();

  const [editingPreset, setEditingPreset] = useState<ExportPreset | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleDelete = useCallback(
    async (preset: ExportPreset) => {
      if (preset.isSystem) {
        toastError('Cannot delete system presets');
        return;
      }

      try {
        await deletePresetAsync({ presetId: preset._id });
        toastSuccess(`Preset "${preset.name}" deleted`);
      } catch {
        toastError('Failed to delete preset');
      }
    },
    [deletePresetAsync],
  );

  const handleDuplicate = useCallback(
    async (preset: ExportPreset) => {
      try {
        const newPreset = await duplicatePresetAsync({ presetId: preset._id });
        toastSuccess(`Created "${newPreset.name}"`);
      } catch {
        toastError('Failed to duplicate preset');
      }
    },
    [duplicatePresetAsync],
  );

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleEditComplete = () => {
    setEditingPreset(null);
    setIsCreating(false);
    void refetch();
  };

  // Show form if editing or creating
  if (editingPreset != null || isCreating) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create Export Preset' : `Edit: ${editingPreset?.name}`}</DialogTitle>
            <DialogDescription>Customize font, margins, colors, and formatting for PDF exports.</DialogDescription>
          </DialogHeader>
          <ExportPresetForm
            preset={editingPreset ?? undefined}
            onSave={handleEditComplete}
            onCancel={() => {
              setEditingPreset(null);
              setIsCreating(false);
            }}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Export Presets</DialogTitle>
          <DialogDescription>Manage your PDF export presets with custom styling options.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-end">
            <Button onClick={handleCreateNew} size="sm" className="gap-1">
              <LuPlus className="h-4 w-4" />
              New Preset
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LuLoader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {presets?.map((preset) => (
                <Card key={preset._id} className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{preset.name}</h4>
                      {preset.isSystem ? (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">System</span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {preset.fontFamily} • {preset.baseFontSize}pt • {preset.pageSize}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={async () => handleDuplicate(preset)}
                      disabled={isDuplicating}
                      title="Duplicate preset"
                    >
                      <LuCopy className="h-4 w-4" />
                    </Button>

                    {!preset.isSystem ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingPreset(preset)}
                          title="Edit preset"
                        >
                          <LuPencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={async () => handleDelete(preset)}
                          disabled={isDeleting}
                          title="Delete preset"
                        >
                          <LuTrash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
