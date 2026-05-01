import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router';
import { parseAsStringEnum, useQueryStates } from 'nuqs';
import { useState } from 'react';
import {
  LuBookUser,
  LuGlobe,
  LuPackage,
  LuCalendar,
  LuSparkles,
  LuTrendingUp,
  LuLightbulb,
  LuFilm,
  LuDownload,
  LuUpload,
  LuLayoutGrid,
  LuLayoutList,
  LuLoader,
  LuNetwork,
  LuHistory,
  LuBookOpen,
} from 'react-icons/lu';
import z from 'zod';

import { PAGE_SIZES } from '@kaeri/shared';

import { Button } from '@~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@~/components/ui/tabs';
import { Toggle } from '@~/components/ui/toggle';
import { CharacterList } from '@~/features/characters/components/character-list';
import { characterListQueryOptions } from '@~/features/characters/hooks/queries/use-character-list';
import { AuditHistoryList, ContinuityGraph } from '@~/features/continuity';
import { useContinuityGraph, useAuditListBySeries } from '@~/features/continuity/hooks/queries';
import { ImportModal } from '@~/features/export/components/import-modal';
import { useExportSeriesJson } from '@~/features/export/hooks/mutations/use-export-series-json';
import { KBAllView } from '@~/features/knowledge-base/components/kb-all-view';
import { KBSearch } from '@~/features/knowledge-base/components/kb-search';
import { LocationList } from '@~/features/locations/components/location-list';
import { LocationPanel } from '@~/features/locations/components/location-panel';
import { locationListQueryOptions } from '@~/features/locations/hooks/queries/use-location-list';
import { PropList } from '@~/features/props/components/prop-list';
import { PropPanel } from '@~/features/props/components/prop-panel';
import { propListQueryOptions } from '@~/features/props/hooks/queries/use-prop-list';
import { ResearchList } from '@~/features/research/components/research-list';
import { ResearchPanel } from '@~/features/research/components/research-panel';
import { SceneList } from '@~/features/scenes/components/scene-list';
import { SeriesHeader } from '@~/features/series/components/series-header';
import { SeriesTabs } from '@~/features/series/components/series-tabs';
import { useSeries, seriesQueryOptions } from '@~/features/series/hooks/queries/use-series';
import { StoryArcList } from '@~/features/story-arcs/components/story-arc-list';
import { StoryArcPanel } from '@~/features/story-arcs/components/story-arc-panel';
import { storyArcListQueryOptions } from '@~/features/story-arcs/hooks/queries/use-story-arc-list';
import { ThemeList } from '@~/features/themes/components/theme-list';
import { ThemePanel } from '@~/features/themes/components/theme-panel';
import { themeListQueryOptions } from '@~/features/themes/hooks/queries/use-theme-list';
import { TimelineList } from '@~/features/timelines/components/timeline-list';
import { timelineListQueryOptions } from '@~/features/timelines/hooks/queries/use-timeline-list';
import { WildcardList } from '@~/features/wildcards/components/wildcard-list';
import { wildcardListQueryOptions } from '@~/features/wildcards/hooks/queries/use-wildcard-list';

const tabSchema = z.enum([
  'all',
  'characters',
  'locations',
  'props',
  'scenes',
  'timeline',
  'wildcards',
  'story-arcs',
  'themes',
  'research',
  'graph',
  'history',
]);
const TAB_VALUES = tabSchema.enum;
const TAB_VALUES_ARRAY = Object.values(TAB_VALUES);
type TabValue = z.infer<typeof tabSchema>;

const viewModeSchema = z.enum(['grid', 'list']);
const VIEW_MODE = viewModeSchema.enum;
const VIEW_MODE_ARRAY = Object.values(VIEW_MODE);

