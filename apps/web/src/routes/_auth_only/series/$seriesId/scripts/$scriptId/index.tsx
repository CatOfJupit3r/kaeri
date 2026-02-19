import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

import { ExportPdfModal } from '@~/features/export';
import { ScriptEditor } from '@~/features/scripts/components';
import { useSaveScriptContent } from '@~/features/scripts/hooks/mutations/use-save-script-content';
import { scriptQueryOptions, useScript } from '@~/features/scripts/hooks/queries/use-script';
import '@~/features/scripts/script-editor.css';

export const Route = createFileRoute('/_auth_only/series/$seriesId/scripts/$scriptId/')({
  loader: async ({ context, params }) => {
    const { scriptId } = params;
    await context.queryClient.ensureQueryData(scriptQueryOptions(scriptId));
  },
  component: ScriptEditorPage,
});

function ScriptEditorPage() {
  const { seriesId, scriptId } = Route.useParams();
  const navigate = useNavigate();
  const { data: script, isPending, error } = useScript(scriptId);
  const { saveContent, isPending: isSaving } = useSaveScriptContent();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleContentChange = useCallback(
    (content: string) => {
      saveContent(scriptId, content);
    },
    [scriptId, saveContent],
  );

  const handleOpenSettings = useCallback(() => {
    // TODO: Open script settings modal
    console.log('Open settings');
  }, []);

  const handleExport = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  // Handle loading state
  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading script...</div>
      </div>
    );
  }

  // Handle error state
  if (error || !script) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="text-destructive">Failed to load script</div>
        <button
          type="button"
          className="text-sm text-muted-foreground hover:underline"
          onClick={async () => navigate({ to: '/series/$seriesId/scripts', params: { seriesId } })}
        >
          Back to Scripts
        </button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ScriptEditor
        content={script.content}
        onContentChange={handleContentChange}
        title={script.title}
        onOpenSettings={handleOpenSettings}
        onExport={handleExport}
        isSaving={isSaving}
        lastEditedAt={script.lastEditedAt}
      />
      <ExportPdfModal
        scriptId={scriptId}
        scriptTitle={script.title}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
