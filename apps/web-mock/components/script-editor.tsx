"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react"
import {
  Send,
  Square,
  Circle,
  Type,
  Minus,
  Plus,
  Film,
  User,
  Users,
  MessageSquare,
  Clapperboard,
  ArrowRight,
  Sparkles,
  BookOpen,
  PenTool,
  ChevronDown,
  X,
  Check,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Copy,
  Scissors,
  Clipboard,
  Search,
  Replace,
  Trash2,
  GripVertical,
} from "lucide-react"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

type BlockType = "scene-heading" | "action" | "dialogue" | "parenthetical" | "transition" | "general"

type ScriptBlock = {
  id: string
  type: BlockType
  content: string
  characters?: string[] // For dialogue blocks - which characters are speaking
  metadata?: {
    location?: string
    timeOfDay?: string
    notes?: string
  }
}

const BLOCK_CONFIG: Record<
  BlockType,
  { label: string; shortcut: string; icon: React.ReactNode; placeholder: string; color: string; bgColor: string; borderColor: string }
> = {
  "scene-heading": {
    label: "Scene Heading",
    shortcut: "1",
    icon: <Clapperboard className="h-4 w-4" strokeWidth={2.5} />,
    placeholder: "INT. LOCATION - TIME",
    color: "var(--foreground)",
    bgColor: "hsl(210, 100%, 95%)",
    borderColor: "hsl(210, 100%, 50%)",
  },
  action: {
    label: "Action/Description",
    shortcut: "2",
    icon: <Film className="h-4 w-4" strokeWidth={2.5} />,
    placeholder: "Describe what's happening in the scene...",
    color: "var(--foreground)",
    bgColor: "transparent",
    borderColor: "hsl(0, 0%, 70%)",
  },
  dialogue: {
    label: "Dialogue",
    shortcut: "3",
    icon: <MessageSquare className="h-4 w-4" strokeWidth={2.5} />,
    placeholder: "CHARACTER: What the character says...",
    color: "var(--foreground)",
    bgColor: "hsl(145, 60%, 95%)",
    borderColor: "hsl(145, 60%, 45%)",
  },
  parenthetical: {
    label: "Parenthetical",
    shortcut: "4",
    icon: <span className="text-xs font-bold">()</span>,
    placeholder: "(softly, turning away)",
    color: "var(--foreground)",
    bgColor: "hsl(300, 60%, 95%)",
    borderColor: "hsl(300, 60%, 50%)",
  },
  transition: {
    label: "Transition",
    shortcut: "5",
    icon: <ArrowRight className="h-4 w-4" strokeWidth={2.5} />,
    placeholder: "CUT TO:",
    color: "var(--foreground)",
    bgColor: "hsl(45, 100%, 95%)",
    borderColor: "hsl(45, 100%, 45%)",
  },
  general: {
    label: "General Text",
    shortcut: "6",
    icon: <Type className="h-4 w-4" strokeWidth={2.5} />,
    placeholder: "General notes, directions, or text...",
    color: "var(--foreground)",
    bgColor: "hsl(0, 0%, 98%)",
    borderColor: "hsl(0, 0%, 80%)",
  },
}

const MOCK_CHARACTERS = [
  { name: "Sarah Chen", id: "1", color: "hsl(210, 80%, 60%)" },
  { name: "Marcus Blake", id: "2", color: "hsl(30, 80%, 55%)" },
  { name: "Elena Rodriguez", id: "3", color: "hsl(145, 60%, 45%)" },
  { name: "Dr. James Wilson", id: "4", color: "hsl(300, 60%, 50%)" },
  { name: "Detective Morris", id: "5", color: "hsl(0, 70%, 55%)" },
]

const MOCK_LOCATIONS = [
  { name: "Sarah's Apartment", id: "1" },
  { name: "Police Station", id: "2" },
  { name: "Downtown Coffee Shop", id: "3" },
  { name: "Hospital Emergency Room", id: "4" },
  { name: "City Park", id: "5" },
]

