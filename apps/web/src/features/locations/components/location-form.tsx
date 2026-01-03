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
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const { createLocation, isPending: isCreating } = useCreateLocation();
  const { updateLocation, isPending: isUpdating } = useUpdateLocation();

  const isPending = isCreating || isUpdating;
  const isEditMode = !!initialData;

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
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
              tags: tags.length > 0 ? tags : undefined,
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
              tags: tags.length > 0 ? tags : undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
              form.reset();
              setTags([]);
              setTagInput('');
            },
          },
        );
      }
    },
    validators: {
      onSubmit: z.object({
        name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
        description: z.string().trim().max(500, 'Description must be 500 characters or less'),
      }),
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description ?? '',
      });
      setTags(initialData.tags ?? []);
      setTagInput('');
    } else if (!open) {
      form.reset({
        name: '',
        description: '',
      });
      setTags([]);
      setTagInput('');
    }
  }, [open, initialData, form]);

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

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

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag (press Enter)"
                  disabled={isPending}
                />
                <Button type="button" onClick={addTag} disabled={!tagInput.trim() || isPending} size="sm">
                  Add
                </Button>
              </div>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
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
          </form.Form>
        </form.AppForm>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <form.SubmitButton isDisabled={isPending}>
            {(() => {
              if (isPending) {
                return isEditMode ? 'Updating...' : 'Creating...';
              }
              return isEditMode ? 'Update Location' : 'Create Location';
            })()}
          </form.SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
