import { useMutation } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { ScriptQueryReturnType } from '../queries/use-script';

export const saveScriptContentMutationOptions = tanstackRPC.scripts.saveScriptContent.mutationOptions({
  onMutate: async (input, ctx) => {
    const { scriptId, content } = input;
    const queryKey = tanstackRPC.scripts.getScript.queryKey({ input: { scriptId } });

    // Cancel any outgoing refetches
    await ctx.client.cancelQueries({ queryKey });

    // Snapshot the previous value
    const previousScript = ctx.client.getQueryData<ScriptQueryReturnType>(queryKey);

    // Optimistically update content
    if (previousScript) {
      ctx.client.setQueryData<ScriptQueryReturnType>(queryKey, {
        ...previousScript,
        content,
        lastEditedAt: new Date(),
      });
    }

    return { previousScript };
  },
  onError: (_error, input, context, ctx) => {
    const { scriptId } = input;
    const queryKey = tanstackRPC.scripts.getScript.queryKey({ input: { scriptId } });

    // Rollback on error
    if (context?.previousScript) {
      ctx.client.setQueryData<ScriptQueryReturnType>(queryKey, context.previousScript);
    }
  },
  onSuccess: (data, input, _context, ctx) => {
    const { scriptId } = input;
    const queryKey = tanstackRPC.scripts.getScript.queryKey({ input: { scriptId } });

    // Update lastEditedAt from server
    ctx.client.setQueryData<ScriptQueryReturnType>(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        lastEditedAt: data.lastEditedAt,
      };
    });
  },
});

interface iUseSaveScriptContentOptions {
  /** Debounce delay in milliseconds */
  debounceMs?: number;
}

export function useSaveScriptContent(options: iUseSaveScriptContentOptions = {}) {
  const { debounceMs = 1000 } = options;
  const mutation = useMutation(saveScriptContentMutationOptions);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const saveContent = useCallback(
    (scriptId: string, content: string) => {
      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Debounce the save
      debounceRef.current = setTimeout(() => {
        mutation.mutate({ scriptId, content });
      }, debounceMs);
    },
    [mutation, debounceMs],
  );

  const saveContentImmediate = useCallback(
    (scriptId: string, content: string) => {
      // Clear any pending debounced save
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      mutation.mutate({ scriptId, content });
    },
    [mutation],
  );

  return {
    saveContent,
    saveContentImmediate,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
