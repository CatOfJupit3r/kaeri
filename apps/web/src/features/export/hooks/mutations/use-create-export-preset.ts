import { useMutation } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const createExportPresetMutationOptions = tanstackRPC.export.createExportPreset.mutationOptions({
  onSuccess: (_data, _variables, _context, ctx) => {
    void ctx.client.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.some((k) => typeof k === 'string' && k.includes('listExportPresets'));
      },
    });
  },
});

export function useCreateExportPreset() {
  const mutation = useMutation(createExportPresetMutationOptions);

  return {
    createPreset: mutation.mutate,
    createPresetAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
