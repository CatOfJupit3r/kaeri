import { useState } from 'react';
import {
  LuBookUser,
  LuCalendar,
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
import { CharacterList } from '@~/features/characters/components/character-list';
import { KBAllView } from '@~/features/knowledge-base/components/kb-all-view';
import { LocationList } from '@~/features/locations/components/location-list';
import { PropList } from '@~/features/props/components/prop-list';
import { StoryArcList } from '@~/features/story-arcs/components/story-arc-list';
import { ThemeList } from '@~/features/themes/components/theme-list';
import { TimelineList } from '@~/features/timelines/components/timeline-list';
import { WildcardList } from '@~/features/wildcards/components/wildcard-list';

interface iKnowledgeBasePanelProps {
  seriesId: string;
}

type KBTab = 'all' | 'characters' | 'locations' | 'props' | 'timeline' | 'wildcards' | 'story-arcs' | 'themes';

const TAB_CONFIG: Array<{ id: KBTab; label: string; icon: typeof LuBookUser }> = [
  { id: 'all', label: 'All', icon: LuLayoutGrid },
  { id: 'characters', label: 'Characters', icon: LuBookUser },
  { id: 'locations', label: 'Locations', icon: LuGlobe },
  { id: 'props', label: 'Props', icon: LuPackage },
  { id: 'timeline', label: 'Timeline', icon: LuCalendar },
  { id: 'wildcards', label: 'Wildcards', icon: LuSparkles },
  { id: 'story-arcs', label: 'Arcs', icon: LuTrendingUp },
  { id: 'themes', label: 'Themes', icon: LuLightbulb },
];

export function KnowledgeBasePanel({ seriesId }: iKnowledgeBasePanelProps) {
  const [activeTab, setActiveTab] = useState<KBTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as KBTab);
  };

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
            <KBAllView seriesId={seriesId} onTabChange={handleTabChange} />
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters" className="mt-0 p-3">
            <CharacterList seriesId={seriesId} />
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="mt-0 p-3">
            <LocationList seriesId={seriesId} />
          </TabsContent>

          {/* Props Tab */}
          <TabsContent value="props" className="mt-0 p-3">
            <PropList seriesId={seriesId} />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-0 p-3">
            <TimelineList seriesId={seriesId} />
          </TabsContent>

          {/* Wildcards Tab */}
          <TabsContent value="wildcards" className="mt-0 p-3">
            <WildcardList seriesId={seriesId} />
          </TabsContent>

          {/* Story Arcs Tab */}
          <TabsContent value="story-arcs" className="mt-0 p-3">
            <StoryArcList seriesId={seriesId} />
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="mt-0 p-3">
            <ThemeList seriesId={seriesId} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
