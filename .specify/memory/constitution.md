<!--
Sync Impact Report:
- Version change: draft -> 1.0.0
- Modified principles: none (initial definition)
- Added sections: Screenwriting Domain Standards, Workflow & Review
- Removed sections: none
- Templates requiring updates: ✅ .specify/templates/plan-template.md, ✅ .specify/templates/spec-template.md, ✅ .specify/templates/tasks-template.md, ⚠ commands templates (not present in repo)
- Follow-up TODOs: none
-->

# Kaeri Constitution

## Core Principles

### I. Contract-First, Typed Delivery (NON-NEGOTIABLE)
All new capabilities START as shared oRPC contracts in `packages/shared`: zod input/output, explicit summary/description, exported through `CONTRACT`. Handlers and UI MUST implement only after contracts exist. Error codes MUST live in shared enums and use project error wrappers; no ad-hoc strings.

### II. Narrative Continuity & Canonical Data
Characters, locations, props, timelines, and episodes MUST have a single canonical source with referential integrity. Cross-episode relationships, appearances, and continuity notes MUST be persisted and queryable so writers can see who/what/where/when across the series without divergence.

### III. Collaboration, Access, and Privacy
The system MUST support multi-writer collaboration without data leaks: authenticated access only, role-aware visibility, audit-friendly change tracking, and no exposure of non-accessible resources (prefer NOT_FOUND over FORBIDDEN when hiding existence).

### IV. Quality Gates & Test Discipline
Every change MUST pass contract/type checks and automated tests (`bun run check-types`, `bun run lint`, targeted tests). Tests MUST cover contracts, access rules, and continuity-critical flows; deterministic fixtures only. No feature merges without a verifiable test plan.

### V. Observability & Operational Readiness
Logs and errors MUST be structured enough to trace contract calls and continuity mutations. Data changes affecting canon MUST be recoverable (backups or reversible migrations). Performance targets MUST be declared for bulk operations (e.g., episode timelines, character graphs) and validated when risk is introduced.

## Screenwriting Domain Standards
The product MUST expose: (1) per-series continuity graph linking characters, locations, props, and scenes; (2) timeline views for multi-episode arcs and parallel timelines; (3) change history for canonical attributes (e.g., eye color, relationships) with provenance. Imports/exports MUST preserve canonical IDs to avoid duplication. Multi-timezone collaboration MUST not alter chronological ordering.

## Workflow & Review
All work items MUST state the contract entry points they affect, the canonical entities touched, and the tests that prove continuity and access. Reviews MUST verify: contract presence/export, enum-driven errors, access-control stance (NOT_FOUND vs FORBIDDEN), and test coverage for continuity risks. Plans/specs/tasks MUST map user stories to canonical entities and contract calls.

## Governance
This constitution supersedes prior practice. Amendments REQUIRE: (1) written rationale, (2) version bump per semantic rules, (3) update of affected templates/guides, and (4) validation plan. Compliance is checked in every PR against Core Principles, Domain Standards, and Workflow rules. Version bumps: MAJOR for principle changes/removals, MINOR for new principles/sections, PATCH for clarifications.

**Version**: 1.0.0 | **Ratified**: 2026-01-01 | **Last Amended**: 2026-01-01
