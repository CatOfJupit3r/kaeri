import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { toastError, toastSuccess } from '@~/components/toastifications';
import { getBackendURL } from '@~/utils/ssr-helpers';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

interface iBeeMovieResult {
  message: string;
  data: {
    seriesId: string;
    scriptId: string;
    characterCount: number;
    locationCount: number;
    propCount: number;
    sceneCount: number;
  };
}

async function createBeeMovie(): Promise<iBeeMovieResult> {
  const response = await fetch(getBackendURL('/dev-tools/create-bee-movie'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create Bee Movie data' }));
    throw new Error(error.error ?? 'Failed to create Bee Movie data');
  }

  return response.json() as Promise<iBeeMovieResult>;
}

export function useCreateBeeMovie() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: createBeeMovieData, isPending } = useMutation({
    mutationFn: createBeeMovie,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: tanstackRPC.series.listSeries.queryKey({ input: {} }) });
      toastSuccess(
        `🐝 ${data.message}! Created ${data.data.characterCount} characters, ${data.data.locationCount} locations, ${data.data.propCount} props, and ${data.data.sceneCount} scenes.`,
      );
      // Navigate to the newly created series
      void navigate({ to: '/series/$seriesId', params: { seriesId: data.data.seriesId } });
    },
    onError: (error) => {
      toastError('Failed to create Bee Movie data', error.message);
    },
  });

  return {
    createBeeMovieData,
    isPending,
  };
}
