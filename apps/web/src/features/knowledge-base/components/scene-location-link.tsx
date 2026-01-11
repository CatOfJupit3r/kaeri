import { Link } from '@tanstack/react-router';
import { LuMapPin } from 'react-icons/lu';

import { Skeleton } from '@~/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@~/components/ui/tooltip';
import { useLocation } from '@~/features/locations/hooks/queries/use-location';

interface iSceneLocationLinkProps {
  sceneId: string;
  locationId: string;
  seriesId: string;
}

export function SceneLocationLink({ sceneId: _sceneId, locationId, seriesId }: iSceneLocationLinkProps) {
  const { data: location, isPending } = useLocation(locationId, seriesId);

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <LuMapPin className="size-4 text-green-500" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <LuMapPin className="size-4" />
        <span className="text-sm">Unknown location</span>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to="/series/$seriesId/knowledge-base"
          params={{ seriesId }}
          search={{ tab: 'locations' }}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <LuMapPin className="size-4 text-green-500" />
          <span>{location.name}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-w-xs space-y-1">
          <p className="font-medium">{location.name}</p>
          {location.description ? <p className="text-xs text-muted-foreground">{location.description}</p> : null}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
