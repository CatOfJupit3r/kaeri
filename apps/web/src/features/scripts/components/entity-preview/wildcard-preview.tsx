import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { LuAsterisk, LuTag } from 'react-icons/lu';

import { Skeleton } from '@~/components/ui/skeleton';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export interface iWildcardPreviewProps {
  /** Wildcard entity ID */
  entityId: string;
  /** Series ID for data fetching */
  seriesId: string;
}

/**
 * Wildcard Preview Component
 */
export const WildcardPreview = memo(({ entityId, seriesId }: iWildcardPreviewProps) => {
  const { data: wildcard, isLoading } = useQuery({
    ...tanstackRPC.knowledgeBase.wildcards.get.queryOptions({
      input: { id: entityId, seriesId },
    }),
    enabled: !!entityId && !!seriesId,
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-12 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    );
  }

  if (!wildcard) {
    return <div className="p-4 text-sm text-muted-foreground">Wildcard not found</div>;
  }

  return (
    <div className="p-4">
      {/* Header with icon and title */}
      <div className="flex items-start gap-3">
        <div className="flex size-12 items-center justify-center rounded bg-purple-100">
          <LuAsterisk className="size-6 text-purple-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{wildcard.title}</h3>
          <p className="truncate text-sm text-muted-foreground">Wildcard</p>
        </div>
      </div>

      {/* Body */}
      {wildcard.body ? <p className="mt-3 line-clamp-3 text-sm">{wildcard.body}</p> : null}

      {/* Tag */}
      {wildcard.tag ? (
        <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
          <LuTag className="size-4" />
          <span>{wildcard.tag}</span>
        </div>
      ) : null}
    </div>
  );
});
