import { LuBookOpen, LuFilm, LuMapPin, LuPackage, LuTrendingUp, LuUsers } from 'react-icons/lu';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import { Progress } from '@~/components/ui/progress';
import { Skeleton } from '@~/components/ui/skeleton';

import type { SeriesAnalyticsQueryReturnType } from '../hooks/queries/use-series-analytics';
import { useSeriesAnalytics } from '../hooks/queries/use-series-analytics';

interface iSeriesAnalyticsDashboardProps {
  seriesId: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </CardContent>
    </Card>
  );
}

function LocationDistributionCard({ items }: { items: SeriesAnalyticsQueryReturnType['locationDistribution'] }) {
  const maxCount = Math.max(...items.map((i) => i.sceneCount), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LuMapPin className="size-4" />
          Scenes by Location
        </CardTitle>
        <CardDescription>Distribution of scenes across locations</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No location data available</p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 10).map((item) => (
              <div key={item.locationId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{item.locationName}</span>
                  <span className="text-muted-foreground">{item.sceneCount} scenes</span>
                </div>
                <Progress value={(item.sceneCount / maxCount) * 100} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CharacterAppearancesCard({ items }: { items: SeriesAnalyticsQueryReturnType['characterAppearances'] }) {
  const maxCount = Math.max(...items.map((i) => i.appearanceCount), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LuUsers className="size-4" />
          Character Appearances
        </CardTitle>
        <CardDescription>Most frequently appearing characters</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No character data available</p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 10).map((item) => (
              <div key={item.characterId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{item.characterName}</span>
                  <span className="text-muted-foreground">{item.appearanceCount} appearances</span>
                </div>
                <Progress value={(item.appearanceCount / maxCount) * 100} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StoryArcProgressCard({ items }: { items: SeriesAnalyticsQueryReturnType['storyArcProgress'] }) {
  const statusColors: Record<string, string> = {
    planned: 'bg-slate-500',
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
    abandoned: 'bg-red-500',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LuTrendingUp className="size-4" />
          Story Arc Progress
        </CardTitle>
        <CardDescription>Status of all story arcs</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No story arcs created yet</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.arcId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`size-3 rounded-full ${statusColors[item.status] ?? 'bg-slate-500'}`} />
                  <span className="text-sm">{item.arcName}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.beatCount} beats • {item.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats grid skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((__, j) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={j} className="space-y-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SeriesAnalyticsDashboard({ seriesId }: iSeriesAnalyticsDashboardProps) {
  const { data, isPending, error } = useSeriesAnalytics(seriesId);

  if (isPending) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">Failed to load analytics: {error.message}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { overview, locationDistribution, characterAppearances, storyArcProgress } = data;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Scripts" value={overview.scriptCount} icon={LuBookOpen} />
        <StatCard title="Characters" value={overview.characterCount} icon={LuUsers} />
        <StatCard title="Locations" value={overview.locationCount} icon={LuMapPin} />
        <StatCard title="Props" value={overview.propCount} icon={LuPackage} />
        <StatCard title="Scenes" value={overview.sceneCount} icon={LuFilm} />
        <StatCard
          title="Total Words"
          value={overview.totalWordCount}
          icon={LuBookOpen}
          description="Across all scripts"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <LocationDistributionCard items={locationDistribution} />
        <CharacterAppearancesCard items={characterAppearances} />
        <StoryArcProgressCard items={storyArcProgress} />
      </div>
    </div>
  );
}
