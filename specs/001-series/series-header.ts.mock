"use client"

import { Settings, Users, ArrowLeft, BookOpen, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface SeriesHeaderProps {
  seriesName?: string
  isInEditor?: boolean
  onBackToLibrary?: () => void
  onBackToProjects?: () => void
  onNavigateToKnowledgeBase?: () => void
}

export function SeriesHeader({
  seriesName,
  isInEditor,
  onBackToLibrary,
  onBackToProjects,
  onNavigateToKnowledgeBase,
}: SeriesHeaderProps) {
  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden md:gap-3">
        {!isInEditor && onBackToProjects && (
          <Button variant="ghost" size="sm" onClick={onBackToProjects} className="shrink-0 gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">All Projects</span>
          </Button>
        )}
        {isInEditor && (
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBackToLibrary} className="shrink-0 gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Scripts</span>
            </Button>
            <div className="hidden h-4 w-px bg-border md:block" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToKnowledgeBase}
              className="hidden shrink-0 gap-2 text-muted-foreground md:flex"
            >
              <BookOpen className="h-4 w-4" />
              Knowledge Base
            </Button>
          </div>
        )}
        {!isInEditor && seriesName && (
          <>
            <div className="hidden h-4 w-px bg-border md:block" />
            <h1 className="truncate text-base font-semibold text-foreground md:text-lg">{seriesName}</h1>
            <span className="hidden text-xs text-muted-foreground xl:inline">Last edited 2 minutes ago</span>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex -space-x-2">
          <Avatar className="h-7 w-7 border-2 border-background">
            <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">JD</AvatarFallback>
          </Avatar>
          <Avatar className="h-7 w-7 border-2 border-background">
            <AvatarFallback className="bg-accent text-[10px] text-accent-foreground">SM</AvatarFallback>
          </Avatar>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </DropdownMenuItem>
            <DropdownMenuItem>Series Settings</DropdownMenuItem>
            <DropdownMenuItem>Export Series</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
