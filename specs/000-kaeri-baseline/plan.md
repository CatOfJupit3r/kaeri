# Implementation Plan: Foundation Platform

**Branch**: `[000-foundation-platform]` | **Date**: 2026-01-01 | **Spec**: ../000-foundation-platform/spec.md
**Input**: Feature specification from `/specs/000-foundation-platform/spec.md`

## Summary

Deliver the foundation platform features for Kaeri (a screenwriting tool) in single-user mode: writers can create/manage a Series, author scripts in a split-screen editor, manage knowledge base entities (characters, locations, props, timeline, wild cards), view character detail/appearances, use a per-series canvas, and export scripts to PDF with basic screenplay formatting. PC-only UX focus; future multi-user workspaces are out-of-scope but data model should stay multi-user-ready (canonical IDs, auth gates).

## Technical Context

**Language/Version**: TypeScript (Bun 1.2.21 toolchain), React 19 frontend, Node/Bun server with Hono + oRPC + Mongoose/Typegoose.  
**Primary Dependencies**: Hono/oRPC, Mongoose/Typegoose, Better Auth, TanStack Router/Query/Form, Vite, Tailwind, Sonner.  
**Storage**: MongoDB (Docker-backed).  
**Testing**: Bun test setup; commands `bun run check-types`, `bun run lint`, targeted tests per feature.  
**Target Platform**: Desktop web (PC-only focus).  
**Project Type**: Web app + API (monorepo: `apps/server`, `apps/web`, shared contracts).  
**Performance Goals**: KB search <300ms backend on ~500 entities; series/script load <2s; PDF export <5s for 120-page script.  
**Constraints**: Continuity integrity, canonical IDs, authenticated-only access (single-user now), future-ready for multi-user roles; avoid mobile responsiveness for now.  
**Scale/Scope**: Single series per user initially; data shapes must support multi-series and multi-user later without breaking IDs.

## Constitution Check

- Contract-first: list required oRPC procedures for Series, Script, Knowledge Base (characters/locations/props/timeline/wild cards), Canvas, Export; add shared zod schemas + enums; ensure exports via `CONTRACT` before handlers/UI.
- Canon continuity: ensure series-scoped canonical IDs; enforce referential integrity for relationships/appearances/timeline ordering; prevent orphan deletes or mark clearly.
- Collaboration & access: auth required; hide non-accessible resources via NOT_FOUND; design roles for future (writer/editor/viewer) but gate to single-user now.
- Quality gates: `bun run check-types`, `bun run lint`, targeted API/UI tests for continuity flows, appearances, and export; deterministic fixtures.
- Observability & recovery: structured logging around contract calls and canon mutations; export/backup path (JSON + PDF) as interim recovery; plan migrations with reversible steps.

## Contract & Data Scope (draft)

- Series: create/update/delete/list, settings, lastEditedAt; export series summary.
- Scripts: CRUD, content save/autosave, lastEditedAt, metadata (authors/genre/logline/cover), list by series, export to PDF.
- Knowledge Base: characters/locations/props/timeline/wild cards CRUD; search across all; relationships between characters; appearances linking to scripts/scenes; variations per script.
- Canvas: per-series node/edge CRUD; persistence and retrieval.
- Export: PDF generation (screenplay-friendly formatting), JSON backup for series + KB.
- Auth: single-user baseline; enforce NOT_FOUND stance for inaccessible resources.
- Shared Enums/Schemas: entity types, relationship types, appearance references, timeline order, export formats, error codes.
- Continuity Graph & Provenance: endpoints to surface per-series continuity graph (characters/locations/props/scenes) and change history for canonical attributes with authorship/timestamps.

## Architecture & Implementation Notes

- Backend: oRPC contracts in `packages/shared`; Hono routers in `apps/server/src/routers`; services under `apps/server/src/features`; Typegoose models per entity; structured logging around canon mutations; PDF export service (server-side).
- Frontend: Vite/React 19; routes under `apps/web/src/routes`; feature modules under `apps/web/src/features/<domain>`; TanStack Query hooks generated from oRPC; split editor layout (text left, KB/canvas right) optimized for desktop; no mobile breakpoints required.
- Data integrity: series-scoped IDs; cascading protections on delete; timeline ordering enforced in schema/handler; optimistic UI for KB edits where safe; reserve workspace/role fields for future multi-user without changing IDs.
- Performance: search indices on name/title for KB entities; pagination/virtualization for large KB; debounced search.
- Export: basic screenplay formatting (scene headings detection, dialogue indentation) with monospace; aim for sub-5s for 120-page script.
- Observability & Audit: structured logging with audit trail of canon mutations (who/when/what); performance telemetry for search/load/export; ensure export/backup endpoints are auth-protected and return NOT_FOUND/FORBIDDEN appropriately.

