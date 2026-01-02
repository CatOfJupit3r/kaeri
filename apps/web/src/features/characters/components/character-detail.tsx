import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { LuPencil } from 'react-icons/lu';

import { Avatar, AvatarFallback, AvatarImage } from '@~/components/ui/avatar';
import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@~/components/ui/tabs';
import { CharacterForm } from '@~/features/characters/components/character-form';

import type { CharacterDetailQueryReturnType } from '../hooks/queries/use-character-detail';

interface iCharacterDetailProps {
  character: CharacterDetailQueryReturnType;
  seriesId: string;
  allCharacters?: Array<{ _id: string; name: string }>;
}

export function CharacterDetail({ character, seriesId, allCharacters = [] }: iCharacterDetailProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const initials = character.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getCharacterName = (characterId: string) => {
    const char = allCharacters.find((c) => c._id === characterId);
    return char?.name ?? 'Unknown';
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start gap-6">
          <Avatar className="size-24">
            {character.avatarUrl ? <AvatarImage src={character.avatarUrl} alt={character.name} /> : null}
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-foreground">{character.name}</h2>
              <Button onClick={() => setIsFormOpen(true)} variant="outline" size="sm">
                <LuPencil className="mr-2 size-4" />
                Edit
              </Button>
            </div>
            {character.description ? (
              <p className="mt-2 text-muted-foreground">{character.description}</p>
            ) : (
              <p className="mt-2 text-muted-foreground italic">No description provided</p>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="variations">
              Script Variations {character.variations?.length ? `(${character.variations.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="appearances">
              Appearances {character.appearances?.length ? `(${character.appearances.length})` : ''}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Traits */}
            <Card>
              <CardHeader>
                <CardTitle>Traits</CardTitle>
                <CardDescription>Character traits and attributes</CardDescription>
              </CardHeader>
              <CardContent>
                {character.traits && character.traits.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {character.traits.map((trait) => (
                      <Badge key={trait} variant="secondary">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No traits defined</p>
                )}
              </CardContent>
            </Card>

            {/* Relationships */}
            <Card>
              <CardHeader>
                <CardTitle>Relationships</CardTitle>
                <CardDescription>Connections with other characters</CardDescription>
              </CardHeader>
              <CardContent>
                {character.relationships && character.relationships.length > 0 ? (
                  <div className="space-y-3">
                    {character.relationships.map((rel) => {
                      const targetName = getCharacterName(rel.targetId);
                      return (
                        <div
                          key={rel.targetId}
                          className="flex items-start justify-between border-b pb-3 last:border-b-0"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Link
                                to="/series/$seriesId/knowledge-base/characters/$characterId"
                                params={{ seriesId, characterId: rel.targetId }}
                                className="font-medium text-primary hover:underline"
                              >
                                {targetName}
                              </Link>
                              <Badge variant="outline" className="text-xs">
                                {rel.type}
                              </Badge>
                            </div>
                            {rel.note ? <p className="mt-1 text-sm text-muted-foreground">{rel.note}</p> : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No relationships defined</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Variations Tab */}
          <TabsContent value="variations" className="space-y-4">
            {character.variations && character.variations.length > 0 ? (
              <div className="grid gap-4">
                {character.variations.map((variation) => (
                  <Card key={`${variation.scriptId}-${variation.label}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">{variation.label}</CardTitle>
                      <CardDescription>Script ID: {variation.scriptId}</CardDescription>
                    </CardHeader>
                    {variation.notes ? (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{variation.notes}</p>
                      </CardContent>
                    ) : null}
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No script variations defined for this character</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Appearances Tab */}
          <TabsContent value="appearances" className="space-y-4">
            {character.appearances && character.appearances.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Script ID</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Scene Reference</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {character.appearances.map((appearance) => (
                          <tr key={`${appearance.scriptId}-${appearance.sceneRef}`} className="hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm">{appearance.scriptId}</td>
                            <td className="px-4 py-3 text-sm font-medium">{appearance.sceneRef}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{appearance.locationId ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No appearances recorded for this character</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Character Edit Form */}
      <CharacterForm seriesId={seriesId} open={isFormOpen} onOpenChange={setIsFormOpen} initialData={character} />
    </>
  );
}
