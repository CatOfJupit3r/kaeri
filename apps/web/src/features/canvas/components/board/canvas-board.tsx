import type {
  Connection,
  Edge,
  EdgeChange,
  EdgeMouseHandler,
  Node,
  NodeChange,
  NodeMouseHandler,
  Viewport,
} from '@xyflow/react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { toastError } from '@~/components/toastifications/create-jsx-toasts';
import { useDebouncedStableCallback } from '@~/hooks/use-stable-callback';

import type {
  CanvasNodeType,
  CanvasTool,
  EdgeStyle,
  iCanvasEdgeData,
  iCanvasNodeData,
  iCanvasNodeStyle,
  iCanvasViewport,
  LinkedEntityType,
  ShapeType,
} from '../../canvas.types';
import {
  CANVAS_NODE_TYPES,
  DEFAULT_EDGE_STYLE,
  DEFAULT_NODE_STYLES,
  EDGE_STYLES,
  SHAPE_TYPES,
  validateNodeStyle,
} from '../../canvas.types';
import { useDeleteEdges } from '../../hooks/mutations/use-delete-edges';
import { useDeleteNodes } from '../../hooks/mutations/use-delete-nodes';
import { useUpsertEdges } from '../../hooks/mutations/use-upsert-edges';
import { useUpsertNodes } from '../../hooks/mutations/use-upsert-nodes';
import { useCanvas } from '../../hooks/queries/use-canvas';
import { EdgeEditorDialog, NodeEditorDialog } from '../dialogs';
import { NoteNode, ShapeNode, TextNode } from '../nodes';
import CanvasToolbar from './canvas-toolbar';

// Custom node type
type CanvasNode = Node<iCanvasNodeData, CanvasNodeType>;

// Define custom node types for ReactFlow
const nodeTypes = {
  [CANVAS_NODE_TYPES.text]: TextNode,
  [CANVAS_NODE_TYPES.shape]: ShapeNode,
  [CANVAS_NODE_TYPES.note]: NoteNode,
};

// Viewport storage key prefix
const VIEWPORT_STORAGE_KEY = 'canvas-viewport-';

