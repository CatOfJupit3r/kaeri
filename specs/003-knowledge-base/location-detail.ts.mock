"use client"

import { ArrowLeft, Edit, MapPin, FileText, Users, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const mockLocation = {
  id: 1,
  name: "Tech Noir Club",
  description:
    "A dimly lit nightclub with neon lights and pulsing music. The interior is filled with fog machines and strobing lights creating an atmospheric, chaotic environment. Features a large dance floor, multiple levels, and dark corners.",
  mood: "Tense, Chaotic, Dangerous",
  timeOfDay: ["Night"],
  images: [
    { id: 1, url: "/neon-nightclub-interior.jpg", caption: "Main dance floor" },
    {
      id: 2,
      url: "/dark-club-entrance-neon.jpg",
      caption: "Entrance view",
    },
  ],
  appearances: [
    {
      scriptId: 1,
      scriptName: "Terminator - Episode 1",
      scenes: [
        { number: "1", heading: "INT. TECH NOIR CLUB - NIGHT", context: "First confrontation with Terminator" },
        { number: "2", heading: "INT. TECH NOIR CLUB - CONTINUOUS", context: "Chase through club" },
      ],
    },
    {
      scriptId: 3,
      scriptName: "Terminator - Episode 5",
      scenes: [{ number: "18", heading: "INT. TECH NOIR CLUB - NIGHT", context: "Flashback sequence" }],
    },
  ],
  associatedCharacters: [
    { name: "Sarah Connor", firstAppearance: "Episode 1, Scene 1" },
    { name: "The Terminator", firstAppearance: "Episode 1, Scene 1" },
    { name: "Kyle Reese", firstAppearance: "Episode 1, Scene 1" },
  ],
  props: ["Plasma Rifle", "Sarah's Photo", "Motorcycle"],
  notes: "Key location for series mythology. Represents the collision of future and present.",
}

interface LocationDetailProps {
  locationId: number
  onBack: () => void
}

export function LocationDetail({ locationId, onBack }: LocationDetailProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-card p-3 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0 md:h-9 md:w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 md:h-12 md:w-12">
              <MapPin className="h-5 w-5 text-green-500 md:h-6 md:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground md:text-xl">{mockLocation.name}</h1>
              <p className="text-xs text-muted-foreground md:text-sm">
                {mockLocation.appearances.reduce((acc, app) => acc + app.scenes.length, 0)} scenes
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full gap-1.5 md:w-auto md:gap-2 bg-transparent">
            <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Edit Location</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-6">
        <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
          <Card className="border-border bg-card p-4 md:p-6">
            <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Description</h2>
            <p className="mb-4 leading-relaxed text-foreground">{mockLocation.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Mood:</span>{" "}
                <span className="text-foreground">{mockLocation.mood}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Time:</span>{" "}
                <span className="text-foreground">{mockLocation.timeOfDay.join(", ")}</span>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-4 md:p-6">
            <div className="mb-3 flex items-center gap-2 md:mb-4">
              <ImageIcon className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
              <h2 className="text-base font-semibold text-foreground md:text-lg">Reference Images</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {mockLocation.images.map((image) => (
                <div key={image.id} className="overflow-hidden rounded-lg border border-border">
                  <img src={image.url || "/placeholder.svg"} alt={image.caption} className="h-48 w-full object-cover" />
                  <div className="border-t border-border bg-background/50 p-2">
                    <p className="text-xs text-muted-foreground">{image.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <Card className="border-border bg-card p-4 md:p-6">
              <div className="mb-3 flex items-center gap-2 md:mb-4">
                <Users className="h-4 w-4 text-blue-500 md:h-5 md:w-5" />
                <h2 className="text-base font-semibold text-foreground md:text-lg">Associated Characters</h2>
              </div>
              <div className="space-y-2">
                {mockLocation.associatedCharacters.map((char) => (
                  <div
                    key={char.name}
                    className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-3"
                  >
                    <span className="font-medium text-foreground">{char.name}</span>
                    <span className="text-xs text-muted-foreground">{char.firstAppearance}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border bg-card p-4 md:p-6">
              <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Props Used Here</h2>
              <div className="flex flex-wrap gap-2">
                {mockLocation.props.map((prop) => (
                  <Badge key={prop} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    {prop}
                  </Badge>
                ))}
              </div>
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Production Notes</h3>
                <p className="text-sm text-foreground leading-relaxed">{mockLocation.notes}</p>
              </div>
            </Card>
          </div>

          <Card className="border-border bg-card p-4 md:p-6">
            <h2 className="mb-4 text-base font-semibold text-foreground md:text-lg">Scenes at This Location</h2>
            <div className="space-y-4">
              {mockLocation.appearances.map((app) => (
                <div key={app.scriptId} className="rounded-lg border border-border bg-background/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <h3 className="font-medium text-foreground">{app.scriptName}</h3>
                    <Badge variant="outline" className="ml-auto">
                      {app.scenes.length} {app.scenes.length === 1 ? "scene" : "scenes"}
                    </Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {app.scenes.map((scene) => (
                      <div key={scene.number} className="flex gap-2 rounded-md border border-border bg-card p-2 md:p-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium">
                          {scene.number}
                        </div>
                        <div className="flex-1">
                          <p className="mb-1 text-xs font-medium text-foreground">{scene.heading}</p>
                          <p className="text-xs text-muted-foreground">{scene.context}</p>
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
