import { useMutation } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { ScriptQueryReturnType } from '../queries/use-script';

export const updateScriptMutationOptions = tanstackRPC.scripts.updateScript.mutationOptions({
  onMutate: async (input, ctx) => {
    const { scriptId, patch } = input;
    const queryKey = tanstackRPC.scripts.getScript.queryKey({ input: { scriptId } });

    // Cancel any outgoing refetches
    await ctx.client.cancelQueries({ queryKey });

    // Snapshot the previous value
    const previousScript = ctx.client.getQueryData<ScriptQueryReturnType>(queryKey);

    // Optimistically update to the new value
    if (previousScript) {
      ctx.client.setQueryData<ScriptQueryReturnType>(queryKey, {
        ...previousScript,
        ...patch,
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
    } else {
      void ctx.client.invalidateQueries({ queryKey });
    }
  },
  onSuccess: (data, input, _context, ctx) => {
    const { scriptId } = input;

    // Update with server response
    ctx.client.setQueryData<ScriptQueryReturnType>(
      tanstackRPC.scripts.getScript.queryKey({ input: { scriptId } }),
      data,
    );

    // Invalidate list - pass input with empty seriesId to match all
    void ctx.client.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'scripts' && query.queryKey[1] === 'listScriptsBySeries',
    });
  },
});

export function useUpdateScript() {
  const mutation = useMutation(updateScriptMutationOptions);

  return {
    updateScript: mutation.mutate,
    updateScriptAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
