import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { LuMapPin, LuBox, LuFileText } from 'react-icons/lu';

import { Skeleton } from '@~/components/ui/skeleton';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export interface iLocationPreviewProps {
  /** Location entity ID */
  entityId: string;
  /** Series ID for data fetching */
  seriesId: string;
}

/**
 * Location Preview Component
 */
export const LocationPreview = memo(({ entityId, seriesId }: iLocationPreviewProps) => {
  // Use wildcards as location-like entities
  const { data: entity, isLoading } = useQuery({
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

  if (!entity) {
    return <div className="p-4 text-sm text-muted-foreground">Location not found</div>;
  }

  return (
    <div className="p-4">
      {/* Header with icon and name */}
      <div className="flex items-start gap-3">
        <div className="flex size-12 items-center justify-center rounded bg-emerald-100">
          <LuMapPin className="size-6 text-emerald-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{entity.title}</h3>
          <p className="text-sm text-muted-foreground">Location</p>
        </div>
      </div>

      {/* Description */}
      {entity.body ? <p className="mt-3 line-clamp-2 text-sm">{entity.body}</p> : null}

      {/* Stats */}
      <div className="mt-3 space-y-1.5 text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <LuBox className="size-4" />
            <span>0 props</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <LuFileText className="size-4" />
            <span>0 scenes</span>
          </div>
        </div>
      </div>
    </div>
  );
});
