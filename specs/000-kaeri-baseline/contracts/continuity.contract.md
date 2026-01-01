# Contract Stubs: Continuity Graph & Audit

## Continuity Graph
- `continuity.graph` — input: seriesId; output: nodes (characters/locations/props/scenes), edges (relationships/appearances/location-of/prop-in-scene).
- `continuity.appearancesByCharacter` — input: seriesId, characterId; output: list of scene refs with locations/props.

## Audit Log
- `audit.listByEntity` — input: seriesId, entityType, entityId, pagination; output: audit entries.
- `audit.listBySeries` — input: seriesId, pagination; output: audit entries.

## Notes
- Graph derived from stored references (no parsing required initially).
- Audit entries recorded on create/update/delete for canon entities; payload trimmed to metadata for large fields.
- Auth required; NOT_FOUND/Forbidden stance maintained.
