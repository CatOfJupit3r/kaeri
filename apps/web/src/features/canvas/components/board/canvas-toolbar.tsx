import {
  LuCircle,
  LuMinus,
  LuMousePointer2,
  LuRedo2,
  LuSquare,
  LuStickyNote,
  LuTriangle,
  LuType,
  LuUndo2,
} from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@~/components/ui/tooltip';

import { CANVAS_TOOLS, SHAPE_TYPES } from '../../canvas.types';
import type { CanvasTool, ShapeType } from '../../canvas.types';

interface iCanvasToolbarProps {
  currentTool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  currentShapeType: ShapeType;
  onShapeTypeChange: (shapeType: ShapeType) => void;
}

const TOOL_CONFIG = {
  [CANVAS_TOOLS.select]: {
    icon: LuMousePointer2,
    label: 'Select',
    shortcut: 'V',
  },
  [CANVAS_TOOLS.text]: {
    icon: LuType,
    label: 'Text',
    shortcut: 'T',
  },
  [CANVAS_TOOLS.shape]: {
    icon: LuSquare,
    label: 'Shape',
    shortcut: 'R',
  },
  [CANVAS_TOOLS.note]: {
    icon: LuStickyNote,
    label: 'Note',
    shortcut: 'N',
  },
  [CANVAS_TOOLS.line]: {
    icon: LuMinus,
    label: 'Connect',
    shortcut: 'L',
  },
} as const;

export default function CanvasToolbar({
  currentTool,
  onToolChange,
  currentShapeType,
  onShapeTypeChange,
}: iCanvasToolbarProps) {
  const handleUndo = () => {
    // Undo functionality stub - to be implemented
  };

  const handleRedo = () => {
    // Redo functionality stub - to be implemented
  };

  return (
    <div className="flex items-center gap-1 border-b bg-background/95 p-2 backdrop-blur-sm">
      {/* Undo/Redo buttons */}
      <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleUndo} disabled>
              <LuUndo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>
              Undo <span className="text-muted-foreground">(Ctrl+Z)</span>
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleRedo} disabled>
              <LuRedo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>
              Redo <span className="text-muted-foreground">(Ctrl+Y)</span>
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="mx-2 h-6 w-px bg-border" />

      {/* Tool selection */}
      <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
        {Object.entries(TOOL_CONFIG).map(([tool, config]) => {
          const Icon = config.icon;
          const isActive = currentTool === tool;

          // Skip line tool for now (connections are made by dragging between handles)
          if (tool === CANVAS_TOOLS.line) return null;

          return (
            <Tooltip key={tool}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`h-8 w-8 p-0 ${isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                  onClick={() => onToolChange(tool as CanvasTool)}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  {config.label} <span className="text-muted-foreground">({config.shortcut})</span>
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="mx-2 h-6 w-px bg-border" />

      {/* Shape options when shape tool is selected */}
      {currentTool === CANVAS_TOOLS.shape && (
        <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentShapeType === SHAPE_TYPES.rectangle ? 'secondary' : 'ghost'}
                size="sm"
                className={`h-8 w-8 p-0 ${currentShapeType === SHAPE_TYPES.rectangle ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                onClick={() => onShapeTypeChange(SHAPE_TYPES.rectangle)}
              >
                <LuSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Rectangle</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentShapeType === SHAPE_TYPES.circle ? 'secondary' : 'ghost'}
                size="sm"
                className={`h-8 w-8 p-0 ${currentShapeType === SHAPE_TYPES.circle ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                onClick={() => onShapeTypeChange(SHAPE_TYPES.circle)}
              >
                <LuCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Circle</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentShapeType === SHAPE_TYPES.triangle ? 'secondary' : 'ghost'}
                size="sm"
                className={`h-8 w-8 p-0 ${currentShapeType === SHAPE_TYPES.triangle ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                onClick={() => onShapeTypeChange(SHAPE_TYPES.triangle)}
              >
                <LuTriangle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Triangle</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      <div className="flex-1" />

      <div className="text-xs text-muted-foreground">
        {currentTool === CANVAS_TOOLS.select ? (
          <span>Click and drag to select • Delete to remove</span>
        ) : (
          <span>Click on canvas to place • Press V to select</span>
        )}
      </div>
    </div>
  );
}
