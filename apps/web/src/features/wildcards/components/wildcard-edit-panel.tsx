import { useEffect } from 'react';
import { LuArrowLeft } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import { useAppForm } from '@~/components/ui/field';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { Separator } from '@~/components/ui/separator';
import { useAutoSave } from '@~/hooks/use-auto-save';

import { useUpdateWildcard } from '../hooks/mutations/use-update-wildcard';
import { useWildcard } from '../hooks/queries/use-wildcard';
import { wildcardFormSchema } from '../schemas/wildcard.schema';

interface iWildcardEditPanelProps {
  wildcardId: string;
  seriesId: string;
  onClose: () => void;
}

export function WildcardEditPanel({ wildcardId, seriesId, onClose }: iWildcardEditPanelProps) {
  const { data: wildcard, isPending: isLoading, error } = useWildcard(wildcardId, seriesId);
  const { updateWildcard, isPending: isUpdating } = useUpdateWildcard();

  const form = useAppForm({
    defaultValues: {
      title: '',
      body: '',
      tag: '',
    },
    onSubmit: async ({ value }) => {
      if (!wildcard) return;

      updateWildcard({
        id: wildcard._id,
        seriesId,
        patch: {
          title: value.title || undefined,
          body: value.body || undefined,
          tag: value.tag || undefined,
        },
      });
    },
    validators: {
      onSubmit: wildcardFormSchema,
    },
  });

  const { handleAutoSave, resetInitialization } = useAutoSave(form, { isUpdating });

  // Sync form with wildcard data when loaded
  useEffect(() => {
    if (wildcard) {
      resetInitialization();
      form.reset({
        title: wildcard.title,
        body: wildcard.body ?? '',
        tag: wildcard.tag ?? '',
      });
    }
  }, [wildcard, form, resetInitialization]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading Wild Card...</p>
      </div>
    );
  }

  if (error || !wildcard) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error ? `Error: ${error.message}` : 'Wild Card not found'}</p>
        <Button variant="outline" onClick={onClose}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b-2 border-foreground bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            <LuArrowLeft className="size-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h2 className="text-lg font-bold">Edit Wild Card</h2>
        </div>
      </div>

      {/* Form Content */}
      <ScrollArea className="flex-1">
        <form.AppForm>
          <form.Form className="p-4">
            {/* Basic Info Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Wild Card Details</CardTitle>
                <CardDescription>Edit the title, content, and tag for this Wild Card</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <form.AppField name="title">
                      {(field) => (
                        <field.TextField
                          label="Title"
                          placeholder="Enter Wild Card title"
                          required
                          onBlur={handleAutoSave}
                        />
                      )}
                    </form.AppField>
                  </div>

                  {/* Tag */}
                  <form.AppField name="tag">
                    {(field) => (
                      <field.TextField label="Tag" placeholder="Optional tag" maxLength={50} onBlur={handleAutoSave} />
                    )}
                  </form.AppField>
                </div>

                {/* Content */}
                <div className="mt-4">
                  <form.AppField name="body">
                    {(field) => (
                      <field.TextareaField
                        label="Content"
                        placeholder="Enter the Wild Card content..."
                        rows={8}
                        maxLength={1000}
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>
                </div>
              </CardContent>
            </Card>
          </form.Form>
        </form.AppForm>
      </ScrollArea>
    </div>
  );
}
