# Tasks: Canvas

Status snapshot: backend router/service implemented (`apps/server/src/routers/canvas.router.ts`, `apps/server/src/features/canvas/canvas.service.ts`). Frontend canvas UI and hooks are not started.

## To complete the spec
- [ ] **T033** Build canvas UI (pan, text, shapes, lines) (`apps/web/src/features/canvas/components/canvas-board.tsx`).
- [ ] **T034** Add canvas state hooks and persistence wiring (`apps/web/src/features/canvas/hooks/use-canvas.ts`).
- [ ] **T045-Canvas** Targeted tests for canvas persistence/bulk updates when test infra is available.

## Completed
- [x] **T031** Implement canvas endpoints (get/upsert/delete) (`apps/server/src/routers/canvas.router.ts`).
- [x] **T032** Add canvas service with per-series persistence (`apps/server/src/features/canvas/canvas.service.ts`).
