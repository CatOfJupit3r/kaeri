import { useMutation } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { ScriptQueryReturnType } from '../queries/use-script';

export const createScriptMutationOptions = tanstackRPC.scripts.createScript.mutationOptions({
  onSuccess: (_data, _variables, _context, ctx) => {
    // Invalidate scripts list using predicate
    void ctx.client.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.some((k) => typeof k === 'string' && k.includes('listScriptsBySeries'));
      },
    });
  },
});

export function useCreateScript() {
  const mutation = useMutation(createScriptMutationOptions);

  return {
    createScript: mutation.mutate,
    createScriptAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
