"use client"

import { Settings, Users, ArrowLeft, BookOpen, LayoutGrid, User, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SeriesHeaderProps {
  seriesName?: string
  isInEditor?: boolean
  onBackToLibrary?: () => void
  onBackToProjects?: () => void
  onNavigateToKnowledgeBase?: () => void
  onOpenProjectSettings?: () => void
  onOpenUserSettings?: () => void
}

export function SeriesHeader({
  seriesName,
  isInEditor,
  onBackToLibrary,
  onBackToProjects,
  onNavigateToKnowledgeBase,
  onOpenProjectSettings,
  onOpenUserSettings,
}: SeriesHeaderProps) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b-4 border-foreground bg-card px-4 gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center border-2 border-foreground bg-[var(--brutalist-yellow)] brutalist-shadow-sm">
            <Zap className="h-5 w-5" />
          </div>
          <span className="hidden text-lg font-black uppercase tracking-tight sm:inline">Zokuhen</span>
        </div>

        <div className="h-8 w-0.5 bg-foreground hidden md:block" />

        {!isInEditor && onBackToProjects && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToProjects}
            className="shrink-0 gap-2 border-2 border-foreground font-bold uppercase tracking-wide hover:bg-[var(--brutalist-yellow)] brutalist-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all bg-transparent"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Projects</span>
          </Button>
        )}

        {isInEditor && (
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToLibrary}
              className="shrink-0 gap-2 border-2 border-foreground font-bold uppercase tracking-wide hover:bg-[var(--brutalist-yellow)] brutalist-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Scripts</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToKnowledgeBase}
              className="hidden shrink-0 gap-2 border-2 border-foreground font-bold uppercase tracking-wide hover:bg-[var(--brutalist-blue)] hover:text-white md:flex brutalist-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all bg-transparent"
            >
              <BookOpen className="h-4 w-4" />
              Knowledge
            </Button>
          </div>
        )}

        {!isInEditor && seriesName && (
          <>
            <h1 className="truncate text-lg font-black uppercase tracking-tight text-foreground md:text-xl">
              {seriesName}
            </h1>
            <span className="hidden border-2 border-foreground bg-[var(--brutalist-green)] px-2 py-0.5 text-xs font-bold uppercase xl:inline">
              Active
            </span>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {/* User avatars - brutalist style */}
        <div className="flex -space-x-1">
          <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-[var(--brutalist-pink)] text-xs font-black">
            JD
          </div>
          <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-[var(--brutalist-blue)] text-xs font-black text-white">
            SM
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 border-2 border-foreground hover:bg-[var(--brutalist-yellow)] brutalist-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all bg-transparent"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-2 border-foreground brutalist-shadow">
            <DropdownMenuItem
              onClick={onOpenProjectSettings}
              className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]"
            >
              <Settings className="mr-2 h-4 w-4" />
              Project Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenProjectSettings}
              className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]"
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Team
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-foreground" />
            <DropdownMenuItem
              onClick={onOpenUserSettings}
              className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]"
            >
              <User className="mr-2 h-4 w-4" />
              User Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
