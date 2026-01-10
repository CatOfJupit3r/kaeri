import type { ReactNode } from 'react';
import { LuArrowRight } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardHeader } from '@~/components/ui/card';
import { Skeleton } from '@~/components/ui/skeleton';

interface iEntitySummaryCardProps {
  title: string;
  icon: ReactNode;
  count: number;
  recentEntities: Array<{
    id: string;
    name: string;
    subtitle?: string;
  }>;
  onViewAll: () => void;
  onEntityClick?: (entityId: string) => void;
  isPending?: boolean;
}

function EntitySummaryCardPending() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-6 w-12" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function EntitySummaryCard({
  title,
  icon,
  count,
  recentEntities,
  onViewAll,
  onEntityClick,
  isPending = false,
}: iEntitySummaryCardProps) {
  if (isPending) {
    return <EntitySummaryCardPending />;
  }

  const hasEntities = recentEntities.length > 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground">{icon}</div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <Badge variant="secondary" className="text-sm">
          {count}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {hasEntities ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {recentEntities.map((entity) => (
                <div
                  key={entity.id}
                  className="group cursor-pointer rounded-md border border-border p-2 transition-colors hover:border-primary hover:bg-accent"
                  role="button"
                  tabIndex={0}
                  onClick={() => onEntityClick?.(entity.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onEntityClick?.(entity.id);
                    }
                  }}
                >
                  <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">{entity.name}</p>
                  {entity.subtitle ? <p className="truncate text-xs text-muted-foreground">{entity.subtitle}</p> : null}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={onViewAll}>
              View All
              <LuArrowRight className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">No {title.toLowerCase()} yet</p>
            <Button variant="outline" className="gap-2" onClick={onViewAll}>
              Get Started
              <LuArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
