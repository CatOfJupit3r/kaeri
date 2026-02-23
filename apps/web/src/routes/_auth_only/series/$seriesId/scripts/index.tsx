import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { LuClock, LuFileText, LuPlus, LuUsers } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Card } from '@~/components/ui/card';
import { useCreateScript } from '@~/features/scripts/hooks/mutations/use-create-script';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';
import { SeriesHeader } from '@~/features/series/components/series-header';
import { SeriesTabs } from '@~/features/series/components/series-tabs';
import { useSeries, seriesQueryOptions } from '@~/features/series/hooks/queries/use-series';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

const CARD_COLORS = [
  'var(--brutalist-yellow)',
  'var(--brutalist-blue)',
  'var(--brutalist-pink)',
  'var(--brutalist-green)',
  'var(--brutalist-orange)',
];

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

      void navigate({
        to: '/series/$seriesId/scripts/$scriptId',
        params: { seriesId, scriptId: newScript._id },
      });
    } catch (error) {
      console.error('Failed to create script:', error);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {series ? <SeriesHeader series={series} /> : null}
      <SeriesTabs seriesId={seriesId} />

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-foreground uppercase md:text-4xl">Scripts</h2>
              <p className="mt-1 text-sm font-bold tracking-wide text-muted-foreground uppercase">
                {scriptsData?.total ?? 0} scripts in your library
              </p>
            </div>
            <Button
              onClick={handleCreateScript}
              disabled={isCreating}
              className="brutalist-shadow gap-2 border-2 border-foreground bg-(--brutalist-yellow) px-6 py-5 font-black tracking-wide text-foreground uppercase transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-(--brutalist-green) hover:shadow-none"
            >
              <LuPlus className="h-5 w-5" strokeWidth={3} />
              New Script
            </Button>
          </div>

          {/* Loading */}
          {isPending ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading scripts...</div>
            </div>
          ) : null}

          {/* Empty state */}
          {!isPending && scriptsData?.items.length === 0 ? (
            <Card className="flex flex-col items-center justify-center gap-4 border-3 border-foreground p-12 text-center">
              <LuFileText className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
              <div>
                <h2 className="text-lg font-black uppercase">No scripts yet</h2>
                <p className="text-sm text-muted-foreground">Create your first script to start writing.</p>
              </div>
              <Button
                onClick={handleCreateScript}
                disabled={isCreating}
                className="brutalist-shadow gap-2 border-2 border-foreground bg-(--brutalist-yellow) font-black text-foreground uppercase transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-(--brutalist-green) hover:shadow-none"
              >
                <LuPlus className="mr-2 h-4 w-4" />
                Create Script
              </Button>
            </Card>
          ) : null}

          {/* Script grid */}
          {!isPending && scriptsData != null && scriptsData.items.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {scriptsData.items.map((script, index) => (
                <Link
                  key={script._id}
                  to="/series/$seriesId/scripts/$scriptId"
                  params={{ seriesId, scriptId: script._id }}
                  className="group"
                >
                  <button
                    type="button"
                    className="brutalist-shadow flex w-full flex-col overflow-hidden border-3 border-foreground bg-card text-left transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_var(--foreground)]"
                    style={{ borderWidth: '3px' }}
                  >
                    {/* Color bar */}
                    <div className="h-3 w-full" style={{ backgroundColor: CARD_COLORS[index % CARD_COLORS.length] }} />

                    {/* Cover image or placeholder */}
                    {script.coverUrl ? (
                      <div
                        className="aspect-video w-full overflow-hidden border-b-3 border-foreground"
                        style={{ borderBottomWidth: '3px' }}
                      >
                        <img
                          src={script.coverUrl}
                          alt={script.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex aspect-video w-full items-center justify-center border-b-3 border-foreground bg-muted"
                        style={{ borderBottomWidth: '3px' }}
                      >
                        <LuFileText className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div>
                        <h3 className="text-lg font-black tracking-tight text-foreground uppercase group-hover:text-(--brutalist-blue)">
                          {script.title}
                        </h3>
                        {script.genre ? (
                          <span className="mt-1 inline-block border-2 border-foreground bg-(--brutalist-yellow) px-2 py-0.5 text-xs font-bold uppercase">
                            {script.genre}
                          </span>
                        ) : null}
                      </div>

                      {script.logline ? (
                        <p className="line-clamp-2 text-sm font-medium text-muted-foreground">{script.logline}</p>
                      ) : null}

                      <div className="mt-auto space-y-2 border-t-2 border-foreground pt-3">
                        {script.authors && script.authors.length > 0 ? (
                          <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                            <LuUsers className="h-4 w-4 shrink-0" />
                            <span className="truncate">{script.authors.join(', ')}</span>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                          <LuClock className="h-4 w-4 shrink-0" />
                          <span>{formatDistanceToNow(new Date(script.lastEditedAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