function parseContentToBlocks(content: string): ScriptBlock[] {
  const lines = content.split("\n")
  const blocks: ScriptBlock[] = []
  let currentBlock: ScriptBlock | null = null

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    if (trimmed.match(/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i)) {
      if (currentBlock) blocks.push(currentBlock)
      currentBlock = { id: `block-${Date.now()}-${index}`, type: "scene-heading", content: trimmed }
    } else if (trimmed.match(/^(FADE IN:|FADE OUT|CUT TO:|DISSOLVE TO:|SMASH CUT TO:)$/i)) {
      if (currentBlock) blocks.push(currentBlock)
      currentBlock = { id: `block-${Date.now()}-${index}`, type: "transition", content: trimmed }
    } else if (trimmed.match(/^\(.*\)$/)) {
      if (currentBlock) blocks.push(currentBlock)
      currentBlock = { id: `block-${Date.now()}-${index}`, type: "parenthetical", content: trimmed }
    } else if (currentBlock?.type === "parenthetical") {
      if (currentBlock) blocks.push(currentBlock)
      currentBlock = { 
        id: `block-${Date.now()}-${index}`, 
        type: "dialogue", 
        content: trimmed,
      }
    } else if (trimmed.length > 0) {
      if (currentBlock?.type === "action") {
        currentBlock.content += "\n" + line
      } else {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = { id: `block-${Date.now()}-${index}`, type: "action", content: line }
      }
    } else if (currentBlock) {
      blocks.push(currentBlock)
      currentBlock = null
    }
  })

  if (currentBlock) blocks.push(currentBlock)

  if (blocks.length === 0) {
    blocks.push({ id: `block-${Date.now()}`, type: "scene-heading", content: "" })
  }

  return blocks
}

function blocksToContent(blocks: ScriptBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "scene-heading":
          return `\n${block.content}\n`
        case "dialogue":
          return block.content
        case "parenthetical":
          return block.content
        case "transition":
          return `\n${block.content}\n`
        default:
          return block.content
      }
    })
    .join("\n")
}

