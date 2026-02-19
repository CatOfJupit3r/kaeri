import { useMutation } from '@tanstack/react-query';

import { toastError, toastSuccess } from '@~/components/toastifications';
import type { ORPCOutputs } from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

export type ExportScriptPdfResult = ORPCOutputs['export']['exportScriptPdf'];

export const exportScriptPdfMutationOptions = tanstackRPC.export.exportScriptPdf.mutationOptions({
  onSuccess: (data) => {
    // Trigger download
    downloadPdf(data.data, data.filename);
    toastSuccess('PDF exported successfully');
  },
  onError: (error) => {
    toastError(`Export failed: ${error.message}`);
  },
});

/**
 * Downloads a base64-encoded PDF
 */
function downloadPdf(base64Data: string, filename: string) {
  // Convert base64 to blob
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'application/pdf' });

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

export function useExportScriptPdf() {
  const mutation = useMutation(exportScriptPdfMutationOptions);

  return {
    exportPdf: mutation.mutate,
    exportPdfAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
