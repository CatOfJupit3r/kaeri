import { useHotkey } from '@tanstack/react-hotkeys';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

import { ExportPdfModal } from '@~/features/export';
import { ScriptEditor, ScriptSettingsModal } from '@~/features/scripts/components';
import type { EntityType } from '@~/features/scripts/extensions/entity-mention';
import { useSaveScriptContent } from '@~/features/scripts/hooks/mutations/use-save-script-content';
import { scriptQueryOptions, useScript } from '@~/features/scripts/hooks/queries/use-script';
import '@~/features/scripts/script-editor.css';
import { usePresenceHeartbeat } from '@~/hooks/use-presence';

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
  const { saveContent, saveContentImmediate, isPending: isSaving } = useSaveScriptContent();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Track presence for this script - sends heartbeat every 30s
  usePresenceHeartbeat({
    targetType: 'script',
    targetId: scriptId,
    context: 'editing',
    enabled: !isPending && !error,
  });

  const handleContentChange = useCallback(
    (content: string) => {
      saveContent(scriptId, content);
    },
    [scriptId, saveContent],
  );

  const handleOpenSettings = useCallback(() => {
    setIsSettingsModalOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  const handleSave = useCallback(
    (content: string) => {
      saveContentImmediate(scriptId, content);
    },
    [saveContentImmediate, scriptId],
  );

  const handleOpenEntityInKnowledgeBase = useCallback(
    (entityId: string, entityType: EntityType) => {
      switch (entityType) {
        case 'character': {
          void navigate({
            to: '/series/$seriesId/knowledge-base/characters/$characterId',
            params: { seriesId, characterId: entityId },
            search: { tab: 'characters' },
          });
          break;
        }
        case 'prop': {
          void navigate({
            to: '/series/$seriesId/knowledge-base',
            params: { seriesId },
            search: { tab: 'props' },
          });
          break;
        }
        case 'wildcard': {
          void navigate({
            to: '/series/$seriesId/knowledge-base',
            params: { seriesId },
            search: { tab: 'wildcards' },
          });
          break;
        }
        default: {
          break;
        }
      }
    },
    [navigate, seriesId],
  );

  // Keyboard shortcuts
  useHotkey('Mod+E', handleExport, { preventDefault: true });
  useHotkey('Mod+,', handleOpenSettings, { preventDefault: true });

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
        seriesId={seriesId}
        scriptId={scriptId}
        onOpenSettings={handleOpenSettings}
        onExport={handleExport}
        onSave={handleSave}
        isSaving={isSaving}
        lastEditedAt={script.lastEditedAt}
        onOpenEntityInKnowledgeBase={handleOpenEntityInKnowledgeBase}
      />
      <ExportPdfModal
        scriptId={scriptId}
        scriptTitle={script.title}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
      <ScriptSettingsModal open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen} script={script} />
    </div>
  );
}
