"use client"

import { ArrowLeft, Edit, FileText, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const mockTheme = {
  id: 1,
  name: "Fate vs Free Will",
  description:
    "A central philosophical question explored throughout the series: Can the future be changed, or is destiny predetermined? Characters constantly struggle with whether their actions matter in the face of prophecy.",
  color: "yellow",
  occurrences: 12,
  relatedScripts: [
    {
      scriptId: 1,
      scriptName: "Terminator - Episode 1",
      mentions: 5,
      keyScenes: [
        { number: "5", heading: "INT. POLICE STATION - DAY", quote: "The future's not set..." },
        { number: "12", heading: "EXT. MOTEL - NIGHT", quote: "No fate but what we make" },
      ],
    },
    {
      scriptId: 2,
      scriptName: "Terminator - Episode 2",
      mentions: 7,
      keyScenes: [
        { number: "8", heading: "EXT. DESERT HIGHWAY - DAY", quote: "There is no fate..." },
        { number: "15", heading: "INT. CYBERDYNE SYSTEMS - NIGHT", quote: "The future can be changed" },
      ],
    },
  ],
  relatedCharacters: [
    { name: "Sarah Connor", connection: "Embodies the struggle against destiny" },
    { name: "Kyle Reese", connection: "Messenger from a predetermined future" },
    { name: "John Connor", connection: "The prophesied savior questioning his role" },
  ],
  visualMotifs: ["Clocks and time imagery", "Crossroads and paths", "Broken chains"],
  evolution: [
    { phase: "Episode 1", interpretation: "Future seems unchangeable" },
    { phase: "Episode 2", interpretation: "Characters actively fight fate" },
    { phase: "Episode 3", interpretation: "Ambiguous resolution" },
  ],
}

interface ThemeDetailProps {
  themeId: number
  onBack: () => void
}

export function ThemeDetail({ themeId, onBack }: ThemeDetailProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-card p-3 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0 md:h-9 md:w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 md:h-12 md:w-12">
              <Lightbulb className="h-5 w-5 text-yellow-500 md:h-6 md:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground md:text-xl">{mockTheme.name}</h1>
              <p className="text-xs text-muted-foreground md:text-sm">{mockTheme.occurrences} mentions across series</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full gap-1.5 md:w-auto md:gap-2 bg-transparent">
            <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Edit Theme</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-6">
        <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
          <Card className="border-border bg-card p-4 md:p-6">
            <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Description</h2>
            <p className="leading-relaxed text-foreground">{mockTheme.description}</p>
          </Card>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <Card className="border-border bg-card p-4 md:p-6">
              <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Related Characters</h2>
              <div className="space-y-3">
                {mockTheme.relatedCharacters.map((char) => (
                  <div key={char.name} className="rounded-lg border border-border bg-background/50 p-3">
                    <h3 className="mb-1 text-sm font-medium text-foreground">{char.name}</h3>
                    <p className="text-xs text-muted-foreground md:text-sm">{char.connection}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border bg-card p-4 md:p-6">
              <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Visual Motifs</h2>
              <div className="flex flex-wrap gap-2">
                {mockTheme.visualMotifs.map((motif) => (
                  <Badge key={motif} variant="secondary" className="text-xs md:text-sm">
                    {motif}
                  </Badge>
                ))}
              </div>
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">Thematic Evolution</h3>
                <div className="space-y-2">
                  {mockTheme.evolution.map((evo) => (
                    <div key={evo.phase} className="text-sm">
                      <span className="font-medium text-foreground">{evo.phase}:</span>{" "}
                      <span className="text-muted-foreground">{evo.interpretation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <Card className="border-border bg-card p-4 md:p-6">
            <h2 className="mb-4 text-base font-semibold text-foreground md:text-lg">Appearances in Scripts</h2>
            <div className="space-y-4">
              {mockTheme.relatedScripts.map((script) => (
                <div key={script.scriptId} className="rounded-lg border border-border bg-background/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <h3 className="font-medium text-foreground">{script.scriptName}</h3>
                    </div>
                    <Badge variant="outline">{script.mentions} mentions</Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground md:text-sm">Key Scenes</h4>
                    {script.keyScenes.map((scene) => (
                      <div key={scene.number} className="flex gap-2 rounded-md border border-border bg-card p-2 md:p-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium">
                          {scene.number}
                        </div>
                        <div className="flex-1">
                          <p className="mb-1 text-xs font-medium text-foreground">{scene.heading}</p>
                          <p className="text-xs italic text-muted-foreground">"{scene.quote}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
