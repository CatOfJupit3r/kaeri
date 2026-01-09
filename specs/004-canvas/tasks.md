# Tasks: Canvas

Status snapshot: backend router/service implemented (`apps/server/src/routers/canvas.router.ts`, `apps/server/src/features/canvas/canvas.service.ts`). Frontend canvas UI and hooks are not started.

## To complete the spec

### Core Canvas (P1)
- [ ] **T033** Build canvas UI with tools, pan, zoom, and rendering (`apps/web/src/features/canvas/components/canvas-board.tsx`).
  - Canvas board component with pan/zoom controls
  - Element rendering (text, rectangles, circles, lines)
  - Click/drag interaction handling
  - Canvas tab integration in script editor right panel
  - Canvas state persists when switching tabs
  - Series context inheritance

- [ ] **T034** Implement canvas tools matching V0 design (`apps/web/src/features/canvas/components/canvas-toolbar.tsx`).
  - Select/Move tool (GripVertical icon)
  - Text tool (Type icon)
  - Rectangle tool (Square icon)
  - Circle tool (Circle icon)
  - Line tool (Minus icon)
  - Tool selection state with visual feedback
  - Tool button group with active state styling

- [ ] **T035** Add canvas state hooks and persistence wiring (`apps/web/src/features/canvas/hooks/use-canvas.ts`).
  - Element CRUD operations
  - Debounced autosave for bulk updates
  - Optimistic updates for element manipulation

### Testing
- [ ] **T045-Canvas** Targeted tests for canvas persistence/bulk updates when test infra is available.

## Completed
- [x] **T031** Implement canvas endpoints (get/upsert/delete) (`apps/server/src/routers/canvas.router.ts`).
- [x] **T032** Add canvas service with per-series persistence (`apps/server/src/features/canvas/canvas.service.ts`).
