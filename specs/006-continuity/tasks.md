# Tasks: Continuity and Audit

Status snapshot: continuity graph and audit list service exists (`apps/server/src/features/continuity/continuity.service.ts`); audit logging middleware and all frontend views are missing.

## To complete the spec

### Audit Logging (P1)
- [ ] **T040** Add audit logging middleware/util invoked from canon mutations (`apps/server/src/lib/audit-logger.ts`).
  - Log all mutations to knowledge base entities
  - Capture user, timestamp, entity type, action
  - Store in audit log collection

### Continuity Graph UI (P1)
- [ ] **T041** Build continuity graph visualization matching V0 design (`apps/web/src/features/continuity/continuity-graph.tsx`).
  - Network/force-directed layout using D3 or React Flow
  - Entity nodes with type-specific icons and colors (Characters, Locations, Props, Themes, Story Arcs, Scenes)
  - Relationship edges with type indicators
  - Zoom and pan controls
  - Node filtering by entity type
  - Edge type legend
  - Node hover tooltip with entity preview
  - Click on node opens entity detail view
  - Performance: handle 100+ nodes under 1s load time

- [ ] **T041b** Integrate continuity graph with KB Graph view mode
  - Continuity graph provides data source for KB Graph view
  - Graph tab in knowledge base right panel
  - Graph inherits series context

### Audit History UI (P1)
- [ ] **T042** Add audit history UI (`apps/web/src/features/continuity/audit-log.tsx`).
  - Chronological list of entity changes
  - Filter by entity type, user, date range
  - Detailed change diffs
  - Navigation to current entity state

### Testing
- [ ] **T045-Continuity** Targeted tests for graph generation and audit logging once test infra is unblocked.

## Completed
- [x] **T039** Add continuity graph resolver (`apps/server/src/features/continuity/continuity.service.ts`).
