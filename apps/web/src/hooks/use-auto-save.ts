import { useCallback, useEffect, useRef } from 'react';

interface iFormWithHandleSubmit {
  handleSubmit: () => Promise<void>;
}

interface iUseAutoSaveOptions {
  /** Whether the mutation is currently in progress */
  isUpdating: boolean;
  /** Debounce delay in milliseconds (default: 0 - no debounce, immediate save) */
  debounceMs?: number;
}

/**
 * Hook to handle auto-save functionality for edit panels.
 * Manages initialization state and provides a save handler.
 *
 * @example
 * ```tsx
 * const { handleAutoSave } = useAutoSave(form, { isUpdating });
 *
 * // In your field
 * <field.TextField label="Name" onBlur={handleAutoSave} />
 * ```
 */
export function useAutoSave(form: iFormWithHandleSubmit, { isUpdating, debounceMs = 0 }: iUseAutoSaveOptions) {
  const isInitializedRef = useRef(false);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mark as initialized after a short delay to avoid autosave on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitializedRef.current = true;
    }, 100);
    return () => {
      clearTimeout(timer);
      isInitializedRef.current = false;
    };
  }, []);

  // Cleanup debounce timeout on unmount
  useEffect(
    () => () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    },
    [],
  );

  const handleAutoSave = useCallback(() => {
    if (!isInitializedRef.current) return;

    // Don't trigger if already updating
    if (isUpdating) return;

    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const performSave = () => {
      form.handleSubmit().catch(() => {
        // Handle submit errors silently - the form validators will show errors
      });
    };

    if (debounceMs > 0) {
      debounceTimeoutRef.current = setTimeout(performSave, debounceMs);
    } else {
      performSave();
    }
  }, [form, isUpdating, debounceMs]);

  /**
   * Reset initialization state.
   * Call this when form data is reset/loaded to prevent auto-save on initial load.
   */
  const resetInitialization = useCallback(() => {
    isInitializedRef.current = false;
    setTimeout(() => {
      isInitializedRef.current = true;
    }, 100);
  }, []);

  return {
    handleAutoSave,
    resetInitialization,
    isInitialized: () => isInitializedRef.current,
  };
}
