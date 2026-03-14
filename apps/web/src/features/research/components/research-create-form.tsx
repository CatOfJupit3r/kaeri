/* eslint-disable react/no-children-prop */
import { useForm } from '@tanstack/react-form';

import { Button } from '@~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@~/components/ui/dialog';
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';
import { Textarea } from '@~/components/ui/textarea';

import { useCreateResearch } from '../hooks/mutations/use-create-research';

interface iResearchCreateFormProps {
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResearchCreateForm({ seriesId, open, onOpenChange }: iResearchCreateFormProps) {
  const { mutate: createResearch, isPending } = useCreateResearch();

  const form = useForm({
    defaultValues: {
      title: '',
      content: '',
      tags: '',
    },
    onSubmit: async ({ value }) => {
      const tags = value.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      createResearch(
        {
          seriesId,
          value: {
            title: value.title,
            content: value.content,
            tags: tags.length > 0 ? tags : undefined,
          },
        },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        },
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Research Entry</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          {}
          <form.Field
            name="title"
            children={(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={field.name}>Title</Label>
                <Input
                  id={field.name}
                  placeholder="Research topic..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.length > 0 ? (
                  <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                ) : null}
              </div>
            )}
          />

          {}
          <form.Field
            name="content"
            children={(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={field.name}>Content (Markdown)</Label>
                <Textarea
                  id={field.name}
                  placeholder="Write your research notes here..."
                  rows={6}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />

          {}
          <form.Field
            name="tags"
            children={(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={field.name}>Tags (comma-separated)</Label>
                <Input
                  id={field.name}
                  placeholder="history, technology, culture..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
