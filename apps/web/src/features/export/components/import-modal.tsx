import { useRef, useState } from 'react';
import { LuUpload, LuFileJson, LuTriangleAlert } from 'react-icons/lu';

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

import { useImportSeriesJson } from '../hooks/mutations/use-import-series-json';

interface iImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId: string;
}

interface iImportData {
  series?: { title?: string; description?: string };
  characters?: Array<{ name?: string }>;
  locations?: Array<{ name?: string }>;
  props?: Array<{ name?: string }>;
  timeline?: Array<{ title?: string }>;
  wildcards?: Array<{ key?: string }>;
  canvas?: {
    nodes?: Array<{ id?: string }>;
    edges?: Array<{ id?: string }>;
  };
}

export function ImportModal({ open, onOpenChange, seriesId }: iImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<iImportData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [options, setOptions] = useState({
    skipKnowledgeBase: false,
    skipCanvas: false,
  });

  const { importSeriesJson, isPending } = useImportSeriesJson();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    try {
      const text = await file.text();
      const data = JSON.parse(text) as iImportData;
      setImportData(data);
    } catch {
      setError('Invalid JSON file. Please select a valid export file.');
      setImportData(null);
    }
  };

  const handleImport = () => {
    if (!importData) return;

    importSeriesJson(
      {
        targetSeriesId: seriesId,
        // Cast to the expected type - the backend will validate
        data: importData as Parameters<typeof importSeriesJson>[0]['data'],
        options,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setImportData(null);
          setFileName('');
        },
      },
    );
  };

  const handleClose = () => {
    if (!isPending) {
      onOpenChange(false);
      setImportData(null);
      setFileName('');
      setError('');
    }
  };

  const getEntityCounts = () => {
    if (!importData) return null;
    return {
      characters: importData.characters?.length ?? 0,
      locations: importData.locations?.length ?? 0,
      props: importData.props?.length ?? 0,
      timeline: importData.timeline?.length ?? 0,
      wildcards: importData.wildcards?.length ?? 0,
      canvasNodes: importData.canvas?.nodes?.length ?? 0,
      canvasEdges: importData.canvas?.edges?.length ?? 0,
    };
  };

  const counts = getEntityCounts();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>Import entities from a previously exported JSON file.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Input */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Select Export File</div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
            >
              <LuUpload className="h-4 w-4" />
              {fileName || 'Choose JSON file...'}
            </Button>
          </div>

          {/* Error Display */}
          {error ? (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <LuTriangleAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          {/* Preview */}
          {counts ? (
            <div className="rounded-md border bg-muted/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <LuFileJson className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">File Contents</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Characters: {counts.characters}</div>
                <div>Locations: {counts.locations}</div>
                <div>Props: {counts.props}</div>
                <div>Timeline: {counts.timeline}</div>
                <div>Wildcards: {counts.wildcards}</div>
                <div>Canvas Nodes: {counts.canvasNodes}</div>
              </div>
            </div>
          ) : null}

          {/* Options */}
          {counts ? (
            <div className="space-y-3">
              <div className="text-sm font-medium">Import Options</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="skip-kb"
                    checked={options.skipKnowledgeBase}
                    onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, skipKnowledgeBase: !!checked }))}
                  />
                  <Label htmlFor="skip-kb" className="cursor-pointer text-sm font-normal">
                    Skip Knowledge Base entities
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="skip-canvas"
                    checked={options.skipCanvas}
                    onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, skipCanvas: !!checked }))}
                  />
                  <Label htmlFor="skip-canvas" className="cursor-pointer text-sm font-normal">
                    Skip Canvas data
                  </Label>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!importData || isPending}>
            {isPending ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
