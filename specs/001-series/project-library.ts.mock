"use client"

import { useState } from "react"
import { Plus, Tv, Film, Library, FileText, Calendar, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Series } from "@/app/page"

interface ProjectLibraryProps {
  series: Series[]
  onSeriesSelect: (series: Series) => void
  onCreateSeries: (series: Omit<Series, "id" | "createdDate" | "lastUpdated" | "scripts">) => void
}

const SERIES_TEMPLATES = [
  {
    type: "tv-series" as const,
    name: "TV Series",
    icon: Tv,
    description: "Episodic television series with multiple seasons",
  },
  {
    type: "film-trilogy" as const,
    name: "Film Trilogy",
    icon: Film,
    description: "Three-part film series with connected storylines",
  },
  {
    type: "anthology" as const,
    name: "Anthology",
    icon: Library,
    description: "Collection of standalone stories in a shared universe",
  },
  {
    type: "standalone" as const,
    name: "Standalone",
    icon: FileText,
    description: "Single film or pilot script",
  },
]

export function ProjectLibrary({ series, onSeriesSelect, onCreateSeries }: ProjectLibraryProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Series["type"]>("tv-series")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const handleCreate = () => {
    if (!formData.name.trim()) return

    onCreateSeries({
      name: formData.name,
      type: selectedTemplate,
      description: formData.description,
    })

    setFormData({ name: "", description: "" })
    setIsCreateOpen(false)
  }

  const getSeriesIcon = (type: Series["type"]) => {
    const template = SERIES_TEMPLATES.find((t) => t.type === type)
    return template?.icon || FileText
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
            <p className="text-sm text-muted-foreground">Manage all your series and screenplays</p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label>Project Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {SERIES_TEMPLATES.map((template) => {
                      const Icon = template.icon
                      return (
                        <button
                          key={template.type}
                          onClick={() => setSelectedTemplate(template.type)}
                          className={`flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-colors ${
                            selectedTemplate === template.type
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Icon className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-xs text-muted-foreground">{template.description}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="series-name">Project Name</Label>
                  <Input
                    id="series-name"
                    placeholder="Enter project name..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="series-description">Description</Label>
                  <Textarea
                    id="series-description"
                    placeholder="Brief description of your project..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>Create Project</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6">
        {series.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Library className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {series.map((s) => {
              const Icon = getSeriesIcon(s.type)
              return (
                <Card
                  key={s.id}
                  className="group cursor-pointer overflow-hidden transition-all hover:shadow-md"
                  onClick={() => onSeriesSelect(s)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary">{s.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {SERIES_TEMPLATES.find((t) => t.type === s.type)?.name}
                          </p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Details</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>

                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {s.scripts.length} {s.scripts.length === 1 ? "script" : "scripts"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {s.lastUpdated.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
