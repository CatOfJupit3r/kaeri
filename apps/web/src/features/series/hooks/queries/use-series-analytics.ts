import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type SeriesAnalyticsQueryReturnType = ORPCOutputs['series']['getSeriesAnalytics'];
export type OverviewStats = SeriesAnalyticsQueryReturnType['overview'];
export type LocationDistributionItem = SeriesAnalyticsQueryReturnType['locationDistribution'][number];
export type CharacterAppearanceItem = SeriesAnalyticsQueryReturnType['characterAppearances'][number];
export type StoryArcProgressItem = SeriesAnalyticsQueryReturnType['storyArcProgress'][number];
export type WritingActivityItem = SeriesAnalyticsQueryReturnType['writingActivity'][number];

export const seriesAnalyticsQueryOptions = (seriesId: string) =>
  tanstackRPC.series.getSeriesAnalytics.queryOptions({
    input: { seriesId },
  });

export function useSeriesAnalytics(seriesId: string, params: { enabled?: boolean } = {}) {
  return useQuery({
    ...seriesAnalyticsQueryOptions(seriesId),
    enabled: (params.enabled ?? true) && !!seriesId,
  });
}
