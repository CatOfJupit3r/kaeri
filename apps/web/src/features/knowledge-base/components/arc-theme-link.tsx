import { Link } from '@tanstack/react-router';
import { LuLightbulb } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import { Skeleton } from '@~/components/ui/skeleton';
import { useThemeDetail } from '@~/features/themes/hooks/queries/use-theme-detail';

interface iArcThemeLinkProps {
  arcId: string;
  themeIds: string[];
  seriesId: string;
}

function ThemeBadge({ themeId, seriesId }: { themeId: string; seriesId: string }) {
  const { data: theme, isPending } = useThemeDetail(themeId);

  if (isPending) {
    return <Skeleton className="h-6 w-20" />;
  }

  if (!theme) {
    return (
      <Badge variant="outline" className="gap-1">
        <LuLightbulb className="size-3" />
        <span>Unknown</span>
      </Badge>
    );
  }

  return (
    <Link
      to="/series/$seriesId/knowledge-base"
      params={{ seriesId }}
      search={{ tab: 'themes' }}
      className="inline-block"
    >
      <Badge
        variant="outline"
        className="gap-1 transition-colors hover:border-pink-500 hover:bg-pink-50"
        style={{
          borderColor: theme.color ?? undefined,
          backgroundColor: theme.color ? `${theme.color}15` : undefined,
        }}
      >
        <div
          className="size-2 rounded-full"
          style={{
            backgroundColor: theme.color ?? '#e11d48',
          }}
        />
        <span>{theme.name}</span>
      </Badge>
    </Link>
  );
}

export function ArcThemeLink({ arcId: _arcId, themeIds, seriesId }: iArcThemeLinkProps) {
  if (themeIds.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <LuLightbulb className="size-4" />
        <span className="text-sm">No themes linked</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {themeIds.map((themeId) => (
        <ThemeBadge key={themeId} themeId={themeId} seriesId={seriesId} />
      ))}
    </div>
  );
}
