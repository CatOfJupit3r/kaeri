# Concrete Tasks: Continuity and Audit

Continuity domain has no sessions in original TASK_BREAKDOWN.md (deferred post-MVP). Creating session plan for audit logger, graph UI, and audit UI.

---

## Session CO1.1: Audit Logger Utility
**Goal**: Implement audit logging middleware for canon mutations  
**Estimated Time**: 60-75 minutes

**Deliverables**:
1. Create audit logger utility: `apps/server/src/lib/audit-logger.ts`
   - Function: `logAuditEntry(seriesId, entityType, entityId, action, changes?, userId?)`
   - Write to AuditEntry model asynchronously (non-blocking)
   - Include before/after values in changes field
   - Capture userId from auth context (if available)

2. Integrate into services:
   - SeriesService: create, update, delete
   - ScriptService: create, update, delete, saveContent
   - KnowledgeBaseService: all entity create/update/delete operations
   - CanvasService: node/edge upsert/delete

3. Ensure NOT_FOUND stance preserved (log after validation)

**Acceptance Criteria**:
- AuditLogger utility implemented and testable
- Integrated into all canon-affecting services
- Logging is non-blocking and async
- before/after changes captured correctly
- userId captured when available

**Files to Create**:
- `apps/server/src/lib/audit-logger.ts`

**Files to Update**:
- `apps/server/src/features/series/series.service.ts` (add audit logging)
- `apps/server/src/features/scripts/scripts.service.ts` (add audit logging)
- `apps/server/src/features/knowledge-base/knowledge-base.service.ts` (add audit logging)
- `apps/server/src/features/canvas/canvas.service.ts` (add audit logging)

---

## Session CO1.2: Continuity Graph UI - Graph Rendering
**Goal**: Build continuity graph visualization with ReactFlow  
**Estimated Time**: 90-120 minutes

**Deliverables**:
1. Install ReactFlow (if not already installed): `bun add reactflow`

2. Create continuity graph component: `apps/web/src/features/continuity/components/continuity-graph.tsx`
   - Use ReactFlow for rendering
   - Node types: Character (circle), Location (square), Prop (diamond), Script (hexagon), Timeline (star)
   - Edge types: Relationship (solid), Appearance (dashed), Reference (dotted)
   - Pan and zoom enabled
   - Load graph data from continuity service

3. Create custom node components for each entity type
   - Show entity name and icon
   - Color-coded by type

**Acceptance Criteria**:
- Graph renders nodes and edges from backend
- Pan and zoom work correctly
- Node types visually distinct (shape/color)
- Edge types visually distinct (line style)

**Files to Create**:
- `apps/web/src/features/continuity/components/continuity-graph.tsx`
- `apps/web/src/features/continuity/components/graph-node.tsx`

---

## Session CO1.3: Continuity Graph UI - Filters & Legend
**Goal**: Add filters and legend to graph UI  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Add legend component:
   - Show node type meanings (Character, Location, etc.)
   - Show edge type meanings (Relationship, Appearance, etc.)
   - Toggle visibility per type

2. Add filter controls:
   - Checkboxes to toggle node types on/off
   - Checkboxes to toggle edge types on/off
   - Reset filter button

3. Implement filtering logic:
   - Hide/show nodes based on filter
   - Hide/show edges based on filter

**Acceptance Criteria**:
- Legend displays all node/edge types
- Filters toggle visibility correctly
- Reset button works
- UI is clear and accessible

**Files to Update**:
- `apps/web/src/features/continuity/components/continuity-graph.tsx` (add legend/filters)

---

## Session CO1.4: Continuity Graph Route & Navigation
**Goal**: Create continuity graph route and integrate with series navigation  
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Create route: `apps/web/src/routes/_auth_only/series/$seriesId/continuity/graph.tsx`
   - Render continuity-graph component
   - Load graph for seriesId
   - Breadcrumb: Series > Continuity > Graph

