import { useMutation } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const duplicateExportPresetMutationOptions = tanstackRPC.export.duplicateExportPreset.mutationOptions({
  onSuccess: (_data, _variables, _context, ctx) => {
    void ctx.client.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.some((k) => typeof k === 'string' && k.includes('listExportPresets'));
      },
    });
  },
});

export function useDuplicateExportPreset() {
  const mutation = useMutation(duplicateExportPresetMutationOptions);

  return {
    duplicatePreset: mutation.mutate,
    duplicatePresetAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
