# Contract Stubs: Canvas

## Procedures
- `canvas.get` — input: seriesId; output: nodes + edges.
- `canvas.upsertNodes` — input: seriesId, nodes[]; output: nodes.
- `canvas.upsertEdges` — input: seriesId, edges[]; output: edges.
- `canvas.deleteNodes` — input: seriesId, nodeIds[]; output: success.
- `canvas.deleteEdges` — input: seriesId, edgeIds[]; output: success.

## Notes
- Persist per-series; enforce seriesId on all writes.
- Auth required; NOT_FOUND if series not accessible.
