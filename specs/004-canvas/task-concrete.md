# Concrete Tasks: Canvas

Canvas domain has no sessions in original TASK_BREAKDOWN.md (deferred post-MVP). Creating minimal session plan.

---

## Session CV1.1: Canvas Hooks & API Integration
**Goal**: Create query/mutation hooks for canvas CRUD  
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Create canvas hooks:
   - `apps/web/src/features/canvas/hooks/use-canvas.ts` - query hook for getCanvas
   - `apps/web/src/features/canvas/hooks/use-upsert-nodes.ts` - mutation for nodes
   - `apps/web/src/features/canvas/hooks/use-upsert-edges.ts` - mutation for edges
   - `apps/web/src/features/canvas/hooks/use-delete-nodes.ts` - mutation
   - `apps/web/src/features/canvas/hooks/use-delete-edges.ts` - mutation

2. Add optimistic updates and debouncing for bulk drag operations
   - Debounce to <1s for drag/move actions

**Acceptance Criteria**:
- Hooks call tanstackRPC.canvas endpoints correctly
- Optimistic updates work for all mutations
- Debouncing prevents save flooding during drag

**Files to Create**:
- `apps/web/src/features/canvas/hooks/use-canvas.ts`
- `apps/web/src/features/canvas/hooks/use-upsert-nodes.ts`
- `apps/web/src/features/canvas/hooks/use-upsert-edges.ts`
- `apps/web/src/features/canvas/hooks/use-delete-nodes.ts`
- `apps/web/src/features/canvas/hooks/use-delete-edges.ts`

---

## Session CV1.2: Canvas Board Component with Basic Rendering
**Goal**: Build canvas board with node/edge rendering using ReactFlow  
**Estimated Time**: 90-120 minutes

**Deliverables**:
1. Install ReactFlow: `bun add reactflow`

2. Create canvas board component: `apps/web/src/features/canvas/components/canvas-board.tsx`
   - Use ReactFlow for rendering
   - Node types: text, rectangle, circle, triangle, sticky
   - Edge types: solid, dashed, dotted
   - Pan and zoom enabled
   - Load nodes/edges from canvas hook

3. Create custom node components for each type
   - Text node, shape nodes, sticky note node
   - Support styling (backgroundColor, borderColor, etc.)

**Acceptance Criteria**:
- Canvas renders nodes and edges from backend
- Pan and zoom work correctly
- Nodes display with correct types and styling

**Files to Create**:
- `apps/web/src/features/canvas/components/canvas-board.tsx`
- `apps/web/src/features/canvas/components/nodes/text-node.tsx`
- `apps/web/src/features/canvas/components/nodes/shape-node.tsx`
- `apps/web/src/features/canvas/components/nodes/sticky-node.tsx`

---

## Session CV1.3: Canvas Toolbar & Node/Edge Creation
**Goal**: Add toolbar for creating nodes and edges  
**Estimated Time**: 60-75 minutes

**Deliverables**:
1. Create canvas toolbar: `apps/web/src/features/canvas/components/canvas-toolbar.tsx`
   - Buttons: Select, Text, Rectangle, Circle, Triangle, Sticky, Line, Delete, Undo/Redo (stub)
   - Tool selection state management

2. Implement node creation
   - Click tool, then click canvas to place node
   - Generate UUID for new nodes
   - Call upsertNodes mutation

3. Implement edge creation
   - Select line tool, drag from source to target node
   - Generate UUID for new edges
   - Call upsertEdges mutation

**Acceptance Criteria**:
- Toolbar displays all tool buttons
- Can select tools and create nodes by clicking canvas
- Can create edges by dragging between nodes
- Created nodes/edges persist to backend

**Files to Create**:
- `apps/web/src/features/canvas/components/canvas-toolbar.tsx`

**Files to Update**:
- `apps/web/src/features/canvas/components/canvas-board.tsx` (integrate toolbar and creation logic)

---

## Session CV1.4: Canvas Node Editing & Deletion
**Goal**: Enable editing and deleting nodes/edges  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Add selection support
   - Click node/edge to select
   - Show selection highlight
   - Multi-select with Ctrl+click (optional)

2. Add delete functionality
   - Delete key or toolbar button deletes selected
   - Call deleteNodes or deleteEdges mutations
   - Remove from canvas immediately (optimistic)

3. Add node editing
   - Double-click node to edit label/content
   - Inline textarea or modal
   - Save calls upsertNodes

**Acceptance Criteria**:
- Can select nodes and edges
- Delete key or button removes selected items
- Double-click node opens editor
- Changes persist to backend

**Files to Update**:
- `apps/web/src/features/canvas/components/canvas-board.tsx` (selection, delete, edit)

---

## Session CV1.5: Canvas Route & Integration
**Goal**: Create canvas route and integrate with series navigation  
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Create route: `apps/web/src/routes/_auth_only/series/$seriesId/canvas.tsx`
   - Render canvas-board component
   - Load canvas for seriesId
   - Breadcrumb: Series > Canvas

2. Add Canvas link to series navigation
   - Add Canvas tab/button in series detail or KB page
   - Link to canvas route

**Acceptance Criteria**:
- Route accessible at `/series/{seriesId}/canvas`
- Canvas loads nodes/edges for correct series
- Navigation from series detail to canvas works

**Files to Create**:
- `apps/web/src/routes/_auth_only/series/$seriesId/canvas.tsx`

**Files to Update**:
- Series/KB navigation to add Canvas link

---

## Session CV1.6: Canvas Validation & Error Handling
**Goal**: Add validation for colors, shapes, orphan edges  
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Add client-side validation
   - Validate hex colors before save
   - Validate shapeType enum values
   - Block orphan edges (source/target must exist)

2. Add error handling
   - Show toast on validation errors
   - Retry failed mutations
   - Handle NOT_FOUND for missing series

**Acceptance Criteria**:
- Invalid colors/shapes rejected with error messages
- Orphan edges prevented or cleaned up
- Error toasts appear for failures

**Files to Update**:
- Canvas board and hooks (add validation logic)
