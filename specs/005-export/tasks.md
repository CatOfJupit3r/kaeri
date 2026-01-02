# Tasks: Export

Status snapshot: router and service exist but PDF export is stubbed (`apps/server/src/routers/export.router.ts`, `apps/server/src/features/export/export.service.ts`); JSON export works, UI absent.

## To complete the spec
- [ ] **T035** Implement export contract/handler with real PDF generation using pdf-lib (`apps/server/src/routers/export.router.ts`).
- [ ] **T036** Add export service + formatter for PDF and JSON (streaming, scene heading detection) (`apps/server/src/features/export/export.service.ts`).
- [ ] **T037** Add export UI action in script editor toolbar (`apps/web/src/features/scripts/components/split-editor.tsx`).
- [ ] **T038** Add export mutation hook with progress/error handling (`apps/web/src/features/scripts/hooks/use-export-script.ts`).
- [ ] **T045-Export** Targeted export tests (PDF timing/format, JSON shape) once test infra is unblocked.

## Completed
- _None yet; router/service stubs exist but require full PDF implementation._
