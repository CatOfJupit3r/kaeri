import { createFileRoute } from '@tanstack/react-router';
import { LuBookUser, LuGlobe, LuPackage, LuCalendar, LuSparkles } from 'react-icons/lu';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@~/components/ui/tabs';
import { CharacterList } from '@~/features/kaeri/components/kb/character-list';

export const Route = createFileRoute('/_auth_only/series/$seriesId/knowledge-base')({
  component: RouteComponent,
});

function RouteComponent() {
  const { seriesId } = Route.useParams();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Knowledge Base</h1>
            <p className="mt-1 text-muted-foreground">
              Manage characters, locations, props, timeline, and other story elements
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="characters" className="gap-2">
              <LuBookUser className="size-4" />
              <span>Characters</span>
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-2">
              <LuGlobe className="size-4" />
              <span>Locations</span>
            </TabsTrigger>
            <TabsTrigger value="props" className="gap-2">
              <LuPackage className="size-4" />
              <span>Props</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <LuCalendar className="size-4" />
              <span>Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="wildcards" className="gap-2">
              <LuSparkles className="size-4" />
              <span>Wild Cards</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="characters" className="mt-6 space-y-4">
            <CharacterList seriesId={seriesId} />
          </TabsContent>

          <TabsContent value="locations" className="mt-6 space-y-4">
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">Locations coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="props" className="mt-6 space-y-4">
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">Props coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6 space-y-4">
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">Timeline coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="wildcards" className="mt-6 space-y-4">
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">Wild Cards coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
