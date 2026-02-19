import { useMutation } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const updateExportPresetMutationOptions = tanstackRPC.export.updateExportPreset.mutationOptions({
  onSuccess: (_data, _variables, _context, ctx) => {
    void ctx.client.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.some((k) => typeof k === 'string' && k.includes('Export'));
      },
    });
  },
});

export function useUpdateExportPreset() {
  const mutation = useMutation(updateExportPresetMutationOptions);

  return {
    updatePreset: mutation.mutate,
    updatePresetAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
