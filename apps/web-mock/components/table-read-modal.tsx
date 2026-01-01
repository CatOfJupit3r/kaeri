"use client"

import { useState } from "react"
import { Users, Play, Pause } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface TableReadModalProps {
  isOpen: boolean
  onClose: () => void
  scriptContent: string
}

const MOCK_READERS = [
  { id: "1", name: "Alex Johnson" },
  { id: "2", name: "Jamie Lee" },
  { id: "3", name: "Taylor Smith" },
  { id: "4", name: "Morgan Davis" },
]

export function TableReadModal({ isOpen, onClose, scriptContent }: TableReadModalProps) {
  const [characterAssignments, setCharacterAssignments] = useState<Record<string, string>>({
    "SARAH CHEN": "1",
    "MARCUS BLAKE": "2",
    "ELENA RODRIGUEZ": "3",
    "DR. JAMES WILSON": "4",
  })
  const [isReading, setIsReading] = useState(false)
  const [currentLine, setCurrentLine] = useState(0)

  const parseScript = () => {
    const lines = scriptContent.split("\n")
    const elements: { type: string; content: string; character?: string; reader?: string }[] = []

    lines.forEach((line) => {
      const trimmed = line.trim()
      if (trimmed.match(/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i)) {
        elements.push({ type: "heading", content: line })
      } else if (
        trimmed.toUpperCase() === trimmed &&
        trimmed.length > 0 &&
        trimmed.length < 30 &&
        !trimmed.match(/^(FADE|CUT TO|DISSOLVE|CONTINUED)/i)
      ) {
        const reader = characterAssignments[trimmed]
        const readerName = MOCK_READERS.find((r) => r.id === reader)?.name
        elements.push({ type: "character", content: line, character: trimmed, reader: readerName })
      } else if (trimmed.match(/^$$.*$$$/)) {
        elements.push({ type: "parenthetical", content: line })
      } else if (trimmed.length > 0) {
        elements.push({ type: "dialogue", content: line })
      }
    })

    return elements
  }

  const elements = parseScript()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Table Read Mode
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 h-full">
          {/* Character Assignments */}
          <div className="w-64 space-y-4 border-r border-border pr-4">
            <div className="font-medium text-sm">Character Assignments</div>
            <ScrollArea className="h-[calc(85vh-200px)]">
              <div className="space-y-3">
                {Object.keys(characterAssignments).map((character) => (
                  <div key={character} className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{character}</label>
                    <Select
                      value={characterAssignments[character]}
                      onValueChange={(value) => setCharacterAssignments((prev) => ({ ...prev, [character]: value }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_READERS.map((reader) => (
                          <SelectItem key={reader.id} value={reader.id}>
                            {reader.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="pt-4 border-t border-border">
              <Button
                className="w-full"
                onClick={() => setIsReading(!isReading)}
                variant={isReading ? "secondary" : "default"}
              >
                {isReading ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Reading
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Script Content */}
          <div className="flex-1">
            <ScrollArea className="h-[calc(85vh-120px)]">
              <div className="space-y-2 pr-4 font-mono text-sm">
                {elements.map((element, index) => (
                  <div
                    key={index}
                    className={`${index === currentLine && isReading ? "bg-primary/10 border-l-4 border-primary pl-3" : ""}`}
                  >
                    {element.type === "heading" && (
                      <div className="font-bold uppercase text-foreground py-2">{element.content}</div>
                    )}
                    {element.type === "character" && (
                      <div className="font-bold text-center text-foreground mt-3 flex items-center justify-center gap-2">
                        {element.content}
                        {element.reader && <Badge variant="secondary">{element.reader}</Badge>}
                      </div>
                    )}
                    {element.type === "parenthetical" && (
                      <div className="text-muted-foreground italic text-center text-sm">{element.content}</div>
                    )}
                    {element.type === "dialogue" && (
                      <div className="text-foreground ml-16 mr-16">{element.content}</div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
