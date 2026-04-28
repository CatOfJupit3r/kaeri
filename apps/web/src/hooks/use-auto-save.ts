import { useCallback, useEffect, useRef } from 'react';

interface iFormWithHandleSubmit {
  handleSubmit: () => Promise<void>;
}

interface iUseAutoSaveOptions {
  /** Whether the mutation is currently in progress */
  isUpdating: boolean;
  /** Debounce delay in milliseconds (default: 0 - no debounce, immediate save) */
  debounceMs?: number;
  /** Whether auto-save is enabled (default: true). Set to false for dialog mode. */
  enabled?: boolean;
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
export function useAutoSave(
  form: iFormWithHandleSubmit,
  { isUpdating, debounceMs = 0, enabled = true }: iUseAutoSaveOptions,
) {
  const isInitializedRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSave = useCallback(() => {
    pendingSaveRef.current = false;
    form.handleSubmit().catch(() => {
      // Handle submit errors silently - the form validators will show errors
    });
  }, [form]);

  const initializeAutoSave = useCallback(() => {
    if (initializationTimeoutRef.current) {
      clearTimeout(initializationTimeoutRef.current);
    }

    isInitializedRef.current = false;
    initializationTimeoutRef.current = setTimeout(() => {
      isInitializedRef.current = true;

      if (!enabled || isUpdating || !pendingSaveRef.current) {
        return;
      }

      performSave();
    }, 100);
  }, [enabled, isUpdating, performSave]);

  // Mark as initialized after a short delay to avoid autosave on initial load
  useEffect(() => {
    initializeAutoSave();

    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      isInitializedRef.current = false;
      pendingSaveRef.current = false;
    };
  }, [initializeAutoSave]);

  // Cleanup debounce timeout on unmount
  useEffect(
    () => () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    },
    [],
  );

  const handleAutoSave = useCallback(() => {
    // Skip auto-save if disabled (e.g., in dialog mode)
    if (!enabled) return;

    if (!isInitializedRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    // Don't trigger if already updating
    if (isUpdating) return;

    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (debounceMs > 0) {
      debounceTimeoutRef.current = setTimeout(performSave, debounceMs);
    } else {
      performSave();
    }
  }, [debounceMs, enabled, isUpdating, performSave]);

  /**
   * Reset initialization state.
   * Call this when form data is reset/loaded to prevent auto-save on initial load.
   */
  const resetInitialization = useCallback(() => {
    initializeAutoSave();
  }, [initializeAutoSave]);

  return {
    handleAutoSave,
    resetInitialization,
    isInitialized: () => isInitializedRef.current,
  };
}
