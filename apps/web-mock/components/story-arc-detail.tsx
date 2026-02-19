"use client"

import { ArrowLeft, Edit, TrendingUp, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const mockStoryArc = {
  id: 1,
  character: "Sarah Connor",
  arcName: "Victim → Hero",
  description:
    "Sarah's transformation from an ordinary waitress who is a victim of circumstance into a hardened warrior who actively shapes her destiny. This arc explores themes of agency, maternal strength, and the cost of survival.",
  progress: 75,
  startPoint: "Naive waitress unaware of her role in humanity's future",
  currentState: "Increasingly capable fighter learning to take control",
  endGoal: "Legendary warrior and mother of the resistance leader",
  keyMilestones: [
    {
      episode: "Episode 1",
      event: "Attacked by Terminator",
      impact: "Forced to confront impossible reality",
      complete: true,
    },
    { episode: "Episode 1", event: "Learns the truth from Kyle", impact: "Accepts her destiny", complete: true },
    {
      episode: "Episode 2",
      event: "Begins combat training",
      impact: "Takes agency in shaping her future",
      complete: true,
    },
    {
      episode: "Episode 3",
      event: "First solo victory",
      impact: "Proves capability without help",
      complete: false,
    },
    {
      episode: "Episode 4",
      event: "Becomes the protector",
      impact: "Role reversal complete",
      complete: false,
    },
  ],
  relatedCharacters: [
    { name: "Kyle Reese", role: "Catalyst for transformation" },
    { name: "John Connor", role: "Motivation for growth" },
    { name: "The Terminator", role: "Antagonist forcing evolution" },
  ],
  thematicConnections: ["Fate vs Free Will", "Survival", "Maternal Instinct"],
  emotionalJourney: [
    { phase: "Act 1", state: "Fear & Confusion", color: "red" },
    { phase: "Act 2", state: "Determination & Growth", color: "yellow" },
    { phase: "Act 3", state: "Strength & Purpose", color: "green" },
  ],
}

interface StoryArcDetailProps {
  arcId: number
  onBack: () => void
}

export function StoryArcDetail({ arcId, onBack }: StoryArcDetailProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-card p-3 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0 md:h-9 md:w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 md:h-12 md:w-12">
              <TrendingUp className="h-5 w-5 text-emerald-500 md:h-6 md:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground md:text-xl">{mockStoryArc.arcName}</h1>
              <p className="text-xs text-muted-foreground md:text-sm">{mockStoryArc.character}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full gap-1.5 md:w-auto md:gap-2 bg-transparent">
            <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Edit Arc</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-6">
        <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
          <Card className="border-border bg-card p-4 md:p-6">
            <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Arc Description</h2>
            <p className="mb-4 leading-relaxed text-foreground">{mockStoryArc.description}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Arc Progress</span>
                <span className="font-medium text-foreground">{mockStoryArc.progress}%</span>
              </div>
              <Progress value={mockStoryArc.progress} className="h-2" />
            </div>
          </Card>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            <Card className="border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Starting Point</h3>
              <p className="text-sm text-foreground">{mockStoryArc.startPoint}</p>
            </Card>
            <Card className="border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Current State</h3>
              <p className="text-sm text-foreground">{mockStoryArc.currentState}</p>
            </Card>
            <Card className="border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">End Goal</h3>
              <p className="text-sm text-foreground">{mockStoryArc.endGoal}</p>
            </Card>
          </div>

          <Card className="border-border bg-card p-4 md:p-6">
            <h2 className="mb-4 text-base font-semibold text-foreground md:text-lg">Key Milestones</h2>
            <div className="space-y-3">
              {mockStoryArc.keyMilestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative rounded-lg border p-4 ${
                    milestone.complete ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-background/50"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText
                        className={`h-4 w-4 ${milestone.complete ? "text-emerald-500" : "text-muted-foreground"}`}
                      />
                      <span className="text-sm font-medium text-foreground">{milestone.episode}</span>
                    </div>
                    {milestone.complete && (
                      <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                        Complete
                      </Badge>
                    )}
                  </div>
                  <h3 className="mb-1 font-medium text-foreground">{milestone.event}</h3>
                  <p className="text-sm text-muted-foreground">{milestone.impact}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <Card className="border-border bg-card p-4 md:p-6">
              <div className="mb-3 flex items-center gap-2 md:mb-4">
                <Users className="h-4 w-4 text-blue-500 md:h-5 md:w-5" />
                <h2 className="text-base font-semibold text-foreground md:text-lg">Related Characters</h2>
              </div>
              <div className="space-y-2">
                {mockStoryArc.relatedCharacters.map((char) => (
                  <div key={char.name} className="rounded-lg border border-border bg-background/50 p-3">
                    <h3 className="mb-1 text-sm font-medium text-foreground">{char.name}</h3>
                    <p className="text-xs text-muted-foreground">{char.role}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border bg-card p-4 md:p-6">
              <h2 className="mb-3 text-base font-semibold text-foreground md:mb-4 md:text-lg">Thematic Connections</h2>
              <div className="mb-4 flex flex-wrap gap-2">
                {mockStoryArc.thematicConnections.map((theme) => (
                  <Badge key={theme} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    {theme}
                  </Badge>
                ))}
              </div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Emotional Journey</h3>
              <div className="space-y-2">
                {mockStoryArc.emotionalJourney.map((phase) => (
                  <div key={phase.phase} className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        phase.color === "red"
                          ? "bg-red-500"
                          : phase.color === "yellow"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    />
                    <div className="text-sm">
                      <span className="font-medium text-foreground">{phase.phase}:</span>{" "}
                      <span className="text-muted-foreground">{phase.state}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
