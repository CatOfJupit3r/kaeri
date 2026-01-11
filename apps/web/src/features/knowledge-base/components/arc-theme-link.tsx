import { Link } from '@tanstack/react-router';
import { LuLightbulb } from 'react-icons/lu';

import { Badge } from '@~/components/ui/badge';
import type { ThemeListItem } from '@~/features/themes/hooks/queries/use-theme-list';

interface iArcThemeLinkProps {
  arcId: string;
  themeIds: string[];
  seriesId: string;
  themes: ThemeListItem[] | Map<string, ThemeListItem>;
}

function ThemeBadge({ seriesId, themeData }: { seriesId: string; themeData: ThemeListItem | undefined }) {
  if (!themeData) {
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
          borderColor: themeData.color ?? undefined,
          backgroundColor: themeData.color ? `${themeData.color}15` : undefined,
        }}
      >
        <div
          className="size-2 rounded-full"
          style={{
            backgroundColor: themeData.color ?? '#e11d48',
          }}
        />
        <span>{themeData.name}</span>
      </Badge>
    </Link>
  );
}

export function ArcThemeLink({ arcId: _arcId, themeIds, seriesId, themes }: iArcThemeLinkProps) {
  if (themeIds.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <LuLightbulb className="size-4" />
        <span className="text-sm">No themes linked</span>
      </div>
    );
  }

  // Convert themes to a Map for efficient lookups if it's an array
  const themeMap = themes instanceof Map ? themes : new Map(themes.map((t) => [t._id, t]));

  return (
    <div className="flex flex-wrap gap-2">
      {themeIds.map((themeId) => (
        <ThemeBadge key={themeId} seriesId={seriesId} themeData={themeMap.get(themeId)} />
      ))}
    </div>
  );
}
