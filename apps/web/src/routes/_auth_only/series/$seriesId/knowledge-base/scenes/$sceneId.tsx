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
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { useLocationList } from '@~/features/locations/hooks/queries/use-location-list';
import { usePropList } from '@~/features/props/hooks/queries/use-prop-list';
import { SceneDetail, SceneDetailSkeleton } from '@~/features/scenes/components/scene-detail';
import { sceneDetailQueryOptions, useSceneDetail } from '@~/features/scenes/hooks/queries/use-scene';
import { useSceneList } from '@~/features/scenes/hooks/queries/use-scene-list';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';

export const Route = createFileRoute('/_auth_only/series/$seriesId/knowledge-base/scenes/$sceneId')({
  loader: async ({ context, params }) => {
    const { sceneId } = params;

    await context.queryClient.ensureQueryData(sceneDetailQueryOptions(sceneId));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { seriesId, sceneId } = Route.useParams();
  const { data: scene, isPending: isScenePending, error } = useSceneDetail(sceneId);
  const { data: scriptsData } = useScriptList(seriesId);
  const { data: charactersData } = useCharacterList(seriesId);
  const { data: locationsData } = useLocationList(seriesId);
  const { data: propsData } = usePropList(seriesId);

  const { data: sceneListData } = useSceneList(scene?.scriptId ?? '', 100, 0, {
    enabled: !!scene?.scriptId,
  });

  if (isScenePending) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <LuLoader className="size-5 animate-spin" />
              <span>Loading scene...</span>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <SceneDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Error loading scene</h2>
          <p className="mt-2 text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  if (!scene) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Scene not found</h2>
          <p className="mt-2 text-muted-foreground">The scene you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const script = scriptsData?.items.find((s) => s._id === scene.scriptId);
  const characters = charactersData?.items.filter((c) => scene.characterIds.includes(c._id)) ?? [];
  const location = locationsData?.items.find((l) => l._id === scene.locationId);
  const props = propsData?.items.filter((p) => scene.propIds.includes(p._id)) ?? [];

  const scenes = sceneListData?.items ?? [];
  const currentIndex = scenes.findIndex((s) => s._id === sceneId);
  const previousScene = currentIndex > 0 ? scenes[currentIndex - 1] : undefined;
  const nextScene = currentIndex < scenes.length - 1 ? scenes[currentIndex + 1] : undefined;

  return (
    <div className="min-h-screen bg-background">
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
                  <Link to="/series/$seriesId/knowledge-base" params={{ seriesId }} search={{ tab: 'scenes' }}>
                    Knowledge Base
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <LuChevronRight className="size-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/series/$seriesId/knowledge-base" params={{ seriesId }} search={{ tab: 'scenes' }}>
                    Scenes
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <LuChevronRight className="size-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{scene.heading}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <SceneDetail
          scene={scene}
          scriptName={script?.title}
          seriesId={seriesId}
          previousScene={previousScene}
          nextScene={nextScene}
          characters={characters}
          location={location}
          props={props}
        />
      </div>
    </div>
  );
}