function getStoredViewport(seriesId: string): iCanvasViewport | null {
  try {
    const stored = localStorage.getItem(`${VIEWPORT_STORAGE_KEY}${seriesId}`);
    if (stored) {
      return JSON.parse(stored) as iCanvasViewport;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function storeViewport(seriesId: string, viewport: iCanvasViewport) {
  try {
    localStorage.setItem(`${VIEWPORT_STORAGE_KEY}${seriesId}`, JSON.stringify(viewport));
  } catch {
    // Ignore storage errors
  }
}

interface iCanvasBoardProps {
  seriesId: string;
}

function generateId() {
  return crypto.randomUUID();
}

function CanvasBoardInner({ seriesId }: iCanvasBoardProps) {
  const { data: canvasData, isLoading, error } = useCanvas(seriesId);
  const { upsertNodes } = useUpsertNodes();
  const { upsertEdges } = useUpsertEdges();
  const { deleteNodes } = useDeleteNodes();
  const { deleteEdges } = useDeleteEdges();
  const reactFlowInstance = useReactFlow();

  // Track pending node updates for debounced save
  const pendingNodeUpdates = useRef<Map<string, CanvasNode>>(new Map());

  // Convert backend data to ReactFlow format
  const initialNodes = useMemo<CanvasNode[]>(() => {
    if (!canvasData?.nodes) return [];
    return canvasData.nodes.map((node) => {
      const style = node.style as iCanvasNodeData['style'];
      const defaultStyle = DEFAULT_NODE_STYLES[node.type];
      // Use stored dimensions or defaults
      const width = style?.width ?? defaultStyle.width ?? 200;
      const height = style?.height ?? defaultStyle.height ?? 100;

      return {
        id: node._id,
        type: node.type,
        position: node.position,
        // Set explicit dimensions for NodeResizer
        width,
        height,
        data: {
          _id: node._id,
          seriesId: node.seriesId,
          type: node.type,
          content: node.content,
          style: {
            ...defaultStyle,
            ...style,
            width,
            height,
          },
        },
      };
    });
  }, [canvasData?.nodes]);

  const initialEdges = useMemo<Edge[]>(() => {
    if (!canvasData?.edges) return [];
    return canvasData.edges.map((edge) => {
      const edgeStyle = edge.edgeStyle ?? DEFAULT_EDGE_STYLE.edgeStyle;
      let strokeDasharray: string | undefined;
      if (edgeStyle === EDGE_STYLES.dashed) {
        strokeDasharray = '5,5';
      } else if (edgeStyle === EDGE_STYLES.dotted) {
        strokeDasharray = '2,2';
      }

      return {
        id: edge._id,
        source: edge.sourceId,
        target: edge.targetId,
        label: edge.label,
        style: {
          stroke: edge.color ?? DEFAULT_EDGE_STYLE.color,
          strokeWidth: edge.thickness ?? DEFAULT_EDGE_STYLE.thickness,
          strokeDasharray,
        },
        data: {
          _id: edge._id,
          seriesId: edge.seriesId,
          color: edge.color,
          thickness: edge.thickness,
          edgeStyle: edge.edgeStyle,
        },
      };
    });
  }, [canvasData?.edges]);

  // ReactFlow state
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Sync with backend data when it changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  // Set initial viewport from storage
  useEffect(() => {
    const storedViewport = getStoredViewport(seriesId);
    if (storedViewport && reactFlowInstance) {
      reactFlowInstance
        .setViewport({
          x: storedViewport.x,
          y: storedViewport.y,
          zoom: storedViewport.zoom,
        })
        .catch(() => {
          // Ignore viewport restoration errors
        });
    }
  }, [seriesId, reactFlowInstance]);

  // Current tool state
  const [currentTool, setCurrentTool] = useState<CanvasTool>('select');
  const [currentShapeType, setCurrentShapeType] = useState<ShapeType>(SHAPE_TYPES.rectangle);

  // Node editor dialog state
  const [editingNode, setEditingNode] = useState<iCanvasNodeData | null>(null);
  const [editingNodePosition, setEditingNodePosition] = useState<{ x: number; y: number } | null>(null);
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);

  // Edge editor dialog state
  const [editingEdge, setEditingEdge] = useState<iCanvasEdgeData | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [isEdgeEditorOpen, setIsEdgeEditorOpen] = useState(false);

  // Debounced save for node position changes (1 second as per spec)
  const debouncedSaveNodes = useDebouncedStableCallback(() => {
    if (pendingNodeUpdates.current.size === 0) return;

    const nodesToSave = Array.from(pendingNodeUpdates.current.values()).map((node) => ({
      _id: node.id,
      seriesId,
      type: node.data.type,
      content: node.data.content,
      position: node.position,
      style: node.data.style,
    }));

    // Validate all node styles before saving
    for (const node of nodesToSave) {
      if (node.style) {
        const validation = validateNodeStyle(node.style);
        if (!validation.valid) {
          toastError('Invalid node style', validation.errors.join(', '));
          return;
        }
      }
    }

    upsertNodes({ seriesId, nodes: nodesToSave });
    pendingNodeUpdates.current.clear();
  }, 1000);

  // Save viewport on move (debounced)
  const debouncedSaveViewport = useDebouncedStableCallback((viewport: Viewport) => {
    storeViewport(seriesId, {
      x: viewport.x,
      y: viewport.y,
      zoom: viewport.zoom,
    });
  }, 500);

  // Handle viewport change
  const handleMoveEnd = useCallback(
    (_event: unknown, viewport: Viewport) => {
      debouncedSaveViewport(viewport);
    },
    [debouncedSaveViewport],
  );

  // Handle node changes (drag, select, resize, etc.)
  const handleNodesChange = useCallback(
    (changes: NodeChange<CanvasNode>[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));

      // Handle removals, position changes, and dimension changes
      changes.forEach((change) => {
        if (change.type === 'position' && 'position' in change && change.position && change.dragging === false) {
          const node = nodes.find((n) => n.id === change.id);
          if (node) {
            // Add to pending updates for debounced save
            pendingNodeUpdates.current.set(change.id, {
              ...node,
              position: change.position,
            });
            debouncedSaveNodes();
          }
        } else if (
          change.type === 'dimensions' &&
          'dimensions' in change &&
          change.dimensions &&
          change.resizing === false
        ) {
          // Handle resize - update node style with new dimensions
          const node = nodes.find((n) => n.id === change.id);
          if (node && change.dimensions) {
            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                style: {
                  ...node.data.style,
                  width: Math.round(change.dimensions.width),
                  height: Math.round(change.dimensions.height),
                },
              },
            };
            // Update local state
            setNodes((nds) => nds.map((n) => (n.id === change.id ? updatedNode : n)));
            // Add to pending updates for debounced save
            pendingNodeUpdates.current.set(change.id, updatedNode);
            debouncedSaveNodes();
          }
        } else if (change.type === 'remove') {
          deleteNodes({ seriesId, nodeIds: [change.id] });
        }
      });
    },
    [nodes, deleteNodes, seriesId, debouncedSaveNodes],
  );

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));

      // Track removals
      changes.forEach((change) => {
        if (change.type === 'remove') {
          deleteEdges({ seriesId, edgeIds: [change.id] });
        }
      });
    },
    [deleteEdges, seriesId],
  );

  // Handle new edge connections
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      // Prevent orphan edges - check that both nodes exist
      const hasSourceNode = nodes.some((n) => n.id === connection.source);
      const hasTargetNode = nodes.some((n) => n.id === connection.target);
      if (!hasSourceNode || !hasTargetNode) return;

      const newEdgeId = generateId();

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: newEdgeId,
            style: {
              stroke: DEFAULT_EDGE_STYLE.color,
              strokeWidth: DEFAULT_EDGE_STYLE.thickness,
            },
            data: {
              _id: newEdgeId,
              seriesId,
              color: DEFAULT_EDGE_STYLE.color,
              thickness: DEFAULT_EDGE_STYLE.thickness,
              edgeStyle: DEFAULT_EDGE_STYLE.edgeStyle,
            },
          },
          eds,
        ),
      );

      // Save immediately for new edges
      upsertEdges({
        seriesId,
        edges: [
          {
            _id: newEdgeId,
            seriesId,
            sourceId: connection.source,
            targetId: connection.target,
            color: DEFAULT_EDGE_STYLE.color,
            thickness: DEFAULT_EDGE_STYLE.thickness,
            edgeStyle: DEFAULT_EDGE_STYLE.edgeStyle,
          },
        ],
      });
    },
    [upsertEdges, seriesId, nodes],
  );

  // Handle canvas click for creating new nodes
  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (currentTool === 'select') return;

      // Get the canvas position from the click event
      const bounds = (event.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };

      // Map tool to node type
      const toolToNodeType: Partial<Record<CanvasTool, CanvasNodeType>> = {
        text: CANVAS_NODE_TYPES.text,
        shape: CANVAS_NODE_TYPES.shape,
        note: CANVAS_NODE_TYPES.note,
      };

      const nodeType = toolToNodeType[currentTool];
      if (!nodeType) return;

      const newNodeId = generateId();
      const defaultStyle = { ...DEFAULT_NODE_STYLES[nodeType] };

      // Apply selected shape type for shape nodes
      if (nodeType === CANVAS_NODE_TYPES.shape) {
        defaultStyle.shapeType = currentShapeType;
      }

      const newNode: CanvasNode = {
        id: newNodeId,
        type: nodeType,
        position,
        // Set explicit dimensions for NodeResizer
        width: defaultStyle.width,
        height: defaultStyle.height,
        data: {
          _id: newNodeId,
          seriesId,
          type: nodeType,
          content: '',
          style: defaultStyle,
        },
      };

      setNodes((nds) => [...nds, newNode]);

      // Save immediately
      upsertNodes({
        seriesId,
        nodes: [
          {
            _id: newNodeId,
            seriesId,
            type: nodeType,
            content: '',
            position,
            style: defaultStyle,
          },
        ],
      });

      // Reset to select tool after placing
      setCurrentTool('select');
    },
    [currentTool, currentShapeType, seriesId, setNodes, upsertNodes],
  );

  // Handle node double-click for editing
  const handleNodeDoubleClick: NodeMouseHandler<CanvasNode> = useCallback((_event, node) => {
    setEditingNode(node.data);
    setEditingNodePosition(node.position);
    setIsNodeEditorOpen(true);
  }, []);

  // Handle edge double-click for editing
  const handleEdgeDoubleClick: EdgeMouseHandler<Edge> = useCallback((_event, edge) => {
    const edgeData = edge.data as iCanvasEdgeData | undefined;
    if (edgeData) {
      setEditingEdge(edgeData);
      setEditingEdgeId(edge.id);
      setIsEdgeEditorOpen(true);
    }
  }, []);

  // Handle saving node edits from dialog
  const handleSaveNodeEdit = useCallback(
    (updates: {
      content: string;
      style: iCanvasNodeStyle;
      linkedEntityId?: string;
      linkedEntityType?: LinkedEntityType;
    }) => {
      if (!editingNode || !editingNodePosition) return;

      // Validate style before saving
      const validation = validateNodeStyle(updates.style);
      if (!validation.valid) {
        toastError('Invalid node style', validation.errors.join(', '));
        return;
      }

      // Update local state
      setNodes((nds) =>
        nds.map((n) =>
          n.id === editingNode._id
            ? {
                ...n,
                data: {
                  ...n.data,
                  content: updates.content,
                  style: updates.style,
                  linkedEntityId: updates.linkedEntityId,
                  linkedEntityType: updates.linkedEntityType,
                },
              }
            : n,
        ),
      );

      // Save to backend
      upsertNodes({
        seriesId,
        nodes: [
          {
            _id: editingNode._id,
            seriesId,
            type: editingNode.type,
            content: updates.content,
            position: editingNodePosition,
            style: updates.style,
            linkedEntityId: updates.linkedEntityId,
            linkedEntityType: updates.linkedEntityType,
          },
        ],
      });

      // Reset editing state
      setEditingNode(null);
      setEditingNodePosition(null);
    },
    [editingNode, editingNodePosition, seriesId, upsertNodes],
  );

  // Handle saving edge edits from dialog
  const handleSaveEdgeEdit = useCallback(
    (updates: { label?: string; color: string; thickness: number; edgeStyle: EdgeStyle }) => {
      if (!editingEdge || !editingEdgeId) return;

      // Get the edge to find source/target
      const edge = edges.find((e) => e.id === editingEdgeId);
      if (!edge) return;

      // Build stroke dasharray
      let strokeDasharray: string | undefined;
      if (updates.edgeStyle === EDGE_STYLES.dashed) {
        strokeDasharray = '5,5';
      } else if (updates.edgeStyle === EDGE_STYLES.dotted) {
        strokeDasharray = '2,2';
      }

      // Update local state
      setEdges((eds) =>
        eds.map((e) =>
          e.id === editingEdgeId
            ? {
                ...e,
                label: updates.label,
                style: {
                  stroke: updates.color,
                  strokeWidth: updates.thickness,
                  strokeDasharray,
                },
                data: {
                  ...e.data,
                  label: updates.label,
                  color: updates.color,
                  thickness: updates.thickness,
                  edgeStyle: updates.edgeStyle,
                },
              }
            : e,
        ),
      );

      // Save to backend
      upsertEdges({
        seriesId,
        edges: [
          {
            _id: editingEdgeId,
            seriesId,
            sourceId: edge.source,
            targetId: edge.target,
            label: updates.label,
            color: updates.color,
            thickness: updates.thickness,
            edgeStyle: updates.edgeStyle,
          },
        ],
      });

      // Reset editing state
      setEditingEdge(null);
      setEditingEdgeId(null);
    },
    [editingEdge, editingEdgeId, edges, seriesId, upsertEdges],
  );

  // Handle keyboard shortcuts (delete)
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter((node) => node.selected);
        const selectedEdges = edges.filter((edge) => edge.selected);

        if (selectedNodes.length > 0) {
          const nodeIds = selectedNodes.map((n) => n.id);
          setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
          deleteNodes({ seriesId, nodeIds });
        }

        if (selectedEdges.length > 0) {
          const edgeIds = selectedEdges.map((e) => e.id);
          setEdges((eds) => eds.filter((e) => !edgeIds.includes(e.id)));
          deleteEdges({ seriesId, edgeIds });
        }
      }
    },
    [nodes, edges, setNodes, setEdges, deleteNodes, deleteEdges, seriesId],
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading canvas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-destructive">Failed to load canvas</div>
      </div>
    );
  }

  const hasNodes = nodes.length > 0;

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="flex h-full flex-col" onKeyDown={handleKeyDown}>
      <CanvasToolbar
        currentTool={currentTool}
        onToolChange={setCurrentTool}
        currentShapeType={currentShapeType}
        onShapeTypeChange={setCurrentShapeType}
      />
      <div className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onPaneClick={handlePaneClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          onEdgeDoubleClick={handleEdgeDoubleClick}
          onMoveEnd={handleMoveEnd}
          nodeTypes={nodeTypes}
          fitView={!getStoredViewport(seriesId)}
          snapToGrid
          snapGrid={[16, 16]}
          defaultEdgeOptions={{
            style: { strokeWidth: 2 },
            type: 'smoothstep',
          }}
          className={currentTool === 'select' ? '' : 'cursor-crosshair'}
        >
          <Background gap={16} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as iCanvasNodeData;
              return data.style?.backgroundColor ?? '#3b82f6';
            }}
            maskColor="rgb(0, 0, 0, 0.1)"
          />
        </ReactFlow>

        {/* Empty state overlay */}
        {!hasNodes && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-lg border border-dashed bg-background/80 p-8 text-center backdrop-blur-sm">
              <h3 className="text-lg font-medium text-foreground">Your canvas is empty</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Select a tool from the toolbar and click on the canvas to add elements.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-muted px-2 py-1">T - Text</span>
                <span className="rounded bg-muted px-2 py-1">R - Shape</span>
                <span className="rounded bg-muted px-2 py-1">N - Note</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Node Editor Dialog */}
      <NodeEditorDialog
        open={isNodeEditorOpen}
        onOpenChange={setIsNodeEditorOpen}
        node={editingNode}
        seriesId={seriesId}
        onSave={handleSaveNodeEdit}
      />

      {/* Edge Editor Dialog */}
      <EdgeEditorDialog
        open={isEdgeEditorOpen}
        onOpenChange={setIsEdgeEditorOpen}
        edge={editingEdge}
        onSave={handleSaveEdgeEdit}
      />
    </div>
  );
}

// Wrapper component that provides ReactFlowProvider
export default function CanvasBoard({ seriesId }: iCanvasBoardProps) {
  return (
    <ReactFlowProvider>
      <CanvasBoardInner seriesId={seriesId} />
    </ReactFlowProvider>
  );
}
