"use client"

import {
  Bold,
  Italic,
  Underline,
  Save,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  ChevronDown,
  Pencil,
  FileDown,
  ClipboardList,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditorToolbarProps {
  onEditDetails?: () => void
  onExport?: () => void
  onBreakdown?: () => void
  onTableRead?: () => void
}

export function EditorToolbar({ onEditDetails, onExport, onBreakdown, onTableRead }: EditorToolbarProps) {
  return (
    <div className="border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-1 px-3 py-2">
        {/* File Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-sm gap-1">
              File
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>New Document</DropdownMenuItem>
            <DropdownMenuItem>Open...</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Save</DropdownMenuItem>
            <DropdownMenuItem>Save As...</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExport}>
              <FileDown className="h-4 w-4 mr-2" />
              Export...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-sm gap-1">
              Edit
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Undo</DropdownMenuItem>
            <DropdownMenuItem>Redo</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Cut</DropdownMenuItem>
            <DropdownMenuItem>Copy</DropdownMenuItem>
            <DropdownMenuItem>Paste</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Find...</DropdownMenuItem>
            <DropdownMenuItem>Replace...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Format Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-sm gap-1">
              Format
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Paragraph</DropdownMenuItem>
            <DropdownMenuItem>Heading 1</DropdownMenuItem>
            <DropdownMenuItem>Heading 2</DropdownMenuItem>
            <DropdownMenuItem>Heading 3</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Increase Indent</DropdownMenuItem>
            <DropdownMenuItem>Decrease Indent</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Style Selector */}
        <Select defaultValue="paragraph">
          <SelectTrigger className="h-8 w-[140px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Paragraph</SelectItem>
            <SelectItem value="heading1">Heading 1</SelectItem>
            <SelectItem value="heading2">Heading 2</SelectItem>
            <SelectItem value="heading3">Heading 3</SelectItem>
            <SelectItem value="quote">Quote</SelectItem>
          </SelectContent>
        </Select>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Undo/Redo */}
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Undo">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Redo">
          <Redo className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Text Formatting */}
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Underline">
          <Underline className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Alignment */}
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Left">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Center">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Align Right">
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Lists */}
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Bullet List">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Numbered List">
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-3">
          {onBreakdown && (
            <Button variant="ghost" size="sm" onClick={onBreakdown} className="h-8 gap-2">
              <ClipboardList className="h-3.5 w-3.5" />
              Breakdown
            </Button>
          )}
          {onTableRead && (
            <Button variant="ghost" size="sm" onClick={onTableRead} className="h-8 gap-2">
              <Users className="h-3.5 w-3.5" />
              Table Read
            </Button>
          )}
          {onEditDetails && (
            <>
              <Button variant="ghost" size="sm" onClick={onEditDetails} className="h-8 gap-2">
                <Pencil className="h-3.5 w-3.5" />
                Edit Details
              </Button>
              <div className="h-6 w-px bg-border" />
            </>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Save">
            <Save className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">Auto-saved</span>
        </div>
      </div>
    </div>
  )
}
