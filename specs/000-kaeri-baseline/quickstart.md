# Quickstart: Foundation Platform

## Prerequisites
- Bun 1.2.21 installed.
- Docker Desktop running (MongoDB via compose).
- `.env` copied from `.env.example` in `apps/server` and `apps/web`.
- Run at repo root unless noted.

## Setup
- Install deps: `bun install`
- Start dev stack: `bun run dev` (API http://localhost:3000, Web http://localhost:3001)
- Seed/ensure Mongo via docker-compose.dev.yml (auto on `bun run dev`).

## Key Commands
- Type checks: `bun run check-types`
- Lint: `bun run lint`
- Format (if needed): `bun run prettier`
- Dev (API + Web + Mongo): `bun run dev`

## Feature Work Order (per plan)
1) Contracts & data model first (`packages/shared/src/contract`, enums/constants) → server routers/services → web UI/hooks.
2) MVP path: Series (library + modal) → Scripts (split editor + autosave) → Knowledge Base CRUD/search.
3) Then Character detail, Canvas, Export, Continuity Graph + Audit.

## Testing & Validation
- Run `bun run check-types` and `bun run lint` before pushing.
- Add targeted tests for: contracts parity, relationships/appearances integrity, canvas persistence, export timing (<5s for 120pp), search p95 <300ms on 500-entity dataset.
- Validate load time (<2s) for series/script pages via profiling or lightweight perf test.

## Access & Error Stance
- All feature endpoints require auth; use NOT_FOUND for hidden/inaccessible resources (even single-user baseline).

## Data & Backups
- Keep series-scoped IDs; avoid deletes that orphan references—prefer reassignment/soft-delete.
- Expose JSON export for series + KB; PDF export for scripts.

## Observability
- Log canon mutations (who/when/what) and measure search/load/export timings; retain audit entries for continuity changes.
