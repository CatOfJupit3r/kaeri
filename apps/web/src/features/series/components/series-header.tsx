import { Link } from '@tanstack/react-router';
import { LuEllipsisVertical, LuUsers, LuSettings, LuDownload } from 'react-icons/lu';

import { Avatar, AvatarFallback, AvatarImage } from '@~/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@~/components/ui/breadcrumb';
import { Button } from '@~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@~/components/ui/dropdown-menu';

interface iSeriesHeaderProps {
  series: {
    _id: string;
    title: string;
    genre?: string;
    logline?: string;
    coverUrl?: string;
    lastEditedAt: Date;
  };
  breadcrumbs?: Array<{ label: string; href?: string }>;
  currentPage: string;
}

export function SeriesHeader({ series, breadcrumbs = [], currentPage }: iSeriesHeaderProps) {
  const handleManageUsers = () => {
    // TODO: Implement manage users functionality (future multi-user support)
    console.log('[SeriesHeader] Manage users clicked');
  };

  const handleSeriesSettings = () => {
    // TODO: Implement series settings functionality
    console.log('[SeriesHeader] Series settings clicked');
  };

  const handleExportSeries = () => {
    // TODO: Implement export series functionality
    console.log('[SeriesHeader] Export series clicked');
  };

  // Mock collaborators for future multi-user support
  const mockCollaborators = [
    { id: '1', name: 'User 1', avatarUrl: undefined },
    { id: '2', name: 'User 2', avatarUrl: undefined },
    { id: '3', name: 'User 3', avatarUrl: undefined },
  ];

  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/projects" className="transition-colors hover:text-foreground">
                  Projects
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/series/$seriesId"
                  params={{ seriesId: series._id }}
                  className="transition-colors hover:text-foreground"
                >
                  {series.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb) => (
              <span key={crumb.label}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.href} className="transition-colors hover:text-foreground">
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
            {!breadcrumbs.length && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Content */}
        <div className="flex items-start gap-6">
          {/* Cover Image */}
          {series.coverUrl ? (
            <img src={series.coverUrl} alt={series.title} className="h-32 w-24 rounded-lg object-cover shadow-md" />
          ) : null}

          {/* Series Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{series.title}</h1>
                {series.genre ? <p className="mt-1 text-sm text-muted-foreground">{series.genre}</p> : null}
                {series.logline ? <p className="mt-3 text-base text-muted-foreground">{series.logline}</p> : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  Last edited: {new Date(series.lastEditedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions Section */}
              <div className="flex items-center gap-2">
                {/* Collaborator Avatars - Placeholder for future multi-user */}
                <div className="mr-2 flex -space-x-2">
                  {mockCollaborators.map((collab) => {
                    const initials = collab.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <Avatar key={collab.id} className="size-8 border-2 border-background">
                        {collab.avatarUrl ? <AvatarImage src={collab.avatarUrl} alt={collab.name} /> : null}
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                    );
                  })}
                </div>

                {/* Settings Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <LuEllipsisVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={handleManageUsers}>
                      <LuUsers className="mr-2 h-4 w-4" />
                      Manage Users
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSeriesSettings}>
                      <LuSettings className="mr-2 h-4 w-4" />
                      Series Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleExportSeries}>
                      <LuDownload className="mr-2 h-4 w-4" />
                      Export Series
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
