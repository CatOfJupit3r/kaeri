import { Link, useLocation } from '@tanstack/react-router';
import { LuChartNoAxesColumn, LuBookOpen, LuClapperboard, LuFileText, LuLayoutDashboard } from 'react-icons/lu';

import { cn } from '@~/lib/utils';

type TabType = 'scripts' | 'episodes' | 'knowledge-base' | 'canvas' | 'analytics';

type SeriesType = 'tv-series' | 'film-trilogy' | 'anthology' | 'standalone';

interface iSeriesTabsProps {
  seriesId: string;
  seriesType?: SeriesType;
}

interface iTabConfig {
  id: TabType;
  label: string;
  href: string;
  icon: typeof LuFileText;
  visibleFor?: SeriesType[];
  disabled?: boolean;
}

const TABS: iTabConfig[] = [
  { id: 'scripts', label: 'Scripts', href: '/series/$seriesId/scripts', icon: LuFileText },
  {
    id: 'episodes',
    label: 'Episodes',
    href: '/series/$seriesId/episodes',
    icon: LuClapperboard,
    visibleFor: ['tv-series'],
  },
  { id: 'knowledge-base', label: 'Knowledge Base', href: '/series/$seriesId/knowledge-base', icon: LuBookOpen },
  { id: 'canvas', label: 'Canvas', href: '/series/$seriesId/canvas', icon: LuLayoutDashboard },
  { id: 'analytics', label: 'Analytics', href: '#', icon: LuChartNoAxesColumn, disabled: true },
];

export function SeriesTabs({ seriesId, seriesType }: iSeriesTabsProps) {
  const location = useLocation();
  const { pathname } = location;

  const getActiveTab = (): TabType => {
    if (pathname.includes('/knowledge-base')) return 'knowledge-base';
    if (pathname.includes('/canvas')) return 'canvas';
    if (pathname.includes('/episodes')) return 'episodes';
    if (pathname.includes('/scripts')) return 'scripts';
    // Default to scripts for the series index page
    return 'scripts';
  };

  // Filter tabs based on series type
  const visibleTabs = TABS.filter((tab) => {
    if (!tab.visibleFor) return true;
    return seriesType && tab.visibleFor.includes(seriesType);
  });

  const activeTab = getActiveTab();

  return (
    <div className="flex shrink-0 items-center gap-1 border-b-2 border-foreground bg-muted/30 px-4">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const href = tab.href.replace('$seriesId', seriesId);

        if (tab.disabled) {
          return (
            <button
              key={tab.id}
              type="button"
              className={cn(
                'flex items-center gap-2 border-b-4 px-4 py-2.5 text-sm font-bold tracking-wide uppercase transition-colors',
                'cursor-not-allowed border-transparent text-muted-foreground/50',
              )}
              disabled
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        }

        return (
          <Link
            key={tab.id}
            to={href}
            params={{ seriesId }}
            className={cn(
              'flex items-center gap-2 border-b-4 px-4 py-2.5 text-sm font-bold tracking-wide uppercase transition-colors',
              isActive
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
