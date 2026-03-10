import z from 'zod';

// Canvas node types
export const canvasNodeTypesSchema = z.enum(['text', 'shape', 'note']);
export const CANVAS_NODE_TYPES = canvasNodeTypesSchema.enum;
export type CanvasNodeType = z.infer<typeof canvasNodeTypesSchema>;

// Canvas tool types for the toolbar
export const canvasToolsSchema = z.enum(['select', 'text', 'shape', 'note', 'line']);
export const CANVAS_TOOLS = canvasToolsSchema.enum;
export type CanvasTool = z.infer<typeof canvasToolsSchema>;

// Shape subtypes for shape nodes
export const shapeTypesSchema = z.enum(['rectangle', 'circle', 'triangle']);
export const SHAPE_TYPES = shapeTypesSchema.enum;
export type ShapeType = z.infer<typeof shapeTypesSchema>;

// Edge style types
export const edgeStylesSchema = z.enum(['solid', 'dashed', 'dotted']);
export const EDGE_STYLES = edgeStylesSchema.enum;
export type EdgeStyle = z.infer<typeof edgeStylesSchema>;

// Linked entity types for KB integration
export const linkedEntityTypesSchema = z.enum(['character', 'location', 'scene', 'script', 'theme', 'storyArc']);
export const LINKED_ENTITY_TYPES = linkedEntityTypesSchema.enum;
export type LinkedEntityType = z.infer<typeof linkedEntityTypesSchema>;

// Canvas node style - uses Record<string, unknown> for contract compatibility
export interface iCanvasNodeStyle extends Record<string, unknown> {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  width?: number;
  height?: number;
  shapeType?: ShapeType;
}

// Canvas node data shape for ReactFlow
export interface iCanvasNodeData extends Record<string, unknown> {
  _id: string;
  seriesId: string;
  type: CanvasNodeType;
  content: string;
  style?: iCanvasNodeStyle;
  linkedEntityId?: string;
  linkedEntityType?: LinkedEntityType;
}

// Canvas edge data shape for ReactFlow
export interface iCanvasEdgeData extends Record<string, unknown> {
  _id: string;
  seriesId: string;
  label?: string;
  color?: string;
  thickness?: number;
  edgeStyle?: EdgeStyle;
}

// Canvas viewport state
export interface iCanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

// Default styles for new nodes
export const DEFAULT_NODE_STYLES: Record<CanvasNodeType, iCanvasNodeStyle> = {
  [CANVAS_NODE_TYPES.text]: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    textColor: '#1a1a1a',
    width: 200,
    height: 60,
  },
  [CANVAS_NODE_TYPES.shape]: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
    textColor: '#ffffff',
    width: 120,
    height: 120,
    shapeType: SHAPE_TYPES.rectangle,
  },
  [CANVAS_NODE_TYPES.note]: {
    backgroundColor: '#fef08a',
    borderColor: '#facc15',
    textColor: '#1a1a1a',
    width: 200,
    height: 150,
  },
};

// Default edge style
export const DEFAULT_EDGE_STYLE = {
  color: '#94a3b8',
  thickness: 2,
  edgeStyle: EDGE_STYLES.solid,
} as const;

// Validation helpers
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export function isValidHexColor(color: string): boolean {
  return HEX_COLOR_REGEX.test(color);
}

export function isValidShapeType(shapeType: string): shapeType is ShapeType {
  return Object.values(SHAPE_TYPES).includes(shapeType as ShapeType);
}

export function isValidEdgeStyle(edgeStyle: string): edgeStyle is EdgeStyle {
  return Object.values(EDGE_STYLES).includes(edgeStyle as EdgeStyle);
}

export interface iValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateNodeStyle(style: iCanvasNodeStyle): iValidationResult {
  const errors: string[] = [];

  if (style.backgroundColor && !isValidHexColor(style.backgroundColor)) {
    errors.push(`Invalid background color: ${style.backgroundColor}`);
  }
  if (style.borderColor && !isValidHexColor(style.borderColor)) {
    errors.push(`Invalid border color: ${style.borderColor}`);
  }
  if (style.textColor && !isValidHexColor(style.textColor)) {
    errors.push(`Invalid text color: ${style.textColor}`);
  }
  if (style.shapeType && !isValidShapeType(style.shapeType)) {
    errors.push(`Invalid shape type: ${style.shapeType}`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateEdgeStyle(color?: string, edgeStyle?: string): iValidationResult {
  const errors: string[] = [];

  if (color && !isValidHexColor(color)) {
    errors.push(`Invalid edge color: ${color}`);
  }
  if (edgeStyle && !isValidEdgeStyle(edgeStyle)) {
    errors.push(`Invalid edge style: ${edgeStyle}`);
  }

  return { valid: errors.length === 0, errors };
}
