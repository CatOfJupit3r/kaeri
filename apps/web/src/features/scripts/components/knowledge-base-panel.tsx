import { useState } from 'react';
import {
  LuBookUser,
  LuCalendar,
  LuFilm,
  LuGlobe,
  LuLayoutGrid,
  LuLightbulb,
  LuPackage,
  LuSearch,
  LuSparkles,
  LuTrendingUp,
} from 'react-icons/lu';

import { Input } from '@~/components/ui/input';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@~/components/ui/tabs';
import { CharacterEditPanel } from '@~/features/characters/components/character-edit-panel';
import { CharacterList } from '@~/features/characters/components/character-list';
import { KBAllView } from '@~/features/knowledge-base/components/kb-all-view';
import { LocationEditPanel } from '@~/features/locations/components/location-edit-panel';
import { LocationList } from '@~/features/locations/components/location-list';
import { PropEditPanel } from '@~/features/props/components/prop-edit-panel';
import { PropList } from '@~/features/props/components/prop-list';
import { SceneEditPanel } from '@~/features/scenes/components/scene-edit-panel';
import { SceneList } from '@~/features/scenes/components/scene-list';
import { StoryArcEditPanel } from '@~/features/story-arcs/components/story-arc-edit-panel';
import { StoryArcList } from '@~/features/story-arcs/components/story-arc-list';
import { ThemeEditPanel } from '@~/features/themes/components/theme-edit-panel';
import { ThemeList } from '@~/features/themes/components/theme-list';
import { TimelineEditPanel } from '@~/features/timelines/components/timeline-edit-panel';
import { TimelineList } from '@~/features/timelines/components/timeline-list';
import { WildcardEditPanel } from '@~/features/wildcards/components/wildcard-edit-panel';
import { WildcardList } from '@~/features/wildcards/components/wildcard-list';

interface iKnowledgeBasePanelProps {
  seriesId: string;
}

type KBTab =
  | 'all'
  | 'characters'
  | 'locations'
  | 'props'
  | 'scenes'
  | 'timeline'
  | 'wildcards'
  | 'story-arcs'
  | 'themes';

const TAB_CONFIG: Array<{ id: KBTab; label: string; icon: typeof LuBookUser }> = [
  { id: 'all', label: 'All', icon: LuLayoutGrid },
  { id: 'characters', label: 'Characters', icon: LuBookUser },
  { id: 'locations', label: 'Locations', icon: LuGlobe },
  { id: 'props', label: 'Props', icon: LuPackage },
  { id: 'scenes', label: 'Scenes', icon: LuFilm },
  { id: 'timeline', label: 'Timeline', icon: LuCalendar },
  { id: 'wildcards', label: 'Wildcards', icon: LuSparkles },
  { id: 'story-arcs', label: 'Arcs', icon: LuTrendingUp },
  { id: 'themes', label: 'Themes', icon: LuLightbulb },
];

