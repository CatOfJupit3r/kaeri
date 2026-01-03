import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type MetricsQueryReturnType = ORPCOutputs['index']['metrics'];

export const metricsQueryOptions = tanstackRPC.index.metrics.queryOptions();

export function useMetrics(params: { enabled?: boolean } = {}) {
  return useQuery({ ...metricsQueryOptions, enabled: params.enabled ?? true });
}

export type UseMetricsType = ReturnType<typeof useMetrics>;
