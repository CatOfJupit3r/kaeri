import { useState } from 'react';
import { LuPencil, LuFileText, LuTrendingUp, LuUsers } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card } from '@~/components/ui/card';
import { Progress } from '@~/components/ui/progress';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { useThemeList } from '@~/features/themes/hooks/queries/use-theme-list';

import type { StoryArcDetailQueryReturnType } from '../hooks/queries/use-story-arc';
import { StoryArcForm } from './story-arc-form';

interface iStoryArcDetailProps {
  storyArc: StoryArcDetailQueryReturnType;
  seriesId: string;
}

const STATUS_COLORS = {
  planned: 'border-blue-500 text-blue-500',
  in_progress: 'border-yellow-500 text-yellow-500',
  completed: 'border-emerald-500 text-emerald-500',
  abandoned: 'border-gray-500 text-gray-500',
} as const;

const STATUS_LABELS = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  abandoned: 'Abandoned',
} as const;

export function StoryArcDetail({ storyArc, seriesId }: iStoryArcDetailProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch character and theme names for display
  const { data: charactersData } = useCharacterList(seriesId, 100, 0);
  const { data: themesData } = useThemeList(seriesId, 100, 0);

  const characterMap = new Map(charactersData?.items.map((c) => [c._id, c.name]) ?? []);
  const themeMap = new Map(themesData?.items.map((t) => [t._id, t.name]) ?? []);

  const calculateProgress = (): number => {
    if (storyArc.keyBeats.length === 0) return 0;
    return Math.round((storyArc.keyBeats.length / (storyArc.keyBeats.length + 2)) * 100);
  };

  const progress = calculateProgress();

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border bg-card p-3 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 md:size-12 md:w-12">
                <LuTrendingUp className="size-5 text-emerald-500 md:size-6 md:w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground md:text-xl">{storyArc.name}</h1>
                <Badge variant="outline" className={`mt-1 ${STATUS_COLORS[storyArc.status]}`}>
                  {STATUS_LABELS[storyArc.status]}
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5 bg-transparent md:w-auto md:gap-2"
              onClick={() => setIsFormOpen(true)}
            >
              <LuPencil className="size-3.5 md:size-4 md:w-4" />
              <span className="text-xs md:text-sm">Edit Arc</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
            {/* Arc Description */}
            <Card className="border-border bg-card p-4 md:p-6">
              <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Arc Description</h2>
              <p className="mb-4 leading-relaxed text-foreground">{storyArc.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Arc Progress</span>
                  <span className="font-medium text-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </Card>

            {/* Key Milestones */}
            {storyArc.keyBeats.length > 0 && (
              <Card className="border-border bg-card p-4 md:p-6">
                <h2 className="mb-4 text-base font-semibold text-foreground md:text-lg">Key Milestones</h2>
                <div className="space-y-3">
                  {storyArc.keyBeats
                    .sort((a, b) => a.order - b.order)
                    .map((beat) => (
                      <div key={beat.id} className="relative rounded-lg border border-border bg-background/50 p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <LuFileText className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">Beat {beat.order + 1}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{beat.description}</p>
                      </div>
                    ))}
                </div>
              </Card>
            )}

            {/* Characters and Themes */}
            <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
              {/* Related Characters */}
              {storyArc.characters.length > 0 && (
                <Card className="border-border bg-card p-4 md:p-6">
                  <div className="mb-3 flex items-center gap-2 md:mb-4">
                    <LuUsers className="size-4 text-blue-500 md:size-5 md:w-5" />
                    <h2 className="text-base font-semibold text-foreground md:text-lg">Related Characters</h2>
                  </div>
                  <div className="space-y-2">
                    {storyArc.characters.map((char) => (
                      <div key={char.characterId} className="rounded-lg border border-border bg-background/50 p-3">
                        <h3 className="mb-1 text-sm font-medium text-foreground">
                          {characterMap.get(char.characterId) ?? `Character ${char.characterId}`}
                        </h3>
                        <p className="text-xs text-muted-foreground">{char.role}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Thematic Connections */}
              {storyArc.themeIds.length > 0 && (
                <Card className="border-border bg-card p-4 md:p-6">
                  <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">
                    Thematic Connections
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {storyArc.themeIds.map((themeId) => (
                      <Badge key={themeId} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                        {themeMap.get(themeId) ?? `Theme ${themeId}`}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Resolution */}
            {storyArc.resolution ? (
              <Card className="border-border bg-card p-4 md:p-6">
                <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Resolution</h2>
                <p className="leading-relaxed text-foreground">{storyArc.resolution}</p>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      <StoryArcForm seriesId={seriesId} open={isFormOpen} onOpenChange={setIsFormOpen} initialData={storyArc} />
    </>
  );
}
