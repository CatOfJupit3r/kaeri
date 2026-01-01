# Contract Stubs: Scripts

## Procedures
- `script.create` — input: seriesId, title, authors?, genre?, logline?, coverUrl?; output: script.
- `script.update` — input: scriptId, patch; output: script.
- `script.delete` — input: scriptId; output: success.
- `script.listBySeries` — input: seriesId, pagination; output: scripts.
- `script.get` — input: scriptId; output: script + metadata.
- `script.saveContent` — input: scriptId, content, cursor?; output: lastEditedAt.
- `script.exportPdf` — input: scriptId; output: PDF stream/meta.

## Notes
- Auth required; NOT_FOUND for inaccessible scripts.
- Validate seriesId ownership; update lastEditedAt on save.
