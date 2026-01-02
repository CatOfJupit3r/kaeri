import { Card } from '@~/components/ui/card';
import { Skeleton } from '@~/components/ui/skeleton';

export function SeriesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={`skeleton-${index + 1}`} className="overflow-hidden">
          <div className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="size-8 rounded" />
            </div>
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
