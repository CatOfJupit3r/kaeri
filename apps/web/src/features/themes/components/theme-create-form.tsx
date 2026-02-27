import { useEffect, useState } from 'react';
import { LuPlus, LuX } from 'react-icons/lu';

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

import { useCreateTheme } from '../hooks/mutations/use-create-theme';
import { themeFormSchema } from '../schemas/theme.schema';
import { ThemeFormFields } from './theme-form-fields';

interface iThemeCreateFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Create form for themes.
 * Renders in a dialog with manual submit.
 * Includes basic fields and visual motifs array.
 */
export function ThemeCreateForm({ seriesId, open, onOpenChange }: iThemeCreateFormProps) {
  const { createTheme, isPending } = useCreateTheme();

  // Local state for visual motifs (separate from form)
  const [visualMotifs, setVisualMotifs] = useState<string[]>([]);
  const [motifInput, setMotifInput] = useState('');

  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
      color: '',
    },
    onSubmit: async ({ value }) => {
      createTheme(
        {
          seriesId,
          value: {
            name: value.name,
            description: value.description || undefined,
            color: value.color || undefined,
            visualMotifs: visualMotifs.length > 0 ? visualMotifs : undefined,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
            setVisualMotifs([]);
          },
        },
      );
    },
    validators: {
      onSubmit: themeFormSchema,
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setMotifInput('');
      setVisualMotifs([]);
    }
  }, [open, form]);

  const handleAddMotif = () => {
    const trimmedMotif = motifInput.trim();
    if (trimmedMotif && !visualMotifs.includes(trimmedMotif)) {
      setVisualMotifs([...visualMotifs, trimmedMotif]);
      setMotifInput('');
    }
  };

  const handleRemoveMotif = (index: number) => {
    setVisualMotifs(visualMotifs.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Theme</DialogTitle>
          <DialogDescription>Add a new theme to your series. Fill in the details below.</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <ThemeFormFields form={form} />

            {/* Visual Motifs */}
            <div className="space-y-2">
              <Label htmlFor="motifs">Visual Motifs</Label>
              <div className="flex gap-2">
                <Input
                  id="motifs"
                  value={motifInput}
                  onChange={(e) => setMotifInput(e.target.value)}
                  placeholder="Add a visual motif (press Enter)"
                  disabled={isPending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMotif();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddMotif} disabled={isPending || !motifInput.trim()} size="sm">
                  <LuPlus className="mr-1 size-4" />
                  Add
                </Button>
              </div>
              {visualMotifs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {visualMotifs.map((motif, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Badge key={`${motif}-${index}`} variant="secondary" className="gap-1">
                      {motif}
                      <button
                        type="button"
                        onClick={() => handleRemoveMotif(index)}
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

            <DialogFooter>
              <form.FormActions
                onCancel={() => onOpenChange(false)}
                submitLabel="Create Theme"
                loadingLabel="Creating..."
                isDisabled={isPending}
              />
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
