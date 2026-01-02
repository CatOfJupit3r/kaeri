# Feature Specification: Knowledge Base

**Feature Branch**: `[knowledge-base-domain]`  
**Created**: 2026-01-02  
**Status**: Draft  
**Input**: Series-scoped Knowledge Base (Characters, Locations, Props, Timeline, Wild Cards) with search, relationships, appearances

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Knowledge Base Entities (Priority: P1)
A writer creates and edits Characters, Locations, Props, Timeline items, and Wild Cards from the knowledge base.

**Why this priority**: Supplies canon and continuity data for scripts.

**Independent Test**: Each entity type can be created, edited, and searched; relationships render correctly in detail view.

**Acceptance Scenarios**:
1. Given the knowledge base, when a new character is added with traits and relationships, then it appears in search and detail view.
2. Given multiple entities, when the writer searches, then results include all matching entities across types.

### User Story 2 - Character Detail and Appearances (Priority: P2)
A writer views character overview, script variations, and appearances linked to scenes or sections.

**Why this priority**: Continuity and cross-script tracking.

**Independent Test**: Character detail tabs render; appearances table lists scene references; hover previews work.

**Acceptance Scenarios**:
1. Given a character with relationships, when viewing Overview, then linked characters show hover previews.
2. Given appearances tagged in a script, when opening Appearances, then scene references list with locations.

### Edge Cases
- Deleting entities with relationships or appearances blocks or requires reassignment with warnings.
- Duplicate names are allowed but warn to reduce confusion.
- Timeline reordering enforces unique order and stable sequencing.
- Large graphs or lists paginate/virtualize to stay performant.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-004**: System MUST support creating and editing Characters, Locations, Props, Timeline entries, and Wild Cards with search across all entities.
- **FR-005**: System MUST support Character Detail tabs: Overview (traits and relationships), Script Variations, and Appearances (scene references).
- **FR-010**: System MUST maintain canonical IDs for entities to avoid duplicates.
- **FR-011**: System MUST log continuity-affecting changes (entity edits, relationships, appearances) for audit and debugging.

### Key Entities *(include if feature involves data)*

- **Character**: id, seriesId, name, description, traits[], avatarUrl, relationships[], appearances[], variations[], createdAt, updatedAt.
- **Location**: id, seriesId, name, description, tags[], imageUrl, appearances[], createdAt, updatedAt.
- **Prop**: id, seriesId, name, description, associations[], imageUrl, createdAt, updatedAt.
- **Timeline Entry**: id, seriesId, label, timestamp?, order, linkedScenes[], linkedEntities[], description, createdAt, updatedAt.
- **Wild Card**: id, seriesId, type, label, content, tags[], createdAt, updatedAt.

### Constitution Alignment

- Contracts: oRPC procedures in `packages/shared/src/contract/knowledge-base.contract.ts` with shared enums and schemas.
- Canonical continuity: All entities are series-scoped; relationships and appearances enforce referential integrity.
- Access and collaboration: Auth required; NOT_FOUND stance for hidden entities; audit logging aligns with FR-011.
- Quality gates: `bun run check-types`, `bun run lint`, and KB CRUD/search tests (blocked by Mongo memory server download issue).
- Observability and recovery: Structured logging for canon mutations planned; continuity and audit surfacing planned.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-002**: Knowledge base search returns relevant entities across all types with a backend response under 300ms on a dataset of 500 entities.
- **SC-003**: Character detail Appearances tab lists at least 95% of tagged scenes in a 120-page script test corpus.
