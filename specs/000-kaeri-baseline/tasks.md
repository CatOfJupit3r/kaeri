# Tasks: Baseline (Cross-Cutting)

Domain-specific task lists now live alongside their specs:
- ../001-series/tasks.md
- ../002-scripts/tasks.md
- ../003-knowledge-base/tasks.md
- ../004-canvas/tasks.md
- ../005-export/tasks.md
- ../006-continuity/tasks.md

## Completed setup & foundational work (record)
- [x] T001-T003 Environment/quickstart readiness
- [x] T004-T012 Shared enums/contracts/models/DI/auth stance/telemetry skeleton

## Cross-cutting quality & observability
- [ ] **T043** Add structured logging for canon mutations and export paths (`apps/server/src/lib/logger` usage sites)
- [ ] **T044** Add performance telemetry reporting (`apps/server/src/lib/telemetry.ts`)
- [ ] **T045** Targeted tests across domains (contracts parity, continuity graph/audit, canvas persistence, export timing) in `apps/server/test/`
- [ ] **T046** Frontend integration tests/smoke or test plan in `specs/000-foundation-platform/quickstart.md`
- [ ] **T047** Document `bun run check-types` / `bun run lint` results in `specs/000-foundation-platform/quickstart.md`

## Polish & documentation
- [ ] **T048** Documentation updates for KB/canvas/export/continuity in README or feature docs
- [ ] **T049** Code cleanup/refactors after tests in touched files
- [ ] **T050** Validate backup/export JSON path and recovery steps in `specs/000-foundation-platform/quickstart.md`
