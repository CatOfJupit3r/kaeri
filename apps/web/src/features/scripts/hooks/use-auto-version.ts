import { useCallback, useEffect, useRef } from 'react';

import { useCreateScriptVersion } from './mutations/use-create-script-version';

interface iUseAutoVersionOptions {
  scriptId: string;
  /** Whether the editor has unsaved content changes since the last version */
  enabled?: boolean;
}

/**
 * Automatically creates a version snapshot when the user leaves the editor tab
 * (visibility change) or after a period of inactivity.
 * Deduplication is handled server-side via content hash.
 */
export function useAutoVersion({ scriptId, enabled = true }: iUseAutoVersionOptions) {
  const { createVersion } = useCreateScriptVersion();
  const hasContentChangedRef = useRef(false);

  const markContentChanged = useCallback(() => {
    hasContentChangedRef.current = true;
  }, []);

  const tryCreateVersion = useCallback(() => {
    if (!enabled || !hasContentChangedRef.current || !scriptId) return;
    hasContentChangedRef.current = false;
    // Fire-and-forget — server deduplicates via content hash,
    // so if content hasn't actually changed since last version this is a no-op (400).
    createVersion({ scriptId });
  }, [enabled, scriptId, createVersion]);

  // Auto-version on visibility change (tab blur)
  useEffect(() => {
    if (!enabled) return undefined;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        tryCreateVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, tryCreateVersion]);

  // Auto-version on beforeunload (page close/navigate away)
  useEffect(() => {
    if (!enabled) return undefined;

    const handleBeforeUnload = () => {
      tryCreateVersion();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, tryCreateVersion]);

  return { markContentChanged };
}
