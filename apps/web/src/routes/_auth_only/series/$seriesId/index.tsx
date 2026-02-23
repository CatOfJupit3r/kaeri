import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth_only/series/$seriesId/')({
  beforeLoad: ({ params }) => {
    // Redirect to scripts by default
    throw redirect({
      to: '/series/$seriesId/scripts',
      params: { seriesId: params.seriesId },
    });
  },
  component: () => null,
});
