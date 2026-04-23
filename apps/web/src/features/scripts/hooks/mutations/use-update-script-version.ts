import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const updateScriptVersionMutationOptions = tanstackRPC.scripts.updateScriptVersion.mutationOptions({
  onSuccess: (data, input, _context, ctx) => {
    const queryKey = tanstackRPC.scripts.listScriptVersions.queryKey({ input: { scriptId: input.scriptId } });
    void ctx.client.invalidateQueries({ queryKey });
    toastSuccess('Version renamed', `v${data.version} — ${data.name}`);
  },
  onError: (err) => {
    toastORPCError('Failed to rename version', err);
  },
});

export function useUpdateScriptVersion() {
  const { mutate: updateVersion, isPending } = useMutation(updateScriptVersionMutationOptions);

  return {
    updateVersion,
    isPending,
  };
}
