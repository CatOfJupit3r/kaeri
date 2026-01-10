import { useState } from 'react';
import { LuFileText, LuLightbulb, LuPencil, LuUser } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';

import type { ThemeDetailQueryReturnType } from '../hooks/queries/use-theme-detail';
import { ThemeForm } from './theme-form';

interface iThemeDetailProps {
  theme: ThemeDetailQueryReturnType;
  seriesId: string;
}

export function ThemeDetail({ theme, seriesId }: iThemeDetailProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const getColorClass = (color?: string) => {
    if (!color) return 'bg-gray-500/10 text-gray-500';

    const colorMap: Record<string, string> = {
      red: 'bg-red-500/10 text-red-500',
      orange: 'bg-orange-500/10 text-orange-500',
      yellow: 'bg-yellow-500/10 text-yellow-500',
      green: 'bg-green-500/10 text-green-500',
      blue: 'bg-blue-500/10 text-blue-500',
      indigo: 'bg-indigo-500/10 text-indigo-500',
      purple: 'bg-purple-500/10 text-purple-500',
      pink: 'bg-pink-500/10 text-pink-500',
    };

    return colorMap[color] ?? 'bg-gray-500/10 text-gray-500';
  };

  const colorClass = getColorClass(theme.color);
  const occurrenceCount = theme.appearances?.length ?? 0;

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start gap-6">
          <div className={`flex size-16 items-center justify-center rounded-full ${colorClass}`}>
            <LuLightbulb className="size-8" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">{theme.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {occurrenceCount} {occurrenceCount === 1 ? 'occurrence' : 'occurrences'} across series
                </p>
              </div>
              <Button onClick={() => setIsFormOpen(true)} variant="outline" size="sm">
                <LuPencil className="mr-2 size-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            {theme.description ? (
              <p className="leading-relaxed text-foreground">{theme.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description provided</p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Related Characters */}
          <Card>
            <CardHeader>
              <CardTitle>Related Characters</CardTitle>
              <CardDescription>Character connections to this theme</CardDescription>
            </CardHeader>
            <CardContent>
              {theme.relatedCharacters && theme.relatedCharacters.length > 0 ? (
                <div className="space-y-3">
                  {theme.relatedCharacters.map((char) => (
                    <div key={char.characterId} className="rounded-lg border border-border bg-background/50 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <LuUser className="size-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-foreground">{char.characterId}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{char.connection}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No character connections defined</p>
              )}
            </CardContent>
          </Card>

          {/* Visual Motifs & Evolution */}
          <Card>
            <CardHeader>
              <CardTitle>Visual Motifs</CardTitle>
              <CardDescription>Recurring visual elements</CardDescription>
            </CardHeader>
            <CardContent>
              {theme.visualMotifs && theme.visualMotifs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {theme.visualMotifs.map((motif) => (
                    <Badge key={motif} variant="secondary">
                      {motif}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No visual motifs defined</p>
              )}

              {theme.evolution && theme.evolution.length > 0 ? (
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground">Thematic Evolution</h3>
                  <div className="space-y-2">
                    {theme.evolution.map((evo, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <div key={`${evo.scriptId}-${index}`} className="text-sm">
                        <span className="font-medium text-foreground">Script {evo.scriptId}:</span>{' '}
                        <span className="text-muted-foreground">{evo.notes}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Appearances in Scripts */}
        <Card>
          <CardHeader>
            <CardTitle>Appearances in Scripts</CardTitle>
            <CardDescription>Where this theme appears throughout the series</CardDescription>
          </CardHeader>
          <CardContent>
            {theme.appearances && theme.appearances.length > 0 ? (
              <div className="space-y-2">
                {theme.appearances.map((appearance, index) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${appearance.sceneId}-${index}`}
                    className="flex gap-2 rounded-md border border-border bg-card p-3"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium">
                      <LuFileText className="size-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="mb-1 text-xs font-medium text-foreground">Scene {appearance.sceneId}</p>
                      {appearance.quote ? (
                        <p className="text-xs text-muted-foreground italic">&quot;{appearance.quote}&quot;</p>
                      ) : null}
                      {appearance.notes ? (
                        <p className="mt-1 text-xs text-muted-foreground">{appearance.notes}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No appearances recorded for this theme</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Form */}
      <ThemeForm seriesId={seriesId} open={isFormOpen} onOpenChange={setIsFormOpen} initialData={theme} />
    </>
  );
}
