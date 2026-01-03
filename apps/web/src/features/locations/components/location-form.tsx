import { useEffect } from 'react';
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
import { useAppForm } from '@~/components/ui/field';
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';

import { useCreateLocation } from '../hooks/mutations/use-create-location';
import { useUpdateLocation } from '../hooks/mutations/use-update-location';

interface iLocation {
  _id: string;
  name: string;
  description?: string;
  tags?: string[];
}

interface iLocationFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: iLocation;
}

export function LocationForm({ seriesId, open, onOpenChange, initialData }: iLocationFormProps) {
  const { createLocation, isPending: isCreating } = useCreateLocation();
  const { updateLocation, isPending: isUpdating } = useUpdateLocation();

  const isPending = isCreating || isUpdating;
  const isEditMode = !!initialData;

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      tags: initialData?.tags ?? ([] as string[]),
    },
    onSubmit: async ({ value }) => {
      const normalizedName = value.name.trim();
      const normalizedDescription = value.description.trim();

      if (isEditMode && initialData) {
        updateLocation(
          {
            id: initialData._id,
            seriesId,
            patch: {
              name: normalizedName,
              description: normalizedDescription || undefined,
              tags: value.tags.length > 0 ? value.tags : undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
            },
          },
        );
      } else {
        createLocation(
          {
            seriesId,
            value: {
              name: normalizedName,
              description: normalizedDescription || undefined,
              tags: value.tags.length > 0 ? value.tags : undefined,
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
        tags: z.array(z.string()),
      }),
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description ?? '',
        tags: initialData.tags ?? [],
      });
    } else if (!open) {
      form.reset({
        name: '',
        description: '',
        tags: [],
      });
    }
  }, [open, initialData, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Location' : 'Create Location'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the location details below.'
              : 'Add a new location to your series. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <form.AppField name="name">
              {(field) => <field.TextField label="Name" placeholder="Enter location name" required />}
            </form.AppField>

            <form.AppField name="description">
              {(field) => (
                <field.TextareaField
                  label="Description"
                  placeholder="Describe the location..."
                  rows={3}
                  maxLength={500}
                />
              )}
            </form.AppField>

            <form.Field name="tags" mode="array">
              {(field) => {
                const tags = field.state.value || [];
                return (
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        placeholder="Add a tag (press Enter)"
                        disabled={isPending}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            const trimmedTag = input.value.trim();
                            if (trimmedTag && !tags.includes(trimmedTag)) {
                              field.pushValue(trimmedTag);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('tags') as HTMLInputElement;
                          if (input) {
                            const trimmedTag = input.value.trim();
                            if (trimmedTag && !tags.includes(trimmedTag)) {
                              field.pushValue(trimmedTag);
                              input.value = '';
                            }
                          }
                        }}
                        disabled={isPending}
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    {tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <Badge key={`${tag}-${index}`} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => field.removeValue(index)}
                              className="ml-1 rounded-full hover:bg-muted"
                              disabled={isPending}
                            >
                              <LuX className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }}
            </form.Field>

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange(false)}
                submitLabel={isEditMode ? 'Update Location' : 'Create Location'}
                loadingLabel={isEditMode ? 'Updating...' : 'Creating...'}
                isDisabled={isPending}
              />
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
