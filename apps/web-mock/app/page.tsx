"use client"

import { useState } from "react"
import { ProjectLibrary } from "@/components/project-library"
import { SeriesAnalytics } from "@/components/series-analytics"
import { SeriesHeader } from "@/components/series-header"
import { SeriesTabs } from "@/components/series-tabs"
import { ScriptEditor } from "@/components/script-editor"
import { KnowledgeBase } from "@/components/knowledge-base"
import { ScriptsLibrary } from "@/components/scripts-library"

export type Script = {
  id: string
  name: string
  authors: string
  lastUpdated: Date
  image?: string
  imagePosition?: "top" | "left" | "right"
  content: string
  genre?: string
  logline?: string
  status?: "draft" | "review" | "final"
  episodeNumber?: number
  wordCount?: number
}

export type Series = {
  id: string
  name: string
  type: "tv-series" | "film-trilogy" | "anthology" | "standalone"
  description: string
  createdDate: Date
  lastUpdated: Date
  scripts: Script[]
  coverImage?: string
}

export default function HomePage() {
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null)
  const [activeTab, setActiveTab] = useState<"scripts" | "knowledge-base" | "analytics">("scripts")
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)

  const [allSeries, setAllSeries] = useState<Series[]>([
    {
      id: "1",
      name: "Coffee Shop Chronicles",
      type: "tv-series",
      description: "A drama series exploring human connections in an urban setting",
      createdDate: new Date("2024-11-01"),
      lastUpdated: new Date("2025-01-15"),
      scripts: [
        {
          id: "1",
          name: "The Last Call - Episode 1",
          authors: "Maya Rodriguez, Jack Chen",
          lastUpdated: new Date("2025-01-15"),
          genre: "Drama",
          logline: "A chance encounter at a coffee shop forces two former partners to confront their past.",
          status: "review",
          episodeNumber: 1,
          wordCount: 8543,
          content: `INT. COFFEE SHOP - DAY

The small coffee shop buzzes with the morning rush. MAYA (28, wearing a vintage leather jacket) sits alone at a corner table, typing furiously on her laptop.

The door chimes. JACK (32, disheveled but charming) enters, looking around nervously.

MAYA
(without looking up)
Table's taken.

JACK
I'm not here for the table.

Maya finally looks up, recognition flashing across her face.

MAYA
You've got to be kidding me.

JACK
There is no security. It's a coffee shop.

Beat. Maya closes her laptop with deliberate slowness.

MAYA
Then I guess you have four seconds.

JACK
Maya, please. Just hear me out.

FADE TO:`,
        },
        {
          id: "2",
          name: "Second Chances - Episode 2",
          authors: "Maya Rodriguez, Jack Chen",
          lastUpdated: new Date("2025-01-12"),
          genre: "Drama",
          logline: "Maya and Jack attempt to rebuild trust while facing new challenges.",
          status: "draft",
          episodeNumber: 2,
          wordCount: 7821,
          content: "INT. MAYA'S APARTMENT - NIGHT\n\n...",
        },
      ],
    },
    {
      id: "2",
      name: "Neon Nights Trilogy",
      type: "film-trilogy",
      description: "A cyberpunk saga spanning three films",
      createdDate: new Date("2024-10-15"),
      lastUpdated: new Date("2025-01-10"),
      scripts: [
        {
          id: "3",
          name: "Neon Nights: Awakening",
          authors: "Sarah Miller",
          lastUpdated: new Date("2025-01-10"),
          genre: "Sci-Fi Thriller",
          logline: "In a cyberpunk metropolis, a hacker discovers a conspiracy that threatens the fabric of reality.",
          status: "final",
          episodeNumber: 1,
          wordCount: 12456,
          content: "INT. UNDERGROUND CLUB - NIGHT\n\n...",
        },
      ],
    },
  ])

  const handleSeriesSelect = (series: Series) => {
    setSelectedSeries(series)
    setActiveTab("scripts")
    setSelectedScript(null)
  }

  const handleBackToProjects = () => {
    setSelectedSeries(null)
    setSelectedScript(null)
  }

  const handleCreateSeries = (newSeries: Omit<Series, "id" | "createdDate" | "lastUpdated" | "scripts">) => {
    const series: Series = {
      ...newSeries,
      id: Date.now().toString(),
      createdDate: new Date(),
      lastUpdated: new Date(),
      scripts: [],
    }
    setAllSeries([...allSeries, series])
    setSelectedSeries(series)
  }

  const handleScriptSelect = (script: Script) => {
    setSelectedScript(script)
  }

  const handleBackToLibrary = () => {
    setSelectedScript(null)
  }

  const handleCreateScript = (newScript: Omit<Script, "id" | "lastUpdated">) => {
    if (!selectedSeries) return

    const script: Script = {
      ...newScript,
      id: Date.now().toString(),
      lastUpdated: new Date(),
      wordCount: newScript.content?.split(/\s+/).length || 0,
    }

    const updatedSeries = {
      ...selectedSeries,
      scripts: [...selectedSeries.scripts, script],
      lastUpdated: new Date(),
    }

    setAllSeries(allSeries.map((s) => (s.id === selectedSeries.id ? updatedSeries : s)))
    setSelectedSeries(updatedSeries)
    setSelectedScript(script)
  }

  const handleUpdateScript = (updatedScript: Script) => {
    if (!selectedSeries) return

    const scriptWithWordCount = {
      ...updatedScript,
      lastUpdated: new Date(),
      wordCount: updatedScript.content?.split(/\s+/).length || 0,
    }

    const updatedSeries = {
      ...selectedSeries,
      scripts: selectedSeries.scripts.map((s) => (s.id === scriptWithWordCount.id ? scriptWithWordCount : s)),
      lastUpdated: new Date(),
    }

    setAllSeries(allSeries.map((s) => (s.id === selectedSeries.id ? updatedSeries : s)))
    setSelectedSeries(updatedSeries)
    setSelectedScript(scriptWithWordCount)
  }

  const handleDeleteScript = (scriptId: string) => {
    if (!selectedSeries) return

    const updatedSeries = {
      ...selectedSeries,
      scripts: selectedSeries.scripts.filter((s) => s.id !== scriptId),
      lastUpdated: new Date(),
    }

    setAllSeries(allSeries.map((s) => (s.id === selectedSeries.id ? updatedSeries : s)))
    setSelectedSeries(updatedSeries)

    if (selectedScript?.id === scriptId) {
      setSelectedScript(null)
    }
  }

  if (!selectedSeries) {
    return <ProjectLibrary series={allSeries} onSeriesSelect={handleSeriesSelect} onCreateSeries={handleCreateSeries} />
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <SeriesHeader
        seriesName={selectedSeries.name}
        isInEditor={!!selectedScript}
        onBackToLibrary={handleBackToLibrary}
        onBackToProjects={handleBackToProjects}
        onNavigateToKnowledgeBase={() => {
          setActiveTab("knowledge-base")
          setSelectedScript(null)
        }}
      />
      {!selectedScript && <SeriesTabs activeTab={activeTab} onTabChange={setActiveTab} />}

      {activeTab === "scripts" && !selectedScript && (
        <main className="flex-1 overflow-auto">
          <ScriptsLibrary
            scripts={selectedSeries.scripts}
            onScriptSelect={handleScriptSelect}
            onCreateScript={handleCreateScript}
          />
        </main>
      )}

      {activeTab === "scripts" && selectedScript && (
        <main className="flex-1 overflow-hidden">
          <ScriptEditor
            script={selectedScript}
            onUpdateScript={handleUpdateScript}
            onDeleteScript={handleDeleteScript}
          />
        </main>
      )}

      {activeTab === "knowledge-base" && (
        <main className="flex-1 overflow-hidden">
          <KnowledgeBase />
        </main>
      )}

      {activeTab === "analytics" && (
        <main className="flex-1 overflow-auto">
          <SeriesAnalytics series={selectedSeries} />
        </main>
      )}
    </div>
  )
}
