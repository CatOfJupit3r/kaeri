import { useMutation } from '@tanstack/react-query';

import { toastORPCError, toastSuccess } from '@~/components/toastifications';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import { invalidateKnowledgeBaseLists, KB_LIST_DEFAULT_PARAMS } from '../../../knowledge-base/helpers/cache-utils';
import type { TimelineListQueryReturnType } from '../queries/use-timeline-list';

type TimelineListItem = TimelineListQueryReturnType['items'][number];

export const createTimelineMutationOptions = tanstackRPC.knowledgeBase.timeline.create.mutationOptions({
  onMutate: async ({ seriesId, value }, ctx) => {
    const queryKey = tanstackRPC.knowledgeBase.timeline.list.queryKey({
      input: { seriesId, ...KB_LIST_DEFAULT_PARAMS },
    });

    await ctx.client.cancelQueries({ queryKey });

    const previous = ctx.client.getQueryData<TimelineListQueryReturnType>(queryKey);
    const tempId = `temp-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;

    const optimisticTimeline: TimelineListItem = {
      _id: tempId,
      seriesId,
      label: value.label,
      order: value.order,
      timestamp: value.timestamp,
      links: value.links ?? [],
    };

    ctx.client.setQueryData<TimelineListQueryReturnType>(queryKey, (old) => {
      if (!old) {
        return {
          items: [optimisticTimeline],
          total: 1,
        } satisfies TimelineListQueryReturnType;
      }

      return {
        ...old,
        items: [optimisticTimeline, ...old.items],
        total: old.total + 1,
      } satisfies TimelineListQueryReturnType;
    });

    return { previous, queryKey, tempId };
  },
  onSuccess: (createdTimeline, { seriesId }, context, ctx) => {
    if (context?.queryKey) {
      ctx.client.setQueryData<TimelineListQueryReturnType>(context.queryKey, (old) => {
        if (!old) return old;

        const withoutTemp = old.items.filter((item) => item._id !== context.tempId);
        return {
          ...old,
          items: [createdTimeline, ...withoutTemp],
        } satisfies TimelineListQueryReturnType;
      });
    }

    void invalidateKnowledgeBaseLists(ctx.client, 'timeline', seriesId);
    toastSuccess('Timeline entry created successfully');
  },
  onError: (error, _variables, context, ctx) => {
    if (context?.queryKey) {
      void ctx.client.invalidateQueries({ queryKey: context.queryKey });
    }
    toastORPCError('Failed to create timeline entry', error);
  },
});

export function useCreateTimeline() {
  const { mutate: createTimeline, isPending } = useMutation(createTimelineMutationOptions);

  return {
    createTimeline,
    isPending,
  };
}
