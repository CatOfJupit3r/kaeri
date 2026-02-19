"use client"

import { useState } from "react"
import { Plus, Clock, Users, FileText } from "lucide-react"
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

  const cardColors = [
    "var(--brutalist-yellow)",
    "var(--brutalist-blue)",
    "var(--brutalist-pink)",
    "var(--brutalist-green)",
    "var(--brutalist-orange)",
  ]

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">Scripts</h2>
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mt-1">
            {scripts.length} scripts in your library
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 border-2 border-foreground bg-[var(--brutalist-yellow)] text-foreground font-black uppercase tracking-wide hover:bg-[var(--brutalist-green)] brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all px-6 py-5"
        >
          <Plus className="h-5 w-5" strokeWidth={3} />
          New Script
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {scripts.map((script, index) => (
          <button
            key={script.id}
            onClick={() => onScriptSelect(script)}
            className="group flex flex-col overflow-hidden border-3 border-foreground bg-card text-left transition-all brutalist-shadow hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_var(--foreground)]"
            style={{ borderWidth: "3px" }}
          >
            {/* Color bar */}
            <div className="h-3 w-full" style={{ backgroundColor: cardColors[index % cardColors.length] }} />

            {script.image ? (
              <div
                className="aspect-video w-full overflow-hidden border-b-3 border-foreground"
                style={{ borderBottomWidth: "3px" }}
              >
                <img
                  src={script.image || "/placeholder.svg"}
                  alt={script.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ) : (
              <div
                className="flex aspect-video w-full items-center justify-center border-b-3 border-foreground bg-muted"
                style={{ borderBottomWidth: "3px" }}
              >
                <FileText className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
              </div>
            )}

            <div className="flex flex-1 flex-col gap-3 p-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-foreground group-hover:text-[var(--brutalist-blue)]">
                  {script.name}
                </h3>
                {script.genre && (
                  <span className="inline-block mt-1 border-2 border-foreground bg-[var(--brutalist-yellow)] px-2 py-0.5 text-xs font-bold uppercase">
                    {script.genre}
                  </span>
                )}
              </div>

              {script.logline && (
                <p className="line-clamp-2 text-sm text-muted-foreground font-medium">{script.logline}</p>
              )}

              <div className="mt-auto space-y-2 border-t-2 border-foreground pt-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="truncate">{script.authors}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{formatDate(script.lastUpdated)}</span>
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
