import { useMutation } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const deleteScriptMutationOptions = tanstackRPC.scripts.deleteScript.mutationOptions({
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

export function useDeleteScript() {
  const mutation = useMutation(deleteScriptMutationOptions);

  return {
    deleteScript: mutation.mutate,
    deleteScriptAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
