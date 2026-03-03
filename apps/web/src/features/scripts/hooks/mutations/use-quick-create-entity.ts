import { useMutation } from '@tanstack/react-query';

import { tanstackRPC } from '@~/utils/tanstack-orpc';

import type { EntityType } from '../../extensions/entity-mention';

/**
 * Mutation options for quick-creating an entity from the script editor.
 *
 * Creates a minimal entity for immediate use in the script.
 * The user can enrich entity details later via the KB panel.
 */
export const quickCreateEntityMutationOptions = tanstackRPC.scriptKBIntegration.quickCreateEntity.mutationOptions({
  onSuccess: ({ entity }, { seriesId, entityType }, _context, ctx) => {
    // Invalidate KB lists for the entity type
    switch (entityType) {
      case 'character':
        void ctx.client.invalidateQueries({
          queryKey: tanstackRPC.knowledgeBase.characters.list.queryKey({ input: { seriesId } }),
        });
        break;
      case 'location':
        void ctx.client.invalidateQueries({
          queryKey: tanstackRPC.knowledgeBase.locations.list.queryKey({ input: { seriesId } }),
        });
        break;
      case 'prop':
        void ctx.client.invalidateQueries({
          queryKey: tanstackRPC.knowledgeBase.props.list.queryKey({ input: { seriesId } }),
        });
        break;
      case 'wildcard':
        void ctx.client.invalidateQueries({
          queryKey: tanstackRPC.knowledgeBase.wildcards.list.queryKey({ input: { seriesId } }),
        });
        break;
      default:
        // No additional invalidation needed for other entity types
        break;
    }

    // Invalidate autocomplete cache for this entity type
    void ctx.client.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return (
          Array.isArray(key) &&
          key.some((k) => typeof k === 'string' && k.includes('autocompleteSearch')) &&
          key.some(
            (k) =>
              typeof k === 'object' &&
              k !== null &&
              'input' in k &&
              (k as { input: { entityType: string } }).input.entityType === entityType,
          )
        );
      },
    });

    return entity;
  },
});

export interface iQuickCreateEntityInput {
  seriesId: string;
  entityType: EntityType | 'location';
  name: string;
  description?: string;
  initialAppearance?: {
    scriptId: string;
    sceneRef: string;
  };
}

// Type alias for external use
export type QuickCreateEntityInput = iQuickCreateEntityInput;

/**
 * Hook for quick-creating entities from the script editor.
 *
 * @example
 * ```tsx
 * const { quickCreate, isPending } = useQuickCreateEntity();
 *
 * // Create a character from autocomplete
 * quickCreate({
 *   seriesId,
 *   entityType: 'character',
 *   name: 'John Smith',
 *   initialAppearance: { scriptId, sceneRef: 'Scene 1' },
 * });
 * ```
 */
export function useQuickCreateEntity() {
  const mutation = useMutation(quickCreateEntityMutationOptions);

  return {
    quickCreate: mutation.mutate,
    quickCreateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
