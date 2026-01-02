# Concrete Tasks: Baseline Cross-Cutting

Applies across domains; domain-specific tasks live with each spec.

1) Structured logging (T043)
- Add logger hooks for canon mutations and export paths; ensure each service logs operation, ids, duration, and errors with consistent fields.

2) Performance telemetry (T044)
- Implement `apps/server/src/lib/telemetry.ts` utilities; add timing for search, load, export, canvas bulk operations; emit to logger for now.

3) Targeted tests (T045)
- When infra unblocks, add server tests: contracts parity, continuity graph/audit, canvas persistence, export timing; document skip/unblockers now.

4) Frontend integration plan (T046)
- Draft smoke test plan in `specs/000-foundation-platform/quickstart.md` for critical flows: series CRUD, script edit/autosave, KB CRUD/search, navigation.

5) Lint/types documentation (T047)
- Run `bun run check-types` and `bun run lint`; capture outcomes and any blockers in quickstart.

6) Polish/docs (T048-T050)
- Update README/feature docs for KB/canvas/export/continuity surfaces.
- Perform post-test cleanup/refactors in touched files.
- Document backup/export JSON recovery steps in quickstart.
