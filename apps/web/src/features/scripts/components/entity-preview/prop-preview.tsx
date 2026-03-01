import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { LuBox, LuInfo } from 'react-icons/lu';

import { Skeleton } from '@~/components/ui/skeleton';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export interface iPropPreviewProps {
  /** Prop entity ID */
  entityId: string;
  /** Series ID for data fetching */
  seriesId: string;
}

/**
 * Prop Preview Component
 */
export const PropPreview = memo(({ entityId, seriesId }: iPropPreviewProps) => {
  const { data: prop, isLoading } = useQuery({
    ...tanstackRPC.knowledgeBase.props.get.queryOptions({
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

  if (!prop) {
    return <div className="p-4 text-sm text-muted-foreground">Prop not found</div>;
  }

  const associationsCount = prop.associations?.length ?? 0;

  return (
    <div className="p-4">
      {/* Header with icon and name */}
      <div className="flex items-start gap-3">
        <div className="flex size-12 items-center justify-center rounded bg-amber-100">
          <LuBox className="size-6 text-amber-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{prop.name}</h3>
          <p className="truncate text-sm text-muted-foreground">Prop</p>
        </div>
      </div>

      {/* Description */}
      {prop.description ? <p className="mt-3 line-clamp-2 text-sm">{prop.description}</p> : null}

      {/* Stats */}
      <div className="mt-3 space-y-1.5 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <LuInfo className="size-4" />
          <span>{associationsCount} associations</span>
        </div>
      </div>
    </div>
  );
});
