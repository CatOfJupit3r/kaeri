/* eslint-disable react/no-children-prop */
import { useForm } from '@tanstack/react-form';
import { useEffect } from 'react';

import { Button } from '@~/components/ui/button';
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';
import { Textarea } from '@~/components/ui/textarea';

import { useUpdateResearch } from '../hooks/mutations/use-update-research';
import { useResearch } from '../hooks/queries/use-research';

interface iResearchEditFormProps {
  researchId: string;
  onSave?: () => void;
}

export function ResearchEditForm({ researchId, onSave }: iResearchEditFormProps) {
  const { data: research, isPending: isLoading } = useResearch(researchId);
  const { mutate: updateResearch, isPending: isSaving } = useUpdateResearch();

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

      updateResearch(
        {
          researchId,
          patch: {
            title: value.title,
            content: value.content,
            tags: tags.length > 0 ? tags : [],
          },
        },
        { onSuccess: onSave },
      );
    },
  });

  useEffect(() => {
    if (research) {
      form.setFieldValue('title', research.title);
      form.setFieldValue('content', research.content ?? '');
      form.setFieldValue('tags', research.tags?.join(', ') ?? '');
    }
  }, [research, form]);

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
  }

  if (!research) {
    return <div className="p-4 text-center text-muted-foreground">Research entry not found</div>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-4 p-4"
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
              rows={12}
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

      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
