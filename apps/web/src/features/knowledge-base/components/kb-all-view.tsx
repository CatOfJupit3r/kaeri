import { useNavigate } from '@tanstack/react-router';
import {
  LuBookUser,
  LuCalendar,
  LuClock,
  LuFilm,
  LuGlobe,
  LuHash,
  LuHeart,
  LuLightbulb,
  LuLink,
  LuPackage,
  LuSparkles,
  LuTrendingUp,
  LuUsers,
} from 'react-icons/lu';

import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import type { iEntitySummaryItem } from '@~/features/knowledge-base/components/entity-summary-card';
import { EntitySummaryCard } from '@~/features/knowledge-base/components/entity-summary-card';
import { useLocationList } from '@~/features/locations/hooks/queries/use-location-list';
import { usePropList } from '@~/features/props/hooks/queries/use-prop-list';
import { useSceneList } from '@~/features/scenes/hooks/queries/use-scene-list';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';
import { useStoryArcList } from '@~/features/story-arcs/hooks/queries/use-story-arc-list';
import { useThemeList } from '@~/features/themes/hooks/queries/use-theme-list';
import { useTimelineList } from '@~/features/timelines/hooks/queries/use-timeline-list';
import { useWildcardList } from '@~/features/wildcards/hooks/queries/use-wildcard-list';

interface iKBAllViewProps {
  seriesId: string;
  onTabChange: (tab: string) => void;
  /** Optional callback for when a character is selected. If not provided, navigates to character page. */
  onCharacterSelect?: (characterId: string) => void;
  /** Optional callback for when a location is selected. If not provided, navigates to location page. */
  onLocationSelect?: (locationId: string) => void;
  /** Optional callback for when a prop is selected. */
  onPropSelect?: (propId: string) => void;
  /** Optional callback for when a scene is selected. */
  onSceneSelect?: (sceneId: string) => void;
  /** Optional callback for when a story arc is selected. */
  onStoryArcSelect?: (storyArcId: string) => void;
  /** Optional callback for when a theme is selected. */
  onThemeSelect?: (themeId: string) => void;
}

