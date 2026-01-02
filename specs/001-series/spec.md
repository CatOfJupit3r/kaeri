# Feature Specification: Series Management

**Feature Branch**: `[series-domain]`  
**Created**: 2026-01-02  
**Status**: Draft  
**Input**: Series container with metadata, scripts, KB scope, canvas, and settings

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Manage Series (Priority: P1)
A writer creates a series, configures metadata (title, genre, logline, cover), and manages scripts inside it.

**Why this priority**: Core container for all downstream work.

**Independent Test**: A series can be created, edited, and reopened with at least one script attached; metadata persists.

**Acceptance Scenarios**:
1. Given no series, when the writer creates one with required fields, then the series is saved and visible in the library.
2. Given an existing series, when the writer edits metadata, then updates persist and last-edited timestamp updates.

### Edge Cases
- Deleting a series with scripts/KB/canvas either blocks with a warning or cascades safely.
- Large libraries (100+ series) paginate or virtualize to keep list interactions responsive.
- Concurrent edits (single-user) resolve last-write-wins; future multi-user requires conflict handling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow creating, editing, and deleting a Series with metadata (title, genre, logline, cover image, last-edited timestamp).
- **FR-008**: System MUST track and display last edited timestamps for Series.
- **FR-009**: System MUST enforce access control; non-accessible resources respond with NOT_FOUND.
- **FR-010**: System MUST maintain canonical IDs for entities to avoid duplicates across imports/exports.

### Key Entities *(include if feature involves data)*

- **Series**: id (UUID), title (required), genre, logline, coverUrl, lastEditedAt, createdAt, updatedAt; reserve ownerId/workspaceId for future multi-user support.

### Constitution Alignment

- Contracts: oRPC procedures in `packages/shared/src/contract/series.contract.ts` are defined before handlers/UI.
- Canonical continuity: Series is the scope boundary; UUID canonical IDs; cascades protect scripts/KB/canvas integrity.
- Access and collaboration: Auth required; NOT_FOUND stance for hidden resources; owner/workspace fields reserved for future roles.
- Quality gates: `bun run check-types`, `bun run lint`, and targeted series CRUD tests (blocked by Mongo memory server download issue).
- Observability and recovery: Structured logging for series mutations planned; exports/backups handled downstream.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Series with at least one Script can be created, reopened, and edited within a 2s load time on desktop.
