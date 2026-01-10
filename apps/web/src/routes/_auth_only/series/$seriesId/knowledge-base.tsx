import { createFileRoute } from '@tanstack/react-router';
import { parseAsStringEnum, useQueryStates } from 'nuqs';
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
} from 'react-icons/lu';
import z from 'zod';

import { Button } from '@~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@~/components/ui/tabs';
import { Toggle } from '@~/components/ui/toggle';
import { CharacterList } from '@~/features/characters/components/character-list';
import { characterListQueryOptions } from '@~/features/characters/hooks/queries/use-character-list';
import { KBAllView } from '@~/features/knowledge-base/components/kb-all-view';
import { KBSearch } from '@~/features/knowledge-base/components/kb-search';
import { LocationList } from '@~/features/locations/components/location-list';
import { locationListQueryOptions } from '@~/features/locations/hooks/queries/use-location-list';
import { PropList } from '@~/features/props/components/prop-list';
import { propListQueryOptions } from '@~/features/props/hooks/queries/use-prop-list';
import { SceneList } from '@~/features/scenes/components/scene-list';
import { SeriesHeader } from '@~/features/series/components/series-header';
import { useSeries, seriesQueryOptions } from '@~/features/series/hooks/queries/use-series';
import { StoryArcList } from '@~/features/story-arcs/components/story-arc-list';
import { storyArcListQueryOptions } from '@~/features/story-arcs/hooks/queries/use-story-arc-list';
import { ThemeList } from '@~/features/themes/components/theme-list';
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
  const { data: series } = useSeries(seriesId);
  const [{ tab, viewMode }, setQueryStates] = useQueryStates({
    tab: parseAsStringEnum(TAB_VALUES_ARRAY).withDefault(TAB_VALUES.all),
    viewMode: parseAsStringEnum(VIEW_MODE_ARRAY).withDefault(VIEW_MODE.grid),
  });
  const activeTab = tab ?? TAB_VALUES.all;
  const activeViewMode = viewMode ?? VIEW_MODE.grid;

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
      all: 'all',
    };

    const targetTab = tabMap[entityType];
    if (targetTab) {
      setQueryStates({ tab: targetTab as TabValue }).catch(() => {});
    }
  };

  const handleImport = () => {
    // TODO: Implement import functionality
    console.log('Import clicked');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export clicked');
  };

  const toggleViewMode = () => {
    const newMode = activeViewMode === VIEW_MODE.grid ? VIEW_MODE.list : VIEW_MODE.grid;
    setQueryStates({ viewMode: newMode }).catch(() => {});
  };

  if (!series) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Series not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Series Header */}
      <SeriesHeader series={series} currentPage="Knowledge Base" />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Action Bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex-1">
            <KBSearch seriesId={seriesId} onResultClick={handleResultClick} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleImport}>
              <LuUpload />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <LuDownload />
              Export
            </Button>
            <Toggle
              pressed={activeViewMode === VIEW_MODE.list}
              onPressedChange={toggleViewMode}
              aria-label="Toggle view mode"
              size="sm"
            >
              {activeViewMode === VIEW_MODE.grid ? <LuLayoutGrid /> : <LuLayoutList />}
            </Toggle>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-9">
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
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-4">
            <KBAllView seriesId={seriesId} onTabChange={handleTabChange} />
          </TabsContent>

          <TabsContent value="characters" className="mt-6 space-y-4">
            <CharacterList seriesId={seriesId} />
          </TabsContent>

          <TabsContent value="locations" className="mt-6 space-y-4">
            <LocationList seriesId={seriesId} />
          </TabsContent>

          <TabsContent value="props" className="mt-6 space-y-4">
            <PropList seriesId={seriesId} />
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
            <StoryArcList seriesId={seriesId} />
          </TabsContent>

          <TabsContent value="themes" className="mt-6 space-y-4">
            <ThemeList seriesId={seriesId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