export function KBAllView({
  seriesId,
  onTabChange,
  onCharacterSelect,
  onLocationSelect,
  onPropSelect,
  onSceneSelect,
  onStoryArcSelect,
  onThemeSelect,
}: iKBAllViewProps) {
  const navigate = useNavigate();

  const { data: charactersData, isPending: isCharactersLoading } = useCharacterList(seriesId, 3, 0);
  const { data: locationsData, isPending: isLocationsLoading } = useLocationList(seriesId, 3, 0);
  const { data: propsData, isPending: isPropsLoading } = usePropList(seriesId, 3, 0);
  const { data: scriptsData } = useScriptList(seriesId, 10, 0);
  const { data: timelinesData, isPending: isTimelinesLoading } = useTimelineList(seriesId, 3, 0);
  const { data: wildcardsData, isPending: isWildcardsLoading } = useWildcardList(seriesId, 3, 0);
  const { data: storyArcsData, isPending: isStoryArcsLoading } = useStoryArcList(seriesId, { limit: 3, offset: 0 });
  const { data: themesData, isPending: isThemesLoading } = useThemeList(seriesId, 3, 0);

  // Fetch scenes for first script (if any) to show in summary
  const firstScriptId = scriptsData?.items[0]?._id ?? '';
  const { data: scenesData, isPending: isScenesLoading } = useSceneList(firstScriptId, 3, 0, {
    enabled: !!firstScriptId,
  });

  const handleCharacterClick = (characterId: string) => {
    // If onCharacterSelect is provided, use it instead of navigating
    if (onCharacterSelect) {
      onCharacterSelect(characterId);
    } else {
      void navigate({
        to: '/series/$seriesId/knowledge-base/characters/$characterId',
        params: { seriesId, characterId },
        search: { tab: 'characters' },
      });
    }
  };

  const handleLocationClick = (locationId: string) => {
    // If onLocationSelect is provided, use it instead of navigating
    if (onLocationSelect) {
      onLocationSelect(locationId);
    }
  };

  const handlePropClick = (propId: string) => {
    if (onPropSelect) {
      onPropSelect(propId);
    }
  };

  const handleSceneClick = (sceneId: string) => {
    if (onSceneSelect) {
      onSceneSelect(sceneId);
    }
  };

  const handleStoryArcClick = (storyArcId: string) => {
    if (onStoryArcSelect) {
      onStoryArcSelect(storyArcId);
    }
  };

  const handleThemeClick = (themeId: string) => {
    if (onThemeSelect) {
      onThemeSelect(themeId);
    }
  };

  // Map characters to rich entity items
  const characterEntities: iEntitySummaryItem[] =
    charactersData?.items.map((c) => ({
      id: c._id,
      name: c.name,
      subtitle: c.description,
      avatarUrl: c.avatarUrl,
      tags: c.traits?.slice(0, 3),
      metadata: [
        ...(c.relationships?.length
          ? [{ label: `${c.relationships.length} relations`, icon: <LuHeart className="size-3" /> }]
          : []),
        ...(c.variations?.length
          ? [{ label: `${c.variations.length} variations`, icon: <LuUsers className="size-3" /> }]
          : []),
      ],
    })) ?? [];

  // Map locations to rich entity items
  const locationEntities: iEntitySummaryItem[] =
    locationsData?.items.map((l) => {
      const moodSuffix = l.description ? ` — ${l.description}` : '';
      return {
        id: l._id,
        name: l.name,
        subtitle: l.mood ? `${l.mood}${moodSuffix}` : l.description,
        tags: l.tags?.slice(0, 3),
        metadata: [
          ...(l.timeOfDay?.length ? [{ label: l.timeOfDay.join(', '), icon: <LuClock className="size-3" /> }] : []),
          ...(l.associatedCharacterIds?.length
            ? [{ label: `${l.associatedCharacterIds.length} characters`, icon: <LuUsers className="size-3" /> }]
            : []),
          ...(l.propIds?.length
            ? [{ label: `${l.propIds.length} props`, icon: <LuPackage className="size-3" /> }]
            : []),
        ],
      };
    }) ?? [];

  // Map props to rich entity items
  const propEntities: iEntitySummaryItem[] =
    propsData?.items.map((p) => ({
      id: p._id,
      name: p.name,
      subtitle: p.description,
      icon: <LuPackage className="size-4" />,
      metadata: p.associations?.length
        ? [{ label: `${p.associations.length} associations`, icon: <LuLink className="size-3" /> }]
        : [],
    })) ?? [];

  // Map scenes to rich entity items
  const sceneEntities: iEntitySummaryItem[] =
    scenesData?.items.map((s) => ({
      id: s._id,
      name: s.heading,
      subtitle: s.emotionalTone,
      icon: <LuFilm className="size-4" />,
      metadata: [
        { label: `Scene ${s.sceneNumber}`, icon: <LuHash className="size-3" /> },
        ...(s.timeOfDay ? [{ label: s.timeOfDay, icon: <LuClock className="size-3" /> }] : []),
        ...(s.characterIds?.length
          ? [{ label: `${s.characterIds.length} characters`, icon: <LuUsers className="size-3" /> }]
          : []),
      ],
    })) ?? [];

  // Map timeline entries to rich entity items
  const timelineEntities: iEntitySummaryItem[] =
    timelinesData?.items.map((t) => ({
      id: t._id,
      name: t.label,
      subtitle: t.timestamp,
      icon: <LuCalendar className="size-4" />,
      metadata: t.links?.length ? [{ label: `${t.links.length} links`, icon: <LuLink className="size-3" /> }] : [],
    })) ?? [];

  // Map wildcards to rich entity items
  const wildcardEntities: iEntitySummaryItem[] =
    wildcardsData?.items.map((w) => ({
      id: w._id,
      name: w.title,
      subtitle: w.body,
      icon: <LuSparkles className="size-4" />,
      tags: w.tag ? [w.tag] : [],
    })) ?? [];

  // Map story arcs to rich entity items
  const getStoryArcStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    if (status === 'completed') return 'default';
    if (status === 'in_progress') return 'secondary';
    if (status === 'abandoned') return 'destructive';
    return 'outline';
  };

  const storyArcEntities: iEntitySummaryItem[] =
    storyArcsData?.items.map((s) => ({
      id: s._id,
      name: s.name,
      subtitle: s.description,
      icon: <LuTrendingUp className="size-4" />,
      status: {
        label: s.status.replace('_', ' '),
        variant: getStoryArcStatusVariant(s.status),
      },
      metadata: [
        ...(s.keyBeats?.length ? [{ label: `${s.keyBeats.length} beats`, icon: <LuHash className="size-3" /> }] : []),
        ...(s.characters?.length
          ? [{ label: `${s.characters.length} characters`, icon: <LuUsers className="size-3" /> }]
          : []),
        ...(s.themeIds?.length
          ? [{ label: `${s.themeIds.length} themes`, icon: <LuLightbulb className="size-3" /> }]
          : []),
      ],
    })) ?? [];

  // Map themes to rich entity items
  const themeEntities: iEntitySummaryItem[] =
    themesData?.items.map((t) => ({
      id: t._id,
      name: t.name,
      subtitle: t.description,
      color: t.color,
      icon: <LuLightbulb className="size-4" />,
      tags: t.visualMotifs?.slice(0, 3),
      metadata: [
        ...(t.relatedCharacters?.length
          ? [{ label: `${t.relatedCharacters.length} characters`, icon: <LuUsers className="size-3" /> }]
          : []),
        ...(t.evolution?.length
          ? [{ label: `${t.evolution.length} evolutions`, icon: <LuTrendingUp className="size-3" /> }]
          : []),
      ],
    })) ?? [];

  return (
    <div className="space-y-6">
      {/* Hero Section - Characters & Story Arcs */}
      <section>
        <h2 className="mb-3 text-sm font-medium tracking-wide text-muted-foreground uppercase">Narrative Core</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <EntitySummaryCard
            title="Characters"
            icon={<LuBookUser className="size-5" />}
            count={charactersData?.total ?? 0}
            recentEntities={characterEntities}
            onViewAll={() => onTabChange('characters')}
            onEntityClick={handleCharacterClick}
            isPending={isCharactersLoading}
            variant="featured"
            className="lg:col-span-3"
          />
          <EntitySummaryCard
            title="Story Arcs"
            icon={<LuTrendingUp className="size-5" />}
            count={storyArcsData?.total ?? 0}
            recentEntities={storyArcEntities}
            onViewAll={() => onTabChange('story-arcs')}
            onEntityClick={onStoryArcSelect ? handleStoryArcClick : undefined}
            isPending={isStoryArcsLoading}
            variant="featured"
            className="lg:col-span-2"
          />
        </div>
      </section>

      {/* World Building Section */}
      <section>
        <h2 className="mb-3 text-sm font-medium tracking-wide text-muted-foreground uppercase">World Building</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <EntitySummaryCard
            title="Locations"
            icon={<LuGlobe className="size-5" />}
            count={locationsData?.total ?? 0}
            recentEntities={locationEntities}
            onViewAll={() => onTabChange('locations')}
            onEntityClick={handleLocationClick}
            isPending={isLocationsLoading}
          />
          <EntitySummaryCard
            title="Scenes"
            icon={<LuFilm className="size-5" />}
            count={scenesData?.total ?? 0}
            recentEntities={sceneEntities}
            onViewAll={() => onTabChange('scenes')}
            onEntityClick={onSceneSelect ? handleSceneClick : undefined}
            isPending={isScenesLoading}
          />
          <EntitySummaryCard
            title="Themes"
            icon={<LuLightbulb className="size-5" />}
            count={themesData?.total ?? 0}
            recentEntities={themeEntities}
            onViewAll={() => onTabChange('themes')}
            onEntityClick={onThemeSelect ? handleThemeClick : undefined}
            isPending={isThemesLoading}
          />
        </div>
      </section>

      {/* Quick Access Section - Compact Cards */}
      <section>
        <h2 className="mb-3 text-sm font-medium tracking-wide text-muted-foreground uppercase">Quick Access</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <EntitySummaryCard
            title="Props"
            icon={<LuPackage className="size-4" />}
            count={propsData?.total ?? 0}
            recentEntities={propEntities}
            onViewAll={() => onTabChange('props')}
            onEntityClick={onPropSelect ? handlePropClick : undefined}
            isPending={isPropsLoading}
            variant="compact"
          />
          <EntitySummaryCard
            title="Timeline"
            icon={<LuCalendar className="size-4" />}
            count={timelinesData?.total ?? 0}
            recentEntities={timelineEntities}
            onViewAll={() => onTabChange('timeline')}
            isPending={isTimelinesLoading}
            variant="compact"
          />
          <EntitySummaryCard
            title="Wildcards"
            icon={<LuSparkles className="size-4" />}
            count={wildcardsData?.total ?? 0}
            recentEntities={wildcardEntities}
            onViewAll={() => onTabChange('wildcards')}
            isPending={isWildcardsLoading}
            variant="compact"
          />
        </div>
      </section>
    </div>
  );
}
