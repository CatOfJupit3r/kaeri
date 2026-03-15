import { createFileRoute } from '@tanstack/react-router';

import { SeriesAnalyticsDashboard } from '@~/features/series/components/series-analytics-dashboard';

export const Route = createFileRoute('/_auth_only/series/$seriesId/analytics')({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { seriesId } = Route.useParams();

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Overview of your series statistics and progress</p>
      </div>
      <SeriesAnalyticsDashboard seriesId={seriesId} />
    </div>
  );
}
