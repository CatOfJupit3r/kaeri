# Tasks: Export

Status snapshot: router and service exist but PDF export is stubbed (`apps/server/src/routers/export.router.ts`, `apps/server/src/features/export/export.service.ts`); JSON export works, UI absent.

## To complete the spec

### Export Backend (P1)
- [ ] **T035** Implement PDF export with screenplay formatting using pdf-lib (`apps/server/src/routers/export.router.ts`, `apps/server/src/features/export/export.service.ts`).
  - Scene heading detection and formatting
  - Streaming support for large scripts
  - Real PDF generation replacing stub

- [ ] **T036** Add additional export formats (`apps/server/src/features/export/export.service.ts`).
  - Final Draft (.fdx) XML format for industry compatibility
  - Production script PDF with scene numbers and marks
  - Call sheet format with character/location breakdowns
  - Plain text export option

- [ ] **T037** Implement export options (`apps/server/src/features/export/export-options.ts`).
  - `includeSceneNumbers` boolean option
  - `includeRevisionMarks` boolean option
  - Options passed to formatters and applied during generation

### Export UI (P1)
- [ ] **T038** Build export modal matching V0 design (`apps/web/src/features/scripts/components/export-modal.tsx`).
  - Dialog with format selection via radio group (PDF, FDX, Production, Call Sheet, Text)
  - Format icons and descriptions (FileText, Share2, Download, Clipboard, Calendar)
  - Options checkboxes (scene numbers, revision marks)
  - Script name in description
  - Cancel and Export buttons
  - Progress indicator during export

- [ ] **T039** Add export action in script editor toolbar (`apps/web/src/features/scripts/components/split-editor.tsx`).
  - Export button in toolbar
  - Opens export modal
  - Export mutation hook with progress/error handling

### Testing
- [ ] **T045-Export** Targeted export tests (PDF timing/format, JSON shape, FDX validation) once test infra is unblocked.

## Completed
- _None yet; router/service stubs exist but require full PDF implementation._
