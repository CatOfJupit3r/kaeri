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

interface EditorToolbarProps {
  onEditDetails?: () => void
  onExport?: () => void
  onBreakdown?: () => void
  onTableRead?: () => void
}

export function EditorToolbar({ onEditDetails, onExport, onBreakdown, onTableRead }: EditorToolbarProps) {
  return (
    <div className="border-b-4 border-foreground bg-card">
      <div className="flex flex-wrap items-center gap-1 px-2 py-2 md:px-3">
        {/* File Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 text-xs font-black uppercase tracking-wide gap-1 border-2 border-transparent hover:border-foreground hover:bg-[var(--brutalist-yellow)] transition-all"
            >
              File
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="border-2 border-foreground brutalist-shadow">
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              New Document
            </DropdownMenuItem>
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Open...
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-foreground" />
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Save
            </DropdownMenuItem>
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Save As...
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-foreground" />
            <DropdownMenuItem
              onClick={onExport}
              className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-green)]"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 text-xs font-black uppercase tracking-wide gap-1 border-2 border-transparent hover:border-foreground hover:bg-[var(--brutalist-yellow)] transition-all"
            >
              Edit
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="border-2 border-foreground brutalist-shadow">
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Undo
            </DropdownMenuItem>
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Redo
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-foreground" />
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Cut
            </DropdownMenuItem>
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Paste
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-foreground" />
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Find...
            </DropdownMenuItem>
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Replace...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Format Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 text-xs font-black uppercase tracking-wide gap-1 border-2 border-transparent hover:border-foreground hover:bg-[var(--brutalist-yellow)] transition-all"
            >
              Format
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="border-2 border-foreground brutalist-shadow">
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Paragraph
            </DropdownMenuItem>
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Heading 3
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-foreground" />
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Increase Indent
            </DropdownMenuItem>
            <DropdownMenuItem className="font-bold uppercase tracking-wide text-xs cursor-pointer hover:bg-[var(--brutalist-yellow)]">
              Decrease Indent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-1 h-8 w-0.5 bg-foreground hidden sm:block" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 border-2 border-transparent hover:border-foreground hover:bg-[var(--brutalist-yellow)] transition-all"
          title="Undo"
        >
          <Undo className="h-4 w-4" strokeWidth={2.5} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 border-2 border-transparent hover:border-foreground hover:bg-[var(--brutalist-yellow)] transition-all"
          title="Redo"
        >
          <Redo className="h-4 w-4" strokeWidth={2.5} />
        </Button>

        <div className="mx-1 h-8 w-0.5 bg-foreground hidden sm:block" />

        {/* Text Formatting */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 border-2 border-transparent hover:border-foreground hover:bg-[var(--brutalist-blue)] hover:text-white transition-all"
          title="Bold"
        >
          <Bold className="h-4 w-4" strokeWidth={2.5} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 border-2 border-transparent hover:border-foreground hover:bg-[var(--brutalist-pink)] transition-all"
          title="Italic"
        >
          <Italic className="h-4 w-4" strokeWidth={2.5} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 border-2 border-transparent hover:border-foreground hover:bg-[var(--brutalist-green)] transition-all hidden sm:flex"
          title="Underline"
        >
          <Underline className="h-4 w-4" strokeWidth={2.5} />
        </Button>

        <div className="mx-1 h-8 w-0.5 bg-foreground hidden md:block" />

        {/* Alignment - hidden on small screens */}
        <div className="hidden md:flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 border-2 border-transparent hover:border-foreground hover:bg-[var(--brutalist-yellow)] transition-all"
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" strokeWidth={2.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 border-2 border-transparent hover:border-foreground hover:bg-[var(--brutalist-yellow)] transition-all"
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" strokeWidth={2.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 border-2 border-transparent hover:border-foreground hover:bg-[var(--brutalist-yellow)] transition-all"
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" strokeWidth={2.5} />
          </Button>
        </div>

        <div className="mx-1 h-8 w-0.5 bg-foreground hidden lg:block" />

        {/* Lists - hidden on small screens */}
        <div className="hidden lg:flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 border-2 border-transparent hover:border-foreground hover:bg-[var(--brutalist-yellow)] transition-all"
            title="Bullet List"
          >
            <List className="h-4 w-4" strokeWidth={2.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 border-2 border-transparent hover:border-foreground hover:bg-[var(--brutalist-yellow)] transition-all"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" strokeWidth={2.5} />
          </Button>
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          {onBreakdown && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBreakdown}
              className="h-9 gap-2 border-2 border-foreground bg-transparent font-black uppercase tracking-wide text-xs hover:bg-[var(--brutalist-orange)] brutalist-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all hidden md:flex"
            >
              <ClipboardList className="h-4 w-4" strokeWidth={2.5} />
              Breakdown
            </Button>
          )}
          {onTableRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onTableRead}
              className="h-9 gap-2 border-2 border-foreground bg-transparent font-black uppercase tracking-wide text-xs hover:bg-[var(--brutalist-pink)] brutalist-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all hidden md:flex"
            >
              <Users className="h-4 w-4" strokeWidth={2.5} />
              Table Read
            </Button>
          )}
          {onEditDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditDetails}
              className="h-9 gap-2 border-2 border-foreground bg-transparent font-black uppercase tracking-wide text-xs hover:bg-[var(--brutalist-blue)] hover:text-white brutalist-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <Pencil className="h-4 w-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Details</span>
            </Button>
          )}
          <div className="h-8 w-0.5 bg-foreground hidden sm:block" />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 border-2 border-foreground bg-[var(--brutalist-green)] hover:bg-[var(--brutalist-yellow)] brutalist-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            title="Save"
          >
            <Save className="h-4 w-4" strokeWidth={2.5} />
          </Button>
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground hidden sm:inline border-2 border-foreground px-2 py-1 bg-muted">
            Saved
          </span>
        </div>
      </div>
    </div>
  )
}
