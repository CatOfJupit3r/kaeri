import { useState } from 'react';
import { LuSearch, LuBookUser, LuGlobe, LuPackage, LuCalendar, LuSparkles, LuX } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Card, CardContent } from '@~/components/ui/card';
import { Input } from '@~/components/ui/input';
import { useDebouncedStableCallback } from '@~/hooks/use-stable-callback';

import { useKBSearch } from '../hooks/queries/use-kb-search';

interface iKBSearchProps {
  seriesId: string;
  onResultClick?: (entityId: string, entityType: string) => void;
}

const ENTITY_CONFIG = {
  character: {
    label: 'Character',
    icon: LuBookUser,
    variant: 'default' as const,
  },
  location: {
    label: 'Location',
    icon: LuGlobe,
    variant: 'secondary' as const,
  },
  prop: {
    label: 'Prop',
    icon: LuPackage,
    variant: 'outline' as const,
  },
  timeline: {
    label: 'Timeline',
    icon: LuCalendar,
    variant: 'default' as const,
  },
  wildcard: {
    label: 'Wild Card',
    icon: LuSparkles,
    variant: 'secondary' as const,
  },
} as const;

export function KBSearch({ seriesId, onResultClick }: iKBSearchProps) {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debouncedSetQuery = useDebouncedStableCallback((value: string) => {
    setDebouncedQuery(value);
  }, 300);

  const { data, isLoading } = useKBSearch(seriesId, debouncedQuery);

  const handleInputChange = (value: string) => {
    setSearchInput(value);
    debouncedSetQuery(value);
  };

  const handleClear = () => {
    setSearchInput('');
    setDebouncedQuery('');
  };

  const handleResultClick = (entityId: string, entityType: string) => {
    if (onResultClick) {
      onResultClick(entityId, entityType);
    }
  };

  const results = data?.items ?? [];
  const isShowingResults = searchInput.trim().length > 0;

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <LuSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search characters, locations, props..."
          value={searchInput}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pr-9 pl-9"
        />
        {searchInput.length > 0 ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <LuX className="size-4" />
          </button>
        ) : null}
      </div>

      {/* Results Overlay */}
      {isShowingResults ? (
        <Card className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-y-auto shadow-lg">
          <CardContent className="p-2">
            {(() => {
              if (isLoading) {
                return (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                );
              }

              if (results.length === 0) {
                return (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">No results found for &quot;{searchInput}&quot;</p>
                  </div>
                );
              }

              return (
                <div className="space-y-1">
                  {results.map((item) => {
                    const config = ENTITY_CONFIG[item._type];
                    const Icon = config.icon;

                    let name = '';
                    if (item._type === 'character') {
                      name = item.name;
                    } else if (item._type === 'location') {
                      name = item.name;
                    } else if (item._type === 'prop') {
                      name = item.name;
                    } else if (item._type === 'timeline') {
                      name = item.label;
                    } else {
                      name = item.title;
                    }

                    let description: string | undefined;
                    if (item._type === 'wildcard') {
                      description = item.body;
                    } else if ('description' in item) {
                      description = item.description;
                    }

                    return (
                      <button
                        type="button"
                        key={`${item._type}-${item._id}`}
                        onClick={() => handleResultClick(item._id, item._type)}
                        className="flex w-full items-start gap-3 rounded-md p-3 text-left transition-colors hover:bg-accent"
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          <Icon className="size-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium text-foreground">{name}</span>
                            <Badge variant={config.variant} className="flex-shrink-0">
                              {config.label}
                            </Badge>
                          </div>
                          {description ? (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description}</p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
