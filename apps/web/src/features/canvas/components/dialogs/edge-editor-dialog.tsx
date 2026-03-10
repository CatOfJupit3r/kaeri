import { useCallback, useEffect, useState } from 'react';

import { Button } from '@~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';

import type { EdgeStyle, iCanvasEdgeData } from '../../canvas.types';
import { DEFAULT_EDGE_STYLE, EDGE_STYLES } from '../../canvas.types';
import ColorInput from '../color-input';

interface iEdgeSaveData {
  label?: string;
  color: string;
  thickness: number;
  edgeStyle: EdgeStyle;
}

interface iEdgeEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edge: iCanvasEdgeData | null;
  onSave: (updates: iEdgeSaveData) => void;
}

function getStrokeDasharray(style: EdgeStyle): string | undefined {
  if (style === EDGE_STYLES.dashed) return '5,5';
  if (style === EDGE_STYLES.dotted) return '2,2';
  return undefined;
}

export default function EdgeEditorDialog({ open, onOpenChange, edge, onSave }: iEdgeEditorDialogProps) {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState<string>(DEFAULT_EDGE_STYLE.color);
  const [thickness, setThickness] = useState<number>(DEFAULT_EDGE_STYLE.thickness);
  const [edgeStyle, setEdgeStyle] = useState<EdgeStyle>(EDGE_STYLES.solid);

  // Reset form when edge changes
  useEffect(() => {
    if (edge) {
      setLabel(edge.label ?? '');
      setColor(edge.color ?? DEFAULT_EDGE_STYLE.color);
      setThickness(edge.thickness ?? DEFAULT_EDGE_STYLE.thickness);
      setEdgeStyle(edge.edgeStyle ?? EDGE_STYLES.solid);
    }
  }, [edge]);

  const handleSave = useCallback(() => {
    onSave({
      label: label || undefined,
      color,
      thickness,
      edgeStyle,
    });
    onOpenChange(false);
  }, [label, color, thickness, edgeStyle, onSave, onOpenChange]);

  if (!edge) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Connection</DialogTitle>
          <DialogDescription>Customize the appearance of this connection.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Label */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edge-label">Label (optional)</Label>
            <Input
              id="edge-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter a label..."
            />
          </div>

          {/* Edge Style */}
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Line Style</legend>
            <div className="flex gap-2">
              {Object.values(EDGE_STYLES).map((style) => (
                <Button
                  key={style}
                  variant={edgeStyle === style ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEdgeStyle(style)}
                  className="flex-1 capitalize"
                >
                  <span className="mr-2">
                    {style === EDGE_STYLES.solid ? '—' : null}
                    {style === EDGE_STYLES.dashed ? '- -' : null}
                    {style === EDGE_STYLES.dotted ? '···' : null}
                  </span>
                  {style}
                </Button>
              ))}
            </div>
          </fieldset>

          {/* Color */}
          <ColorInput label="Line Color" value={color} onChange={setColor} />

          {/* Thickness */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edge-thickness">Thickness (px)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="edge-thickness"
                type="range"
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
                min={1}
                max={8}
                className="flex-1"
              />
              <span className="w-8 text-center text-sm font-medium">{thickness}</span>
            </div>
            {/* Preview */}
            <div className="mt-2 flex items-center justify-center rounded-md border bg-muted/30 p-4">
              <svg width="120" height="20" viewBox="0 0 120 20">
                <line
                  x1="0"
                  y1="10"
                  x2="120"
                  y2="10"
                  stroke={color}
                  strokeWidth={thickness}
                  strokeDasharray={getStrokeDasharray(edgeStyle)}
                />
              </svg>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
