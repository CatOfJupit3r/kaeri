import type { Editor } from '@tiptap/core';
import { useCallback, useEffect, useRef } from 'react';

import { useEntityPreview } from '../components/entity-preview/use-entity-preview';
import type { EntityType } from '../extensions/entity-mention';

export interface iUseMentionHoverPreviewOptions {
  /** TipTap editor instance */
  editor: Editor | null;
  /** Delay before showing preview (ms) */
  delay?: number;
  /** Called when user clicks to navigate to KB */
  onNavigateToKB?: (entityId: string, entityType: EntityType) => void;
}

export interface iUseMentionHoverPreviewResult {
  /** Current preview state */
  previewState: ReturnType<typeof useEntityPreview>['state'];
  /** Hide the preview */
  hidePreview: () => void;
  /** Handle opening entity in KB */
  handleOpenInKB: () => void;
  /** Call when mouse enters the preview card */
  onCardMouseEnter: () => void;
  /** Call when mouse leaves the preview card */
  onCardMouseLeave: () => void;
}

// Type aliases for external use
export type UseMentionHoverPreviewOptions = iUseMentionHoverPreviewOptions;
export type UseMentionHoverPreviewResult = iUseMentionHoverPreviewResult;

/**
 * Hook for displaying entity previews when hovering over mentions in the editor.
 *
 * Attaches mouse event listeners to mention spans rendered by TipTap's MentionMark.
 * When the user hovers over a mention, shows a preview card with entity details.
 *
 * @example
 * ```tsx
 * const { previewState, hidePreview, handleOpenInKB } = useMentionHoverPreview({
 *   editor,
 *   delay: 500,
 *   onNavigateToKB: (entityId, entityType) => {
 *     navigate(`/kb/${entityType}/${entityId}`);
 *   },
 * });
 *
 * return (
 *   <>
 *     <EditorContent editor={editor} />
 *     {previewState.isVisible && previewState.entityId && previewState.entityType && (
 *       <EntityPreviewCard
 *         entityId={previewState.entityId}
 *         entityType={previewState.entityType}
 *         position={previewState.position!}
 *         onClose={hidePreview}
 *         onOpenInKB={handleOpenInKB}
 *         seriesId={seriesId}
 *       />
 *     )}
 *   </>
 * );
 * ```
 */
export function useMentionHoverPreview({
  editor,
  delay = 500,
  onNavigateToKB,
}: iUseMentionHoverPreviewOptions): iUseMentionHoverPreviewResult {
  const { state: previewState, show, hide, cancel, onCardMouseEnter, onCardMouseLeave } = useEntityPreview({ delay });
  const previewStateRef = useRef(previewState);
  const isHoveringCardRef = useRef(false);
  previewStateRef.current = previewState;

  // Handle navigation to KB
  const handleOpenInKB = useCallback(() => {
    if (previewState.entityId && previewState.entityType) {
      onNavigateToKB?.(previewState.entityId, previewState.entityType);
    }
    hide();
  }, [previewState.entityId, previewState.entityType, onNavigateToKB, hide]);

  // Wrap card handlers to track hover state locally
  const handleCardMouseEnter = useCallback(() => {
    isHoveringCardRef.current = true;
    onCardMouseEnter();
  }, [onCardMouseEnter]);

  const handleCardMouseLeave = useCallback(() => {
    isHoveringCardRef.current = false;
    onCardMouseLeave();
  }, [onCardMouseLeave]);

  // Attach event listeners to mention spans
  useEffect(() => {
    if (!editor) return undefined;

    const editorElement = editor.view.dom;

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains('mention')) return;

      const { entityId, entityType: rawEntityType } = target.dataset;
      const entityType = rawEntityType as EntityType | undefined;

      if (!entityId || !entityType) return;

      // Calculate position centered below the mention with sufficient gap
      const rect = target.getBoundingClientRect();
      show(entityId, entityType, {
        x: rect.left + rect.width / 2,
        y: rect.bottom + 12,
        targetTop: rect.top,
      });
    };

    const handleMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains('mention')) return;

      const relatedTarget = (e as MouseEvent).relatedTarget as HTMLElement | null;

      // Don't hide if moving to the preview card
      if (relatedTarget?.closest('.entity-preview-card')) {
        return;
      }

      cancel();
      // Schedule hide with delay to allow mouse to move to preview card
      setTimeout(() => {
        // Only hide if not hovering over the card
        if (!isHoveringCardRef.current) {
          hide();
        }
      }, 100);
    };

    // Use event delegation on the editor element
    editorElement.addEventListener('mouseenter', handleMouseEnter, true);
    editorElement.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      editorElement.removeEventListener('mouseenter', handleMouseEnter, true);
      editorElement.removeEventListener('mouseleave', handleMouseLeave, true);
    };
  }, [editor, show, hide, cancel]);

  return {
    previewState,
    hidePreview: hide,
    handleOpenInKB,
    onCardMouseEnter: handleCardMouseEnter,
    onCardMouseLeave: handleCardMouseLeave,
  };
}
