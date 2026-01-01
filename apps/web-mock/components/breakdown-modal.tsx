"use client"

import { Calendar, MapPin, Package, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface BreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  scriptName: string
}

const MOCK_BREAKDOWN = {
  schedule: [
    { scene: "1", location: "INT. SARAH'S APARTMENT - DAY", characters: ["Sarah Chen", "Marcus Blake"], day: "Day 1" },
    { scene: "2", location: "EXT. DOWNTOWN STREET - DAY", characters: ["Sarah Chen"], day: "Day 1" },
    {
      scene: "3",
      location: "INT. POLICE STATION - NIGHT",
      characters: ["Marcus Blake", "Elena Rodriguez"],
      day: "Day 2",
    },
    { scene: "4", location: "INT. COFFEE SHOP - DAY", characters: ["Sarah Chen", "Dr. James Wilson"], day: "Day 3" },
  ],
  locations: [
    { name: "Sarah's Apartment", scenes: ["1", "8", "15"], type: "Interior" },
    { name: "Downtown Street", scenes: ["2", "10"], type: "Exterior" },
    { name: "Police Station", scenes: ["3", "7", "12"], type: "Interior" },
    { name: "Coffee Shop", scenes: ["4", "9"], type: "Interior" },
  ],
  characters: [
    { name: "Sarah Chen", scenes: ["1", "2", "4", "8", "9", "10", "15"], totalScenes: 7 },
    { name: "Marcus Blake", scenes: ["1", "3", "7", "12"], totalScenes: 4 },
    { name: "Elena Rodriguez", scenes: ["3", "7", "12"], totalScenes: 3 },
    { name: "Dr. James Wilson", scenes: ["4", "9"], totalScenes: 2 },
  ],
  props: [
    { name: "Sarah's Laptop", scenes: ["1", "15"] },
    { name: "Police Badge", scenes: ["3", "7", "12"] },
    { name: "Coffee Cups", scenes: ["4", "9"] },
    { name: "Phone", scenes: ["1", "2", "8", "10"] },
  ],
}

export function BreakdownModal({ isOpen, onClose, scriptName }: BreakdownModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Script Breakdown - {scriptName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="schedule" className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Shooting Schedule
            </TabsTrigger>
            <TabsTrigger value="locations">
              <MapPin className="h-4 w-4 mr-2" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="characters">
              <Users className="h-4 w-4 mr-2" />
              Character Schedule
            </TabsTrigger>
            <TabsTrigger value="props">
              <Package className="h-4 w-4 mr-2" />
              Props
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="flex-1 mt-4">
            <ScrollArea className="h-[calc(80vh-180px)]">
              <div className="space-y-4 pr-4">
                {MOCK_BREAKDOWN.schedule.map((item, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">Scene {item.scene}</Badge>
                        <Badge>{item.day}</Badge>
                      </div>
                    </div>
                    <div className="font-medium">{item.location}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {item.characters.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="locations" className="flex-1 mt-4">
            <ScrollArea className="h-[calc(80vh-180px)]">
              <div className="space-y-4 pr-4">
                {MOCK_BREAKDOWN.locations.map((location, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{location.name}</div>
                      <Badge variant="outline">{location.type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Scenes: {location.scenes.join(", ")} ({location.scenes.length} total)
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="characters" className="flex-1 mt-4">
            <ScrollArea className="h-[calc(80vh-180px)]">
              <div className="space-y-4 pr-4">
                {MOCK_BREAKDOWN.characters.map((character, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{character.name}</div>
                      <Badge>{character.totalScenes} scenes</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Appears in scenes: {character.scenes.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="props" className="flex-1 mt-4">
            <ScrollArea className="h-[calc(80vh-180px)]">
              <div className="space-y-4 pr-4">
                {MOCK_BREAKDOWN.props.map((prop, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="font-medium">{prop.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Scenes: {prop.scenes.join(", ")} ({prop.scenes.length} total)
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
