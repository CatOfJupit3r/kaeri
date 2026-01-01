"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Square, Circle, Type, Minus, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScriptModal } from "@/components/script-modal"
import { KnowledgeBase } from "@/components/knowledge-base"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EditorToolbar } from "@/components/editor-toolbar"
import type { Script } from "@/app/page"
import { ExportModal } from "@/components/export-modal"
import { BreakdownModal } from "@/components/breakdown-modal"
import { TableReadModal } from "@/components/table-read-modal"

interface ScriptEditorProps {
  script: Script
  onUpdateScript: (script: Script) => void
  onDeleteScript: (scriptId: string) => void
}

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type CanvasElement = {
  id: string
  type: "text" | "rectangle" | "circle" | "line"
  x: number
  y: number
  width?: number
  height?: number
  content?: string
  color: string
}

const MOCK_CHARACTERS = [
  { name: "Sarah Chen", id: "1" },
  { name: "Marcus Blake", id: "2" },
  { name: "Elena Rodriguez", id: "3" },
  { name: "Dr. James Wilson", id: "4" },
]

const MOCK_LOCATIONS = [
  { name: "Sarah's Apartment", id: "1" },
  { name: "Police Station", id: "2" },
  { name: "Downtown Coffee Shop", id: "3" },
]

export function ScriptEditor({ script, onUpdateScript, onDeleteScript }: ScriptEditorProps) {
  const [content, setContent] = useState(script.content)
  const [inputMessage, setInputMessage] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false)
  const [isTableReadModalOpen, setIsTableReadModalOpen] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState("knowledge")
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteOptions, setAutocompleteOptions] = useState<{ name: string; id: string; type: string }[]>([])
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 })
  const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([])
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedTool, setSelectedTool] = useState<"select" | "text" | "rectangle" | "circle" | "line">("select")
  const [messages, setMessages] = useState<Message[]>([])

  const parseScriptContent = (text: string) => {
    const lines = text.split("\n")
    const elements: {
      type: string
      content: string
      line: number
      linkedEntity?: { id: string; name: string; type: string }
    }[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      let linkedEntity = undefined

      // Scene heading detection
      if (trimmed.match(/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i)) {
        // Check if location exists in knowledge base
        const locationMatch = MOCK_LOCATIONS.find((loc) => trimmed.toUpperCase().includes(loc.name.toUpperCase()))
        if (locationMatch) {
          linkedEntity = { id: locationMatch.id, name: locationMatch.name, type: "location" }
        }
        elements.push({ type: "heading", content: line, line: index + 1, linkedEntity })
      }
      // Character name detection
      else if (
        trimmed.toUpperCase() === trimmed &&
        trimmed.length > 0 &&
        trimmed.length < 30 &&
        !trimmed.match(/^(FADE|CUT TO|DISSOLVE|CONTINUED)/i) &&
        lines[index + 1]?.trim().length > 0
      ) {
        // Check if character exists in knowledge base
        const characterMatch = MOCK_CHARACTERS.find((char) => trimmed.includes(char.name.toUpperCase()))
        if (characterMatch) {
          linkedEntity = { id: characterMatch.id, name: characterMatch.name, type: "character" }
        }
        elements.push({ type: "character", content: line, line: index + 1, linkedEntity })
      }
      // Parenthetical detection
      else if (trimmed.match(/^$$.*$$$/)) {
        elements.push({ type: "parenthetical", content: line, line: index + 1 })
      }
      // Dialogue detection (indented text after character)
      else if (
        index > 0 &&
        elements[index - 1]?.type === "character" &&
        trimmed.length > 0 &&
        !trimmed.match(/^$$.*$$$/)
      ) {
        elements.push({ type: "dialogue", content: line, line: index + 1 })
      }
      // Transition detection
      else if (trimmed.match(/^(FADE IN:|FADE OUT|CUT TO:|DISSOLVE TO:)$/i)) {
        elements.push({ type: "transition", content: line, line: index + 1 })
      }
      // Action/description
      else {
        elements.push({ type: "action", content: line, line: index + 1 })
      }
    })

    return elements
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    onUpdateScript({ ...script, content: newContent })

    // Check for autocomplete trigger
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart
      const textBeforeCursor = newContent.substring(0, cursorPos)
      const lines = textBeforeCursor.split("\n")
      const currentLine = lines[lines.length - 1]

      // Trigger autocomplete for character names (all caps line)
      if (currentLine.length > 0 && currentLine === currentLine.toUpperCase() && currentLine.length < 30) {
        const matches = MOCK_CHARACTERS.filter((char) => char.name.toUpperCase().startsWith(currentLine))
        if (matches.length > 0) {
          setAutocompleteOptions(matches.map((m) => ({ ...m, type: "character" })))
          setShowAutocomplete(true)
          setSelectedAutocompleteIndex(0)
        } else {
          setShowAutocomplete(false)
        }
      }
      // Trigger autocomplete for locations in scene headings
      else if (currentLine.match(/^(INT\.|EXT\.|INT\/EXT\.)/i)) {
        const locationPart = currentLine.substring(currentLine.indexOf(".") + 1).trim()
        if (locationPart.length > 0) {
          const matches = MOCK_LOCATIONS.filter((loc) => loc.name.toUpperCase().includes(locationPart.toUpperCase()))
          if (matches.length > 0) {
            setAutocompleteOptions(matches.map((m) => ({ ...m, type: "location" })))
            setShowAutocomplete(true)
            setSelectedAutocompleteIndex(0)
          } else {
            setShowAutocomplete(false)
          }
        }
      } else {
        setShowAutocomplete(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showAutocomplete) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedAutocompleteIndex((prev) => (prev + 1) % autocompleteOptions.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedAutocompleteIndex((prev) => (prev - 1 + autocompleteOptions.length) % autocompleteOptions.length)
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        selectAutocompleteOption(autocompleteOptions[selectedAutocompleteIndex])
      } else if (e.key === "Escape") {
        setShowAutocomplete(false)
      }
    } else {
      // Tab key formatting for screenplay
      if (e.key === "Tab") {
        e.preventDefault()
        // Cycle through screenplay element types with tab
        // This is a simplified version - full implementation would be more complex
      }
    }
  }

  const selectAutocompleteOption = (option: { name: string; id: string; type: string }) => {
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart
      const textBeforeCursor = content.substring(0, cursorPos)
      const textAfterCursor = content.substring(cursorPos)
      const lines = textBeforeCursor.split("\n")
      const currentLine = lines[lines.length - 1]
      const previousLines = lines.slice(0, -1).join("\n")

      let newLine = ""
      if (option.type === "character") {
        newLine = option.name.toUpperCase()
      } else if (option.type === "location") {
        // Replace the location part
        const sceneHeadingPrefix = currentLine.match(/^(INT\.|EXT\.|INT\/EXT\.)/i)?.[0] || ""
        newLine = `${sceneHeadingPrefix} ${option.name.toUpperCase()}`
      }

      const newContent = (previousLines ? previousLines + "\n" : "") + newLine + textAfterCursor
      setContent(newContent)
      onUpdateScript({ ...script, content: newContent })
      setShowAutocomplete(false)

      // Set cursor position after the inserted text
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = (previousLines ? previousLines.length + 1 : 0) + newLine.length
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
          textareaRef.current.focus()
        }
      }, 0)
    }
  }

  const handleMetadataUpdate = (updatedScript: Omit<Script, "id" | "lastUpdated">) => {
    onUpdateScript({ ...script, ...updatedScript })
    setIsModalOpen(false)
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Based on your script "${script.name}", I can help you with character development, scene structure, and dialogue. What would you like to work on?`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (selectedTool === "select") {
      setIsPanning(true)
      setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y })
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning && selectedTool === "select") {
      setCanvasOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleCanvasMouseUp = () => {
    setIsPanning(false)
  }

  const addCanvasElement = (type: CanvasElement["type"]) => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type,
      x: 100 - canvasOffset.x,
      y: 100 - canvasOffset.y,
      width: type === "rectangle" ? 150 : type === "circle" ? 100 : undefined,
      height: type === "rectangle" ? 100 : type === "circle" ? 100 : undefined,
      content: type === "text" ? "Double click to edit" : undefined,
      color: "#3b82f6",
    }
    setCanvasElements((prev) => [...prev, newElement])
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const LINES_PER_PAGE = 60
  const pageBreaks = new Set<number>()
  const elements = parseScriptContent(content)

  for (let i = LINES_PER_PAGE; i < elements.length; i += LINES_PER_PAGE) {
    pageBreaks.add(i)
  }

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        <EditorToolbar
          onEditDetails={() => setIsModalOpen(true)}
          onExport={() => setIsExportModalOpen(true)}
          onBreakdown={() => setIsBreakdownModalOpen(true)}
          onTableRead={() => setIsTableReadModalOpen(true)}
        />

        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Editor Panel - Left Half */}
          <div className="flex h-1/2 w-full flex-col overflow-hidden border-b border-border bg-background lg:h-full lg:w-1/2 lg:border-b-0 lg:border-r">
            <div className="flex flex-1 overflow-hidden">
              <div className="w-12 shrink-0 overflow-y-auto border-r border-border bg-muted/30 py-4 md:w-16">
                {elements.map((element, index) => (
                  <div key={index}>
                    <div className="flex h-[25.6px] items-center justify-end px-2 text-xs text-muted-foreground font-mono select-none md:px-3">
                      {element.line}
                    </div>
                    {pageBreaks.has(index) && (
                      <div className="relative my-4 h-px bg-blue-500/50">
                        <span className="absolute right-1 -top-2 bg-background px-1 text-[10px] text-blue-500 md:right-2">
                          PAGE
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="relative flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-8">
                <div className="relative mx-auto max-w-3xl">
                  {/* Styled preview overlay */}
                  <div className="pointer-events-none absolute inset-0 font-mono text-sm leading-relaxed md:text-base">
                    {elements.map((element, index) => (
                      <div key={index}>
                        {element.type === "heading" && (
                          <div className="mb-1 border-l-4 border-blue-500 bg-blue-500/5 py-1 pl-2 font-bold uppercase text-foreground md:pl-3">
                            <span className="break-words">{element.content}</span>
                            {element.linkedEntity && (
                              <span className="ml-2 inline-block rounded bg-blue-500 px-1.5 py-0.5 text-[10px] text-white md:px-2 md:text-xs">
                                {element.linkedEntity.type}: {element.linkedEntity.name}
                              </span>
                            )}
                          </div>
                        )}
                        {element.type === "character" && (
                          <div className="mt-2 text-center font-bold text-foreground">
                            {element.content}
                            {element.linkedEntity && (
                              <span className="ml-2 inline-block rounded bg-green-500 px-1.5 py-0.5 text-[10px] text-white md:px-2 md:text-xs">
                                KB: {element.linkedEntity.name}
                              </span>
                            )}
                          </div>
                        )}
                        {element.type === "dialogue" && (
                          <div className="ml-8 mr-8 border-l-2 border-green-500/30 bg-green-500/5 pl-3 pr-3 text-foreground md:ml-16 md:mr-16 md:pl-4 md:pr-4">
                            {element.content}
                          </div>
                        )}
                        {element.type === "parenthetical" && (
                          <div className="text-center text-xs italic text-muted-foreground md:text-sm">
                            {element.content}
                          </div>
                        )}
                        {element.type === "transition" && (
                          <div className="text-right font-bold text-foreground">{element.content}</div>
                        )}
                        {element.type === "action" && <div className="text-foreground">{element.content}</div>}
                        {pageBreaks.has(index) && (
                          <div className="my-4 h-8 border-t-2 border-dashed border-blue-500/30" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actual textarea for editing */}
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="relative z-10 w-full min-h-[500px] resize-none border-0 bg-transparent font-mono text-sm leading-relaxed caret-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground md:text-base md:min-h-[calc(100vh-300px)]"
                    placeholder="Start writing your screenplay..."
                    spellCheck={true}
                    style={{
                      fontFamily: "'Courier New', monospace",
                      lineHeight: "1.6",
                      color: "transparent",
                      caretColor: "hsl(var(--foreground))",
                    }}
                  />

                  {showAutocomplete && (
                    <div className="absolute z-20 mt-1 min-w-[180px] rounded-md border border-border bg-card shadow-lg md:min-w-[200px]">
                      {autocompleteOptions.map((option, index) => (
                        <button
                          key={option.id}
                          onClick={() => selectAutocompleteOption(option)}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-muted md:px-4 ${
                            index === selectedAutocompleteIndex ? "bg-muted" : ""
                          }`}
                        >
                          <span className="truncate text-xs text-foreground md:text-sm">{option.name}</span>
                          <span className="ml-2 shrink-0 text-[10px] capitalize text-muted-foreground md:text-xs">
                            {option.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-1/2 w-full flex-col overflow-hidden bg-background lg:h-full lg:w-1/2">
            <Tabs
              value={rightPanelTab}
              onValueChange={setRightPanelTab}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="shrink-0 border-b border-border bg-card px-3 pt-2 md:px-4 md:pt-3">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="knowledge" className="text-xs md:text-sm">
                    Knowledge Base
                  </TabsTrigger>
                  <TabsTrigger value="canvas" className="text-xs md:text-sm">
                    Canvas
                  </TabsTrigger>
                  <TabsTrigger value="assistant" className="text-xs md:text-sm">
                    AI Assistant
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="knowledge"
                className="mt-0 flex-1 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
              >
                <KnowledgeBase />
              </TabsContent>

              <TabsContent
                value="canvas"
                className="mt-0 flex-1 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
              >
                <div className="flex flex-1 flex-col bg-background overflow-hidden">
                  <div className="flex shrink-0 items-center gap-2 border-b border-border p-2 md:p-3">
                    <div className="flex items-center gap-1 rounded-md border border-border bg-background p-0.5 md:p-1">
                      <Button
                        size="sm"
                        variant={selectedTool === "select" ? "secondary" : "ghost"}
                        onClick={() => setSelectedTool("select")}
                        className="h-7 w-7 p-0 md:h-8 md:w-8"
                      >
                        <GripVertical className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedTool === "text" ? "secondary" : "ghost"}
                        onClick={() => {
                          setSelectedTool("text")
                          addCanvasElement("text")
                        }}
                        className="h-7 w-7 p-0 md:h-8 md:w-8"
                      >
                        <Type className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedTool === "rectangle" ? "secondary" : "ghost"}
                        onClick={() => {
                          setSelectedTool("rectangle")
                          addCanvasElement("rectangle")
                        }}
                        className="h-7 w-7 p-0 md:h-8 md:w-8"
                      >
                        <Square className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedTool === "circle" ? "secondary" : "ghost"}
                        onClick={() => {
                          setSelectedTool("circle")
                          addCanvasElement("circle")
                        }}
                        className="h-7 w-7 p-0 md:h-8 md:w-8"
                      >
                        <Circle className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedTool === "line" ? "secondary" : "ghost"}
                        onClick={() => {
                          setSelectedTool("line")
                          addCanvasElement("line")
                        }}
                        className="h-7 w-7 p-0 md:h-8 md:w-8"
                      >
                        <Minus className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                    <p className="ml-auto hidden text-xs text-muted-foreground sm:block">
                      {selectedTool === "select" ? "Pan mode - Click and drag to move" : `Adding ${selectedTool}`}
                    </p>
                  </div>

                  <div
                    className="relative flex-1 cursor-move overflow-hidden bg-muted/20"
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, hsl(var(--muted-foreground) / 0.1) 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                        transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
                      }}
                    />

                    <div
                      style={{
                        transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
                      }}
                    >
                      {canvasElements.map((element) => (
                        <div
                          key={element.id}
                          className="absolute cursor-pointer transition-opacity hover:opacity-80"
                          style={{
                            left: element.x,
                            top: element.y,
                            width: element.width,
                            height: element.height,
                          }}
                        >
                          {element.type === "text" && (
                            <div className="rounded border border-border bg-card p-2 text-xs shadow-sm md:text-sm">
                              {element.content}
                            </div>
                          )}
                          {element.type === "rectangle" && (
                            <div
                              className="rounded border-2"
                              style={{
                                borderColor: element.color,
                                width: element.width,
                                height: element.height,
                              }}
                            />
                          )}
                          {element.type === "circle" && (
                            <div
                              className="rounded-full border-2"
                              style={{
                                borderColor: element.color,
                                width: element.width,
                                height: element.height,
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="assistant"
                className="mt-0 flex-1 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
              >
                <div className="flex flex-1 flex-col overflow-hidden bg-background">
                  <ScrollArea className="flex-1 p-3 md:p-4" ref={scrollAreaRef}>
                    <div className="space-y-3 md:space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 md:max-w-[80%] md:px-4 md:py-3 ${
                              message.role === "user"
                                ? "bg-blue-500 text-white"
                                : "border border-border bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-xs leading-relaxed md:text-sm">{message.content}</p>
                            <p
                              className={`mt-1 text-[10px] md:text-xs ${
                                message.role === "user" ? "text-blue-100" : "text-muted-foreground"
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="shrink-0 border-t border-border p-3 md:p-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSendMessage()
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask about your script..."
                        className="flex-1 text-sm"
                      />
                      <Button type="submit" size="icon" disabled={!inputMessage.trim()} className="shrink-0">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <ScriptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleMetadataUpdate}
        script={script}
        onDelete={() => onDeleteScript(script.id)}
      />

      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} scriptName={script.name} />

      <BreakdownModal
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        scriptName={script.name}
      />

      <TableReadModal
        isOpen={isTableReadModalOpen}
        onClose={() => setIsTableReadModalOpen(false)}
        scriptContent={content}
      />
    </>
  )
}
