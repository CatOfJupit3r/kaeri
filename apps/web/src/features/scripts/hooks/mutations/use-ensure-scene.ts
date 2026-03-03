import { useMutation } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

/**
 * Mutation options for ensuring a Scene entity exists.
 *
 * Idempotent operation:
 * - If Scene exists for scriptId + sceneNumber, returns it
 * - If not, creates new Scene with provided data
 *
 * This enables automatic Scene creation as writers add scene headings.
 */
export const ensureSceneMutationOptions = tanstackRPC.scriptKBIntegration.ensureScene.mutationOptions({
  onSuccess: ({ scene }, { seriesId }, _context, ctx) => {
    // Invalidate scenes list if a new scene was created
    if (scene.isNew) {
      void ctx.client.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key.some((k) => typeof k === 'string' && k.includes('scenes')) &&
            key.some(
              (k) =>
                typeof k === 'object' &&
                k !== null &&
                'input' in k &&
                (k as { input: { seriesId: string } }).input.seriesId === seriesId,
            )
          );
        },
      });
    }

    return scene;
  },
});

export interface iEnsureSceneInput {
  scriptId: string;
  seriesId: string;
  heading: string;
  sceneNumber: number;
  locationId?: string;
  timeOfDay?: string;
}

// Type alias for external use
export type EnsureSceneInput = iEnsureSceneInput;

export interface iEnsureSceneResult {
  _id: string;
  heading: string;
  sceneNumber: number;
  locationId?: string;
  isNew: boolean;
}

// Type alias for external use
export type EnsureSceneResult = iEnsureSceneResult;

/**
 * Hook for ensuring Scene entities exist for script scenes.
 *
 * @example
 * ```tsx
 * const { ensureScene, isPending } = useEnsureScene();
 *
 * // Auto-create scene when scene heading is confirmed
 * const result = await ensureScene({
 *   scriptId,
 *   seriesId,
 *   heading: 'INT. OFFICE - DAY',
 *   sceneNumber: 1,
 *   locationId: 'abc123', // optional, if location was selected
 *   timeOfDay: 'DAY',
 * });
 *
 * // result.scene._id can now be stored in the scene heading block
 * // result.scene.isNew tells whether it was created or already existed
 * ```
 */
export function useEnsureScene() {
  const mutation = useMutation(ensureSceneMutationOptions);

  return {
    ensureScene: mutation.mutate,
    ensureSceneAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
