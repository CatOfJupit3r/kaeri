# Contract Stubs: Export

## Procedures
- `export.scriptPdf` — input: scriptId; output: PDF (screenplay-friendly basic layout).
- `export.seriesJson` — input: seriesId; output: JSON backup (series + scripts metadata + KB entities + canvas + continuity refs, excluding large content if needed).

## Notes
- Auth required; NOT_FOUND for inaccessible resources.
- Performance target: <5s for 120-page script.
- Validate script saved state before export; return meaningful error if unsaved.
