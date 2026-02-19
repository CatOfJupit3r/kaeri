import { useQuery } from '@tanstack/react-query';

import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type ExportPresetListReturnType = ORPCOutputs['export']['listExportPresets'];
export type ExportPreset = ExportPresetListReturnType[number];

export const exportPresetsQueryOptions = () =>
  tanstackRPC.export.listExportPresets.queryOptions({
    input: {},
  });

/**
 * Hook to fetch all export presets for the current user
 */
export function useExportPresets() {
  return useQuery(exportPresetsQueryOptions());
}
