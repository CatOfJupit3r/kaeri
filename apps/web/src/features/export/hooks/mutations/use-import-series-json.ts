import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const importSeriesJsonMutationOptions = tanstackRPC.export.importSeriesJson.mutationOptions({
  onSuccess: async (data, _variables, _context, ctx) => {
    const { imported, skipped, errors } = data;
    const total =
      imported.characters +
      imported.locations +
      imported.props +
      imported.timeline +
      imported.wildcards +
      imported.canvasNodes +
      imported.canvasEdges;

    if (errors.length > 0) {
      toastSuccess(`Imported ${total} items (${skipped} skipped with errors)`);
    } else {
      toastSuccess(`Successfully imported ${total} items`);
    }

    // Invalidate all KB queries
    await ctx.client.invalidateQueries({ queryKey: ['characters'] });
    await ctx.client.invalidateQueries({ queryKey: ['locations'] });
    await ctx.client.invalidateQueries({ queryKey: ['props'] });
    await ctx.client.invalidateQueries({ queryKey: ['timeline'] });
    await ctx.client.invalidateQueries({ queryKey: ['wildcards'] });
    await ctx.client.invalidateQueries({ queryKey: ['canvas'] });
  },
  onError: (error) => {
    toastORPCError('Failed to import data', error);
  },
});

export function useImportSeriesJson() {
  const mutation = useMutation(importSeriesJsonMutationOptions);

  return {
    importSeriesJson: mutation.mutate,
    importSeriesJsonAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
