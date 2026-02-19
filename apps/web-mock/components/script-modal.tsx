"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Upload, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Script } from "@/app/page"

interface ScriptModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (script: Omit<Script, "id" | "lastUpdated">) => void
  script?: Script
}

export function ScriptModal({ isOpen, onClose, onSave, script }: ScriptModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    authors: "",
    genre: "",
    logline: "",
    image: "",
    imagePosition: "top" as "top" | "left" | "right",
    content: "",
  })

  useEffect(() => {
    if (script) {
      setFormData({
        name: script.name,
        authors: script.authors,
        genre: script.genre || "",
        logline: script.logline || "",
        image: script.image || "",
        imagePosition: script.imagePosition || "top",
        content: script.content,
      })
    } else {
      setFormData({
        name: "",
        authors: "",
        genre: "",
        logline: "",
        image: "",
        imagePosition: "top",
        content: "",
      })
    }
  }, [script, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      authors: formData.authors,
      genre: formData.genre || undefined,
      logline: formData.logline || undefined,
      image: formData.image || undefined,
      imagePosition: formData.image ? formData.imagePosition : undefined,
      content: formData.content || "INT. ",
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-xl font-semibold text-foreground">{script ? "Edit Script" : "New Script"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Title *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter script title"
                required
                className="font-normal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authors" className="text-sm font-medium">
                Written By *
              </Label>
              <Input
                id="authors"
                value={formData.authors}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                placeholder="Jane Doe, John Smith"
                required
                className="font-normal"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre" className="text-sm font-medium">
              Genre
            </Label>
            <Input
              id="genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              placeholder="Drama, Thriller, etc."
              className="font-normal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logline" className="text-sm font-medium">
              Logline
            </Label>
            <Textarea
              id="logline"
              value={formData.logline}
              onChange={(e) => setFormData({ ...formData, logline: e.target.value })}
              placeholder="A one or two sentence summary of your script"
              className="min-h-[80px] resize-none font-normal"
            />
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
            <Label className="text-sm font-medium">Cover Image (Optional)</Label>
            <div className="flex items-start gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded border-2 border-dashed border-border bg-card">
                {formData.image ? (
                  <img
                    src={formData.image || "/placeholder.svg"}
                    alt="Preview"
                    className="h-full w-full rounded object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Enter image URL"
                  className="font-normal"
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Upload className="h-3.5 w-3.5" />
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{script ? "Save Changes" : "Create Script"}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
