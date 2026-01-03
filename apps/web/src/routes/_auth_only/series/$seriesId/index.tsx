import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { LuBookOpen, LuDatabase, LuBookUser, LuGlobe, LuPackage, LuCalendar, LuSparkles } from 'react-icons/lu';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@~/components/ui/breadcrumb';
import { Card } from '@~/components/ui/card';
import { characterListQueryOptions } from '@~/features/characters/hooks/queries/use-character-list';
import { locationListQueryOptions } from '@~/features/locations/hooks/queries/use-location-list';
import { propListQueryOptions } from '@~/features/props/hooks/queries/use-prop-list';
import { useSeries, seriesQueryOptions } from '@~/features/series/hooks/queries/use-series';
import { timelineListQueryOptions } from '@~/features/timelines/hooks/queries/use-timeline-list';
import { wildcardListQueryOptions } from '@~/features/wildcards/hooks/queries/use-wildcard-list';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const Route = createFileRoute('/_auth_only/series/$seriesId/')({
  loader: async ({ context, params }) => {
    const { seriesId } = params;

    const baseListParams = { limit: 1, offset: 0 } as const;

    await Promise.all([
      context.queryClient.ensureQueryData(seriesQueryOptions(seriesId)),
      context.queryClient.ensureQueryData(
        tanstackRPC.scripts.listScriptsBySeries.queryOptions({
          input: { seriesId, ...baseListParams },
        }),
      ),
      context.queryClient.ensureQueryData(characterListQueryOptions(seriesId, baseListParams)),
      context.queryClient.ensureQueryData(locationListQueryOptions(seriesId, baseListParams)),
      context.queryClient.ensureQueryData(propListQueryOptions(seriesId, baseListParams)),
      context.queryClient.ensureQueryData(timelineListQueryOptions(seriesId, baseListParams)),
      context.queryClient.ensureQueryData(wildcardListQueryOptions(seriesId, baseListParams)),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { seriesId } = Route.useParams();
  const { data: series, isPending, error } = useSeries(seriesId);

  const { data: scriptsData } = useQuery({
    ...tanstackRPC.scripts.listScriptsBySeries.queryOptions({
      input: { seriesId, limit: 1, offset: 0 },
    }),
    enabled: !!seriesId,
  });

  const { data: charactersData } = useQuery({
    ...tanstackRPC.knowledgeBase.characters.list.queryOptions({
      input: { seriesId, limit: 1, offset: 0 },
    }),
    enabled: !!seriesId,
  });

  const { data: locationsData } = useQuery({
    ...tanstackRPC.knowledgeBase.locations.list.queryOptions({
      input: { seriesId, limit: 1, offset: 0 },
    }),
    enabled: !!seriesId,
  });

  const { data: propsData } = useQuery({
    ...tanstackRPC.knowledgeBase.props.list.queryOptions({
      input: { seriesId, limit: 1, offset: 0 },
    }),
    enabled: !!seriesId,
  });

  const { data: timelineData } = useQuery({
    ...tanstackRPC.knowledgeBase.timeline.list.queryOptions({
      input: { seriesId, limit: 1, offset: 0 },
    }),
    enabled: !!seriesId,
  });

  const { data: wildcardsData } = useQuery({
    ...tanstackRPC.knowledgeBase.wildcards.list.queryOptions({
      input: { seriesId, limit: 1, offset: 0 },
    }),
    enabled: !!seriesId,
  });

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading series...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Error loading series: {error.message}</p>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Series not found</p>
      </div>
    );
  }

  const scriptCount = scriptsData?.total ?? 0;
  const characterCount = charactersData?.total ?? 0;
  const locationCount = locationsData?.total ?? 0;
  const propCount = propsData?.total ?? 0;
  const timelineCount = timelineData?.total ?? 0;
  const wildcardCount = wildcardsData?.total ?? 0;
  const totalKBEntities = characterCount + locationCount + propCount + timelineCount + wildcardCount;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/projects" className="transition-colors hover:text-foreground">
                    Projects
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{series.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-start gap-6">
            {series.coverUrl ? (
              <img src={series.coverUrl} alt={series.title} className="h-32 w-24 rounded-lg object-cover shadow-md" />
            ) : null}
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{series.title}</h1>
              {series.genre ? <p className="mt-1 text-sm text-muted-foreground">{series.genre}</p> : null}
              {series.logline ? <p className="mt-3 text-base text-muted-foreground">{series.logline}</p> : null}
              <p className="mt-2 text-xs text-muted-foreground">
                Last edited: {new Date(series.lastEditedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Quick Stats</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <LuBookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{scriptCount}</p>
                  <p className="text-sm text-muted-foreground">Scripts</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <LuDatabase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalKBEntities}</p>
                  <p className="text-sm text-muted-foreground">KB Entities</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Knowledge Base Breakdown */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Knowledge Base Breakdown</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Card className="p-4">
              <div className="flex flex-col items-center text-center">
                <LuBookUser className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-lg font-semibold text-foreground">{characterCount}</p>
                <p className="text-xs text-muted-foreground">Characters</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex flex-col items-center text-center">
                <LuGlobe className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-lg font-semibold text-foreground">{locationCount}</p>
                <p className="text-xs text-muted-foreground">Locations</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex flex-col items-center text-center">
                <LuPackage className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-lg font-semibold text-foreground">{propCount}</p>
                <p className="text-xs text-muted-foreground">Props</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex flex-col items-center text-center">
                <LuCalendar className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-lg font-semibold text-foreground">{timelineCount}</p>
                <p className="text-xs text-muted-foreground">Timeline</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex flex-col items-center text-center">
                <LuSparkles className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-lg font-semibold text-foreground">{wildcardCount}</p>
                <p className="text-xs text-muted-foreground">Wild Cards</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Navigation Actions */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">Navigate to</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="group overflow-hidden transition-all hover:shadow-md">
              <div className="block p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted transition-colors">
                    <LuBookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Scripts</h3>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="group overflow-hidden transition-all hover:shadow-md">
              <Link to="/series/$seriesId/knowledge-base" params={{ seriesId }} className="block p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <LuDatabase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary">Knowledge Base</h3>
                    <p className="text-sm text-muted-foreground">Manage characters, locations, props, and more</p>
                  </div>
                </div>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
