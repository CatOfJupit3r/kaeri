import { createFileRoute } from '@tanstack/react-router';

import { EpisodeList } from '@~/features/episodes';
import { episodeListQueryOptions } from '@~/features/episodes/hooks/queries/use-episode-list';
import { SeriesHeader } from '@~/features/series/components/series-header';
import { SeriesTabs } from '@~/features/series/components/series-tabs';
import { useSeries, seriesQueryOptions } from '@~/features/series/hooks/queries/use-series';

export const Route = createFileRoute('/_auth_only/series/$seriesId/episodes/')({
  loader: async ({ context, params }) => {
    const { seriesId } = params;
    await Promise.all([
      context.queryClient.ensureQueryData(seriesQueryOptions(seriesId)),
      context.queryClient.ensureQueryData(episodeListQueryOptions(seriesId)),
    ]);
  },
  component: EpisodesPage,
});

function EpisodesPage() {
  const { seriesId } = Route.useParams();
  const { data: series } = useSeries(seriesId);

  if (!series) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Series not found</p>
      </div>
    );
  }

  // Episodes only available for TV Series type
  if (series.type !== 'tv-series') {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <SeriesHeader series={series} />
        <SeriesTabs seriesId={seriesId} seriesType={series.type} />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Episodes are only available for TV Series projects.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SeriesHeader series={series} />
      <SeriesTabs seriesId={seriesId} seriesType={series.type} />

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          <EpisodeList seriesId={seriesId} />
        </div>
      </main>
    </div>
  );
}
