import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { LuFileText, LuPlus, LuUser } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Card } from '@~/components/ui/card';
import { useCreateScript } from '@~/features/scripts/hooks/mutations/use-create-script';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';
import { SeriesHeader } from '@~/features/series/components/series-header';
import { useSeries, seriesQueryOptions } from '@~/features/series/hooks/queries/use-series';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export const Route = createFileRoute('/_auth_only/series/$seriesId/scripts/')({
  loader: async ({ context, params }) => {
    const { seriesId } = params;
    await Promise.all([
      context.queryClient.ensureQueryData(seriesQueryOptions(seriesId)),
      context.queryClient.ensureQueryData(
        tanstackRPC.scripts.listScriptsBySeries.queryOptions({
          input: { seriesId, limit: 100, offset: 0 },
        }),
      ),
    ]);
  },
  component: ScriptsLibraryPage,
});

function ScriptsLibraryPage() {
  const { seriesId } = Route.useParams();
  const navigate = useNavigate();
  const { data: series } = useSeries(seriesId);
  const { data: scriptsData, isPending } = useScriptList(seriesId);
  const { createScriptAsync, isPending: isCreating } = useCreateScript();

  const handleCreateScript = async () => {
    try {
      const newScript = await createScriptAsync({
        seriesId,
        title: 'Untitled Script',
      });

      // Navigate to the new script
      void navigate({
        to: '/series/$seriesId/scripts/$scriptId',
        params: { seriesId, scriptId: newScript._id },
      });
    } catch (error) {
      console.error('Failed to create script:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {series != null ? <SeriesHeader series={series} currentPage="scripts" /> : null}

      <main className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Scripts</h1>
            <p className="text-muted-foreground">
              {scriptsData?.total ?? 0} script{scriptsData?.total !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={handleCreateScript} disabled={isCreating} className="gap-2">
            <LuPlus className="h-4 w-4" />
            New Script
          </Button>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading scripts...</div>
          </div>
        ) : null}

        {!isPending && scriptsData?.items.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <LuFileText className="h-12 w-12 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-medium">No scripts yet</h2>
              <p className="text-sm text-muted-foreground">Create your first script to start writing.</p>
            </div>
            <Button onClick={handleCreateScript} disabled={isCreating}>
              <LuPlus className="mr-2 h-4 w-4" />
              Create Script
            </Button>
          </Card>
        ) : null}

        {!isPending && scriptsData != null && scriptsData.items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scriptsData.items.map((script) => (
              <Link
                key={script._id}
                to="/series/$seriesId/scripts/$scriptId"
                params={{ seriesId, scriptId: script._id }}
                className="group"
              >
                <Card className="flex flex-col gap-3 p-4 transition-all hover:border-primary hover:shadow-md">
                  {/* Cover image or placeholder */}
                  <div className="aspect-16/10 overflow-hidden rounded-md bg-muted">
                    {script.coverUrl != null ? (
                      <img src={script.coverUrl} alt={script.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <LuFileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Script info */}
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium group-hover:text-primary">{script.title}</h3>
                    {script.logline ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{script.logline}</p>
                    ) : null}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {script.authors && script.authors.length > 0 ? (
                        <>
                          <LuUser className="h-3 w-3" />
                          <span>{script.authors.join(', ')}</span>
                        </>
                      ) : null}
                    </div>
                    <span>{formatDistanceToNow(new Date(script.lastEditedAt), { addSuffix: true })}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}
