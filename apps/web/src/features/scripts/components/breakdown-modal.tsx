import { useMemo, useState } from 'react';
import { LuCalendar, LuDownload, LuMapPin, LuPackage, LuUser } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@~/components/ui/dialog';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@~/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@~/components/ui/tabs';
import { cn } from '@~/lib/utils';

import { generateBreakdown, groupScenesForShooting } from '../helpers/breakdown-utils';
import type { iBreakdownScene } from '../helpers/breakdown-utils';

interface iBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  scriptTitle?: string;
}

interface iSceneGroupProps {
  title: string;
  scenes: iBreakdownScene[];
  color: string;
}

function SceneGroup({ title, scenes, color }: iSceneGroupProps) {
  if (scenes.length === 0) return null;
  return (
    <div className="space-y-2">
      <h4 className={cn('font-semibold', color)}>
        {title} ({scenes.length} scenes)
      </h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Scene</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="w-24">Pages</TableHead>
            <TableHead>Characters</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scenes.map((scene) => (
            <TableRow key={scene.sceneNumber}>
              <TableCell className="font-mono">{scene.sceneNumber}</TableCell>
              <TableCell>{scene.location}</TableCell>
              <TableCell className="text-muted-foreground">
                {scene.pageStart === scene.pageEnd ? scene.pageStart : `${scene.pageStart}-${scene.pageEnd}`}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {scene.characters.slice(0, 5).map((char) => (
                    <Badge key={char} variant="outline" className="text-xs">
                      {char}
                    </Badge>
                  ))}
                  {scene.characters.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{scene.characters.length - 5}
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function BreakdownModal({ open, onOpenChange, content, scriptTitle }: iBreakdownModalProps) {
  const [activeTab, setActiveTab] = useState('schedule');

  const breakdown = useMemo(() => generateBreakdown(content), [content]);
  const shootingGroups = useMemo(() => groupScenesForShooting(breakdown.scenes), [breakdown.scenes]);

  const locationsArray = useMemo(
    () => Array.from(breakdown.locations.values()).sort((a, b) => b.sceneCount - a.sceneCount),
    [breakdown.locations],
  );

  const charactersArray = useMemo(
    () => Array.from(breakdown.characters.values()).sort((a, b) => b.sceneCount - a.sceneCount),
    [breakdown.characters],
  );

  const propsArray = useMemo(
    () => Array.from(breakdown.props.values()).sort((a, b) => b.mentions - a.mentions),
    [breakdown.props],
  );

  const handleExportCSV = () => {
    const rows: string[][] = [];

    // Header
    rows.push(['Scene #', 'Location', 'INT/EXT', 'Time', 'Characters', 'Pages']);

    // Scene data
    for (const scene of breakdown.scenes) {
      rows.push([
        String(scene.sceneNumber),
        scene.location,
        scene.intExt,
        scene.timeOfDay,
        scene.characters.join(', '),
        `${scene.pageStart}-${scene.pageEnd}`,
      ]);
    }

    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scriptTitle ?? 'script'}-breakdown.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Script Breakdown</DialogTitle>
              <DialogDescription>
                {scriptTitle ? `${scriptTitle} - ` : ''}
                {breakdown.scenes.length} scenes, {breakdown.totalPages} pages
              </DialogDescription>
            </div>
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2">
              <LuDownload className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule" className="gap-2">
              <LuCalendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-2">
              <LuMapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Locations</span>
            </TabsTrigger>
            <TabsTrigger value="characters" className="gap-2">
              <LuUser className="h-4 w-4" />
              <span className="hidden sm:inline">Characters</span>
            </TabsTrigger>
            <TabsTrigger value="props" className="gap-2">
              <LuPackage className="h-4 w-4" />
              <span className="hidden sm:inline">Props</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="mt-4 h-[60vh]">
            <TabsContent value="schedule" className="space-y-6 pr-4">
              <SceneGroup title="Day - Interior" scenes={shootingGroups.dayInt} color="text-amber-600" />
              <SceneGroup title="Day - Exterior" scenes={shootingGroups.dayExt} color="text-sky-600" />
              <SceneGroup title="Night - Interior" scenes={shootingGroups.nightInt} color="text-indigo-600" />
              <SceneGroup title="Night - Exterior" scenes={shootingGroups.nightExt} color="text-violet-600" />
              <SceneGroup title="Other" scenes={shootingGroups.other} color="text-muted-foreground" />

              {breakdown.scenes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <LuCalendar className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No scenes found. Add scene headings to generate a breakdown.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="locations" className="pr-4">
              {locationsArray.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead className="w-24 text-center">Scenes</TableHead>
                      <TableHead className="w-32">Scene Numbers</TableHead>
                      <TableHead>Characters</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locationsArray.map((loc) => (
                      <TableRow key={loc.name}>
                        <TableCell className="font-medium">{loc.name}</TableCell>
                        <TableCell className="text-center">{loc.sceneCount}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {loc.sceneNumbers.join(', ')}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.from(loc.characters)
                              .slice(0, 4)
                              .map((char) => (
                                <Badge key={char} variant="outline" className="text-xs">
                                  {char}
                                </Badge>
                              ))}
                            {loc.characters.size > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{loc.characters.size - 4}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <LuMapPin className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No locations found.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="characters" className="pr-4">
              {charactersArray.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Character</TableHead>
                      <TableHead className="w-24 text-center">Scenes</TableHead>
                      <TableHead className="w-24 text-center">Lines</TableHead>
                      <TableHead>Scene Numbers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charactersArray.map((char) => (
                      <TableRow key={char.name}>
                        <TableCell className="font-medium">{char.name}</TableCell>
                        <TableCell className="text-center">{char.sceneCount}</TableCell>
                        <TableCell className="text-center">{char.dialogueCount}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {char.sceneNumbers.join(', ')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <LuUser className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No characters found.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="props" className="pr-4">
              {propsArray.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prop</TableHead>
                      <TableHead className="w-24 text-center">Mentions</TableHead>
                      <TableHead>Scene Numbers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propsArray.map((prop) => (
                      <TableRow key={prop.name}>
                        <TableCell className="font-medium">{prop.name}</TableCell>
                        <TableCell className="text-center">{prop.mentions}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {prop.sceneNumbers.join(', ')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <LuPackage className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No props found. Use [PROP NAME] format in action blocks to track props.
                  </p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
