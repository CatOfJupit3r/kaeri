# Research: Kaeri Baseline Platform

## Goals
- Pick practical libraries/patterns for PDF export (screenplay-friendly), search, autosave, and audit logging.
- Ensure continuity graph and provenance can be derived efficiently from canonical data.
- Keep desktop-first UX; defer mobile.

## Findings

### PDF / Export
- Use server-side `pdf-lib` or `@react-pdf/renderer`? For Bun/Hono backend, prefer `pdf-lib` to avoid DOM; supports custom fonts and layout with manual positioning.
- Screenplay basics: detect scene headings (`/^(INT|EXT|INT\.\/EXT|INT\/EXT)\b/i`), dialogue indentation (~2.5" for names, ~1.5" for dialogue), transitions right-aligned. Start simple: monospace, 60 lines/page heuristic. Keep formatter modular for later upgrade (FDX, call sheets).

### Search & Indexing
- Mongo indexes: `Series.title`, `Script.title`, `Script.seriesId`, `Character.name`, `Location.name`, `Prop.name`, `TimelineEntry.label`, plus text index for KB search across name/description/traits.
- Use debounced search client-side (300ms) and limit results with pagination to handle 500+ entities; expose `limit/offset` in contracts.

### Autosave & Drafting
- Autosave endpoint accepts script id + content + cursor metadata; server sets `lastEditedAt`. Use optimistic updates in UI; throttle saves (e.g., 3–5s) and support manual save.
- Store script content as plaintext initially; keep structure extensible for future scene/block structure.

### Continuity Graph & Appearances
- Graph nodes: characters, locations, props, scripts/scenes; edges: appearances (character→scene, location→scene, prop→scene), relationships (character↔character), set-in-location (scene→location).
- Compute graph from persisted refs (appearances table) rather than parsing text; optionally run background extraction later.

### Audit Trail
- Audit entry fields: entityType, entityId, action, before/after snapshot (diff-friendly), actorId, timestamp. Index on entityId+timestamp. Limit payload size; strip large content (scripts) to metadata-only.

### Access & Auth
- Single-user baseline: require auth session; use NOT_FOUND to hide non-accessible resources (even though single-user, keep stance for future multi-user workspaces).

### Performance Targets
- Search p95 <300ms on 500-entity dataset (indexed queries).
- Script load <2s including KB sidebar bootstrap.
- Export <5s for 120-page script using precomputed layout.

### Risks / Open Questions
- PDF pagination/format accuracy might drift; mitigate with snapshot tests on fixture scripts.
- Large scripts memory pressure during export; chunk pages and stream if needed.
- Future scene-level structure: current plain text may need migration to structured scenes; design `contentVersion` field to migrate safely.
