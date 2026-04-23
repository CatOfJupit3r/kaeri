import { useMutation } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const createScriptVersionMutationOptions = tanstackRPC.scripts.createScriptVersion.mutationOptions({
  onSuccess: (_data, input, _context, ctx) => {
    const queryKey = tanstackRPC.scripts.listScriptVersions.queryKey({ input: { scriptId: input.scriptId } });
    void ctx.client.invalidateQueries({ queryKey });
  },
});

export function useCreateScriptVersion() {
  const {
    mutate: createVersion,
    mutateAsync: createVersionAsync,
    isPending,
  } = useMutation(createScriptVersionMutationOptions);

  return {
    createVersion,
    createVersionAsync,
    isPending,
  };
}
