# Feature Specification: Continuity and Audit

**Feature Branch**: `[continuity-domain]`  
**Created**: 2026-01-02  
**Status**: Draft  
**Input**: Continuity graph of series entities and audit logging for canon-affecting changes

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Continuity Graph (Priority: P3)
A writer views a graph of all entities and their relationships within a series.

**Why this priority**: Supports understanding complex story interconnections.

**Independent Test**: Graph renders nodes (characters, locations, props, scripts) and edges (relationships, appearances) from series data.

**Acceptance Scenarios**:
1. Given a series with characters and relationships, when opening the continuity graph, then nodes and edges render accurately.
2. Given graph nodes, when clicking a node, then the entity detail view opens.

### User Story 2 - Audit History (Priority: P3)
A writer views audit history of changes to canonical entities.

**Why this priority**: Debugging, recovery, and accountability.

**Independent Test**: Audit log lists all canon changes with timestamps, entity IDs, and change types.

**Acceptance Scenarios**:
1. Given entity edits, when viewing the audit log, then all changes appear with timestamps and user attribution.
2. Given audit entries, when filtering by entity type, then only relevant entries show.

### Edge Cases
- Large graphs (500+ nodes) need virtualization or server-side layout to avoid timeouts.
- Circular relationships render without infinite loops.
- Missing audit entries surface gaps gracefully and do not break UI.
- Audit log privacy: redact sensitive fields if user data is absent.
- Query performance relies on indexes for seriesId, entityType, and timestamp.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-011**: System MUST log continuity-affecting changes (entity edits, relationships, appearances) for audit and debugging and surface continuity graph data per series.

### Key Entities *(include if feature involves data)*

- **AuditEntry**: id (UUID), seriesId, entityType, entityId, action (`create` | `update` | `delete`), changes, userId?, timestamp, metadata?.
- **ContinuityGraph**: seriesId, nodes[], edges[] where nodes have id, type, label, metadata? and edges have id, source, target, type, label?.

### Constitution Alignment

- Contracts: oRPC procedures in `packages/shared/src/contract/continuity.contract.ts` define graph and audit endpoints before handlers/UI.
- Canonical continuity: Graph represents canonical relationships; audit log records all canon mutations for recovery.
- Access and collaboration: Auth required; NOT_FOUND stance for hidden series; userId captured when available.
- Quality gates: `bun run check-types`, `bun run lint`, and continuity/audit tests (blocked by Mongo memory server download issue).
- Observability and recovery: Structured logging for graph generation and audit writes; plan CSV export for audits.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Continuity graph renders 100+ nodes with load time under 1s on desktop.
- **SC-002**: Audit log queries return under 500ms for 10,000+ entries with pagination.
