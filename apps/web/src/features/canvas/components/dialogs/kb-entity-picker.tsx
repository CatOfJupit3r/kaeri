import { useCallback, useMemo, useState } from 'react';
import { LuBookUser, LuFilm, LuGlobe, LuLightbulb, LuSearch, LuTrendingUp, LuX } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Input } from '@~/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@~/components/ui/popover';
import { useCharacterDetail } from '@~/features/characters/hooks/queries/use-character-detail';
import { useKBSearch } from '@~/features/knowledge-base/hooks/queries/use-kb-search';
import { useLocation as useLocationDetail } from '@~/features/locations/hooks/queries/use-location';
import { useSceneDetail } from '@~/features/scenes/hooks/queries/use-scene';
import { useStoryArc } from '@~/features/story-arcs/hooks/queries/use-story-arc';
import { useThemeDetail } from '@~/features/themes/hooks/queries/use-theme';
import { useDebouncedStableCallback } from '@~/hooks/use-stable-callback';

import type { LinkedEntityType } from '../../canvas.types';
import { LINKED_ENTITY_TYPES } from '../../canvas.types';

interface iKBEntityPickerProps {
  seriesId: string;
  selectedEntityId?: string;
  selectedEntityType?: LinkedEntityType;
  onSelect: (entityId: string | undefined, entityType: LinkedEntityType | undefined) => void;
}

const ENTITY_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    variant: 'default' | 'secondary' | 'outline';
  }
> = {
  character: {
    label: 'Character',
    icon: LuBookUser,
    variant: 'default',
  },
  location: {
    label: 'Location',
    icon: LuGlobe,
    variant: 'secondary',
  },
  scene: {
    label: 'Scene',
    icon: LuFilm,
    variant: 'default',
  },
  storyArc: {
    label: 'Story Arc',
    icon: LuTrendingUp,
    variant: 'default',
  },
  theme: {
    label: 'Theme',
    icon: LuLightbulb,
    variant: 'secondary',
  },
} as const;

// Helper to get display name from KB result
function getResultName(result: { _type: string; name?: string; heading?: string }): string {
  if (result._type === 'scene' && 'heading' in result) {
    return result.heading ?? 'Untitled Scene';
  }
  if ('name' in result && result.name) {
    return result.name;
  }
  return 'Untitled';
}

// Hook to fetch linked entity name based on type
function useLinkedEntityName(
  entityId: string | undefined,
  entityType: LinkedEntityType | undefined,
  seriesId: string,
): { name: string | undefined; isPending: boolean } {
  const isEnabled = !!entityId && !!entityType;

  const { data: character, isPending: isCharPending } = useCharacterDetail(entityId ?? '', seriesId, {
    enabled: isEnabled && entityType === LINKED_ENTITY_TYPES.character,
  });
  const { data: location, isPending: isLocPending } = useLocationDetail(entityId ?? '', seriesId);
  const { data: scene, isPending: isScenePending } = useSceneDetail(entityId ?? '', {
    enabled: isEnabled && entityType === LINKED_ENTITY_TYPES.scene,
  });
  const { data: storyArc, isPending: isStoryArcPending } = useStoryArc(entityId ?? '', {
    enabled: isEnabled && entityType === LINKED_ENTITY_TYPES.storyArc,
  });
  const { data: theme, isPending: isThemePending } = useThemeDetail(entityId ?? '', {
    enabled: isEnabled && entityType === LINKED_ENTITY_TYPES.theme,
  });

  const result = useMemo(() => {
    if (!isEnabled) return { name: undefined, isPending: false };

    switch (entityType) {
      case LINKED_ENTITY_TYPES.character:
        return { name: character?.name, isPending: isCharPending };
      case LINKED_ENTITY_TYPES.location:
        return { name: location?.name, isPending: isLocPending };
      case LINKED_ENTITY_TYPES.scene:
        return { name: scene?.heading, isPending: isScenePending };
      case LINKED_ENTITY_TYPES.storyArc:
        return { name: storyArc?.name, isPending: isStoryArcPending };
      case LINKED_ENTITY_TYPES.theme:
        return { name: theme?.name, isPending: isThemePending };
      default:
        return { name: undefined, isPending: false };
    }
  }, [
    entityType,
    isEnabled,
    character,
    isCharPending,
    location,
    isLocPending,
    scene,
    isScenePending,
    storyArc,
    isStoryArcPending,
    theme,
    isThemePending,
  ]);

  return result;
}

export default function KBEntityPicker({
  seriesId,
  selectedEntityId,
  selectedEntityType,
  onSelect,
}: iKBEntityPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debouncedSetQuery = useDebouncedStableCallback((value: string) => {
    setDebouncedQuery(value);
  }, 300);

  // Fetch initial results when popover opens (empty query returns all items)
  const { data, isPending } = useKBSearch(seriesId, debouncedQuery || ' ', 15, 0, {
    enabled: isOpen,
  });

  // Fetch linked entity name
  const { name: linkedEntityName, isPending: isLinkedEntityPending } = useLinkedEntityName(
    selectedEntityId,
    selectedEntityType,
    seriesId,
  );

  const handleInputChange = (value: string) => {
    setSearchInput(value);
    debouncedSetQuery(value);
  };

  const handleSelect = useCallback(
    (entityId: string, entityType: string) => {
      // Map the entity type to LinkedEntityType
      const mappedType = Object.values(LINKED_ENTITY_TYPES).includes(entityType as LinkedEntityType)
        ? (entityType as LinkedEntityType)
        : undefined;

      onSelect(entityId, mappedType);
      setIsOpen(false);
      setSearchInput('');
      setDebouncedQuery('');
    },
    [onSelect],
  );

  const handleClear = useCallback(() => {
    onSelect(undefined, undefined);
  }, [onSelect]);

  const results = data?.items ?? [];

  const selectedConfig = selectedEntityType ? ENTITY_CONFIG[selectedEntityType] : null;
  const SelectedIcon = selectedConfig?.icon;

  return (
    <div className="flex flex-col gap-2">
      {selectedEntityId && selectedEntityType ? (
        <div className="flex items-center justify-between rounded-md border-2 border-foreground bg-muted/50 px-3 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {SelectedIcon ? <SelectedIcon className="h-4 w-4 shrink-0" /> : null}
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {isLinkedEntityPending ? 'Loading...' : (linkedEntityName ?? 'Unknown')}
              </span>
              <span className="text-xs text-muted-foreground">{selectedConfig?.label ?? selectedEntityType}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClear} className="h-6 w-6 shrink-0 p-0">
            <LuX className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <LuSearch className="mr-2 h-4 w-4" />
              Search Knowledge Base...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="flex flex-col">
              <div className="border-b p-2">
                <Input
                  value={searchInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Search characters, locations, scenes..."
                  className="h-8"
                  autoFocus
                />
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {isPending ? <div className="py-4 text-center text-sm text-muted-foreground">Loading...</div> : null}
                {!isPending && results.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    {debouncedQuery.length > 0 ? 'No results found' : 'No entities in this series'}
                  </div>
                ) : null}
                {!isPending &&
                  results.map((result) => {
                    const config = ENTITY_CONFIG[result._type];
                    const Icon = config?.icon ?? LuBookUser;
                    const displayName = getResultName(result as { _type: string; name?: string; heading?: string });

                    return (
                      <button
                        key={result._id}
                        type="button"
                        onClick={() => handleSelect(result._id, result._type)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-accent"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium">{displayName}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {config?.label ?? result._type}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