2. Create query hook: `apps/web/src/features/continuity/hooks/use-continuity-graph.ts`
   - Use `tanstackRPC.continuity.continuityGraph`
   - Load graph data for series

3. Add Continuity link to series navigation
   - Add Continuity tab/button in series detail
   - Link to graph route

**Acceptance Criteria**:
- Route accessible at `/series/{seriesId}/continuity/graph`
- Graph loads nodes/edges for correct series
- Navigation from series to continuity works

**Files to Create**:
- `apps/web/src/routes/_auth_only/series/$seriesId/continuity/graph.tsx`
- `apps/web/src/features/continuity/hooks/use-continuity-graph.ts`

**Files to Update**:
- Series navigation to add Continuity link

---

## Session CO1.5: Audit Log UI - Table & Filters
**Goal**: Build audit log table with filters and pagination  
**Estimated Time**: 60-75 minutes

**Deliverables**:
1. Create audit log component: `apps/web/src/features/continuity/components/audit-log.tsx`
   - Table with columns: Timestamp, Entity Type, Entity Name, Action, User (future), Changes
   - Expandable rows to view full change details (before/after)
   - Pagination controls (50 entries per page)

2. Add filter controls:
   - Filter by entity type (dropdown)
   - Filter by action (Create/Update/Delete dropdown)
   - Filter by date range (date pickers)
   - Reset filters button

3. Create query hook: `apps/web/src/features/continuity/hooks/use-audit-log.ts`
   - Use `tanstackRPC.continuity.auditListBySeries`
   - Support filter params (entityType, action, dateRange)
   - Pagination support (limit, offset)

**Acceptance Criteria**:
- Table displays audit entries with all columns
- Rows expand to show change details
- Filters work correctly
- Pagination works (50/page)
- Loading and empty states handled

**Files to Create**:
- `apps/web/src/features/continuity/components/audit-log.tsx`
- `apps/web/src/features/continuity/hooks/use-audit-log.ts`

---

## Session CO1.6: Audit Log Route & Navigation
**Goal**: Create audit log route and integrate with continuity navigation  
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Create route: `apps/web/src/routes/_auth_only/series/$seriesId/continuity/audit.tsx`
   - Render audit-log component
   - Load audit log for seriesId
   - Breadcrumb: Series > Continuity > Audit Log

2. Add tab/navigation between Graph and Audit Log
   - Tabs: Graph, Audit Log
   - Tab navigation in continuity route

**Acceptance Criteria**:
- Route accessible at `/series/{seriesId}/continuity/audit`
- Audit log loads entries for correct series
- Tab navigation between Graph and Audit works

**Files to Create**:
- `apps/web/src/routes/_auth_only/series/$seriesId/continuity/audit.tsx`

**Files to Update**:
- Continuity navigation to add tabs

---

## Session CO1.7: Graph Interaction - Click to Entity Detail
**Goal**: Add click-through from graph nodes to entity detail pages  
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Add click handler to graph nodes
   - Click character node  navigate to character detail
   - Click location node  navigate to location detail
   - Click script node  navigate to script editor
   - Click other entity nodes  show detail modal or navigate

2. Add hover tooltip to nodes
   - Show entity name and type on hover

**Acceptance Criteria**:
- Clicking node navigates to appropriate detail page
- Hover shows entity name/type
- Navigation preserves context (breadcrumb works)

**Files to Update**:
- `apps/web/src/features/continuity/components/continuity-graph.tsx` (add click handlers)

---

## Session CO1.8: Audit Log - Search & Export (Optional Polish)
**Goal**: Add search and CSV export to audit log  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Add search input to audit log
   - Search by entity name (fuzzy match)
   - Debounced search (300ms)
   - Clear search button

2. Add CSV export button
   - Export filtered audit log to CSV
   - Include all columns (timestamp, entity, action, changes)
   - Trigger browser download

**Acceptance Criteria**:
- Search filters audit log by entity name
- CSV export downloads filtered results
- Export includes all visible columns

**Files to Update**:
- `apps/web/src/features/continuity/components/audit-log.tsx` (add search/export)