export function KnowledgeBasePanel({ seriesId }: iKnowledgeBasePanelProps) {
  const [activeTab, setActiveTab] = useState<KBTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);
  const [selectedWildcardId, setSelectedWildcardId] = useState<string | null>(null);
  const [selectedStoryArcId, setSelectedStoryArcId] = useState<string | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as KBTab);
  };

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacterId(characterId);
  };

  const handleCloseCharacterEdit = () => {
    setSelectedCharacterId(null);
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

  const handleSceneSelect = (sceneId: string) => {
    setSelectedSceneId(sceneId);
  };

  const handleCloseSceneEdit = () => {
    setSelectedSceneId(null);
  };

  const handleTimelineSelect = (timelineId: string) => {
    setSelectedTimelineId(timelineId);
  };

  const handleCloseTimelineEdit = () => {
    setSelectedTimelineId(null);
  };

  const handleWildcardSelect = (wildcardId: string) => {
    setSelectedWildcardId(wildcardId);
  };

  const handleCloseWildcardEdit = () => {
    setSelectedWildcardId(null);
  };

  const handleStoryArcSelect = (storyArcId: string) => {
    setSelectedStoryArcId(storyArcId);
  };

  const handleCloseStoryArcEdit = () => {
    setSelectedStoryArcId(null);
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedThemeId(themeId);
  };

  const handleCloseThemeEdit = () => {
    setSelectedThemeId(null);
  };

  // Show character edit panel when a character is selected
  if (selectedCharacterId) {
    return (
      <CharacterEditPanel characterId={selectedCharacterId} seriesId={seriesId} onClose={handleCloseCharacterEdit} />
    );
  }

  // Show location edit panel when a location is selected
  if (selectedLocationId) {
    return <LocationEditPanel locationId={selectedLocationId} seriesId={seriesId} onClose={handleCloseLocationEdit} />;
  }

  // Show prop edit panel when a prop is selected
  if (selectedPropId) {
    return <PropEditPanel propId={selectedPropId} seriesId={seriesId} onClose={handleClosePropEdit} />;
  }

  // Show scene edit panel when a scene is selected
  if (selectedSceneId) {
    return <SceneEditPanel sceneId={selectedSceneId} seriesId={seriesId} onClose={handleCloseSceneEdit} />;
  }

  // Show timeline edit panel when a timeline entry is selected
  if (selectedTimelineId) {
    return <TimelineEditPanel timelineId={selectedTimelineId} seriesId={seriesId} onClose={handleCloseTimelineEdit} />;
  }

  // Show wildcard edit panel when a wildcard is selected
  if (selectedWildcardId) {
    return <WildcardEditPanel wildcardId={selectedWildcardId} seriesId={seriesId} onClose={handleCloseWildcardEdit} />;
  }

  // Show story arc edit panel when a story arc is selected
  if (selectedStoryArcId) {
    return <StoryArcEditPanel storyArcId={selectedStoryArcId} seriesId={seriesId} onClose={handleCloseStoryArcEdit} />;
  }

  // Show theme edit panel when a theme is selected
  if (selectedThemeId) {
    return <ThemeEditPanel themeId={selectedThemeId} seriesId={seriesId} onClose={handleCloseThemeEdit} />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Search */}
      <div className="shrink-0 border-b-2 border-foreground bg-card p-3">
        <div className="relative">
          <LuSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge base..."
            className="border-2 border-foreground pl-9 text-sm font-medium"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as KBTab)}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <TabsList className="h-auto shrink-0 flex-wrap justify-start gap-0 border-b-2 border-foreground bg-card p-0">
          {TAB_CONFIG.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`gap-1 px-2 py-2 text-xs font-bold tracking-wide uppercase data-[state=active]:text-foreground ${
                  index < TAB_CONFIG.length - 1 ? 'border-r border-foreground/20' : ''
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden xl:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <ScrollArea className="min-h-0 flex-1">
          {/* All Tab */}
          <TabsContent value="all" className="mt-0 p-3">
            <KBAllView
              seriesId={seriesId}
              onTabChange={handleTabChange}
              onCharacterSelect={handleCharacterSelect}
              onLocationSelect={handleLocationSelect}
              onPropSelect={handlePropSelect}
              onSceneSelect={handleSceneSelect}
              onStoryArcSelect={handleStoryArcSelect}
              onThemeSelect={handleThemeSelect}
            />
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters" className="mt-0 p-3">
            <CharacterList seriesId={seriesId} onCharacterSelect={handleCharacterSelect} />
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="mt-0 p-3">
            <LocationList seriesId={seriesId} onLocationSelect={handleLocationSelect} />
          </TabsContent>

          {/* Props Tab */}
          <TabsContent value="props" className="mt-0 p-3">
            <PropList seriesId={seriesId} onPropSelect={handlePropSelect} />
          </TabsContent>

          {/* Scenes Tab */}
          <TabsContent value="scenes" className="mt-0 p-3">
            <SceneList seriesId={seriesId} onSceneSelect={handleSceneSelect} />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-0 p-3">
            <TimelineList seriesId={seriesId} onTimelineSelect={handleTimelineSelect} />
          </TabsContent>

          {/* Wildcards Tab */}
          <TabsContent value="wildcards" className="mt-0 p-3">
            <WildcardList seriesId={seriesId} onWildcardSelect={handleWildcardSelect} />
          </TabsContent>

          {/* Story Arcs Tab */}
          <TabsContent value="story-arcs" className="mt-0 p-3">
            <StoryArcList seriesId={seriesId} onStoryArcSelect={handleStoryArcSelect} />
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="mt-0 p-3">
            <ThemeList seriesId={seriesId} onThemeSelect={handleThemeSelect} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
