import { useNavigate } from '@tanstack/react-router';
import {
  LuBookUser,
  LuCalendar,
  LuFilm,
  LuGlobe,
  LuLightbulb,
  LuPackage,
  LuSparkles,
  LuTrendingUp,
} from 'react-icons/lu';

import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
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

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <EntitySummaryCard
        title="Characters"
        icon={<LuBookUser className="size-5" />}
        count={charactersData?.total ?? 0}
        recentEntities={
          charactersData?.items.map((c) => ({
            id: c._id,
            name: c.name,
            subtitle: c.description,
          })) ?? []
        }
        onViewAll={() => onTabChange('characters')}
        onEntityClick={handleCharacterClick}
        isPending={isCharactersLoading}
      />

      <EntitySummaryCard
        title="Locations"
        icon={<LuGlobe className="size-5" />}
        count={locationsData?.total ?? 0}
        recentEntities={
          locationsData?.items.map((l) => ({
            id: l._id,
            name: l.name,
            subtitle: l.description,
          })) ?? []
        }
        onViewAll={() => onTabChange('locations')}
        onEntityClick={handleLocationClick}
        isPending={isLocationsLoading}
      />

      <EntitySummaryCard
        title="Props"
        icon={<LuPackage className="size-5" />}
        count={propsData?.total ?? 0}
        recentEntities={
          propsData?.items.map((p) => ({
            id: p._id,
            name: p.name,
            subtitle: p.description,
          })) ?? []
        }
        onViewAll={() => onTabChange('props')}
        onEntityClick={onPropSelect ? handlePropClick : undefined}
        isPending={isPropsLoading}
      />

      <EntitySummaryCard
        title="Scenes"
        icon={<LuFilm className="size-5" />}
        count={scenesData?.total ?? 0}
        recentEntities={
          scenesData?.items.map((s) => ({
            id: s._id,
            name: `#${s.sceneNumber} ${s.heading}`,
            subtitle: s.emotionalTone,
          })) ?? []
        }
        onViewAll={() => onTabChange('scenes')}
        onEntityClick={onSceneSelect ? handleSceneClick : undefined}
        isPending={isScenesLoading}
      />

      <EntitySummaryCard
        title="Timeline"
        icon={<LuCalendar className="size-5" />}
        count={timelinesData?.total ?? 0}
        recentEntities={
          timelinesData?.items.map((t) => ({
            id: t._id,
            name: t.label,
            subtitle: t.timestamp,
          })) ?? []
        }
        onViewAll={() => onTabChange('timeline')}
        isPending={isTimelinesLoading}
      />

      <EntitySummaryCard
        title="Wildcards"
        icon={<LuSparkles className="size-5" />}
        count={wildcardsData?.total ?? 0}
        recentEntities={
          wildcardsData?.items.map((w) => ({
            id: w._id,
            name: w.title,
            subtitle: w.body,
          })) ?? []
        }
        onViewAll={() => onTabChange('wildcards')}
        isPending={isWildcardsLoading}
      />

      <EntitySummaryCard
        title="Story Arcs"
        icon={<LuTrendingUp className="size-5" />}
        count={storyArcsData?.total ?? 0}
        recentEntities={
          storyArcsData?.items.map((s) => ({
            id: s._id,
            name: s.name,
            subtitle: s.description,
          })) ?? []
        }
        onViewAll={() => onTabChange('story-arcs')}
        onEntityClick={onStoryArcSelect ? handleStoryArcClick : undefined}
        isPending={isStoryArcsLoading}
      />

      <EntitySummaryCard
        title="Themes"
        icon={<LuLightbulb className="size-5" />}
        count={themesData?.total ?? 0}
        recentEntities={
          themesData?.items.map((t) => ({
            id: t._id,
            name: t.name,
            subtitle: t.description,
          })) ?? []
        }
        onViewAll={() => onTabChange('themes')}
        onEntityClick={onThemeSelect ? handleThemeClick : undefined}
        isPending={isThemesLoading}
      />
    </div>
  );
}
