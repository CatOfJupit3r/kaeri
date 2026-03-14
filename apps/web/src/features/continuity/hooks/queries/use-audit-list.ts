import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type AuditListOutput = ORPCOutputs['continuity']['auditListBySeries'];
export type AuditEntry = AuditListOutput['items'][number];

export const auditListBySeriesQueryOptions = (seriesId: string, params: { offset?: number; limit?: number } = {}) =>
  tanstackRPC.continuity.auditListBySeries.queryOptions({
    input: {
      seriesId,
      offset: params.offset ?? 0,
      limit: params.limit ?? 20,
    },
  });

export function useAuditListBySeries(
  seriesId: string,
  params: { offset?: number; limit?: number; enabled?: boolean } = {},
) {
  return useQuery({
    ...auditListBySeriesQueryOptions(seriesId, params),
    enabled: (params.enabled ?? true) && !!seriesId,
  });
}

export const auditListByEntityQueryOptions = (
  seriesId: string,
  entityType: string,
  entityId: string,
  params: { offset?: number; limit?: number } = {},
) =>
  tanstackRPC.continuity.auditListByEntity.queryOptions({
    input: {
      seriesId,
      entityType,
      entityId,
      offset: params.offset ?? 0,
      limit: params.limit ?? 20,
    },
  });

export function useAuditListByEntity(
  seriesId: string,
  entityType: string,
  entityId: string,
  params: { offset?: number; limit?: number; enabled?: boolean } = {},
) {
  return useQuery({
    ...auditListByEntityQueryOptions(seriesId, entityType, entityId, params),
    enabled: (params.enabled ?? true) && !!seriesId && !!entityId,
  });
}
