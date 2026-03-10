import type { NodeProps } from '@xyflow/react';
import { Handle, NodeResizer, Position } from '@xyflow/react';
import { memo } from 'react';

import type { iCanvasNodeData } from '../../canvas.types';

interface iTextNodeProps extends NodeProps {
  data: iCanvasNodeData;
}

function TextNode({ data, selected }: iTextNodeProps) {
  const style = data.style ?? {};

  return (
    <div
      className={`
        relative h-full w-full rounded-lg border-2 p-3 shadow-sm transition-shadow
        ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
      style={{
        backgroundColor: style.backgroundColor ?? '#ffffff',
        borderColor: style.borderColor ?? '#e2e8f0',
        color: style.textColor ?? '#1a1a1a',
      }}
    >
      <NodeResizer
        minWidth={100}
        minHeight={40}
        isVisible={selected}
        lineClassName="border-primary"
        handleClassName="h-3 w-3 rounded-sm border-2 border-primary bg-background"
      />
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="h-2! w-2! bg-primary!" />
      <Handle type="source" position={Position.Bottom} className="h-2! w-2! bg-primary!" />
      <Handle type="target" position={Position.Left} className="h-2! w-2! bg-primary!" />
      <Handle type="source" position={Position.Right} className="h-2! w-2! bg-primary!" />

      {/* Content */}
      <div className="flex h-full items-center justify-center text-sm font-medium">{data.content || 'Text'}</div>
    </div>
  );
}

export default memo(TextNode);
