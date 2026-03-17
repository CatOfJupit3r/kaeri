import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { LuFileText, LuFilm, LuLayoutGrid, LuLibrary, LuSettings, LuTv, LuUser, LuUsers, LuZap } from 'react-icons/lu';

import { toastInfo } from '@~/components/toastifications';
import { Button } from '@~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@~/components/ui/dropdown-menu';
import { PresenceIndicator } from '@~/components/workspaces/presence-indicator';

import { SeriesModal } from './series-modal';

// Series type configuration
const SERIES_TYPE_CONFIG = {
  'tv-series': { label: 'TV Series', icon: LuTv, color: 'bg-(--brutalist-blue)' },
  'film-trilogy': { label: 'Film Trilogy', icon: LuFilm, color: 'bg-(--brutalist-pink)' },
  anthology: { label: 'Anthology', icon: LuLibrary, color: 'bg-(--brutalist-yellow)' },
  standalone: { label: 'Standalone', icon: LuFileText, color: 'bg-(--brutalist-green)' },
} as const;

type SeriesType = keyof typeof SERIES_TYPE_CONFIG;

interface iSeriesHeaderProps {
  series: {
    _id: string;
    title: string;
    type?: SeriesType;
    genre?: string;
    logline?: string;
    coverUrl?: string;
    lastEditedAt: Date;
  };
}

export function SeriesHeader({ series }: iSeriesHeaderProps) {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleManageUsers = () => {
    toastInfo('Multi-user support coming soon');
  };

  const handleSeriesSettings = () => {
    setIsSettingsModalOpen(true);
  };

  const handleUserSettings = () => {
    toastInfo('User settings coming soon');
  };

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b-4 border-foreground bg-card px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          {/* Logo */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="brutalist-shadow-sm flex h-9 w-9 items-center justify-center border-2 border-foreground bg-(--brutalist-yellow)">
              <LuZap className="h-5 w-5" />
            </div>
            <span className="hidden text-lg font-black tracking-tight uppercase sm:inline">Kaeri</span>
          </div>

          <div className="hidden h-8 w-0.5 bg-foreground md:block" />

          <Link to="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="brutalist-shadow-sm shrink-0 gap-2 border-2 border-foreground bg-transparent font-bold tracking-wide uppercase transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-(--brutalist-yellow) hover:shadow-none"
            >
              <LuLayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </Button>
          </Link>

          {/* Series Name */}
          <h1 className="truncate text-lg font-black tracking-tight text-foreground uppercase md:text-xl">
            {series.title}
          </h1>
          {/* Series Type Badge */}
          {series.type && SERIES_TYPE_CONFIG[series.type] ? (
            <span
              className={`hidden items-center gap-1 border-2 border-foreground px-2 py-0.5 text-xs font-bold uppercase lg:inline-flex ${SERIES_TYPE_CONFIG[series.type].color}`}
            >
              {(() => {
                const Icon = SERIES_TYPE_CONFIG[series.type].icon;
                return <Icon className="h-3 w-3" />;
              })()}
              {SERIES_TYPE_CONFIG[series.type].label}
            </span>
          ) : null}
          {series.genre ? (
            <span className="hidden border-2 border-foreground bg-(--brutalist-green) px-2 py-0.5 text-xs font-bold uppercase xl:inline">
              {series.genre}
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {/* Presence indicator - shows who's viewing this series */}
          <PresenceIndicator
            targetType="series"
            targetId={series._id}
            context="viewing"
            maxDisplay={3}
            showEmpty={false}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="brutalist-shadow-sm h-9 w-9 shrink-0 border-2 border-foreground bg-transparent transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-(--brutalist-yellow) hover:shadow-none"
              >
                <LuSettings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="brutalist-shadow border-2 border-foreground">
              <DropdownMenuItem onClick={handleSeriesSettings}>
                <LuSettings className="mr-2 h-4 w-4" />
                Project Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleManageUsers}>
                <LuUsers className="mr-2 h-4 w-4" />
                Manage Team
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-foreground" />
              <DropdownMenuItem onClick={handleUserSettings}>
                <LuUser className="mr-2 h-4 w-4" />
                User Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Series Settings Modal */}
      <SeriesModal open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen} initialData={series} />
    </>
  );
}