## Phases & Execution Order

1) Phase 0 — Research (spec already provided): finalize data model, confirm export format constraints, pick PDF lib, define search strategy (indexes).
2) Phase 1 — Contracts & Data Model: add shared zod schemas/enums and oRPC contracts for Series, Scripts, KB entities, Canvas, Export, Continuity Graph, Audit Log; define Typegoose models (Series, Script, Character, Location, Prop, TimelineEntry, WildCard, CanvasNode/Edge, AuditEntry). Add error codes and role/workspace placeholders.
3) Phase 2 — Backend Implementation: implement routers/handlers per contract; autosave endpoints; search endpoints; relationships/appearances enforcement; continuity graph queries; audit logging on canon mutations; canvas persistence; export service; register routers; enforce auth/NOT_FOUND on exports/backups.
4) Phase 3 — Frontend Implementation: series library + script grid; script modal; split editor; KB management UI + search; character detail tabs; canvas UI; continuity graph view; audit history surfacing; export trigger. Desktop-only layout.
5) Phase 4 — Quality & Observability: add structured logs for canon mutations, audit trail queries, PDF/export checks; targeted tests (contracts, continuity graph/appearances, export, canvas persistence); performance validation vs SCs (load/search/export timings); run `bun run check-types`, `bun run lint`.

## Risks & Mitigations

- PDF formatting complexity → start with basic monospace and scene heading detection; keep formatter modular for future upgrade.
- Large KB/search latency → add indexes, pagination, and debounced search; avoid N+1 by batching queries.
- Referential integrity on delete → enforce checks and soft-delete/mark-orphan flows.
- Future multi-user → keep series-scoped IDs and avoid coupling to single-user assumptions; leave role hooks in schemas.
- Audit/log overhead → keep audit entries concise, index by entity/id/time; sampling for heavy logs; ensure privacy-safe fields only.

## Deliverables Checklist

- Contracts in `packages/shared` with schemas/enums and exports updated.
- Typegoose models and routers registered in `apps/server`.
- Desktop-first web UI for series library, split editor, KB, canvas, export.
- Desktop-first web UI for series library, split editor, KB, canvas, export, continuity graph, and audit views.
- Tests: contract parity, continuity flows (relationships/appearances + continuity graph), canvas persistence, export validity, performance checks against SCs.
- Logs/audit for canon changes; backup/export path (JSON + PDF); audit queries exposed; export/backup guarded by auth + NOT_FOUND stance.

## Validation vs Success Criteria

- SC-001 (load <2s): measure series/script load with profiling; add perf test or instrumentation.
- SC-002 (search <300ms): benchmark KB search with indexed dataset; log p95.
- SC-003 (appearances accuracy 95%+): test tagging/appearance listing against fixture scripts.
- SC-004 (export <5s for 120pp): measure export pipeline; fail CI if over budget.
- SC-005 (checks/tests): enforce `bun run check-types`, `bun run lint`, targeted suites in CI.

## Project Structure

### Documentation (this feature)

```
specs/000-foundation-platform/
├── plan.md              # This file
├── research.md          # Phase 0 output (TBD)
├── data-model.md        # Phase 1 output (TBD)
├── quickstart.md        # Phase 1 output (TBD)
├── contracts/           # Phase 1 output (TBD)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```
apps/server/src/
  db/
  features/series|scripts|knowledge-base|canvas|export/
  routers/

apps/web/src/
  features/series|scripts|knowledge-base|canvas|export/
  routes/
  hooks/
  components/

packages/shared/src/
  contract/
  enums/
  constants/
```

**Structure Decision**: Use existing monorepo layout: `apps/server` for API, `apps/web` for frontend, `packages/shared` for contracts/enums.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| None yet  | N/A        | N/A |

