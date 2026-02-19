"use client"

import { ArrowLeft, Edit, FileText, Users, Sparkles, Award, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"

// Mock data for demonstration
const mockCharacter = {
  id: 1,
  name: "Sarah Connor",
  generalInfo: {
    role: "Protagonist",
    description:
      "A resilient waitress turned warrior who transforms from an ordinary woman into humanity's savior. Her journey represents the classic hero's transformation arc.",
    traits: ["Resourceful", "Determined", "Protective", "Traumatized"],
    relationships: [
      { character: "Kyle Reese", type: "Love Interest", inKnowledgeBase: true },
      { character: "John Connor", type: "Son", inKnowledgeBase: true },
      { character: "The Terminator", type: "Enemy", inKnowledgeBase: false },
    ],
  },
  scriptVariations: [
    {
      scriptId: 1,
      scriptName: "Terminator - Episode 1",
      version: "1984 (Young)",
      age: "19 years old",
      notes: "Naive and unaware of her destiny. Works as a waitress. Not yet hardened by the future.",
      appearance: "Long brown hair, casual 80s fashion, innocent demeanor",
    },
    {
      scriptId: 2,
      scriptName: "Terminator - Episode 2",
      version: "1991 (Hardened)",
      age: "26 years old",
      notes: "Battle-hardened and paranoid. Physically fit and trained in combat. Institutionalized.",
      appearance: "Short hair, muscular build, tank top, military demeanor",
    },
  ],
  mentions: [
    {
      scriptId: 1,
      scriptName: "Terminator - Episode 1",
      scenes: [
        {
          sceneNumber: "1",
          sceneHeading: "INT. TECH NOIR CLUB - NIGHT",
          type: "Appears",
          context: "First confrontation with the Terminator",
        },
        {
          sceneNumber: "5",
          sceneHeading: "INT. POLICE STATION - DAY",
          type: "Appears",
          context: "Meets Kyle Reese, learns the truth",
        },
        { sceneNumber: "12", sceneHeading: "EXT. MOTEL - NIGHT", type: "Appears", context: "Intimate scene with Kyle" },
        {
          sceneNumber: "15",
          sceneHeading: "INT. CYBERDYNE FACTORY - NIGHT",
          type: "Appears",
          context: "Final confrontation",
        },
      ],
    },
    {
      scriptId: 2,
      scriptName: "Terminator - Episode 2",
      scenes: [
        {
          sceneNumber: "3",
          sceneHeading: "INT. PSYCHIATRIC HOSPITAL - DAY",
          type: "Appears",
          context: "Escape attempt",
        },
        {
          sceneNumber: "8",
          sceneHeading: "EXT. DESERT HIGHWAY - DAY",
          type: "Mentioned",
          context: "John talks about his mother",
        },
        {
          sceneNumber: "11",
          sceneHeading: "INT. CYBERDYNE SYSTEMS - NIGHT",
          type: "Appears",
          context: "Infiltration mission",
        },
      ],
    },
  ],
}

const characterDatabase = {
  "Kyle Reese": {
    role: "Supporting Character",
    description: "A soldier from the future sent to protect Sarah Connor. Brave and determined.",
    traits: ["Loyal", "Tactical", "Scarred"],
  },
  "John Connor": {
    role: "Protagonist",
    description: "Future leader of the human resistance. Son of Sarah Connor.",
    traits: ["Leader", "Determined", "Strategic"],
  },
}

interface CharacterDetailProps {
  characterId: number
  onBack: () => void
}

function CharacterMention({ name, inKnowledgeBase }: { name: string; inKnowledgeBase: boolean }) {
  if (!inKnowledgeBase) {
    return <span className="font-medium text-foreground">{name}</span>
  }

  const characterData = characterDatabase[name as keyof typeof characterDatabase]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="font-medium text-blue-500 underline decoration-dotted hover:text-blue-600 transition-colors cursor-pointer">
          {name}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="top">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-sm font-medium text-blue-500">
              {name.charAt(0)}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{name}</h4>
              <p className="text-xs text-muted-foreground">{characterData?.role}</p>
            </div>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{characterData?.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {characterData?.traits.map((trait) => (
              <Badge key={trait} variant="secondary" className="text-xs">
                {trait}
              </Badge>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function CharacterDetail({ characterId, onBack }: CharacterDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3 md:gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 shrink-0 p-0 md:h-9 md:w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-2xl font-bold text-white shadow-lg md:h-20 md:w-20 md:text-3xl">
              {mockCharacter.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground md:text-2xl">{mockCharacter.name}</h1>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Award className="h-3 w-3" />
                  {mockCharacter.generalInfo.role}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  {mockCharacter.mentions.reduce((acc, m) => acc + m.scenes.length, 0)} appearances
                </Badge>
              </div>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full gap-1.5 md:w-auto md:gap-2 bg-card/80 backdrop-blur">
            <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Edit Character</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-6">
        <div className="mx-auto max-w-6xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 md:mb-6">
              <TabsTrigger value="overview" className="text-xs md:text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="variations" className="text-xs md:text-sm">
                Script Variations
              </TabsTrigger>
              <TabsTrigger value="appearances" className="text-xs md:text-sm">
                Appearances
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 md:space-y-6">
              <Card className="border-border bg-gradient-to-br from-card to-card/50 p-4 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-foreground">Character Description</h2>
                </div>
                <p className="leading-relaxed text-foreground">{mockCharacter.generalInfo.description}</p>
              </Card>

              <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
                <Card className="border-border bg-card p-4 md:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <h2 className="text-lg font-semibold text-foreground">Character Traits</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mockCharacter.generalInfo.traits.map((trait) => (
                      <Badge key={trait} variant="secondary" className="text-sm">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </Card>

                <Card className="border-border bg-card p-4 md:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <h2 className="text-lg font-semibold text-foreground">Relationships</h2>
                  </div>
                  <div className="space-y-3">
                    {mockCharacter.generalInfo.relationships.map((rel, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border border-border bg-background/50 p-3"
                      >
                        <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1">
                          <CharacterMention name={rel.character} inKnowledgeBase={rel.inKnowledgeBase} />
                          <p className="mt-1 text-xs text-muted-foreground">{rel.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="variations" className="space-y-4">
              <Card className="bg-card border-border p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Script-Specific Variations</h2>
                  <Button size="sm" variant="outline">
                    Add Variation
                  </Button>
                </div>
                <div className="space-y-4">
                  {mockCharacter.scriptVariations.map((variation) => (
                    <div key={variation.scriptId} className="rounded-lg border border-border bg-background/50 p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <h3 className="font-medium text-foreground">{variation.scriptName}</h3>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{variation.version}</span>
                            <span>•</span>
                            <span>{variation.age}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="mb-1 text-xs font-medium text-muted-foreground">Notes</h4>
                          <p className="text-sm text-foreground leading-relaxed">{variation.notes}</p>
                        </div>
                        <div>
                          <h4 className="mb-1 text-xs font-medium text-muted-foreground">Appearance</h4>
                          <p className="text-sm text-foreground leading-relaxed">{variation.appearance}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="appearances" className="space-y-4 md:space-y-6">
              {mockCharacter.mentions.map((mention) => (
                <Card key={mention.scriptId} className="border-border bg-card p-4 md:p-6">
                  <div className="mb-3 flex flex-col gap-2 md:mb-4 md:flex-row md:items-center md:gap-2">
                    <FileText className="h-4 w-4 text-blue-500 md:h-5 md:w-5" />
                    <h3 className="font-semibold text-foreground">{mention.scriptName}</h3>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {mention.scenes.length} {mention.scenes.length === 1 ? "scene" : "scenes"}
                    </Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {mention.scenes.map((scene) => (
                      <div
                        key={scene.sceneNumber}
                        className="flex cursor-pointer gap-2 rounded-md border border-border bg-background/50 p-2 transition-colors hover:bg-accent/50 md:gap-3 md:p-3"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-medium text-foreground md:h-7 md:w-7 md:text-xs">
                          {scene.sceneNumber}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <p className="truncate text-[11px] font-medium text-foreground md:text-xs">
                              {scene.sceneHeading}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1 md:gap-2">
                            <Badge
                              variant="outline"
                              className={`h-4 text-[9px] md:h-5 md:text-[10px] ${
                                scene.type === "Appears"
                                  ? "border-green-600 text-green-600"
                                  : "border-amber-600 text-amber-600"
                              }`}
                            >
                              {scene.type}
                            </Badge>
                            <p className="truncate text-[10px] text-muted-foreground md:text-[11px]">{scene.context}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
