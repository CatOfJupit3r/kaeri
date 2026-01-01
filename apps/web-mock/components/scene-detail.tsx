"use client"

import { ArrowLeft, Edit, Film, MapPin, Users, Clock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const mockScene = {
  id: 1,
  number: "1",
  heading: "INT. TECH NOIR CLUB - NIGHT",
  scriptName: "Terminator - Episode 1",
  location: "Tech Noir Club",
  characters: ["Sarah Connor", "Kyle Reese", "The Terminator"],
  emotionalTone: "Tense, Chaotic",
  conflict: "Terminator vs Sarah + Kyle - First major confrontation",
  timeOfDay: "Night",
  duration: "2 pages",
  beats: [
    { order: 1, description: "Terminator enters club, scans for Sarah" },
    { order: 2, description: "Kyle spots Terminator, tries to reach Sarah" },
    { order: 3, description: "Terminator opens fire" },
    { order: 4, description: "Chaos erupts, Kyle grabs Sarah" },
    { order: 5, description: "Escape through back exit" },
  ],
  props: ["Plasma Rifle", "Sarah's Photo", "Laser Sight"],
  lighting: "Neon strobes, fog, dark shadows",
  sound: "Loud techno music, gunfire, screaming",
  previousScene: { number: "0", heading: "EXT. CITY STREET - NIGHT" },
  nextScene: { number: "2", heading: "EXT. ALLEY - NIGHT" },
  notes:
    "This is the pivotal first action sequence. Establish the Terminator's relentless nature and Sarah's vulnerability. Kyle's protective instinct comes through.",
  storyboardUrl: "/action-storyboard-nightclub-scene.jpg",
}

interface SceneDetailProps {
  sceneId: number
  onBack: () => void
}

export function SceneDetail({ sceneId, onBack }: SceneDetailProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-card p-3 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0 md:h-9 md:w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 md:h-12 md:w-12">
              <Film className="h-5 w-5 text-indigo-500 md:h-6 md:w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">Scene #{mockScene.number}</span>
                <h1 className="text-lg font-semibold text-foreground md:text-xl">{mockScene.heading}</h1>
              </div>
              <p className="text-xs text-muted-foreground md:text-sm">{mockScene.scriptName}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full gap-1.5 md:w-auto md:gap-2 bg-transparent">
            <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Edit Scene</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-6">
        <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            <Card className="border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
              </div>
              <p className="font-medium text-foreground">{mockScene.location}</p>
            </Card>

            <Card className="border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-medium text-muted-foreground">Time & Duration</h3>
              </div>
              <p className="font-medium text-foreground">
                {mockScene.timeOfDay} • {mockScene.duration}
              </p>
            </Card>

            <Card className="border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-medium text-muted-foreground">Emotional Tone</h3>
              </div>
              <p className="font-medium text-foreground">{mockScene.emotionalTone}</p>
            </Card>
          </div>

          <Card className="border-border bg-card p-4 md:p-6">
            <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Conflict</h2>
            <p className="leading-relaxed text-foreground">{mockScene.conflict}</p>
          </Card>

          <Card className="border-border bg-card p-4 md:p-6">
            <div className="mb-3 flex items-center gap-2 md:mb-4">
              <Users className="h-4 w-4 text-blue-500 md:h-5 md:w-5" />
              <h2 className="text-base font-semibold text-foreground md:text-lg">Characters Present</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {mockScene.characters.map((char) => (
                <Badge key={char} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {char}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="border-border bg-card p-4 md:p-6">
            <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Scene Beats</h2>
            <div className="space-y-3">
              {mockScene.beats.map((beat) => (
                <div key={beat.order} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-medium text-indigo-500">
                    {beat.order}
                  </div>
                  <p className="flex-1 pt-1 text-sm text-foreground">{beat.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <Card className="border-border bg-card p-4 md:p-6">
              <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Production Details</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">Props</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {mockScene.props.map((prop) => (
                      <Badge key={prop} variant="outline" className="text-xs">
                        {prop}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-muted-foreground">Lighting</h3>
                  <p className="text-sm text-foreground">{mockScene.lighting}</p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-muted-foreground">Sound Design</h3>
                  <p className="text-sm text-foreground">{mockScene.sound}</p>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card p-4 md:p-6">
              <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Scene Flow</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">Previous Scene</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-xs text-muted-foreground">#{mockScene.previousScene.number}</span>
                    <span className="text-foreground">{mockScene.previousScene.heading}</span>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">Next Scene</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-xs text-muted-foreground">#{mockScene.nextScene.number}</span>
                    <span className="text-foreground">{mockScene.nextScene.heading}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="border-border bg-card p-4 md:p-6">
            <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Director's Notes</h2>
            <p className="leading-relaxed text-foreground">{mockScene.notes}</p>
          </Card>

          <Card className="border-border bg-card p-4 md:p-6">
            <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Storyboard</h2>
            <div className="overflow-hidden rounded-lg border border-border">
              <img src={mockScene.storyboardUrl || "/placeholder.svg"} alt="Scene storyboard" className="w-full" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
