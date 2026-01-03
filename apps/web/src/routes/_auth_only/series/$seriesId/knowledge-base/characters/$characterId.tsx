import { createFileRoute, Link } from '@tanstack/react-router';
import { LuChevronRight, LuLoader } from 'react-icons/lu';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@~/components/ui/breadcrumb';
import { CharacterDetail } from '@~/features/characters/components/character-detail';
import {
  useCharacterDetail,
  characterDetailQueryOptions,
} from '@~/features/characters/hooks/queries/use-character-detail';
import { useCharacterList, characterListQueryOptions } from '@~/features/characters/hooks/queries/use-character-list';

export const Route = createFileRoute('/_auth_only/series/$seriesId/knowledge-base/characters/$characterId')({
  loader: async ({ context, params }) => {
    const { characterId, seriesId } = params;

    await Promise.all([
      context.queryClient.ensureQueryData(characterDetailQueryOptions(characterId, seriesId)),
      context.queryClient.ensureQueryData(characterListQueryOptions(seriesId)),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { seriesId, characterId } = Route.useParams();
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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Error loading character</h2>
          <p className="mt-2 text-muted-foreground">{error.message}</p>
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

  const allCharacters = characterListData?.items ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/series/$seriesId" params={{ seriesId }}>
                    Series
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <LuChevronRight className="size-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/series/$seriesId/knowledge-base" params={{ seriesId }}>
                    Knowledge Base
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <LuChevronRight className="size-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/series/$seriesId/knowledge-base" params={{ seriesId }} search={{ tab: 'characters' }}>
                    Characters
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <LuChevronRight className="size-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{character.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <CharacterDetail character={character} seriesId={seriesId} allCharacters={allCharacters} />
      </div>
    </div>
  );
}
