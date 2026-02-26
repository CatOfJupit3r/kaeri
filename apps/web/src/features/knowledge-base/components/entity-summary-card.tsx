import type { ReactNode } from 'react';
import { LuArrowRight } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardHeader } from '@~/components/ui/card';
import { Skeleton } from '@~/components/ui/skeleton';
import { cn } from '@~/lib/utils';

/** Metadata item displayed as a badge or label */
export interface iEntityMetadata {
  /** Text to display */
  label: string;
  /** Variant for styling */
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  /** Optional icon to show before label */
  icon?: ReactNode;
}

/** Rich entity for display in summary card */
export interface iEntitySummaryItem {
  id: string;
  name: string;
  subtitle?: string;
  /** Color indicator (hex color) */
  color?: string;
  /** Avatar/image URL */
  avatarUrl?: string;
  /** Status badge */
  status?: {
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  };
  /** Tags/badges to display */
  tags?: string[];
  /** Metadata items (counts, labels) */
  metadata?: iEntityMetadata[];
  /** Optional left-side icon */
  icon?: ReactNode;
}

interface iEntitySummaryCardProps {
  title: string;
  icon: ReactNode;
  count: number;
  recentEntities: iEntitySummaryItem[];
  onViewAll: () => void;
  onEntityClick?: (entityId: string) => void;
  isPending?: boolean;
  /** Card display variant */
  variant?: 'default' | 'compact' | 'featured';
  /** Optional className for the card wrapper */
  className?: string;
}

function EntitySummaryCardPending({ variant = 'default' }: { variant?: 'default' | 'compact' | 'featured' }) {
  if (variant === 'compact') {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center gap-3 p-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-6 w-12" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: variant === 'featured' ? 4 : 3 }).map((_, index) => (
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
  variant = 'default',
  className,
}: iEntitySummaryCardProps) {
  if (isPending) {
    return <EntitySummaryCardPending variant={variant} />;
  }

  const hasEntities = recentEntities.length > 0;

  // Compact variant - minimal card with just header info and entity pills
  if (variant === 'compact') {
    return (
      <Card
        className={cn('flex h-full cursor-pointer flex-col transition-colors hover:bg-accent/50', className)}
        role="button"
        tabIndex={0}
        onClick={onViewAll}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onViewAll();
          }
        }}
      >
        <CardContent className="flex flex-1 items-center gap-3 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold">{title}</h3>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {count}
              </Badge>
            </div>
            {hasEntities ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {recentEntities
                  .slice(0, 2)
                  .map((e) => e.name)
                  .join(', ')}
                {recentEntities.length > 2 ? ` +${recentEntities.length - 2}` : ''}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">No items yet</p>
            )}
          </div>
          <LuArrowRight className="size-4 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Featured and default variant
  const displayCount = variant === 'featured' ? 4 : 3;
  const entitiesToShow = recentEntities.slice(0, displayCount);
  const hasEntitiesForDisplay = entitiesToShow.length > 0;

  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className={cn('text-muted-foreground', variant === 'featured' && 'text-primary')}>{icon}</div>
          <h3 className={cn('font-semibold text-foreground', variant === 'featured' ? 'text-xl' : 'text-lg')}>
            {title}
          </h3>
        </div>
        <Badge variant={variant === 'featured' ? 'default' : 'secondary'} className="text-sm">
          {count}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {hasEntitiesForDisplay ? (
          <div className="flex flex-1 flex-col">
            <div className="flex-1 space-y-2">
              {entitiesToShow.map((entity) => (
                <div
                  key={entity.id}
                  className={cn(
                    'group cursor-pointer rounded-md border border-border p-2.5 transition-colors hover:border-primary hover:bg-accent',
                    entity.color && 'border-l-4',
                  )}
                  style={entity.color ? { borderLeftColor: entity.color } : undefined}
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
                  <div className="flex items-start gap-2">
                    {/* Avatar or Icon */}
                    {entity.avatarUrl ? (
                      <img src={entity.avatarUrl} alt="" className="size-8 shrink-0 rounded-full object-cover" />
                    ) : null}
                    {!entity.avatarUrl && entity.icon ? (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        {entity.icon}
                      </div>
                    ) : null}

                    <div className="min-w-0 flex-1">
                      {/* Name and Status */}
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                          {entity.name}
                        </p>
                        {entity.status ? (
                          <Badge
                            variant={entity.status.variant ?? 'secondary'}
                            className="shrink-0 px-1.5 py-0 text-[10px]"
                          >
                            {entity.status.label}
                          </Badge>
                        ) : null}
                      </div>

                      {/* Subtitle */}
                      {entity.subtitle ? (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{entity.subtitle}</p>
                      ) : null}

                      {/* Tags */}
                      {entity.tags && entity.tags.length > 0 ? (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {entity.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="px-1.5 py-0 text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                          {entity.tags.length > 3 ? (
                            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                              +{entity.tags.length - 3}
                            </Badge>
                          ) : null}
                        </div>
                      ) : null}

                      {/* Metadata */}
                      {entity.metadata && entity.metadata.length > 0 ? (
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                          {entity.metadata.map((meta) => (
                            <span key={meta.label} className="flex items-center gap-0.5">
                              {meta.icon}
                              {meta.label}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-3 w-full gap-2" onClick={onViewAll}>
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