// Character Multiselect Component for Dialogue blocks
const CharacterSelect = memo(function CharacterSelect({
  selectedCharacters,
  onCharactersChange,
}: {
  selectedCharacters: string[]
  onCharactersChange: (characters: string[]) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  const toggleCharacter = (charId: string) => {
    if (selectedCharacters.includes(charId)) {
      onCharactersChange(selectedCharacters.filter(id => id !== charId))
    } else {
      onCharactersChange([...selectedCharacters, charId])
    }
  }

  const selectedChars = MOCK_CHARACTERS.filter(c => selectedCharacters.includes(c.id))

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 px-2 py-1 text-xs border-2 border-foreground bg-background hover:bg-muted transition-colors">
          <Users className="h-3 w-3" />
          {selectedChars.length > 0 ? (
            <span className="flex items-center gap-1">
              {selectedChars.slice(0, 2).map(c => (
                <span 
                  key={c.id} 
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
              ))}
              {selectedChars.length > 2 && <span>+{selectedChars.length - 2}</span>}
            </span>
          ) : (
            <span className="text-muted-foreground">Characters</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 border-2 border-foreground" align="start">
        <div className="text-xs font-bold uppercase tracking-wide mb-2 text-muted-foreground">
          Speaking Characters
        </div>
        <div className="space-y-1">
          {MOCK_CHARACTERS.map(char => (
            <button
              key={char.id}
              onClick={() => toggleCharacter(char.id)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left transition-colors rounded ${
                selectedCharacters.includes(char.id) ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
            >
              <span 
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: char.color }}
              />
              <span className="flex-1 truncate">{char.name}</span>
              {selectedCharacters.includes(char.id) && (
                <Check className="h-3 w-3 text-green-600" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
})

// Improved Script Block Component
const ScriptBlockComponent = memo(function ScriptBlockComponent({
  block,
  index,
  isFocused,
  onFocus,
  onBlur,
  onChange,
  onKeyDown,
  onChangeType,
  onCharactersChange,
  onDelete,
  blockRef,
  totalBlocks,
}: {
  block: ScriptBlock
  index: number
  isFocused: boolean
  onFocus: () => void
  onBlur: () => void
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onChangeType: (type: BlockType) => void
  onCharactersChange: (characters: string[]) => void
  onDelete: () => void
  blockRef: (el: HTMLTextAreaElement | null) => void
  totalBlocks: number
}) {
  const config = BLOCK_CONFIG[block.type]
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [block.content])

  const getTextAlignment = () => {
    switch (block.type) {
      case "parenthetical":
        return "text-center"
      case "transition":
        return "text-right"
      default:
        return "text-left"
    }
  }

  const getTextStyle = () => {
    switch (block.type) {
      case "scene-heading":
        return "font-bold uppercase tracking-wide"
      case "parenthetical":
        return "italic"
      case "transition":
        return "font-bold uppercase"
      default:
        return ""
    }
  }

  return (
    <div
      className={`group relative transition-all duration-150 rounded-sm ${
        isFocused ? "ring-2 ring-offset-2" : ""
      }`}
      style={{
        borderLeft: `4px solid ${config.borderColor}`,
        backgroundColor: isFocused ? config.bgColor : "transparent",
        // @ts-ignore
        "--tw-ring-color": config.borderColor,
      }}
    >
      {/* Block header - visible on hover or focus */}
      <div className={`flex items-center gap-2 px-3 py-1.5 border-b border-border/50 transition-opacity ${
        isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      }`}>
        <div className="flex items-center gap-1 text-muted-foreground">
          <GripVertical className="h-3 w-3 cursor-grab" />
          <span className="text-xs font-medium">{index + 1}</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium border-2 border-foreground bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              {config.icon}
              <span>{config.label}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="border-2 border-foreground w-48">
            {Object.entries(BLOCK_CONFIG).map(([type, cfg]) => (
              <DropdownMenuItem
                key={type}
                onClick={() => onChangeType(type as BlockType)}
                className={`gap-2 text-xs cursor-pointer ${block.type === type ? 'bg-muted' : ''}`}
              >
                {cfg.icon}
                <span className="flex-1">{cfg.label}</span>
                <kbd className="text-[10px] border border-muted-foreground/30 px-1 rounded">
                  Ctrl+{cfg.shortcut}
                </kbd>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Character select for dialogue blocks */}
        {block.type === "dialogue" && (
          <CharacterSelect 
            selectedCharacters={block.characters || []}
            onCharactersChange={onCharactersChange}
          />
        )}

        <div className="flex-1" />

        {/* Delete button */}
        {totalBlocks > 1 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onDelete}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete block</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Character badges for dialogue */}
      {block.type === "dialogue" && block.characters && block.characters.length > 0 && (
        <div className="flex items-center gap-1 px-3 py-1 border-b border-border/30">
          {block.characters.map(charId => {
            const char = MOCK_CHARACTERS.find(c => c.id === charId)
            if (!char) return null
            return (
              <Badge 
                key={charId} 
                variant="secondary"
                className="text-xs py-0 gap-1"
                style={{ borderColor: char.color, borderWidth: 2 }}
              >
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: char.color }}
                />
                {char.name}
              </Badge>
            )
          })}
        </div>
      )}

      {/* Text area */}
      <textarea
        ref={(el) => {
          textareaRef.current = el
          blockRef(el)
        }}
        value={block.content}
        onChange={(e) => {
          onChange(e.target.value)
          // Auto-resize on change
          if (e.target) {
            e.target.style.height = "auto"
            e.target.style.height = e.target.scrollHeight + "px"
          }
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={config.placeholder}
        className={`w-full resize-none bg-transparent px-4 py-3 text-sm focus:outline-none overflow-hidden ${getTextAlignment()} ${getTextStyle()}`}
        rows={1}
        style={{
          minHeight: block.type === "action" || block.type === "general" ? "80px" : "44px",
          height: "auto",
        }}
      />
    </div>
  )
})

export function ScriptEditor({ script, onUpdateScript, onDeleteScript }: ScriptEditorProps) {
  const [blocks, setBlocks] = useState<ScriptBlock[]>(() => parseContentToBlocks(script.content))
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [inputMessage, setInputMessage] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false)
  const [isTableReadModalOpen, setIsTableReadModalOpen] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState("knowledge")
  const blockRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map())
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([])
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedTool, setSelectedTool] = useState<"select" | "text" | "rectangle" | "circle" | "line">("select")
  const [messages, setMessages] = useState<Message[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const contentUpdateTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (contentUpdateTimeoutRef.current) {
      clearTimeout(contentUpdateTimeoutRef.current)
    }
    contentUpdateTimeoutRef.current = setTimeout(() => {
      const newContent = blocksToContent(blocks)
      if (newContent !== script.content) {
        onUpdateScript({ ...script, content: newContent })
      }
    }, 300)

    return () => {
      if (contentUpdateTimeoutRef.current) {
        clearTimeout(contentUpdateTimeoutRef.current)
      }
    }
  }, [blocks, script, onUpdateScript])

  const updateBlock = useCallback((blockId: string, content: string) => {
    setBlocks((prev) => prev.map((block) => (block.id === blockId ? { ...block, content } : block)))
  }, [])

  const changeBlockType = useCallback((blockId: string, newType: BlockType) => {
    setBlocks((prev) => prev.map((block) => (block.id === blockId ? { ...block, type: newType } : block)))
  }, [])

  const updateBlockCharacters = useCallback((blockId: string, characters: string[]) => {
    setBlocks((prev) => prev.map((block) => (block.id === blockId ? { ...block, characters } : block)))
  }, [])

  const addBlockAfter = useCallback((afterId: string, type: BlockType = "action") => {
    const newBlock: ScriptBlock = {
      id: `block-${Date.now()}`,
      type,
      content: "",
    }
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === afterId)
      const newBlocks = [...prev]
      newBlocks.splice(index + 1, 0, newBlock)
      return newBlocks
    })
    setTimeout(() => {
      blockRefs.current.get(newBlock.id)?.focus()
    }, 10)
    return newBlock.id
  }, [])

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks((prev) => {
      if (prev.length <= 1) return prev
      const index = prev.findIndex((b) => b.id === blockId)
      const newBlocks = prev.filter((b) => b.id !== blockId)
      const focusIndex = Math.max(0, index - 1)
      setTimeout(() => {
        blockRefs.current.get(newBlocks[focusIndex]?.id)?.focus()
      }, 10)
      return newBlocks
    })
  }, [])

  const handleBlockKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>, block: ScriptBlock) => {
      const textarea = e.currentTarget
      const { selectionStart, value } = textarea

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        let nextType: BlockType = "action"
        if (block.type === "scene-heading") nextType = "action"
        else if (block.type === "character") nextType = "dialogue"
        else if (block.type === "dialogue") nextType = "character"
        else if (block.type === "parenthetical") nextType = "dialogue"

        addBlockAfter(block.id, nextType)
      }

      if (e.key === "Backspace" && value === "" && blocks.length > 1) {
        e.preventDefault()
        deleteBlock(block.id)
      }

      if (e.key === "ArrowUp" && selectionStart === 0) {
        e.preventDefault()
        const index = blocks.findIndex((b) => b.id === block.id)
        if (index > 0) {
          const prevBlock = blocks[index - 1]
          const prevTextarea = blockRefs.current.get(prevBlock.id)
          if (prevTextarea) {
            prevTextarea.focus()
            prevTextarea.setSelectionRange(prevTextarea.value.length, prevTextarea.value.length)
          }
        }
      }

      if (e.key === "ArrowDown" && selectionStart === value.length) {
        e.preventDefault()
        const index = blocks.findIndex((b) => b.id === block.id)
        if (index < blocks.length - 1) {
          const nextBlock = blocks[index + 1]
          const nextTextarea = blockRefs.current.get(nextBlock.id)
          if (nextTextarea) {
            nextTextarea.focus()
            nextTextarea.setSelectionRange(0, 0)
          }
        }
      }

      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault()
        const types: BlockType[] = ["scene-heading", "action", "character", "dialogue", "parenthetical", "transition"]
        const currentIndex = types.indexOf(block.type)
        const nextIndex = (currentIndex + 1) % types.length
        changeBlockType(block.id, types[nextIndex])
      }
    },
    [blocks, addBlockAfter, deleteBlock, changeBlockType],
  )

  const handleBlockChange = useCallback(
    (blockId: string, value: string) => {
      updateBlock(blockId, value)
    },
    [updateBlock],
  )

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

  const { wordCount, pageCount } = useMemo(() => {
    const words = blocks.reduce((acc, block) => acc + block.content.split(/\s+/).filter(Boolean).length, 0)
    return { wordCount: words, pageCount: Math.ceil(words / 250) }
  }, [blocks])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <EditorToolbar
        onEditDetails={() => setIsModalOpen(true)}
        onExport={() => setIsExportModalOpen(true)}
        onBreakdown={() => setIsBreakdownModalOpen(true)}
        onTableRead={() => setIsTableReadModalOpen(true)}
      />

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Editor Panel */}
        <div className="flex h-1/2 w-full flex-col overflow-hidden border-b-2 border-foreground lg:h-full lg:w-1/2 lg:border-b-0 lg:border-r-2">
          {/* Editor Toolbar */}
          <div className="flex items-center gap-1 border-b-2 border-foreground bg-card px-2 py-1.5">
            {/* Undo/Redo */}
            <div className="flex items-center border-r border-border pr-2 mr-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                      <Undo className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                      <Redo className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Cut/Copy/Paste */}
            <div className="flex items-center border-r border-border pr-2 mr-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                      <Scissors className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Cut (Ctrl+X)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                      <Copy className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Copy (Ctrl+C)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                      <Clipboard className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Paste (Ctrl+V)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Text Formatting */}
            <div className="flex items-center border-r border-border pr-2 mr-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                      <Bold className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Bold (Ctrl+B)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                      <Italic className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Italic (Ctrl+I)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                      <Underline className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Underline (Ctrl+U)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Block Type Quick Access */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium border border-border rounded hover:bg-muted transition-colors">
                  <Type className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Insert Block</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {Object.entries(BLOCK_CONFIG).map(([type, config]) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => {
                      const lastBlock = blocks[blocks.length - 1]
                      addBlockAfter(lastBlock.id, type as BlockType)
                    }}
                    className="gap-2 cursor-pointer"
                  >
                    <span 
                      className="w-1 h-4 rounded-full"
                      style={{ backgroundColor: config.borderColor }}
                    />
                    {config.icon}
                    <span className="flex-1">{config.label}</span>
                    <kbd className="text-[10px] text-muted-foreground">Ctrl+{config.shortcut}</kbd>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search */}
            <div className="ml-auto flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => setShowSearch(!showSearch)}
                      className={`p-1.5 rounded transition-colors ${showSearch ? 'bg-muted text-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Find (Ctrl+F)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Word/Page Count */}
              <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-xs font-medium">
                <span>{wordCount} words</span>
                <span className="text-muted-foreground">|</span>
                <span>~{pageCount} pages</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find in script..."
                className="h-7 text-sm border-0 bg-transparent focus-visible:ring-0"
              />
              <button className="text-xs text-muted-foreground hover:text-foreground">
                <Replace className="h-4 w-4" />
              </button>
              <button 
                onClick={() => { setShowSearch(false); setSearchQuery("") }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Script Content */}
          <div className="flex-1 overflow-y-auto bg-background">
            <div className="p-4 md:p-6 pb-8">
              <div className="mx-auto max-w-3xl space-y-2">
                {blocks.map((block, index) => (
                  <ScriptBlockComponent
                    key={block.id}
                    block={block}
                    index={index}
                    isFocused={focusedBlockId === block.id}
                    onFocus={() => setFocusedBlockId(block.id)}
                    onBlur={() => {}}
                    onChange={(value) => handleBlockChange(block.id, value)}
                    onKeyDown={(e) => handleBlockKeyDown(e, block)}
                    onChangeType={(type) => changeBlockType(block.id, type)}
                    onCharactersChange={(chars) => updateBlockCharacters(block.id, chars)}
                    onDelete={() => deleteBlock(block.id)}
                    totalBlocks={blocks.length}
                    blockRef={(el) => {
                      if (el) blockRefs.current.set(block.id, el)
                      else blockRefs.current.delete(block.id)
                    }}
                  />
                ))}

                {/* Smart Add block suggestions */}
                <div className="flex flex-wrap items-center gap-2 pt-6">
                  <span className="text-xs text-muted-foreground font-medium">Quick Add:</span>
                  {(() => {
                    const lastBlock = blocks[blocks.length - 1]
                    const suggestions: BlockType[] = []
                    
                    // Smart suggestions based on last block type
                    if (lastBlock.type === "scene-heading") {
                      suggestions.push("action", "dialogue")
                    } else if (lastBlock.type === "action") {
                      suggestions.push("dialogue", "transition")
                    } else if (lastBlock.type === "dialogue") {
                      suggestions.push("action", "parenthetical")
                    } else if (lastBlock.type === "transition") {
                      suggestions.push("scene-heading", "action")
                    } else if (lastBlock.type === "parenthetical") {
                      suggestions.push("dialogue", "action")
                    } else {
                      suggestions.push("dialogue", "action")
                    }
                    
                    return suggestions.map((type) => {
                      const config = BLOCK_CONFIG[type]
                      return (
                        <button
                          key={type}
                          onClick={() => addBlockAfter(blocks[blocks.length - 1].id, type)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground rounded text-xs font-medium hover:bg-muted transition-colors"
                          style={{ borderLeftColor: config.borderColor, borderLeftWidth: 4 }}
                        >
                          {config.icon}
                          <span>{config.label}</span>
                        </button>
                      )
                    })
                  })()}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-dashed border-muted-foreground/40 rounded text-xs font-medium text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                        <Plus className="h-3.5 w-3.5" />
                        <span>More</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {Object.entries(BLOCK_CONFIG).map(([type, config]) => (
                        <DropdownMenuItem
                          key={type}
                          onClick={() => addBlockAfter(blocks[blocks.length - 1].id, type as BlockType)}
                          className="gap-2 cursor-pointer"
                        >
                          <span 
                            className="w-1 h-4 rounded-full"
                            style={{ backgroundColor: config.borderColor }}
                          />
                          {config.icon}
                          <span>{config.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex h-1/2 w-full flex-col overflow-hidden lg:h-full lg:w-1/2">
          <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex h-full flex-col">
            <TabsList className="h-auto shrink-0 border-b-2 border-foreground bg-card p-0 rounded-none">
              <TabsTrigger
                value="knowledge"
                className="flex-1 gap-2 border-r-2 border-foreground py-3 font-black uppercase tracking-wide data-[state=active]:bg-[var(--brutalist-blue)] data-[state=active]:text-white rounded-none"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Knowledge</span>
              </TabsTrigger>
              <TabsTrigger
                value="canvas"
                className="flex-1 gap-2 border-r-2 border-foreground py-3 font-black uppercase tracking-wide data-[state=active]:bg-[var(--brutalist-pink)] rounded-none"
              >
                <PenTool className="h-4 w-4" />
                <span className="hidden sm:inline">Canvas</span>
              </TabsTrigger>
              <TabsTrigger
                value="assistant"
                className="flex-1 gap-2 py-3 font-black uppercase tracking-wide data-[state=active]:bg-[var(--brutalist-green)] rounded-none"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="knowledge" className="mt-0 flex-1 overflow-hidden">
              <KnowledgeBase isCompact />
            </TabsContent>

            <TabsContent value="canvas" className="mt-0 flex-1 overflow-hidden">
              <div className="flex h-full flex-col">
                {/* Canvas toolbar */}
                <div className="flex items-center gap-2 border-b-2 border-foreground bg-card p-2">
                  {[
                    { tool: "select" as const, icon: <Square className="h-4 w-4" />, label: "Select" },
                    { tool: "text" as const, icon: <Type className="h-4 w-4" />, label: "Text" },
                    { tool: "rectangle" as const, icon: <Square className="h-4 w-4" />, label: "Rect" },
                    { tool: "circle" as const, icon: <Circle className="h-4 w-4" />, label: "Circle" },
                    { tool: "line" as const, icon: <Minus className="h-4 w-4" />, label: "Line" },
                  ].map(({ tool, icon, label }) => (
                    <button
                      key={tool}
                      onClick={() => {
                        setSelectedTool(tool)
                        if (tool !== "select") addCanvasElement(tool)
                      }}
                      className={`flex items-center gap-1 border-2 border-foreground px-2 py-1 text-xs font-bold uppercase transition-all ${
                        selectedTool === tool ? "bg-[var(--brutalist-yellow)] brutalist-shadow-sm" : "hover:bg-muted"
                      }`}
                    >
                      {icon}
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Canvas area */}
                <div
                  className="relative flex-1 cursor-grab overflow-hidden bg-muted/50 active:cursor-grabbing"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                >
                  {/* Grid pattern */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage: `
                        linear-gradient(var(--foreground) 1px, transparent 1px),
                        linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
                      `,
                      backgroundSize: "40px 40px",
                      backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
                      opacity: 0.1,
                    }}
                  />

                  {/* Canvas elements */}
                  {canvasElements.map((element) => (
                    <div
                      key={element.id}
                      className="absolute border-2 border-foreground bg-card brutalist-shadow-sm"
                      style={{
                        left: element.x + canvasOffset.x,
                        top: element.y + canvasOffset.y,
                        width: element.width,
                        height: element.height,
                      }}
                    >
                      {element.type === "text" && <div className="p-2 text-sm font-bold">{element.content}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assistant" className="mt-0 flex-1 overflow-hidden">
              <div className="flex h-full flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center border-2 border-foreground bg-[var(--brutalist-green)] brutalist-shadow mb-4">
                        <Sparkles className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-tight">AI Assistant</h3>
                      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                        Ask questions about your script, get character suggestions, or brainstorm plot ideas.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] border-2 border-foreground p-3 ${
                              message.role === "user"
                                ? "bg-[var(--brutalist-blue)] text-white brutalist-shadow-sm"
                                : "bg-card brutalist-shadow-sm"
                            }`}
                          >
                            <p className="text-sm font-medium">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="border-t-2 border-foreground bg-card p-3">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      placeholder="Ask about your script..."
                      className="border-2 border-foreground font-medium"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="border-2 border-foreground bg-[var(--brutalist-green)] text-foreground font-black uppercase hover:bg-[var(--brutalist-yellow)] brutalist-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <ScriptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleMetadataUpdate}
        initialData={script}
      />
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} scriptName={script.name} />
      <BreakdownModal isOpen={isBreakdownModalOpen} onClose={() => setIsBreakdownModalOpen(false)} />
      <TableReadModal
        isOpen={isTableReadModalOpen}
        onClose={() => setIsTableReadModalOpen(false)}
        scriptContent={script.content}
      />
    </div>
  )
}
