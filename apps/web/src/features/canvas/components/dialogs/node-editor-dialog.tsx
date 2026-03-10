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
import { Textarea } from '@~/components/ui/textarea';

import type {
  CanvasNodeType,
  iCanvasNodeData,
  iCanvasNodeStyle,
  LinkedEntityType,
  ShapeType,
} from '../../canvas.types';
import { CANVAS_NODE_TYPES, SHAPE_TYPES } from '../../canvas.types';
import ColorInput from '../color-input';
import KBEntityPicker from './kb-entity-picker';

interface iNodeEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: iCanvasNodeData | null;
  seriesId: string;
  onSave: (updates: {
    content: string;
    style: iCanvasNodeStyle;
    linkedEntityId?: string;
    linkedEntityType?: LinkedEntityType;
  }) => void;
}

export default function NodeEditorDialog({ open, onOpenChange, node, seriesId, onSave }: iNodeEditorDialogProps) {
  const [content, setContent] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#e2e8f0');
  const [textColor, setTextColor] = useState('#1a1a1a');
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(60);
  const [shapeType, setShapeType] = useState<ShapeType>(SHAPE_TYPES.rectangle);
  const [linkedEntityId, setLinkedEntityId] = useState<string | undefined>(undefined);
  const [linkedEntityType, setLinkedEntityType] = useState<LinkedEntityType | undefined>(undefined);

  // Reset form when node changes
  useEffect(() => {
    if (node) {
      setContent(node.content || '');
      setBackgroundColor(node.style?.backgroundColor ?? '#ffffff');
      setBorderColor(node.style?.borderColor ?? '#e2e8f0');
      setTextColor(node.style?.textColor ?? '#1a1a1a');
      setWidth(node.style?.width ?? 200);
      setHeight(node.style?.height ?? 60);
      setShapeType(node.style?.shapeType ?? SHAPE_TYPES.rectangle);
      setLinkedEntityId(node.linkedEntityId);
      setLinkedEntityType(node.linkedEntityType);
    }
  }, [node]);

  const handleSave = useCallback(() => {
    const style: iCanvasNodeStyle = {
      backgroundColor,
      borderColor,
      textColor,
      width,
      height,
    };

    // Add shapeType only for shape nodes
    if (node?.type === CANVAS_NODE_TYPES.shape) {
      style.shapeType = shapeType;
    }

    onSave({
      content,
      style,
      linkedEntityId,
      linkedEntityType,
    });
    onOpenChange(false);
  }, [
    backgroundColor,
    borderColor,
    textColor,
    width,
    height,
    shapeType,
    content,
    linkedEntityId,
    linkedEntityType,
    node?.type,
    onSave,
    onOpenChange,
  ]);

  const handleEntitySelect = useCallback((entityId: string | undefined, entityType: LinkedEntityType | undefined) => {
    setLinkedEntityId(entityId);
    setLinkedEntityType(entityType);
  }, []);

  const getNodeTypeLabel = (type: CanvasNodeType | undefined) => {
    switch (type) {
      case CANVAS_NODE_TYPES.text:
        return 'Text Node';
      case CANVAS_NODE_TYPES.shape:
        return 'Shape Node';
      case CANVAS_NODE_TYPES.note:
        return 'Note';
      default:
        return 'Node';
    }
  };

  if (!node) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit {getNodeTypeLabel(node.type)}</DialogTitle>
          <DialogDescription>Customize the content and appearance of this node.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Content */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="node-content">Content</Label>
            {node.type === CANVAS_NODE_TYPES.note ? (
              <Textarea
                id="node-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter note content..."
                rows={4}
              />
            ) : (
              <Input
                id="node-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter content..."
              />
            )}
          </div>

          {/* Shape type picker (only for shape nodes) */}
          {node.type === CANVAS_NODE_TYPES.shape ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">Shape Type</legend>
              <div className="flex gap-2">
                {Object.values(SHAPE_TYPES).map((type) => (
                  <Button
                    key={type}
                    variant={shapeType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShapeType(type)}
                    className="capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {/* Colors */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ColorInput label="Background" value={backgroundColor} onChange={setBackgroundColor} />
            <ColorInput label="Border" value={borderColor} onChange={setBorderColor} />
            <ColorInput label="Text" value={textColor} onChange={setTextColor} />
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="node-width">Width (px)</Label>
              <Input
                id="node-width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value) || 100)}
                min={50}
                max={500}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="node-height">Height (px)</Label>
              <Input
                id="node-height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value) || 50)}
                min={30}
                max={500}
              />
            </div>
          </div>

          {/* KB Entity Linking */}
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Link to Knowledge Base</legend>
            <KBEntityPicker
              seriesId={seriesId}
              selectedEntityId={linkedEntityId}
              selectedEntityType={linkedEntityType}
              onSelect={handleEntitySelect}
            />
          </fieldset>
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
