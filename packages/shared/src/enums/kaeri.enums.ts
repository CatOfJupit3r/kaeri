import z from 'zod';

// Entity Types for continuity graph and audit
export const entityTypeSchema = z.enum([
  'SERIES',
  'SCRIPT',
  'CHARACTER',
  'LOCATION',
  'PROP',
  'TIMELINE_ENTRY',
  'WILDCARD',
  'CANVAS_NODE',
  'CANVAS_EDGE',
]);
export const ENTITY_TYPES = entityTypeSchema.enum;
export type EntityType = z.infer<typeof entityTypeSchema>;

// Relationship Types between characters
export const relationshipTypeSchema = z.enum([
  'FAMILY',
  'FRIEND',
  'ENEMY',
  'ROMANTIC',
  'PROFESSIONAL',
  'MENTOR',
  'OTHER',
]);
export const RELATIONSHIP_TYPES = relationshipTypeSchema.enum;
export type RelationshipType = z.infer<typeof relationshipTypeSchema>;

// Canvas Node Types
export const canvasNodeTypeSchema = z.enum(['text', 'shape', 'note']);
export const CANVAS_NODE_TYPES = canvasNodeTypeSchema.enum;
export type CanvasNodeType = z.infer<typeof canvasNodeTypeSchema>;

// Export Formats
export const exportFormatSchema = z.enum(['PDF', 'JSON', 'FDX']);
export const EXPORT_FORMATS = exportFormatSchema.enum;
export type ExportFormat = z.infer<typeof exportFormatSchema>;

// Audit Actions
export const auditActionSchema = z.enum(['CREATE', 'UPDATE', 'DELETE']);
export const AUDIT_ACTIONS = auditActionSchema.enum;
export type AuditAction = z.infer<typeof auditActionSchema>;

// Continuity Edge Types
export const continuityEdgeTypeSchema = z.enum(['relationship', 'appearance', 'location-of', 'prop-in-scene']);
export const CONTINUITY_EDGE_TYPES = continuityEdgeTypeSchema.enum;
export type ContinuityEdgeType = z.infer<typeof continuityEdgeTypeSchema>;
