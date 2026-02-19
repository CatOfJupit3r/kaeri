import { useState } from 'react';
import { LuFileDown, LuLoader, LuSettings } from 'react-icons/lu';

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

  const [selectedPresetId, setSelectedPresetId] = useState<string>('default-screenplay');
  const [shouldIncludeSceneNumbers, setShouldIncludeSceneNumbers] = useState(true);
  const [shouldIncludeDraftWatermark, setShouldIncludeDraftWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('DRAFT');

  const handleExport = () => {
    exportPdf(
      {
        scriptId,
        presetId: selectedPresetId !== 'default-screenplay' ? selectedPresetId : undefined,
        includeSceneNumbers: shouldIncludeSceneNumbers,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export to PDF</DialogTitle>
          <DialogDescription>Export &quot;{scriptTitle}&quot; as a formatted PDF screenplay.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preset Selection */}
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

          {/* Export Options */}
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
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || isLoadingPresets}>
            {isExporting ? (
              <>
                <LuLoader className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <LuFileDown className="mr-2 h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
