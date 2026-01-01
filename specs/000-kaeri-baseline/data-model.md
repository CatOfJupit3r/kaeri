# Data Model: Kaeri Baseline Platform

## Entities & Fields (proposed)

### Series
- `_id` (string ObjectId), `title` (string, required), `genre` (string), `logline` (string), `coverUrl` (string), `lastEditedAt` (date), `createdAt`, `updatedAt`.
- Future-ready: `workspaceId?`, `roles?` (placeholder for multi-user access).
- Indexes: `title` (text), `lastEditedAt`.

### Script
- `_id` (string), `seriesId` (ref Series, required), `title` (string), `authors` (string[]), `genre` (string), `logline` (string), `coverUrl` (string), `content` (string, plaintext), `contentVersion` (number, default 1), `lastEditedAt` (date), `createdAt`, `updatedAt`.
- Indexes: `seriesId`, `title`, `lastEditedAt`.

### Character
- `_id` (string), `seriesId` (ref Series), `name` (string, required), `description` (string), `traits` (string[]), `relationships` ({ targetId: string; type: string; note?: string }[]), `variations` ({ scriptId: string; label: string; notes?: string }[]), `appearances` ({ scriptId: string; sceneRef: string; locationId?: string }[]), `avatarUrl` (string), `createdAt`, `updatedAt`.
- Indexes: `seriesId`, `name` (text), `relationships.targetId`, `appearances.scriptId`.

### Location
- `_id` (string), `seriesId`, `name` (required), `description` (string), `tags` (string[]), `appearances` ({ scriptId: string; sceneRef: string }[]), `createdAt`, `updatedAt`.
- Indexes: `seriesId`, `name` (text), `appearances.scriptId`.

### Prop
- `_id` (string), `seriesId`, `name` (required), `description` (string), `associations` ({ characterId?: string; locationId?: string; scriptId?: string; note?: string }[]), `createdAt`, `updatedAt`.
- Indexes: `seriesId`, `name` (text).

### TimelineEntry
- `_id` (string), `seriesId`, `label` (string, required), `order` (number) or `timestamp` (string/ISO), `links` ({ entityType: string; entityId: string }[]), `createdAt`, `updatedAt`.
- Indexes: `seriesId`, `order`, `label`.

### WildCard
- `_id` (string), `seriesId`, `title` (required), `body` (string), `tag` (string), `createdAt`, `updatedAt`.
- Indexes: `seriesId`, `title` (text), `tag`.

### CanvasNode
- `_id` (string), `seriesId`, `type` ("text"|"shape"|"note"), `content` (string), `position` ({ x: number; y: number; }), `style` (record), `createdAt`, `updatedAt`.
- Indexes: `seriesId`.

### CanvasEdge
- `_id` (string), `seriesId`, `sourceId` (node), `targetId` (node), `label` (string), `createdAt`, `updatedAt`.
- Indexes: `seriesId`, `sourceId`, `targetId`.

### AuditEntry
- `_id` (string), `seriesId`, `entityType` (enum), `entityId` (string), `action` ("CREATE"|"UPDATE"|"DELETE"), `actorId` (string), `timestamp` (date), `before` (partial snapshot), `after` (partial snapshot).
- Indexes: `seriesId`, `entityId`, `entityType`, `timestamp`.

## Relationships
- Series 1—N Scripts, KB entities, Canvas nodes/edges, Audit entries.
- Characters/Locations/Props reference Scripts via appearances/associations for continuity graph edges.
- Timeline entries link to entities for chronological views.

## Constraints & Integrity
- All child entities require `seriesId` (enforce in contracts/handlers).
- Deletion rules: prevent deleting entities with dependent references or mark as orphaned with clear status; prefer soft-delete or reassignment for characters/locations/props with appearances.
- Referential integrity checks on relationships/appearances during writes.

## Performance Notes
- Text indexes on name/title/description for KB search; consider compound index (seriesId, name) for selective queries.
- Paginate KB queries; use projections to avoid large payloads (especially relationships/appearances).

## Migration Considerations
- Keep `contentVersion` to evolve script storage (plaintext → structured scenes) with backward compatibility.
- Reserve `workspaceId`/`roles` fields for future multi-user without breaking IDs.
