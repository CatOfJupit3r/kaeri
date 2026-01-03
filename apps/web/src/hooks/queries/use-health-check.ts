import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type HealthCheckQueryReturnType = ORPCOutputs['index']['healthCheck'];

export const healthCheckQueryOptions = tanstackRPC.index.healthCheck.queryOptions();

export function useHealthCheck(params: { enabled?: boolean } = {}) {
  return useQuery({ ...healthCheckQueryOptions, enabled: params.enabled ?? true });
}

export type UseHealthCheckType = ReturnType<typeof useHealthCheck>;
