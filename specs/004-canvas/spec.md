# Feature Specification: Canvas

**Feature Branch**: `[canvas-domain]`  
**Created**: 2026-01-02  
**Status**: Draft  
**Input**: Series-scoped visual canvas for brainstorming with nodes, edges, pan, and zoom

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Canvas for Story Structuring (Priority: P3)
A writer uses the canvas to place notes or shapes and link ideas while drafting a series.

**Why this priority**: Supports brainstorming and structuring.

**Independent Test**: Nodes and edges can be created, moved, styled, and saved per series; pan/zoom navigation works; state reloads accurately.

**Acceptance Scenarios**:
1. Given a series, when the user opens Canvas, then tools for text, shapes, and lines are available and state persists after reload.
2. Given placed nodes, when reconnecting later, then nodes and connections reload for that series.

### Edge Cases
- Orphan edges are blocked when source or target nodes are missing.
- Bulk drag updates debounce saves to avoid flooding the backend.
- Large canvases (100+ nodes/edges) remain usable with <500ms load on reload.
- Invalid color or shape inputs are rejected with clear validation errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-006**: System MUST allow canvas nodes (text, shapes, sticky) and edges with pan/zoom, persisted per Series.
- **FR-010**: System MUST maintain canonical IDs for nodes and edges to avoid duplicates.

### Key Entities *(include if feature involves data)*

- **CanvasNode**: id (UUID), seriesId, type (`text` | `shape` | `sticky`), label, x, y, width, height, backgroundColor, borderColor, textColor, shapeType, linkedEntityId, linkedEntityType, createdAt, updatedAt.
- **CanvasEdge**: id (UUID), seriesId, sourceNodeId, targetNodeId, label, color, thickness, style, createdAt, updatedAt.
- **CanvasViewport**: seriesId, panX, panY, zoom (client state persisted per series).

### Constitution Alignment

- Contracts: oRPC procedures in `packages/shared/src/contract/canvas.contract.ts` define nodes and edges before handlers/UI.
- Canonical continuity: Series-scoped UUIDs; linkedEntityId references KB or scripts and enforce referential integrity.
- Access and collaboration: Auth required; NOT_FOUND stance for hidden series or linked entities; future collaboration not yet scoped.
- Quality gates: `bun run check-types`, `bun run lint`, and canvas CRUD tests (blocked by Mongo memory server download issue).
- Observability and recovery: Add structured logging for bulk updates and edge creation; consider rate limiting for drag floods.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Canvas loads 100+ nodes and edges per series in under 500ms on reload and allows drag operations without lag (debounced save within 1s).
