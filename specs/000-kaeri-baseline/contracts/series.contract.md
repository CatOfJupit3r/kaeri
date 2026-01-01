# Contract Stubs: Series

## Procedures (oRPC)
- `series.create` — input: title, genre?, logline?, coverUrl?; output: series.
- `series.update` — input: seriesId, patch (title/genre/logline/cover); output: series.
- `series.delete` — input: seriesId; output: success flag.
- `series.list` — input: pagination; output: series list with lastEditedAt.
- `series.get` — input: seriesId; output: series.
- `series.exportSummary` — input: seriesId; output: JSON summary (series + scripts metadata).

## Notes
- Require auth; NOT_FOUND when no access.
- Update lastEditedAt on relevant mutations.
