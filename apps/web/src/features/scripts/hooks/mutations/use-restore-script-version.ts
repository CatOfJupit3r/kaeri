import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const restoreScriptVersionMutationOptions = tanstackRPC.scripts.restoreScriptVersion.mutationOptions({
  onSuccess: (data, input, _context, ctx) => {
    // Invalidate both the script content and version list
    const scriptKey = tanstackRPC.scripts.getScript.queryKey({ input: { scriptId: input.scriptId } });
    const versionsKey = tanstackRPC.scripts.listScriptVersions.queryKey({ input: { scriptId: input.scriptId } });
    void ctx.client.invalidateQueries({ queryKey: scriptKey });
    void ctx.client.invalidateQueries({ queryKey: versionsKey });
    toastSuccess('Version restored', `Restored to v${data.restoredVersion}. A safety snapshot was saved.`);
  },
  onError: (error, input, _context, ctx) => {
    const scriptKey = tanstackRPC.scripts.getScript.queryKey({ input: { scriptId: input.scriptId } });
    void ctx.client.invalidateQueries({ queryKey: scriptKey });
    toastORPCError('Failed to restore version', error);
  },
});

export function useRestoreScriptVersion() {
  const {
    mutate: restoreVersion,
    mutateAsync: restoreVersionAsync,
    isPending,
  } = useMutation(restoreScriptVersionMutationOptions);

  return {
    restoreVersion,
    restoreVersionAsync,
    isPending,
  };
}
