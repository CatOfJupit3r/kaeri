import type { NodeProps } from '@xyflow/react';
import { Handle, NodeResizer, Position } from '@xyflow/react';
import { memo } from 'react';

import { cn } from '@~/lib/utils';

import type { iCanvasNodeData } from '../../canvas.types';
import { SHAPE_TYPES } from '../../canvas.types';

interface iShapeNodeProps extends NodeProps {
  data: iCanvasNodeData;
}

function ShapeNode({ data, selected }: iShapeNodeProps) {
  const style = data.style ?? {};
  const shapeType = style.shapeType ?? SHAPE_TYPES.rectangle;

  const getShapeStyles = () => {
    const baseStyles = {
      backgroundColor: style.backgroundColor ?? '#3b82f6',
      borderColor: style.borderColor ?? '#2563eb',
      color: style.textColor ?? '#ffffff',
    };

    switch (shapeType) {
      case SHAPE_TYPES.circle:
        return {
          ...baseStyles,
          borderRadius: '50%',
        };
      case SHAPE_TYPES.triangle:
        // Triangle uses clip-path
        return {
          ...baseStyles,
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
        };
      case SHAPE_TYPES.rectangle:
      default:
        return {
          ...baseStyles,
          borderRadius: '0.5rem',
        };
    }
  };

  return (
    <div
      className={cn(
        'relative flex h-full w-full items-center justify-center border-2 shadow-sm transition-shadow',
        selected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={getShapeStyles()}
    >
      <NodeResizer
        minWidth={60}
        minHeight={60}
        isVisible={selected}
        lineClassName="border-primary"
        handleClassName="h-3 w-3 rounded-sm border-2 border-primary bg-background"
        keepAspectRatio={shapeType !== SHAPE_TYPES.rectangle}
      />
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="h-2! w-2! bg-primary!" />
      <Handle type="source" position={Position.Bottom} className="h-2! w-2! bg-primary!" />
      <Handle type="target" position={Position.Left} className="h-2! w-2! bg-primary!" />
      <Handle type="source" position={Position.Right} className="h-2! w-2! bg-primary!" />

      {/* Content */}
      <span className="text-center text-xs font-medium">{data.content || ''}</span>
    </div>
  );
}

export default memo(ShapeNode);
