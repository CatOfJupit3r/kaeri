import { createFileRoute } from '@tanstack/react-router';
import { LuLoader } from 'react-icons/lu';

import { CharacterDetail } from '@~/features/characters/components/character-detail';
import {
  useCharacterDetail,
  characterDetailQueryOptions,
} from '@~/features/characters/hooks/queries/use-character-detail';
import { useCharacterList, characterListQueryOptions } from '@~/features/characters/hooks/queries/use-character-list';
import { SeriesHeader } from '@~/features/series/components/series-header';
import { useSeries, seriesQueryOptions } from '@~/features/series/hooks/queries/use-series';

export const Route = createFileRoute('/_auth_only/series/$seriesId/knowledge-base/characters/$characterId')({
  loader: async ({ context, params }) => {
    const { characterId, seriesId } = params;

    await Promise.all([
      context.queryClient.ensureQueryData(seriesQueryOptions(seriesId)),
      context.queryClient.ensureQueryData(characterDetailQueryOptions(characterId, seriesId)),
      context.queryClient.ensureQueryData(characterListQueryOptions(seriesId)),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { seriesId, characterId } = Route.useParams();
  const { data: series } = useSeries(seriesId);
  const { data: character, isPending, error } = useCharacterDetail(characterId, seriesId);
  const { data: characterListData } = useCharacterList(seriesId);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LuLoader className="size-5 animate-spin" />
          <span>Loading character...</span>
        </div>
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Error loading character</h2>
          <p className="mt-2 text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Character not found</h2>
          <p className="mt-2 text-muted-foreground">The character you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Series not found</h2>
          <p className="mt-2 text-muted-foreground">The series you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const allCharacters = characterListData?.items ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Series Header */}
      <SeriesHeader
        series={series}
        breadcrumbs={[
          { label: 'Knowledge Base', href: `/series/${seriesId}/knowledge-base?tab=characters` },
          { label: 'Characters', href: `/series/${seriesId}/knowledge-base?tab=characters` },
        ]}
        currentPage={character.name}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <CharacterDetail character={character} seriesId={seriesId} allCharacters={allCharacters} />
      </div>
    </div>
  );
}
