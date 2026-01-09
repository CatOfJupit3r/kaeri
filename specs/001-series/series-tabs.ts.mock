"use client"

import { FileText, BookOpen, BarChart3, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"

interface SeriesTabsProps {
  activeTab: "scripts" | "knowledge-base" | "analytics" | "breakdown"
  onTabChange: (tab: "scripts" | "knowledge-base" | "analytics" | "breakdown") => void
}

export function SeriesTabs({ activeTab, onTabChange }: SeriesTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-border bg-muted/30 px-4">
      <button
        onClick={() => onTabChange("scripts")}
        className={cn(
          "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
          activeTab === "scripts"
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        <FileText className="h-4 w-4" />
        Scripts
      </button>
      <button
        onClick={() => onTabChange("knowledge-base")}
        className={cn(
          "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
          activeTab === "knowledge-base"
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        <BookOpen className="h-4 w-4" />
        Knowledge Base
      </button>
      <button
        onClick={() => onTabChange("analytics")}
        className={cn(
          "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
          activeTab === "analytics"
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        <BarChart3 className="h-4 w-4" />
        Analytics
      </button>
      <button
        onClick={() => onTabChange("breakdown")}
        className={cn(
          "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
          activeTab === "breakdown"
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        <ClipboardList className="h-4 w-4" />
        Production
      </button>
    </div>
  )
}
