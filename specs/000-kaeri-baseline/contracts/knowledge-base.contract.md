# Contract Stubs: Knowledge Base

## Procedures
- `kb.search` — input: seriesId, query, pagination; output: mixed entities.
- `kb.characters.create/update/delete/get/list`
- `kb.locations.create/update/delete/get/list`
- `kb.props.create/update/delete/get/list`
- `kb.timeline.create/update/delete/get/list`
- `kb.wildcards.create/update/delete/get/list`
- `kb.characters.addRelationship/removeRelationship`
- `kb.characters.addAppearance/removeAppearance`
- `kb.characters.addVariation/removeVariation`

## Notes
- Enforce referential checks on relationships/appearances/variations.
- Use NOT_FOUND for hidden resources.
- Index by seriesId; paginate responses.
