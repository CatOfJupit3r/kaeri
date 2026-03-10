import type { NodeProps } from '@xyflow/react';
import { Handle, NodeResizer, Position } from '@xyflow/react';
import { memo } from 'react';

import type { iCanvasNodeData } from '../../canvas.types';

interface iNoteNodeProps extends NodeProps {
  data: iCanvasNodeData;
}

function NoteNode({ data, selected }: iNoteNodeProps) {
  const style = data.style ?? {};

  return (
    <div
      className={`
        relative h-full w-full rounded-sm shadow-md transition-shadow
        ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
      style={{
        backgroundColor: style.backgroundColor ?? '#fef08a',
        borderLeft: `4px solid ${style.borderColor ?? '#facc15'}`,
        color: style.textColor ?? '#1a1a1a',
      }}
    >
      <NodeResizer
        minWidth={100}
        minHeight={80}
        isVisible={selected}
        lineClassName="border-primary"
        handleClassName="h-3 w-3 rounded-sm border-2 border-primary bg-background"
      />
      {/* Corner fold effect */}
      <div
        className="absolute top-0 right-0 h-4 w-4"
        style={{
          background: `linear-gradient(135deg, transparent 50%, ${style.borderColor ?? '#facc15'} 50%)`,
        }}
      />

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="h-2! w-2! bg-primary!" />
      <Handle type="source" position={Position.Bottom} className="h-2! w-2! bg-primary!" />
      <Handle type="target" position={Position.Left} className="h-2! w-2! bg-primary!" />
      <Handle type="source" position={Position.Right} className="h-2! w-2! bg-primary!" />

      {/* Content */}
      <div className="p-3 pr-5 text-sm whitespace-pre-wrap">{data.content || 'Write a note...'}</div>
    </div>
  );
}

export default memo(NoteNode);
