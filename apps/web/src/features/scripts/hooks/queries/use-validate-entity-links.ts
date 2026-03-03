import { useMutation } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type ValidateLinksReturnType = ORPCOutputs['scriptKBIntegration']['validateEntityLinks'];

export interface iEntityLinkToValidate {
  entityType: string;
  entityId: string;
}

// Type alias for external use
export type EntityLinkToValidate = iEntityLinkToValidate;

/**
 * Mutation options for validating entity links.
 *
 * Checks which linked entities still exist.
 * Returns list of orphaned (deleted) entity IDs.
 */
export const validateEntityLinksMutationOptions = tanstackRPC.scriptKBIntegration.validateEntityLinks.mutationOptions(
  {},
);

/**
 * Hook for validating entity links exist.
 *
 * This is a mutation rather than a query because:
 * 1. It's called imperatively (not on mount)
 * 2. It may be called with different link sets
 * 3. Results are used to update local state, not cached
 *
 * @example
 * ```tsx
 * const { validateLinks, isPending } = useValidateEntityLinks();
 * const markOrphaned = useMarkOrphaned();
 *
 * // Validate links on script load
 * const result = await validateLinks({
 *   seriesId,
 *   links: allLinks.map(l => ({ entityType: l.entityType, entityId: l.entityId })),
 * });
 *
 * // Mark orphaned links in local state
 * markOrphaned(result.orphaned);
 * ```
 */
export function useValidateEntityLinks() {
  const mutation = useMutation(validateEntityLinksMutationOptions);

  return {
    validateLinks: mutation.mutate,
    validateLinksAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
