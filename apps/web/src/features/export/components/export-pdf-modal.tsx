import { useState } from 'react';
import { LuFileDown, LuFileText, LuList, LuLoader, LuSettings } from 'react-icons/lu';

import type { ExportFormat } from '@kaeri/shared/enums/kaeri.enums';
import { EXPORT_FORMATS } from '@kaeri/shared/enums/kaeri.enums';

import { Button } from '@~/components/ui/button';
import { Checkbox } from '@~/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { Label } from '@~/components/ui/label';
import { SingleSelect } from '@~/components/ui/select';

import { useExportScriptPdf } from '../hooks/mutations/use-export-script-pdf';
import { useExportPresets } from '../hooks/queries/use-export-presets';

const FORMAT_OPTIONS = [
  {
    value: EXPORT_FORMATS.PDF,
    label: 'Standard PDF',
    description: 'Standard screenplay format',
    icon: LuFileDown,
  },
  {
    value: EXPORT_FORMATS.PRODUCTION_PDF,
    label: 'Production Script',
    description: 'With scene numbers and revision marks',
    icon: LuFileDown,
  },
  {
    value: EXPORT_FORMATS.CALL_SHEET,
    label: 'Call Sheet',
    description: 'Scene breakdown with characters and locations',
    icon: LuList,
  },
  {
    value: EXPORT_FORMATS.PLAIN_TEXT,
    label: 'Plain Text',
    description: 'Simple text format',
    icon: LuFileText,
  },
] as const;

interface iExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptId: string;
  scriptTitle: string;
  onOpenPresetEditor?: () => void;
}

export function ExportPdfModal({ isOpen, onClose, scriptId, scriptTitle, onOpenPresetEditor }: iExportPdfModalProps) {
  const { data: presets, isPending: isLoadingPresets } = useExportPresets();
  const { exportPdf, isPending: isExporting } = useExportScriptPdf();

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(EXPORT_FORMATS.PDF);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('default-screenplay');
  const [shouldIncludeSceneNumbers, setShouldIncludeSceneNumbers] = useState(true);
  const [shouldIncludeRevisionMarks, setShouldIncludeRevisionMarks] = useState(false);
  const [shouldIncludeDraftWatermark, setShouldIncludeDraftWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('DRAFT');

  // Production PDF forces certain options
  const isProductionPdf = selectedFormat === EXPORT_FORMATS.PRODUCTION_PDF;
  const shouldShowPdfOptions =
    selectedFormat === EXPORT_FORMATS.PDF || selectedFormat === EXPORT_FORMATS.PRODUCTION_PDF;

  const handleExport = () => {
    exportPdf(
      {
        scriptId,
        format: selectedFormat,
        presetId: selectedPresetId !== 'default-screenplay' ? selectedPresetId : undefined,
        includeSceneNumbers: isProductionPdf ? true : shouldIncludeSceneNumbers,
        includeRevisionMarks: isProductionPdf ? true : shouldIncludeRevisionMarks,
        includeDraftWatermark: shouldIncludeDraftWatermark,
        watermarkText: shouldIncludeDraftWatermark ? watermarkText : undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const selectedPreset = presets?.find((p) => p._id === selectedPresetId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Export Script</DialogTitle>
          <DialogDescription>Export &quot;{scriptTitle}&quot; in your preferred format.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <span className="text-sm font-medium">Export Format</span>
            <div className="grid grid-cols-2 gap-3">
              {FORMAT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedFormat === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedFormat(option.value)}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                        isSelected ? 'border-primary' : 'border-muted-foreground'
                      }`}
                    >
                      {isSelected ? <div className="h-2 w-2 rounded-full bg-primary" /> : null}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preset Selection - only for PDF formats */}
          {shouldShowPdfOptions ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Export Preset</span>
                {onOpenPresetEditor != null ? (
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={onOpenPresetEditor}>
                    <LuSettings className="h-3 w-3" />
                    Manage Presets
                  </Button>
                ) : null}
              </div>

              {isLoadingPresets ? (
                <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
                  <LuLoader className="h-4 w-4 animate-spin" />
                  Loading presets...
                </div>
              ) : (
                <SingleSelect
                  options={
                    presets?.map((preset) => ({
                      value: preset._id,
                      label: preset.name + (preset.isSystem ? ' (System)' : ''),
                    })) ?? []
                  }
                  value={selectedPresetId}
                  onValueChange={(value) => setSelectedPresetId(value ?? 'default-screenplay')}
                  placeholder="Select a preset"
                />
              )}

              {selectedPreset != null ? (
                <p className="text-xs text-muted-foreground">
                  {selectedPreset.description ??
                    `${selectedPreset.fontFamily}, ${selectedPreset.baseFontSize}pt, ${selectedPreset.pageSize}`}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* Export Options - only for standard PDF */}
          {selectedFormat === EXPORT_FORMATS.PDF ? (
            <div className="space-y-3">
              <span className="text-sm font-medium">Options</span>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="scene-numbers"
                    checked={shouldIncludeSceneNumbers}
                    onCheckedChange={(checked) => setShouldIncludeSceneNumbers(checked === true)}
                  />
                  <Label htmlFor="scene-numbers" className="cursor-pointer font-medium">
                    Include scene numbers
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="revision-marks"
                    checked={shouldIncludeRevisionMarks}
                    onCheckedChange={(checked) => setShouldIncludeRevisionMarks(checked === true)}
                  />
                  <Label htmlFor="revision-marks" className="cursor-pointer font-medium">
                    Include revision marks
                  </Label>
                </div>
              </div>
            </div>
          ) : null}

          {/* Production PDF info */}
          {isProductionPdf ? (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">
                Production scripts automatically include scene numbers and revision marks.
              </p>
            </div>
          ) : null}

          {/* Watermark Option - for PDF formats */}
          {shouldShowPdfOptions ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="draft-watermark"
                  checked={shouldIncludeDraftWatermark}
                  onCheckedChange={(checked) => setShouldIncludeDraftWatermark(checked === true)}
                />
                <Label htmlFor="draft-watermark" className="cursor-pointer font-medium">
                  Add draft watermark
                </Label>
              </div>

              {shouldIncludeDraftWatermark ? (
                <div className="ml-6">
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Watermark text"
                    className="h-8 w-full max-w-[200px] rounded-md border border-input bg-background px-3 text-sm"
                    maxLength={50}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Call Sheet info */}
          {selectedFormat === EXPORT_FORMATS.CALL_SHEET ? (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">
                Generates a breakdown document with scene list, character index, and location summary.
              </p>
            </div>
          ) : null}

          {/* Plain Text info */}
          {selectedFormat === EXPORT_FORMATS.PLAIN_TEXT ? (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">
                Exports script as plain text with basic formatting for scene headings, dialogue, and action.
              </p>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || (shouldShowPdfOptions && isLoadingPresets)}>
            {isExporting ? (
              <>
                <LuLoader className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <LuFileDown className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
