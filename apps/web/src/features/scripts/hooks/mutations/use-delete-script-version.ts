import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const deleteScriptVersionMutationOptions = tanstackRPC.scripts.deleteScriptVersion.mutationOptions({
  onSuccess: (_data, input, _context, ctx) => {
    const queryKey = tanstackRPC.scripts.listScriptVersions.queryKey({ input: { scriptId: input.scriptId } });
    void ctx.client.invalidateQueries({ queryKey });
    toastSuccess('Version deleted');
  },
  onError: (err) => {
    toastORPCError('Failed to delete version', err);
  },
});

export function useDeleteScriptVersion() {
  const { mutate: deleteVersion, isPending } = useMutation(deleteScriptVersionMutationOptions);

  return {
    deleteVersion,
    isPending,
  };
}
