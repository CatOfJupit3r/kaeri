"use client"

import {
  Plus,
  Search,
  Users,
  MapPin,
  Clock,
  Network,
  Film,
  Lightbulb,
  TrendingUp,
  List,
  Download,
  Upload,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { CharacterDetail } from "./character-detail"
import { ThemeDetail } from "./theme-detail"
import { LocationDetail } from "./location-detail"
import { SceneDetail } from "./scene-detail"
import { StoryArcDetail } from "./story-arc-detail"

// Mock data for demonstration
const mockData = {
  characters: [
    { id: 1, name: "Sarah Connor", role: "Protagonist", description: "A waitress turned warrior..." },
    { id: 2, name: "The Terminator", role: "Antagonist", description: "Cybernetic assassin..." },
    { id: 3, name: "Kyle Reese", role: "Supporting", description: "Soldier from the future..." },
  ],
  locations: [
    { id: 1, name: "Tech Noir Club", description: "Neon-lit nightclub, pivotal confrontation scene" },
    { id: 2, name: "Cyberdyne Systems", description: "Corporate headquarters, research facility" },
  ],
  props: [
    { id: 1, name: "Plasma Rifle", significance: "Future weapon, key plot device" },
    { id: 2, name: "Polaroid Photo", significance: "Connection between timelines" },
  ],
  scenes: [
    {
      id: 1,
      number: "1",
      location: "Tech Noir Club",
      beat: "First Confrontation",
      tone: "Tense",
      conflict: "Terminator vs Sarah + Kyle",
    },
    {
      id: 2,
      number: "15",
      location: "Cyberdyne Systems",
      beat: "Discovery",
      tone: "Mysterious",
      conflict: "Uncovering the truth",
    },
    {
      id: 3,
      number: "42",
      location: "Factory",
      beat: "Final Battle",
      tone: "Climactic",
      conflict: "Last stand against Terminator",
    },
  ],
  themes: [
    { id: 1, name: "Fate vs Free Will", description: "Can the future be changed?", occurrences: 12 },
    {
      id: 2,
      name: "Technology & Humanity",
      description: "The dangers of AI and human reliance on tech",
      occurrences: 8,
    },
    { id: 3, name: "Survival", description: "Fighting against impossible odds", occurrences: 15 },
  ],
  storyArcs: [
    { id: 1, character: "Sarah Connor", arc: "Victim → Hero", progress: 75 },
    { id: 2, character: "Kyle Reese", arc: "Protector → Sacrifice", progress: 100 },
  ],
  episodes: [
    { id: 1, number: "1x01", title: "Pilot", scenes: 24, status: "Complete" },
    { id: 2, number: "1x02", title: "The Chase Begins", scenes: 18, status: "In Progress" },
    { id: 3, number: "1x03", title: "Revelations", scenes: 0, status: "Outline" },
  ],
  research: [
    { id: 1, title: "AI Development Timeline", notes: "References for tech accuracy..." },
    { id: 2, title: "1980s Los Angeles", notes: "Period-accurate details..." },
  ],
}

export function KnowledgeBase() {
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<number | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [selectedScene, setSelectedScene] = useState<number | null>(null)
  const [selectedArc, setSelectedArc] = useState<number | null>(null)
  const [activeView, setActiveView] = useState<"grid" | "graph" | "timeline">("grid")
  const [selectedTab, setSelectedTab] = useState("all")

  if (selectedCharacter) {
    return <CharacterDetail characterId={selectedCharacter} onBack={() => setSelectedCharacter(null)} />
  }

  if (selectedTheme) {
    return <ThemeDetail themeId={selectedTheme} onBack={() => setSelectedTheme(null)} />
  }

  if (selectedLocation) {
    return <LocationDetail locationId={selectedLocation} onBack={() => setSelectedLocation(null)} />
  }

  if (selectedScene) {
    return <SceneDetail sceneId={selectedScene} onBack={() => setSelectedScene(null)} />
  }

  if (selectedArc) {
    return <StoryArcDetail arcId={selectedArc} onBack={() => setSelectedArc(null)} />
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-card p-3 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search all knowledge base..." className="pl-9 text-sm" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                size="sm"
                variant={activeView === "grid" ? "default" : "outline"}
                onClick={() => setActiveView("grid")}
                className="h-8 px-2 md:px-3"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={activeView === "graph" ? "default" : "outline"}
                onClick={() => setActiveView("graph")}
                className="h-8 px-2 md:px-3"
              >
                <Network className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={activeView === "timeline" ? "default" : "outline"}
                onClick={() => setActiveView("timeline")}
                className="h-8 px-2 md:px-3"
              >
                <Clock className="h-4 w-4" />
              </Button>
            </div>
            <div className="hidden h-4 w-px bg-border md:block" />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2 md:gap-2 md:px-3 bg-transparent">
                <Upload className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden text-xs md:inline md:text-sm">Import</span>
              </Button>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2 md:gap-2 md:px-3 bg-transparent">
                <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden text-xs md:inline md:text-sm">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {activeView === "grid" && (
        <div className="flex-1 overflow-y-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full">
            <div className="sticky top-0 z-10 border-b border-border bg-card px-3 pt-2 md:px-4 md:pt-3">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="all" className="text-xs md:text-sm">
                  All
                </TabsTrigger>
                <TabsTrigger value="characters" className="text-xs md:text-sm">
                  Characters
                </TabsTrigger>
                <TabsTrigger value="locations" className="text-xs md:text-sm">
                  Locations
                </TabsTrigger>
                <TabsTrigger value="props" className="text-xs md:text-sm">
                  Props
                </TabsTrigger>
                <TabsTrigger value="scenes" className="text-xs md:text-sm">
                  Scenes
                </TabsTrigger>
                <TabsTrigger value="themes" className="text-xs md:text-sm">
                  Themes
                </TabsTrigger>
                <TabsTrigger value="arcs" className="text-xs md:text-sm">
                  Story Arcs
                </TabsTrigger>
                <TabsTrigger value="episodes" className="text-xs md:text-sm">
                  Episodes
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0 p-3 md:p-6">
              <div className="grid gap-3 md:gap-4 lg:grid-cols-12">
                <Card className="border-border bg-card p-4 md:p-6 lg:col-span-6">
                  <div className="mb-3 flex items-center justify-between md:mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500 md:h-5 md:w-5" />
                      <h2 className="text-base font-semibold text-foreground md:text-lg">Characters</h2>
                      <span className="text-xs text-muted-foreground md:text-sm">({mockData.characters.length})</span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 md:h-8 md:w-8">
                      <Plus className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {mockData.characters.slice(0, 3).map((char) => (
                      <div
                        key={char.id}
                        onClick={() => setSelectedCharacter(char.id)}
                        className="group flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background/50 p-2 transition-colors hover:bg-accent/50 md:gap-3 md:p-3"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-medium text-blue-500 md:h-8 md:w-8 md:text-sm">
                          {char.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-medium text-foreground md:text-base">{char.name}</h3>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="lg:col-span-6 bg-card border-border p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Film className="h-5 w-5 text-indigo-500" />
                      <h2 className="text-lg font-semibold text-foreground">Scenes</h2>
                      <span className="text-sm text-muted-foreground">({mockData.scenes.length})</span>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {mockData.scenes.map((scene) => (
                      <div
                        key={scene.id}
                        onClick={() => setSelectedScene(scene.id)}
                        className="group cursor-pointer rounded-lg border border-border bg-background/50 p-3 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">#{scene.number}</span>
                              <h3 className="text-sm font-medium text-foreground">{scene.location}</h3>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {scene.beat} · {scene.tone}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="lg:col-span-4 bg-card border-border p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <h2 className="text-lg font-semibold text-foreground">Themes</h2>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {mockData.themes.map((theme) => (
                      <div
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className="group cursor-pointer rounded-lg border border-border bg-background/50 p-3 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-foreground">{theme.name}</h3>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{theme.description}</p>
                            <span className="mt-2 inline-block text-xs text-muted-foreground">
                              {theme.occurrences} mentions
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="lg:col-span-4 bg-card border-border p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      <h2 className="text-lg font-semibold text-foreground">Story Arcs</h2>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {mockData.storyArcs.map((arc) => (
                      <div
                        key={arc.id}
                        onClick={() => setSelectedArc(arc.id)}
                        className="group cursor-pointer rounded-lg border border-border bg-background/50 p-3 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-foreground">{arc.character}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">{arc.arc}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${arc.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="lg:col-span-4 bg-card border-border p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-500" />
                      <h2 className="text-lg font-semibold text-foreground">Locations</h2>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {mockData.locations.map((loc) => (
                      <div
                        key={loc.id}
                        onClick={() => setSelectedLocation(loc.id)}
                        className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-medium text-foreground">{loc.name}</h3>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="characters" className="mt-0 p-3 md:p-6">
              <div className="mb-4 flex items-center justify-between md:mb-6">
                <h2 className="text-lg font-semibold text-foreground md:text-xl">All Characters</h2>
                <Button size="sm" className="gap-1.5 md:gap-2">
                  <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="text-xs md:text-sm">Add Character</span>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {mockData.characters.map((char) => (
                  <div
                    key={char.id}
                    onClick={() => setSelectedCharacter(char.id)}
                    className="group cursor-pointer rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50 md:p-4"
                  >
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-base font-medium text-blue-500 md:h-12 md:w-12 md:text-lg">
                        {char.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-medium text-foreground md:text-base">{char.name}</h3>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground md:text-xs">
                          {char.role}
                        </span>
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground md:text-sm">{char.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="locations" className="mt-0 p-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {mockData.locations.map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc.id)}
                    className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground">{loc.name}</h3>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="text-sm text-muted-foreground">{loc.description}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="props" className="mt-0 p-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {mockData.props.map((prop) => (
                  <div
                    key={prop.id}
                    className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground">{prop.name}</h3>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="text-sm text-muted-foreground">{prop.significance}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="scenes" className="mt-0 p-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {mockData.scenes.map((scene) => (
                  <div
                    key={scene.id}
                    onClick={() => setSelectedScene(scene.id)}
                    className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">#{scene.number}</span>
                        <h3 className="font-medium text-foreground">{scene.location}</h3>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-foreground">{scene.beat}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{scene.tone}</span>
                        <span>·</span>
                        <span>{scene.conflict}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="themes" className="mt-0 p-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {mockData.themes.map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground">{theme.name}</h3>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{theme.description}</p>
                    <span className="inline-block rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-500">
                      {theme.occurrences} mentions
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="arcs" className="mt-0 p-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {mockData.storyArcs.map((arc) => (
                  <div
                    key={arc.id}
                    onClick={() => setSelectedArc(arc.id)}
                    className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">{arc.character}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{arc.arc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{arc.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${arc.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="episodes" className="mt-0 p-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {mockData.episodes.map((episode) => (
                  <div
                    key={episode.id}
                    className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-mono text-sm text-muted-foreground">{episode.number}</span>
                        <h3 className="mt-1 font-medium text-foreground">{episode.title}</h3>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-muted-foreground">{episode.scenes} scenes</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          episode.status === "Complete"
                            ? "bg-green-500/10 text-green-500"
                            : episode.status === "In Progress"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {episode.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {activeView === "graph" && (
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <div className="text-center">
            <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Relationship Graph View</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Visualize connections between characters, locations, scenes, and themes.
              <br />
              <span className="text-xs">(Coming soon)</span>
            </p>
          </div>
        </div>
      )}

      {activeView === "timeline" && (
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <div className="text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Timeline View</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              See when characters appear, locations are used, and how themes develop over time.
              <br />
              <span className="text-xs">(Coming soon)</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
