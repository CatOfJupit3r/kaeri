import { createFileRoute } from '@tanstack/react-router';

import { CanvasBoard } from '@~/features/canvas/components/board';
import { canvasQueryOptions } from '@~/features/canvas/hooks/queries/use-canvas';
import { SeriesHeader } from '@~/features/series/components/series-header';
import { SeriesTabs } from '@~/features/series/components/series-tabs';
import { seriesQueryOptions, useSeries } from '@~/features/series/hooks/queries/use-series';

export const Route = createFileRoute('/_auth_only/series/$seriesId/canvas')({
  loader: async ({ context, params }) => {
    const { seriesId } = params;

    await Promise.all([
      context.queryClient.ensureQueryData(seriesQueryOptions(seriesId)),
      context.queryClient.ensureQueryData(canvasQueryOptions(seriesId)),
    ]);
  },
  component: CanvasRoute,
});

function CanvasRoute() {
  const { seriesId } = Route.useParams();
  const { data: series } = useSeries(seriesId);

  if (!series) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <SeriesHeader series={series} />
      <SeriesTabs seriesId={seriesId} />

      <div className="flex h-[calc(100vh-180px)] min-h-[500px] flex-1 flex-col">
        <CanvasBoard seriesId={seriesId} />
      </div>
    </div>
  );
}
