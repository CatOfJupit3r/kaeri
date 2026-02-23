import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { LuLayoutGrid, LuSettings, LuUsers, LuUser, LuZap } from 'react-icons/lu';

import { toastInfo } from '@~/components/toastifications';
import { Button } from '@~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@~/components/ui/dropdown-menu';

import { SeriesModal } from './series-modal';

interface iSeriesHeaderProps {
  series: {
    _id: string;
    title: string;
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
          {series.genre ? (
            <span className="hidden border-2 border-foreground bg-(--brutalist-green) px-2 py-0.5 text-xs font-bold uppercase xl:inline">
              {series.genre}
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {/* User avatars - brutalist style */}
          <div className="flex -space-x-1">
            <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-(--brutalist-pink) text-xs font-black">
              U1
            </div>
            <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-(--brutalist-blue) text-xs font-black text-white">
              U2
            </div>
          </div>

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
