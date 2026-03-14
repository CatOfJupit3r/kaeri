import type { Edge, Node } from '@xyflow/react';
import { Background, Controls, MarkerType, MiniMap, ReactFlow, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useMemo } from 'react';
import { LuClock, LuFileText, LuLoader, LuMapPin, LuPackage, LuUser } from 'react-icons/lu';

import { cn } from '@~/lib/utils';

import type { ContinuityEdge, ContinuityNode } from '../hooks/queries/use-continuity-graph';

const NODE_TYPE_CONFIG = {
  character: { color: 'bg-blue-100 border-blue-400', icon: LuUser, label: 'Character' },
  location: { color: 'bg-green-100 border-green-400', icon: LuMapPin, label: 'Location' },
  prop: { color: 'bg-amber-100 border-amber-400', icon: LuPackage, label: 'Prop' },
  script: { color: 'bg-purple-100 border-purple-400', icon: LuFileText, label: 'Script' },
  timeline: { color: 'bg-rose-100 border-rose-400', icon: LuClock, label: 'Timeline' },
} as const;

const EDGE_TYPE_CONFIG = {
  relationship: { color: '#3b82f6', label: 'Relationship', style: 'solid' },
  appearance: { color: '#8b5cf6', label: 'Appears in', style: 'dashed' },
  'location-of': { color: '#22c55e', label: 'Location of', style: 'dotted' },
  'prop-in-scene': { color: '#f59e0b', label: 'Prop in Scene', style: 'dashed' },
} as const;

interface iContinuityGraphProps {
  nodes: ContinuityNode[];
  edges: ContinuityEdge[];
  isLoading?: boolean;
  onNodeClick?: (node: ContinuityNode) => void;
}

function getNodeLabel(node: ContinuityNode): string {
  switch (node.type) {
    case 'character':
      return node.name;
    case 'location':
      return node.name;
    case 'prop':
      return node.name;
    case 'script':
      return node.title;
    case 'timeline':
      return node.label;
    default:
      return 'Unknown';
  }
}

function layoutNodes(nodes: ContinuityNode[]): Node[] {
  // Group nodes by type for better layout
  const nodesByType = nodes.reduce<Record<string, ContinuityNode[]>>((acc, node) => {
    acc[node.type] = acc[node.type] ?? [];
    acc[node.type].push(node);
    return acc;
  }, {});

  const typeOrder = ['character', 'location', 'script', 'prop', 'timeline'];
  const result: Node[] = [];

  const COLUMN_WIDTH = 250;
  const ROW_HEIGHT = 80;
  const START_X = 50;
  const START_Y = 50;

  typeOrder.forEach((type, colIndex) => {
    const typeNodes = nodesByType[type] ?? [];
    typeNodes.forEach((node, rowIndex) => {
      const config = NODE_TYPE_CONFIG[node.type];
      const IconComponent = config?.icon ?? LuFileText;

      result.push({
        id: node._id,
        type: 'default',
        position: {
          x: START_X + colIndex * COLUMN_WIDTH,
          y: START_Y + rowIndex * ROW_HEIGHT,
        },
        data: {
          label: (
            <div className={cn('flex items-center gap-2 rounded-md border-2 px-3 py-2', config?.color)}>
              <IconComponent className="h-4 w-4 shrink-0" />
              <span className="truncate text-sm font-medium">{getNodeLabel(node)}</span>
            </div>
          ),
          originalNode: node,
        },
        style: {
          background: 'transparent',
          border: 'none',
          padding: 0,
        },
      });
    });
  });

  return result;
}

function mapEdges(edges: ContinuityEdge[]): Edge[] {
  return edges.map((edge, index) => {
    const config = EDGE_TYPE_CONFIG[edge.type];
    const strokeDasharray = getStrokeDasharray(config?.style);
    return {
      id: `${edge.fromId}-${edge.toId}-${index}`,
      source: edge.fromId,
      target: edge.toId,
      label: config?.label,
      labelStyle: { fontSize: 10 },
      style: {
        stroke: config?.color ?? '#888',
        strokeDasharray,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: config?.color ?? '#888',
      },
    };
  });
}

function getStrokeDasharray(style?: string): string | undefined {
  if (style === 'dashed') return '5,5';
  if (style === 'dotted') return '2,2';
  return undefined;
}

function ContinuityGraphInner({ nodes, edges, isLoading, onNodeClick }: iContinuityGraphProps) {
  const { fitView } = useReactFlow();

  const flowNodes = useMemo(() => layoutNodes(nodes), [nodes]);
  const flowEdges = useMemo(() => mapEdges(edges), [edges]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const nodeData = node.data as { originalNode: ContinuityNode };
      onNodeClick?.(nodeData.originalNode);
    },
    [onNodeClick],
  );

  // Fit view when nodes change
  useMemo(() => {
    if (flowNodes.length > 0) {
      setTimeout(async () => fitView({ padding: 0.1 }), 100);
    }
  }, [flowNodes, fitView]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LuLoader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
        <p className="text-lg font-medium">No entities found</p>
        <p className="text-sm">Add characters, locations, or other entities to see the continuity graph.</p>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      onNodeClick={handleNodeClick}
      fitView
      fitViewOptions={{ padding: 0.1 }}
      minZoom={0.1}
      maxZoom={2}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
    >
      <Background />
      <Controls />
      <MiniMap
        nodeColor={(node) => {
          const originalNode = node.data.originalNode as ContinuityNode;
          const config = NODE_TYPE_CONFIG[originalNode?.type];
          return config ? config.color.replace('bg-', '').replace('-100', '') : '#888';
        }}
        maskColor="rgb(0, 0, 0, 0.1)"
      />

      {/* Legend */}
      <div className="absolute top-4 left-4 rounded-md border bg-background/90 p-3 shadow-sm">
        <div className="mb-2 text-xs font-semibold text-muted-foreground">Node Types</div>
        <div className="space-y-1">
          {Object.entries(NODE_TYPE_CONFIG).map(([type, config]) => {
            const IconComponent = config.icon;
            return (
              <div key={type} className="flex items-center gap-2 text-xs">
                <div className={cn('h-4 w-4 rounded border', config.color)}>
                  <IconComponent className="m-0.5 h-3 w-3" />
                </div>
                <span>{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </ReactFlow>
  );
}

export function ContinuityGraph(props: iContinuityGraphProps) {
  return (
    <ReactFlowProvider>
      <ContinuityGraphInner {...props} />
    </ReactFlowProvider>
  );
}
