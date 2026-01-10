"use client"

import { useState } from "react"
import { Plus, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScriptModal } from "@/components/script-modal"
import type { Script } from "@/app/page"

interface ScriptsLibraryProps {
  scripts: Script[]
  onScriptSelect: (script: Script) => void
  onCreateScript: (script: Omit<Script, "id" | "lastUpdated">) => void
}

export function ScriptsLibrary({ scripts, onScriptSelect, onCreateScript }: ScriptsLibraryProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleCreate = (scriptData: Omit<Script, "id" | "lastUpdated">) => {
    onCreateScript(scriptData)
    setIsCreateModalOpen(false)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground md:text-2xl">Scripts</h2>
          <p className="text-xs text-muted-foreground md:text-sm">{scripts.length} scripts in your library</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Script
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {scripts.map((script) => (
          <button
            key={script.id}
            onClick={() => onScriptSelect(script)}
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left transition-all hover:border-primary hover:shadow-md"
          >
            {script.image && (
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={script.image || "/placeholder.svg"}
                  alt={script.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-2 p-4 md:gap-3 md:p-5">
              <div>
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary md:text-lg">
                  {script.name}
                </h3>
                {script.genre && <p className="text-xs text-muted-foreground">{script.genre}</p>}
              </div>

              {script.logline && (
                <p className="line-clamp-2 text-xs text-muted-foreground md:text-sm">{script.logline}</p>
              )}

              <div className="mt-auto space-y-2 border-t border-border pt-2 md:pt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                  <span className="truncate">{script.authors}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                  <span>Updated {formatDate(script.lastUpdated)}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <ScriptModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSave={handleCreate} />
    </div>
  )
}
