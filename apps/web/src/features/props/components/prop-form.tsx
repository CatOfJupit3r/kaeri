import { useEffect, useState } from 'react';
import { LuX } from 'react-icons/lu';
import z from 'zod';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { useAppForm, withForm } from '@~/components/ui/field';
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';

import { useCreateProp } from '../hooks/mutations/use-create-prop';
import { useUpdateProp } from '../hooks/mutations/use-update-prop';

interface iProp {
  _id: string;
  name: string;
  description?: string;
  associations?: Array<{
    characterId?: string;
    locationId?: string;
    scriptId?: string;
    note?: string;
  }>;
}

interface iPropFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: iProp;
}

type Association = NonNullable<iProp['associations']>[number];

interface iAssociationDraft {
  characterId: string;
  locationId: string;
  scriptId: string;
  note: string;
}

const createEmptyAssociationDraft = (): iAssociationDraft => ({
  characterId: '',
  locationId: '',
  scriptId: '',
  note: '',
});

interface iAssociationsFieldProps {
  associations: Association[];
  onAdd: (association: Association) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
  isOpen: boolean;
}

function AssociationsField({ associations, onAdd, onRemove, disabled = false, isOpen }: iAssociationsFieldProps) {
  const [associationDraft, setAssociationDraft] = useState<iAssociationDraft>(() => createEmptyAssociationDraft());

  useEffect(() => {
    setAssociationDraft(createEmptyAssociationDraft());
  }, [isOpen]);

  const trimmedDraft = {
    characterId: associationDraft.characterId.trim(),
    locationId: associationDraft.locationId.trim(),
    scriptId: associationDraft.scriptId.trim(),
    note: associationDraft.note.trim(),
  };

  const canAddAssociation =
    trimmedDraft.characterId.length > 0 || trimmedDraft.locationId.length > 0 || trimmedDraft.scriptId.length > 0;

  const handleAddAssociation = () => {
    if (!canAddAssociation) return;

    onAdd({
      characterId: trimmedDraft.characterId || undefined,
      locationId: trimmedDraft.locationId || undefined,
      scriptId: trimmedDraft.scriptId || undefined,
      note: trimmedDraft.note || undefined,
    });

    setAssociationDraft(createEmptyAssociationDraft());
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="associations-field">Associations (Optional)</Label>
        <p className="text-xs text-muted-foreground" id="associations-field">
          Link this prop to characters, locations, or scripts
        </p>
      </div>

      {associations.length > 0 && (
        <div className="space-y-2">
          {associations.map((assoc) => (
            <div
              key={`${assoc.characterId ?? ''}-${assoc.locationId ?? ''}-${assoc.scriptId ?? ''}-${assoc.note ?? ''}`}
              className="rounded-md border border-border p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1 text-sm">
                  {assoc.characterId ? (
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Character
                      </Badge>
                      <span className="text-muted-foreground">{assoc.characterId}</span>
                    </div>
                  ) : null}
                  {assoc.locationId ? (
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Location
                      </Badge>
                      <span className="text-muted-foreground">{assoc.locationId}</span>
                    </div>
                  ) : null}
                  {assoc.scriptId ? (
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Script
                      </Badge>
                      <span className="text-muted-foreground">{assoc.scriptId}</span>
                    </div>
                  ) : null}
                  {assoc.note ? <p className="text-xs text-muted-foreground italic">{assoc.note}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const index = associations.indexOf(assoc);
                    if (index !== -1) onRemove(index);
                  }}
                  className="ml-2 rounded-full p-1 hover:bg-muted"
                  disabled={disabled}
                >
                  <LuX className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 rounded-md border border-dashed p-3">
        <p className="text-xs font-medium">Add Association</p>
        <div className="space-y-2">
          <Input
            value={associationDraft.characterId}
            onChange={(event) => setAssociationDraft((prev) => ({ ...prev, characterId: event.target.value }))}
            placeholder="Character ID (optional)"
            disabled={disabled}
          />
          <Input
            value={associationDraft.locationId}
            onChange={(event) => setAssociationDraft((prev) => ({ ...prev, locationId: event.target.value }))}
            placeholder="Location ID (optional)"
            disabled={disabled}
          />
          <Input
            value={associationDraft.scriptId}
            onChange={(event) => setAssociationDraft((prev) => ({ ...prev, scriptId: event.target.value }))}
            placeholder="Script ID (optional)"
            disabled={disabled}
          />
          <Input
            value={associationDraft.note}
            onChange={(event) => setAssociationDraft((prev) => ({ ...prev, note: event.target.value }))}
            placeholder="Note (optional)"
            disabled={disabled}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAddAssociation();
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="w-full"
            disabled={disabled || !canAddAssociation}
            onClick={handleAddAssociation}
          >
            Add Association
          </Button>
        </div>
      </div>
    </div>
  );
}

const PropFormFields = withForm({
  defaultValues: {
    name: '',
    description: '',
    associations: [] as Association[],
  },
  props: {
    isPending: false,
    onCancel: () => {},
    isEditMode: false,
    isOpen: false,
  },
  render: function Render({ form, isPending, onCancel, isEditMode, isOpen }) {
    return (
      <>
        <form.AppField name="name">
          {(field) => <field.TextField label="Name" placeholder="Enter prop name" required />}
        </form.AppField>

        <form.AppField name="description">
          {(field) => (
            <field.TextareaField label="Description" placeholder="Describe the prop..." rows={3} maxLength={500} />
          )}
        </form.AppField>

        <form.Field name="associations" mode="array">
          {(field) => (
            <AssociationsField
              associations={field.state.value ?? []}
              onAdd={(association) => field.pushValue(association)}
              onRemove={(index) => field.removeValue(index)}
              disabled={isPending}
              isOpen={isOpen}
            />
          )}
        </form.Field>

        <DialogFooter>
          <form.FormActions
            onCancel={onCancel}
            submitLabel={isEditMode ? 'Update Prop' : 'Create Prop'}
            loadingLabel={isEditMode ? 'Updating...' : 'Creating...'}
            isDisabled={isPending}
          />
        </DialogFooter>
      </>
    );
  },
});

export function PropForm({ seriesId, open, onOpenChange, initialData }: iPropFormProps) {
  const { createProp, isPending: isCreating } = useCreateProp();
  const { updateProp, isPending: isUpdating } = useUpdateProp();

  const isPending = isCreating || isUpdating;
  const isEditMode = !!initialData;

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      associations: initialData?.associations ?? ([] as Association[]),
    },
    onSubmit: async ({ value }) => {
      const normalizedName = value.name.trim();
      const normalizedDescription = value.description.trim();
      const normalizedAssociations = (value.associations ?? []).map((association) => {
        const characterId = association.characterId?.trim();
        const locationId = association.locationId?.trim();
        const scriptId = association.scriptId?.trim();
        const note = association.note?.trim();

        return {
          characterId: characterId ?? undefined,
          locationId: locationId ?? undefined,
          scriptId: scriptId ?? undefined,
          note: note ?? undefined,
        };
      });
      const associations = normalizedAssociations.filter(
        (association) => association.characterId ?? association.locationId ?? association.scriptId,
      );

      if (isEditMode && initialData) {
        updateProp(
          {
            id: initialData._id,
            seriesId,
            patch: {
              name: normalizedName,
              description: normalizedDescription || undefined,
              associations: associations.length > 0 ? associations : undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
            },
          },
        );
      } else {
        createProp(
          {
            seriesId,
            value: {
              name: normalizedName,
              description: normalizedDescription || undefined,
              associations: associations.length > 0 ? associations : undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
              form.reset();
            },
          },
        );
      }
    },
    validators: {
      onSubmit: z.object({
        name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
        description: z.string().trim().max(500, 'Description must be 500 characters or less'),
        associations: z.array(
          z
            .object({
              characterId: z.string().trim().optional(),
              locationId: z.string().trim().optional(),
              scriptId: z.string().trim().optional(),
              note: z.string().trim().max(500, 'Note must be 500 characters or less').optional(),
            })
            .superRefine((association, ctx) => {
              if (!association.characterId && !association.locationId && !association.scriptId) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'Add at least one linked ID',
                });
              }
            }),
        ),
      }),
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description ?? '',
        associations: initialData.associations ?? [],
      });
    } else if (!open) {
      form.reset({
        name: '',
        description: '',
        associations: [],
      });
    }
  }, [open, initialData, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Prop' : 'Create Prop'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the prop details below.'
              : 'Add a new prop to your series. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <PropFormFields
              form={form}
              isPending={isPending}
              onCancel={() => onOpenChange(false)}
              isEditMode={isEditMode}
              isOpen={open}
            />
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
