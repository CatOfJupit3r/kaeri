import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@~/components/ui/button';
import { Card } from '@~/components/ui/card';
import { useSeriesList } from '@~/features/kaeri/hooks/queries/use-series-list';

export const Route = createFileRoute('/_auth_only/projects')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: seriesListData, isLoading, error } = useSeriesList();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading series...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Error loading series: {error.message}</p>
      </div>
    );
  }

  const series = seriesListData?.items ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
            <p className="text-sm text-muted-foreground">Manage all your series and screenplays</p>
          </div>

          <Button className="gap-2">
            <span>New Project</span>
          </Button>
        </div>
      </div>

      <div className="p-6">
        {series.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {series.map((s) => (
              <Card key={s._id} className="group cursor-pointer overflow-hidden transition-all hover:shadow-md">
                <div className="p-5">
                  <h3 className="font-semibold text-foreground group-hover:text-primary">{s.title}</h3>
                  {s.genre ? <p className="text-xs text-muted-foreground">{s.genre}</p> : null}
                  {s.logline ? <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{s.logline}</p> : null}
                  <div className="mt-4 text-xs text-muted-foreground">
                    Last edited: {new Date(s.lastEditedAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
