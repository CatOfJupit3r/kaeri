"use client"

import { useState } from "react"
import { FileDown, FileType, Film, Calendar, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  scriptName: string
}

export function ExportModal({ isOpen, onClose, scriptName }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState("pdf")
  const [includeSceneNumbers, setIncludeSceneNumbers] = useState(false)
  const [includeRevisions, setIncludeRevisions] = useState(false)

  const handleExport = () => {
    // Simulate export
    console.log("[v0] Exporting:", { exportFormat, includeSceneNumbers, includeRevisions })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Script</DialogTitle>
          <DialogDescription>Choose your export format and options for "{scriptName}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
              <div className="flex items-start space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="pdf" id="pdf" className="mt-1" />
                <div className="flex-1">
                  <label htmlFor="pdf" className="flex items-center gap-2 font-medium cursor-pointer">
                    <FileType className="h-4 w-4" />
                    Hollywood Standard PDF
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">Industry-standard screenplay formatting</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="fdx" id="fdx" className="mt-1" />
                <div className="flex-1">
                  <label htmlFor="fdx" className="flex items-center gap-2 font-medium cursor-pointer">
                    <Film className="h-4 w-4" />
                    Final Draft (.fdx)
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">Compatible with Final Draft software</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="production" id="production" className="mt-1" />
                <div className="flex-1">
                  <label htmlFor="production" className="flex items-center gap-2 font-medium cursor-pointer">
                    <CheckCircle className="h-4 w-4" />
                    Production Script
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">With scene numbers and production marks</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="callsheet" id="callsheet" className="mt-1" />
                <div className="flex-1">
                  <label htmlFor="callsheet" className="flex items-center gap-2 font-medium cursor-pointer">
                    <Calendar className="h-4 w-4" />
                    Call Sheet
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">Character and location breakdowns</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scene-numbers"
                  checked={includeSceneNumbers}
                  onCheckedChange={(checked) => setIncludeSceneNumbers(checked as boolean)}
                />
                <label
                  htmlFor="scene-numbers"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Include scene numbers
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="revisions"
                  checked={includeRevisions}
                  onCheckedChange={(checked) => setIncludeRevisions(checked as boolean)}
                />
                <label
                  htmlFor="revisions"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Include revision marks
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
