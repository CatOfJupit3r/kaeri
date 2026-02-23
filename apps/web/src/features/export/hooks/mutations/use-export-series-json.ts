import { useMutation } from '@tanstack/react-query';

import { toastError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type ExportSeriesJsonResult = ORPCOutputs['export']['exportSeriesJson'];

export const exportSeriesJsonMutationOptions = tanstackRPC.export.exportSeriesJson.mutationOptions({
  onSuccess: (data) => {
    // Trigger download
    downloadJson(data, `${data.series.title}-backup.json`);
    toastSuccess('Series exported successfully');
  },
  onError: (error) => {
    toastError(`Export failed: ${error.message}`);
  },
});

/**
 * Downloads data as a JSON file
 */
function downloadJson(data: ExportSeriesJsonResult, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function useExportSeriesJson() {
  const mutation = useMutation(exportSeriesJsonMutationOptions);

  return {
    exportSeriesJson: mutation.mutate,
    exportSeriesJsonAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