export const Route = createFileRoute('/_auth_only/series/$seriesId/knowledge-base')({
  validateSearch: (search) => {
    const parsed = tabSchema.safeParse(search.tab);

    return {
      tab: parsed.success ? parsed.data : undefined,
    };
  },
  loader: async ({ context, params }) => {
    const { seriesId } = params;

    await Promise.all([
      context.queryClient.ensureQueryData(seriesQueryOptions(seriesId)),
      context.queryClient.ensureQueryData(characterListQueryOptions(seriesId)),
      context.queryClient.ensureQueryData(locationListQueryOptions(seriesId)),
      context.queryClient.ensureQueryData(propListQueryOptions(seriesId)),
      context.queryClient.ensureQueryData(timelineListQueryOptions(seriesId)),
      context.queryClient.ensureQueryData(wildcardListQueryOptions(seriesId)),
      context.queryClient.ensureQueryData(storyArcListQueryOptions(seriesId)),
      context.queryClient.ensureQueryData(themeListQueryOptions(seriesId)),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { seriesId } = Route.useParams();
  const location = useLocation();
  const { data: series } = useSeries(seriesId);
  const { exportSeriesJson, isPending: isExporting } = useExportSeriesJson();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [auditOffset, setAuditOffset] = useState(0);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [selectedResearchId, setSelectedResearchId] = useState<string | null>(null);
  const [selectedStoryArcId, setSelectedStoryArcId] = useState<string | null>(null);
  const [{ tab, viewMode }, setQueryStates] = useQueryStates({
    tab: parseAsStringEnum(TAB_VALUES_ARRAY).withDefault(TAB_VALUES.all),
    viewMode: parseAsStringEnum(VIEW_MODE_ARRAY).withDefault(VIEW_MODE.grid),
  });
  const activeTab = tab ?? TAB_VALUES.all;
  const activeViewMode = viewMode ?? VIEW_MODE.grid;

  // Continuity data (only fetch when on graph/history tabs)
  const { data: graphData, isLoading: isGraphLoading } = useContinuityGraph(seriesId, {
    enabled: activeTab === 'graph',
  });
  const { data: auditData, isLoading: isAuditLoading } = useAuditListBySeries(seriesId, {
    offset: auditOffset,
    limit: PAGE_SIZES.DEFAULT,
    enabled: activeTab === 'history',
  });

  const handleTabChange = (value: string) => {
    setQueryStates({ tab: (value as TabValue) ?? TAB_VALUES.all }).catch(() => {});
  };

  const handleResultClick = (entityId: string, entityType: string) => {
    const tabMap: Record<string, string> = {
      character: 'characters',
      location: 'locations',
      prop: 'props',
      scene: 'scenes',
      timeline: 'timeline',
      wildcard: 'wildcards',
      storyArc: 'story-arcs',
      theme: 'themes',
      research: 'research',
      all: 'all',
    };

    const targetTab = tabMap[entityType];
    if (targetTab) {
      setQueryStates({ tab: targetTab as TabValue }).catch(() => {});
    }
  };

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId);
  };

  const handleCloseLocationEdit = () => {
    setSelectedLocationId(null);
  };

  const handlePropSelect = (propId: string) => {
    setSelectedPropId(propId);
  };

  const handleClosePropEdit = () => {
    setSelectedPropId(null);
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedThemeId(themeId);
  };

  const handleCloseThemeEdit = () => {
    setSelectedThemeId(null);
  };

  const handleResearchSelect = (researchId: string) => {
    setSelectedResearchId(researchId);
  };

  const handleCloseResearchEdit = () => {
    setSelectedResearchId(null);
  };

  const handleStoryArcSelect = (storyArcId: string) => {
    setSelectedStoryArcId(storyArcId);
  };

  const handleCloseStoryArcEdit = () => {
    setSelectedStoryArcId(null);
  };

  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  const handleExport = () => {
    exportSeriesJson({ seriesId });
  };

  const toggleViewMode = () => {
    const newMode = activeViewMode === VIEW_MODE.grid ? VIEW_MODE.list : VIEW_MODE.grid;
    setQueryStates({ viewMode: newMode }).catch(() => {});
  };

  if (location.pathname !== `/series/${seriesId}/knowledge-base`) {
    return <Outlet />;
  }

  if (!series) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Series not found</p>
      </div>
    );
  }

  let knowledgeBaseContent = null;

  if (selectedLocationId != null) {
    knowledgeBaseContent = (
      <LocationPanel locationId={selectedLocationId} seriesId={seriesId} onClose={handleCloseLocationEdit} />
    );
  } else if (selectedPropId != null) {
    knowledgeBaseContent = <PropPanel propId={selectedPropId} seriesId={seriesId} onClose={handleClosePropEdit} />;
  } else if (selectedThemeId != null) {
    knowledgeBaseContent = <ThemePanel themeId={selectedThemeId} seriesId={seriesId} onClose={handleCloseThemeEdit} />;
  } else if (selectedResearchId != null) {
    knowledgeBaseContent = <ResearchPanel researchId={selectedResearchId} onBack={handleCloseResearchEdit} />;
  } else if (selectedStoryArcId != null) {
    knowledgeBaseContent = (
      <StoryArcPanel storyArcId={selectedStoryArcId} seriesId={seriesId} onClose={handleCloseStoryArcEdit} />
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Series Header */}
      <SeriesHeader series={series} />
      <SeriesTabs seriesId={seriesId} seriesType={series.type} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-3xl font-black tracking-tight text-foreground uppercase md:text-4xl">Knowledge Base</h2>
            <p className="mt-1 text-sm font-bold tracking-wide text-muted-foreground uppercase">
              Manage your series entities
            </p>
          </div>

          {knowledgeBaseContent ?? (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <KBSearch seriesId={seriesId} onResultClick={handleResultClick} />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImport}
                    className="brutalist-shadow-sm gap-2 border-2 border-foreground bg-transparent font-bold tracking-wide uppercase transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-(--brutalist-yellow) hover:shadow-none"
                  >
                    <LuUpload />
                    Import
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={isExporting}
                    className="brutalist-shadow-sm gap-2 border-2 border-foreground bg-transparent font-bold tracking-wide uppercase transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-(--brutalist-green) hover:shadow-none"
                  >
                    {isExporting ? <LuLoader className="animate-spin" /> : <LuDownload />}
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                  <Toggle
                    pressed={activeViewMode === VIEW_MODE.list}
                    onPressedChange={toggleViewMode}
                    aria-label="Toggle view mode"
                    size="sm"
                    className="border-2 border-foreground"
                  >
                    {activeViewMode === VIEW_MODE.grid ? <LuLayoutGrid /> : <LuLayoutList />}
                  </Toggle>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-12">
                  <TabsTrigger value="all" className="gap-2">
                    <LuLayoutGrid className="size-4" />
                    <span>All</span>
                  </TabsTrigger>
                  <TabsTrigger value="characters" className="gap-2">
                    <LuBookUser className="size-4" />
                    <span>Characters</span>
                  </TabsTrigger>
                  <TabsTrigger value="locations" className="gap-2">
                    <LuGlobe className="size-4" />
                    <span>Locations</span>
                  </TabsTrigger>
                  <TabsTrigger value="props" className="gap-2">
                    <LuPackage className="size-4" />
                    <span>Props</span>
                  </TabsTrigger>
                  <TabsTrigger value="scenes" className="gap-2">
                    <LuFilm className="size-4" />
                    <span>Scenes</span>
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="gap-2">
                    <LuCalendar className="size-4" />
                    <span>Timeline</span>
                  </TabsTrigger>
                  <TabsTrigger value="wildcards" className="gap-2">
                    <LuSparkles className="size-4" />
                    <span>Wild Cards</span>
                  </TabsTrigger>
                  <TabsTrigger value="story-arcs" className="gap-2">
                    <LuTrendingUp className="size-4" />
                    <span>Story Arcs</span>
                  </TabsTrigger>
                  <TabsTrigger value="themes" className="gap-2">
                    <LuLightbulb className="size-4" />
                    <span>Themes</span>
                  </TabsTrigger>
                  <TabsTrigger value="research" className="gap-2">
                    <LuBookOpen className="size-4" />
                    <span>Research</span>
                  </TabsTrigger>
                  <TabsTrigger value="graph" className="gap-2">
                    <LuNetwork className="size-4" />
                    <span>Graph</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-2">
                    <LuHistory className="size-4" />
                    <span>History</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6 space-y-4">
                  <KBAllView
                    seriesId={seriesId}
                    onTabChange={handleTabChange}
                    onLocationSelect={handleLocationSelect}
                    onPropSelect={handlePropSelect}
                    onStoryArcSelect={handleStoryArcSelect}
                    onThemeSelect={handleThemeSelect}
                  />
                </TabsContent>

                <TabsContent value="characters" className="mt-6 space-y-4">
                  <CharacterList seriesId={seriesId} />
                </TabsContent>

                <TabsContent value="locations" className="mt-6 space-y-4">
                  <LocationList seriesId={seriesId} onLocationSelect={handleLocationSelect} />
                </TabsContent>

                <TabsContent value="props" className="mt-6 space-y-4">
                  <PropList seriesId={seriesId} onPropSelect={handlePropSelect} />
                </TabsContent>

                <TabsContent value="scenes" className="mt-6 space-y-4">
                  <SceneList seriesId={seriesId} />
                </TabsContent>

                <TabsContent value="timeline" className="mt-6 space-y-4">
                  <TimelineList seriesId={seriesId} />
                </TabsContent>

                <TabsContent value="wildcards" className="mt-6 space-y-4">
                  <WildcardList seriesId={seriesId} />
                </TabsContent>

                <TabsContent value="story-arcs" className="mt-6 space-y-4">
                  <StoryArcList seriesId={seriesId} onStoryArcSelect={handleStoryArcSelect} />
                </TabsContent>

                <TabsContent value="themes" className="mt-6 space-y-4">
                  <ThemeList seriesId={seriesId} onThemeSelect={handleThemeSelect} />
                </TabsContent>

                <TabsContent value="research" className="mt-6 space-y-4">
                  <ResearchList seriesId={seriesId} onResearchSelect={handleResearchSelect} />
                </TabsContent>

                <TabsContent value="graph" className="mt-6">
                  <div className="h-150 rounded-lg border">
                    <ContinuityGraph
                      nodes={graphData?.nodes ?? []}
                      edges={graphData?.edges ?? []}
                      isLoading={isGraphLoading}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <div className="h-150 rounded-lg border">
                    <AuditHistoryList
                      items={auditData?.items ?? []}
                      isLoading={isAuditLoading}
                      hasMore={(auditData?.total ?? 0) > auditOffset + PAGE_SIZES.DEFAULT}
                      onLoadMore={() => setAuditOffset((prev) => prev + PAGE_SIZES.DEFAULT)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal open={isImportModalOpen} onOpenChange={setIsImportModalOpen} seriesId={seriesId} />
    </div>
  );
}
