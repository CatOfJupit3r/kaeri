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
import { useStoryArcList } from '@~/features/story-arcs/hooks/queries/use-story-arc-list';
import { useThemeList } from '@~/features/themes/hooks/queries/use-theme-list';
import { useTimelineList } from '@~/features/timelines/hooks/queries/use-timeline-list';
import { useWildcardList } from '@~/features/wildcards/hooks/queries/use-wildcard-list';

interface iKBAllViewProps {
  seriesId: string;
  onTabChange: (tab: string) => void;
}

export function KBAllView({ seriesId, onTabChange }: iKBAllViewProps) {
  const navigate = useNavigate();

  const { data: charactersData, isPending: isCharactersLoading } = useCharacterList(seriesId, 3, 0);
  const { data: locationsData, isPending: isLocationsLoading } = useLocationList(seriesId, 3, 0);
  const { data: propsData, isPending: isPropsLoading } = usePropList(seriesId, 3, 0);
  const { data: timelinesData, isPending: isTimelinesLoading } = useTimelineList(seriesId, 3, 0);
  const { data: wildcardsData, isPending: isWildcardsLoading } = useWildcardList(seriesId, 3, 0);
  const { data: storyArcsData, isPending: isStoryArcsLoading } = useStoryArcList(seriesId, { limit: 3, offset: 0 });
  const { data: themesData, isPending: isThemesLoading } = useThemeList(seriesId, 3, 0);

  const handleCharacterClick = (characterId: string) => {
    void navigate({
      to: '/series/$seriesId/knowledge-base/characters/$characterId',
      params: { seriesId, characterId },
      search: { tab: 'characters' },
    });
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
        isPending={isPropsLoading}
      />

      <EntitySummaryCard
        title="Scenes"
        icon={<LuFilm className="size-5" />}
        count={0}
        recentEntities={[]}
        onViewAll={() => onTabChange('scenes')}
        isPending={false}
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
        isPending={isThemesLoading}
      />
    </div>
  );
}
