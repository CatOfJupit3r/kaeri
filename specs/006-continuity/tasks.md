# Tasks: Continuity and Audit

Status snapshot: continuity graph and audit list service exists (`apps/server/src/features/continuity/continuity.service.ts`); audit logging middleware and all frontend views are missing.

## To complete the spec
- [ ] **T040** Add audit logging middleware/util invoked from canon mutations (`apps/server/src/lib/audit-logger.ts`).
- [ ] **T041** Add continuity graph UI (`apps/web/src/features/continuity/continuity-graph.tsx`).
- [ ] **T042** Add audit history UI (`apps/web/src/features/continuity/audit-log.tsx`).
- [ ] **T045-Continuity** Targeted tests for graph generation and audit logging once test infra is unblocked.

## Completed
- [x] **T039** Add continuity graph resolver (`apps/server/src/features/continuity/continuity.service.ts`).
