# Tasks: Script Authoring

Status snapshot: backend CRUD/autosave handlers and services exist (`apps/server/src/routers/scripts.router.ts`, `apps/server/src/features/scripts/scripts.service.ts`). No script UI or hooks are present.

## To complete the spec
- [ ] **T020** Add script list/grid under series route (`apps/web/src/routes/_auth_only/series/$seriesId/scripts.tsx`).
- [ ] **T021** Build split editor layout with block-based editor (left) and KB/Canvas panel (right) (`apps/web/src/features/scripts/components/split-editor-layout.tsx`).
- [ ] **T022** Implement block-based text editor with 6 block types, dropdowns, and keyboard navigation (`apps/web/src/features/scripts/components/script-block-editor.tsx`).
- [ ] **T023** Add block parsing/serialization utilities (`apps/web/src/features/scripts/utils/block-parser.ts`).
- [ ] **T024** Implement autocomplete for characters/locations within blocks (`apps/web/src/features/scripts/components/block-autocomplete.tsx`).
- [ ] **T025** Add autosave + manual save hooks with block serialization (`apps/web/src/features/scripts/hooks/use-save-script.ts`).
- [ ] **T026** Implement "Add Block" section with suggestions (`apps/web/src/features/scripts/components/add-block-section.tsx`).
- [ ] **T045-Scripts** Targeted tests for script CRUD/autosave and block parsing once test infra is unblocked.

## Completed
- [x] **T018** Implement script CRUD + saveContent handlers (`apps/server/src/routers/scripts.router.ts`).
- [x] **T019** Implement script service with autosave + lastEditedAt updates (`apps/server/src/features/scripts/scripts.service.ts`).
