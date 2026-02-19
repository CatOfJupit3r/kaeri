import { useMutation } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const deleteExportPresetMutationOptions = tanstackRPC.export.deleteExportPreset.mutationOptions({
  onSuccess: (_data, _variables, _context, ctx) => {
    void ctx.client.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.some((k) => typeof k === 'string' && k.includes('listExportPresets'));
      },
    });
  },
});

export function useDeleteExportPreset() {
  const mutation = useMutation(deleteExportPresetMutationOptions);

  return {
    deletePreset: mutation.mutate,
    deletePresetAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
