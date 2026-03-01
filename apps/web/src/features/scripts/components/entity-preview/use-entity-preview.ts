import { useCallback, useRef, useState } from 'react';

import type { EntityType } from '../../extensions/entity-mention';

export interface iEntityPreviewState {
  /** Whether the preview is visible */
  isVisible: boolean;
  /** Entity ID being previewed */
  entityId: string | null;
  /** Entity type being previewed */
  entityType: EntityType | null;
  /** Position of the preview card */
  position: { x: number; y: number; targetTop?: number } | null;
}

export interface iUseEntityPreviewOptions {
  /** Delay before showing preview (ms) */
  delay?: number;
  /** Callback when preview opens */
  onOpen?: (entityId: string, entityType: EntityType) => void;
  /** Callback when preview closes */
  onClose?: () => void;
}

export interface iUseEntityPreviewResult {
  /** Current preview state */
  state: iEntityPreviewState;
  /** Show preview for an entity */
  show: (entityId: string, entityType: EntityType, position: { x: number; y: number; targetTop?: number }) => void;
  /** Hide the preview */
  hide: () => void;
  /** Cancel pending show */
  cancel: () => void;
  /** Whether mouse is currently over the preview card */
  isHoveringCard: boolean;
  /** Call when mouse enters the preview card */
  onCardMouseEnter: () => void;
  /** Call when mouse leaves the preview card */
  onCardMouseLeave: () => void;
  /** Props to spread on hover target */
  getTargetProps: (
    entityId: string,
    entityType: EntityType,
  ) => {
    onMouseEnter: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
  };
}

/**
 * Hook for managing entity preview state
 *
 * Handles hover delay, positioning, and visibility state.
 */
export function useEntityPreview({
  delay = 500,
  onOpen,
  onClose,
}: iUseEntityPreviewOptions = {}): iUseEntityPreviewResult {
  const [state, setState] = useState<iEntityPreviewState>({
    isVisible: false,
    entityId: null,
    entityType: null,
    position: null,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveringCardRef = useRef(false);
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const show = useCallback(
    (entityId: string, entityType: EntityType, position: { x: number; y: number; targetTop?: number }) => {
      cancel();
      cancelHide();

      timeoutRef.current = setTimeout(() => {
        setState({
          isVisible: true,
          entityId,
          entityType,
          position,
        });
        onOpen?.(entityId, entityType);
      }, delay);
    },
    [cancel, cancelHide, delay, onOpen],
  );

  const hide = useCallback(() => {
    cancel();
    cancelHide();
    if (state.isVisible) {
      setState({
        isVisible: false,
        entityId: null,
        entityType: null,
        position: null,
      });
      onClose?.();
    }
  }, [cancel, cancelHide, state.isVisible, onClose]);

  // Schedule a hide with delay, can be cancelled if mouse enters card
  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimeoutRef.current = setTimeout(() => {
      // Only hide if not hovering over the card
      if (!isHoveringCardRef.current) {
        hide();
      }
    }, 100);
  }, [cancelHide, hide]);

  const onCardMouseEnter = useCallback(() => {
    isHoveringCardRef.current = true;
    setIsHoveringCard(true);
    cancelHide();
  }, [cancelHide]);

  const onCardMouseLeave = useCallback(() => {
    isHoveringCardRef.current = false;
    setIsHoveringCard(false);
    scheduleHide();
  }, [scheduleHide]);

  const getTargetProps = useCallback(
    (entityId: string, entityType: EntityType) => ({
      onMouseEnter: (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        show(entityId, entityType, {
          x: rect.left + rect.width / 2,
          y: rect.bottom + 12,
          targetTop: rect.top,
        });
      },
      onMouseLeave: () => {
        cancel();
        scheduleHide();
      },
    }),
    [show, cancel, scheduleHide],
  );

  return {
    state,
    show,
    hide,
    cancel,
    isHoveringCard,
    onCardMouseEnter,
    onCardMouseLeave,
    getTargetProps,
  };
}
