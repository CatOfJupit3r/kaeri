import { EditPanelWrapper } from '@~/components/forms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { useAppForm } from '@~/components/ui/field';
import { useAutoSave } from '@~/hooks/use-auto-save';
import type { EditFormMode } from '@~/types/form.types';
import { EDIT_FORM_MODES } from '@~/types/form.types';

import { useUpdateWildcard } from '../hooks/mutations/use-update-wildcard';
import type { WildcardQueryReturnType } from '../hooks/queries/use-wildcard';
import { wildcardFormSchema } from '../schemas/wildcard.schema';
import { WildcardFormFields } from './wildcard-form-fields';

interface iWildcardEditFormProps {
  mode: EditFormMode;
  seriesId: string;
  /** Initial data - required, parent must fetch and provide */
  initialData: WildcardQueryReturnType;
  onClose: () => void;
  /** For dialog mode only */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Unified edit form for wildcards.
 * Supports both panel mode (auto-save on blur) and dialog mode (manual submit).
 *
 * @param mode - 'panel' for inline panel editing, 'dialog' for modal editing
 * @param initialData - Required wildcard data (parent fetches this)
 */
export function WildcardEditForm({ mode, seriesId, initialData, onClose, open, onOpenChange }: iWildcardEditFormProps) {
  const { updateWildcard, isPending } = useUpdateWildcard();

  const form = useAppForm({
    defaultValues: {
      title: initialData.title,
      body: initialData.body ?? '',
      tag: initialData.tag ?? '',
    },
    onSubmit: async ({ value }) => {
      updateWildcard(
        {
          id: initialData._id,
          seriesId,
          patch: {
            title: value.title || undefined,
            body: value.body || undefined,
            tag: value.tag || undefined,
          },
        },
        {
          onSuccess: () => {
            if (mode === EDIT_FORM_MODES.dialog) {
              onOpenChange?.(false);
            }
          },
        },
      );
    },
    validators: {
      onSubmit: wildcardFormSchema,
    },
  });

  // Auto-save only enabled in panel mode
  const { handleAutoSave } = useAutoSave(form, {
    isUpdating: isPending,
    enabled: mode === EDIT_FORM_MODES.panel,
  });

  const handleBlur = mode === EDIT_FORM_MODES.panel ? handleAutoSave : undefined;

  // Panel mode content - wrapped in Card for consistent styling
  const panelFormContent = (
    <form.AppForm>
      <form.Form className="p-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Wild Card Details</CardTitle>
            <CardDescription>Edit the title, content, and tag for this Wild Card</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <WildcardFormFields form={form} handleBlur={handleBlur} />
          </CardContent>
        </Card>
      </form.Form>
    </form.AppForm>
  );

  // Dialog mode content - simpler layout with footer actions
  const dialogFormContent = (
    <form.AppForm>
      <form.Form className="space-y-4 p-0">
        <WildcardFormFields form={form} />

        <DialogFooter>
          <form.FormActions
            onCancel={() => onOpenChange?.(false)}
            submitLabel="Update Wild Card"
            loadingLabel="Updating..."
            isDisabled={isPending}
          />
        </DialogFooter>
      </form.Form>
    </form.AppForm>
  );

  // Render based on mode
  if (mode === EDIT_FORM_MODES.panel) {
    return (
      <EditPanelWrapper title="Edit Wild Card" onClose={onClose}>
        {panelFormContent}
      </EditPanelWrapper>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Wild Card</DialogTitle>
          <DialogDescription>Update the Wild Card details below.</DialogDescription>
        </DialogHeader>
        {dialogFormContent}
      </DialogContent>
    </Dialog>
  );
}
