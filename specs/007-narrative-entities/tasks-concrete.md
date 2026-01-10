## Backend Models & Services (P1)

### T005-NE: Create Scene model and service

**Files to create/verify:**
- `apps/server/src/db/models/scene.model.ts` ✅ (exists)
- `apps/server/src/features/scenes/scene.service.ts`

**Implementation steps:**
1. Verify Mongoose model includes:
   - All fields from contract schema
   - Composite unique index: `{ scriptId: 1, sceneNumber: 1 }`
   - Indexes on `seriesId`, `scriptId`, `locationId`
   - Timestamps enabled
2. Create service class `apps/server/src/features/scenes/scene.service.ts`:
   ```typescript
   export class SceneService {
     async create(data: CreateSceneInput): Promise<Scene> {
       // Auto-generate scene number if not provided
       // Validate series ownership via scriptId
       // Check location exists if locationId provided
     }
     
     async update(sceneId: string, patch: Partial<Scene>): Promise<Scene> {
       // Prevent sceneNumber and scriptId changes
       // Validate foreign key references
     }
     
     async delete(sceneId: string): Promise<void> {
       // Hard delete (scenes are transient production data)
     }
     
     async listByScript(scriptId: string, limit: number, offset: number) {
       // Return scenes ordered by sceneNumber
     }
     
     async get(sceneId: string): Promise<Scene | null>
     
     private async getNextSceneNumber(scriptId: string): Promise<number> {
       // Find max scene number + 1
     }
   }
   ```
3. Add service to DI container: `apps/server/src/routers/di-getter.ts`
4. Follow pattern from existing KB services (character.service.ts)

**Dependencies:** Scene contract (T001-NE)

**Acceptance criteria:**
- Scene number auto-generation works correctly
- Composite unique index prevents duplicate scene numbers per script
- Service validates series ownership through scriptId → script → seriesId chain

---

### T006-NE: Create Theme model and service

**Files to create/verify:**
- `apps/server/src/db/models/theme.model.ts` ✅ (exists)
- `apps/server/src/features/themes/theme.service.ts`

**Implementation steps:**
1. Verify Mongoose model includes:
   - Nested subdocuments for relatedCharacters[], evolution[], appearances[]
   - Index on seriesId
   - Timestamps enabled
2. Create service class:
   ```typescript
   export class ThemeService {
     async create(data: CreateThemeInput): Promise<Theme>
     async update(themeId: string, patch: Partial<Theme>): Promise<Theme>
     async delete(themeId: string): Promise<void> // Soft delete
     async listBySeries(seriesId: string, limit: number, offset: number)
     async get(themeId: string): Promise<Theme | null>
     
     // Helper methods for sub-entities
     async addCharacterConnection(themeId: string, connection: ThemeCharacterConnection)
     async removeCharacterConnection(themeId: string, characterId: string)
     async addEvolutionNote(themeId: string, evolution: ThemeEvolution)
     async addAppearance(themeId: string, appearance: ThemeAppearance)
   }
   ```
3. Add to DI container

**Dependencies:** Theme contract (T002-NE)

**Acceptance criteria:**
- Soft delete implemented (isDeleted flag)
- Character connection methods validate characterId exists
- Evolution notes can be updated per scriptId

---

### T007-NE: Create Story Arc model and service

**Files to create/verify:**
- `apps/server/src/db/models/story-arc.model.ts` ✅ (exists)
- `apps/server/src/features/story-arcs/story-arc.service.ts`

**Implementation steps:**
1. Verify Mongoose model includes:
   - Status enum field
   - Nested subdocuments for keyBeats[], characters[]
   - Index on seriesId and status
   - Timestamps enabled
2. Create service class:
   ```typescript
   export class StoryArcService {
     async create(data: CreateStoryArcInput): Promise<StoryArc>
     async update(arcId: string, patch: Partial<StoryArc>): Promise<StoryArc>
     async delete(arcId: string): Promise<void> // Soft delete
     async listBySeries(seriesId: string, limit: number, offset: number)
     async get(arcId: string): Promise<StoryArc | null>
     
     // Timeline generation
     async getTimeline(arcId: string): Promise<ArcTimeline> {
       // Return ordered beats with script/scene context
     }
     
     // Character role management
     async addCharacterRole(arcId: string, role: ArcCharacterRole)
     async updateCharacterRole(arcId: string, characterId: string, newRole: string)
     async removeCharacterRole(arcId: string, characterId: string)
   }
   ```
3. Add to DI container

**Dependencies:** Story Arc contract (T003-NE)

**Acceptance criteria:**
- Timeline generation resolves script/scene references
- Soft delete preserves narrative history
- Status transitions validated (e.g., can't go from completed to planned)

---

## Backend Routers (P1)

### T009-NE: Create Scene router with oRPC procedures

**Files to create/verify:**
- `apps/server/src/routers/scene.router.ts` ✅ (exists)

**Implementation steps:**
1. Verify router file follows pattern:
   ```typescript
   import { base, protectedProcedure } from '@~/lib/orpc';
   import { GETTERS } from '@~/routers/di-getter';
   
   export const sceneRouter = base.scene.router({
     createScene: protectedProcedure.scene.createScene.handler(async ({ input, context }) => {
       // Validate series ownership via scriptId
       await validateScriptOwnership(input.scriptId, context.user.id);
       return GETTERS.SceneService().create(input);
     }),
     
     updateScene: protectedProcedure.scene.updateScene.handler(async ({ input, context }) => {
       // Validate scene ownership
       await validateSceneOwnership(input.sceneId, context.user.id);
       return GETTERS.SceneService().update(input.sceneId, input.patch);
     }),
     
     deleteScene: protectedProcedure.scene.deleteScene.handler(async ({ input, context }) => {
       await validateSceneOwnership(input.sceneId, context.user.id);
       await GETTERS.SceneService().delete(input.sceneId);
       return { success: true };
     }),
     
     listScenesByScript: protectedProcedure.scene.listScenesByScript.handler(async ({ input, context }) => {
       await validateScriptOwnership(input.scriptId, context.user.id);
       return GETTERS.SceneService().listByScript(input.scriptId, input.limit, input.offset);
     }),
     
     getScene: protectedProcedure.scene.getScene.handler(async ({ input, context }) => {
       const scene = await GETTERS.SceneService().get(input.sceneId);
       if (!scene) throw ORPCError.notFound('SCENE_NOT_FOUND');
       await validateSceneOwnership(input.sceneId, context.user.id);
       return scene;
     }),
   });
   ```
2. Add ownership validation helpers
3. Register router in `apps/server/src/routers/index.router.ts`
4. Follow AUTH_ERROR_STANCE.md: return NOT_FOUND when user lacks access

**Dependencies:** Scene service (T005-NE), Scene contract (T001-NE)

**Acceptance criteria:**
- All endpoints enforce series ownership
- Scene number uniqueness enforced by model constraint
- NOT_FOUND returned for unauthorized access

---

### T010-NE: Create Theme router with oRPC procedures

**Files to create/verify:**
- `apps/server/src/routers/theme.router.ts` ✅ (exists)

**Implementation steps:**
1. Follow same pattern as scene router
2. Implement procedures:
   - `createTheme`: Validate seriesId ownership
   - `updateTheme`: Validate theme ownership via seriesId
   - `deleteTheme`: Soft delete with ownership check
   - `listThemesBySeries`: Validate seriesId ownership
   - `getTheme`: Validate ownership, return NOT_FOUND if unauthorized
3. Register router in index

**Dependencies:** Theme service (T006-NE), Theme contract (T002-NE)

**Acceptance criteria:**
- All endpoints enforce series ownership
- Soft delete implemented
- NOT_FOUND stance followed

---

### T011-NE: Create Story Arc router with oRPC procedures

**Files to create/verify:**
- `apps/server/src/routers/story-arc.router.ts` ✅ (exists)

**Implementation steps:**
1. Follow same pattern as scene/theme routers
2. Implement procedures matching contract
3. Register router in index

**Dependencies:** Story Arc service (T007-NE), Story Arc contract (T003-NE)

**Acceptance criteria:**
- All endpoints enforce series ownership
- Soft delete implemented
- Status transitions validated

---

## Frontend Entity Constants (P1)

### T013-NE: Add narrative entity type constants

**Files to modify:**
- `packages/shared/src/constants/entity-types.ts` (or create if doesn't exist)

**Implementation steps:**
1. Check if file exists, create if not
2. Define entity type enum using z.enum pattern:
   ```typescript
   import z from 'zod';
   
   export const entityTypeSchema = z.enum([
     'CHARACTER',
     'LOCATION',
     'PROP',
     'SCENE',
     'THEME',
     'STORY_ARC',
   ]);
   export const ENTITY_TYPES = entityTypeSchema.enum;
   export type EntityType = z.infer<typeof entityTypeSchema>;
   ```
3. Define entity metadata:
   ```typescript
   import { Drama, Sparkles, TrendingUp, BookOpen, User, MapPin, Package } from 'lucide-react';
   
   export const ENTITY_METADATA = {
     [ENTITY_TYPES.SCENE]: {
       icon: Drama,
       color: 'border-purple-500',
       bgColor: 'bg-purple-50',
       label: 'Scene',
     },
     [ENTITY_TYPES.THEME]: {
       icon: Sparkles,
       color: 'border-pink-500',
       bgColor: 'bg-pink-50',
       label: 'Theme',
     },
     [ENTITY_TYPES.STORY_ARC]: {
       icon: TrendingUp,
       color: 'border-orange-500',
       bgColor: 'bg-orange-50',
       label: 'Story Arc',
     },
     // ... existing entity types
   } as const satisfies Record<EntityType, { icon: LucideIcon; color: string; bgColor: string; label: string }>;
   ```
4. Export filter options for KB views

**Dependencies:** None (can be done in parallel)

**Acceptance criteria:**
- All three new entity types added to enum
- Icon components imported from lucide-react
- Color classes follow Tailwind naming convention
- Metadata object uses satisfies for type safety

---

## Frontend Scene UI (P1)

### T014-NE: Create Scene detail component matching V0 design

**Files to create:**
- `apps/web/src/features/scenes/components/scene-detail.tsx`

**Implementation steps:**
1. Create component file with props interface:
   ```typescript
   interface iSceneDetailProps {
     scene: SceneDetailQueryReturnType;
     seriesId: string;
     scriptId: string;
   }
   ```
2. Implement layout matching V0 design:
   - Header: Scene number badge, heading, script name link
   - Metadata cards grid: Location (clickable link), Time/Duration, Emotional Tone
   - Conflict section: Textarea or display text
   - Beats section: Ordered list with inline edit capability
   - Props section: Badge list with links to prop entities
   - Technical notes: Three separate sections (lighting, sound, camera)
   - Storyboard: Image upload/display area
   - Navigation footer: Previous Scene / Next Scene buttons
3. Use existing shadcn/ui components: Card, Badge, Button, Tabs
4. Add edit button that opens `SceneForm` modal
5. Fetch related entities (location, characters, props) for display

**Dependencies:** T016-NE (hooks), T015-NE (form)

**Acceptance criteria:**
- Layout matches V0 design screenshots
- All scene fields displayed
- Beats can be edited inline
- Previous/Next navigation works within script context
- Location links to KB entity detail

---

### T015-NE: Create Scene form component

**Files to create:**
- `apps/web/src/features/scenes/components/scene-form.tsx`

**Implementation steps:**
1. Create modal/dialog form using TanStack Form and shadcn Dialog
2. Form fields:
   - Scene number (auto-generated, display only)
   - Heading (text input, required)
   - Location (dropdown populated from KB locations)
   - Time of day (select: dawn/day/dusk/night/continuous)
   - Duration (text input)
   - Emotional tone (text input or predefined options)
   - Conflict (textarea)
   - Beats (dynamic list with add/remove/reorder)
   - Characters (multi-select from KB)
   - Props (multi-select from KB)
   - Technical notes: lighting, sound, camera (textareas)
   - Story notes (textarea)
   - Storyboard URL (text input with upload option)
3. Use TanStack Form for validation and submission
4. Call `useCreateScene` or `useUpdateScene` mutation on submit
5. Handle loading/error states

**Dependencies:** T016-NE (hooks)

**Acceptance criteria:**
- Form validates required fields
- Beat list supports reordering
- Multi-selects load from KB data
- Form shows loading state during submission
- Success toast on save

---

### T016-NE: Add Scene hooks

**Files to create:**
- `apps/web/src/features/scenes/hooks/queries/use-scene-list.ts`
- `apps/web/src/features/scenes/hooks/queries/use-scene.ts`
- `apps/web/src/features/scenes/hooks/mutations/use-create-scene.ts`
- `apps/web/src/features/scenes/hooks/mutations/use-update-scene.ts`
- `apps/web/src/features/scenes/hooks/mutations/use-delete-scene.ts`

**Implementation steps:**
1. **use-scene-list.ts**: Query hook for script scenes
   ```typescript
   export const sceneListQueryOptions = (scriptId: string, params?: { limit?: number; offset?: number }) =>
     tanstackRPC.scene.listScenesByScript.queryOptions({
       input: {
         scriptId,
         limit: params?.limit ?? 20,
         offset: params?.offset ?? 0,
       },
     });
   
   export function useSceneList(scriptId: string, params?: { limit?: number; offset?: number; enabled?: boolean }) {
     return useQuery({
       ...sceneListQueryOptions(scriptId, params),
       enabled: (params?.enabled ?? true) && !!scriptId,
     });
   }
   ```

2. **use-scene.ts**: Single scene query
   ```typescript
   export function useScene(sceneId: string, params?: { enabled?: boolean }) {
     return useQuery({
       ...tanstackRPC.scene.getScene.queryOptions({ input: { sceneId } }),
       enabled: (params?.enabled ?? true) && !!sceneId,
     });
   }
   ```

3. **use-create-scene.ts**: Mutation with optimistic update
   - Follow pattern from `use-create-character.ts`
   - Optimistically add scene to list cache
   - On success, replace temp ID with real ID
   - On error, rollback and show toast

4. **use-update-scene.ts**: Mutation with optimistic update
   - Update both list cache and detail cache
   - Preserve unchanged fields

5. **use-delete-scene.ts**: Mutation with confirmation
   - Show confirmation dialog before deleting
   - Remove from list cache on success
   - Invalidate related queries

**Dependencies:** Scene contract (T001-NE), Scene router (T009-NE)

**Acceptance criteria:**
- All hooks use TanStack Query patterns
- Optimistic updates work correctly
- Error handling with toasts
- Query invalidation on mutations

---

## Frontend Theme UI (P1)

### T017-NE: Create Theme detail component matching V0 design

**Files to create:**
- `apps/web/src/features/themes/components/theme-detail.tsx`

**Implementation steps:**
1. Create component with props:
   ```typescript
   interface iThemeDetailProps {
     theme: ThemeDetailQueryReturnType;
     seriesId: string;
   }
   ```
2. Implement sections:
   - Header: Theme name, color indicator badge, edit button
   - Description: Textarea or display text
   - Related Characters: Card list with character avatars and connection descriptions
   - Visual Motifs: Badge list with add/remove
   - Thematic Evolution: Accordion with per-script entries
   - Appearances: List of scene references with quotes
3. Use color indicator badge with theme.color as background
4. Character cards link to KB character entities

**Dependencies:** T019-NE (hooks), T018-NE (form)

**Acceptance criteria:**
- Color indicator badge uses theme.color
- Related characters show avatars and connections
- Evolution accordion groups by script
- Scene appearances link to scene detail

---

### T018-NE: Create Theme form component

**Files to create:**
- `apps/web/src/features/themes/components/theme-form.tsx`

**Implementation steps:**
1. Create modal/dialog form
2. Form fields:
   - Name (text input, required)
   - Description (textarea)
   - Color (color picker with preset palette: purple, pink, blue, green, yellow, red)
   - Visual motifs (tag input with add/remove)
   - Related characters (repeatable section: character select + connection textarea)
3. Use TanStack Form
4. Call mutation hooks on submit

**Dependencies:** T019-NE (hooks)

**Acceptance criteria:**
- Color picker shows preset palette
- Visual motifs support dynamic add/remove
- Character connection editor allows multiple entries
- Validation works

---

### T019-NE: Add Theme hooks

**Files to create:**
- `apps/web/src/features/themes/hooks/queries/use-theme-list.ts`
- `apps/web/src/features/themes/hooks/queries/use-theme.ts`
- `apps/web/src/features/themes/hooks/mutations/use-create-theme.ts`
- `apps/web/src/features/themes/hooks/mutations/use-update-theme.ts`
- `apps/web/src/features/themes/hooks/mutations/use-delete-theme.ts`

**Implementation steps:**
1. Follow same pattern as Scene hooks (T016-NE)
2. List query uses `seriesId` instead of `scriptId`
3. Optimistic updates for create/update/delete
4. Soft delete on backend, remove from cache on frontend

**Dependencies:** Theme contract (T002-NE), Theme router (T010-NE)

**Acceptance criteria:**
- Same patterns as Scene hooks
- List query by seriesId
- Optimistic updates work

---

## Frontend Story Arc UI (P1)

### T020-NE: Create Story Arc detail component matching V0 design

**Files to create:**
- `apps/web/src/features/story-arcs/components/story-arc-detail.tsx`

**Implementation steps:**
1. Create component with props
2. Implement sections:
   - Header: Arc name, status badge (color-coded: planned=gray, in_progress=blue, completed=green, abandoned=red), edit button
   - Description: Textarea or display text
   - Timeline visualization: Horizontal flow (start script → beats → end script) using simple div layout
   - Key Beats: Ordered list with script/scene references
   - Characters Involved: Avatar list with role badges
   - Related Themes: Linked theme badges (clickable to theme detail)
   - Resolution: Textarea or display text (only for completed arcs)
3. Status badge changes color based on status

**Dependencies:** T022-NE (hooks), T021-NE (form)

**Acceptance criteria:**
- Timeline shows progression across scripts
- Status badge color matches status
- Character roles displayed as badges
- Theme links work

---

### T021-NE: Create Story Arc form component

**Files to create:**
- `apps/web/src/features/story-arcs/components/story-arc-form.tsx`

**Implementation steps:**
1. Create modal/dialog form
2. Form fields:
   - Name (text input, required)
   - Description (textarea)
   - Status (dropdown: planned/in_progress/completed/abandoned)
   - Start script (dropdown from series scripts)
   - End script (dropdown from series scripts)
   - Key beats (dynamic list with order, description, optional script/scene reference)
   - Resolution (textarea, enabled only if status=completed)
   - Characters involved (repeatable: character select + role input)
   - Related themes (multi-select from series themes)
3. Beat list supports add/remove/reorder

**Dependencies:** T022-NE (hooks)

**Acceptance criteria:**
- Status dropdown works
- Script dropdowns populated from series
- Beat list reorderable
- Resolution field disabled unless status=completed

---

### T022-NE: Add Story Arc hooks

**Files to create:**
- `apps/web/src/features/story-arcs/hooks/queries/use-story-arc-list.ts`
- `apps/web/src/features/story-arcs/hooks/queries/use-story-arc.ts`
- `apps/web/src/features/story-arcs/hooks/mutations/use-create-story-arc.ts`
- `apps/web/src/features/story-arcs/hooks/mutations/use-update-story-arc.ts`
- `apps/web/src/features/story-arcs/hooks/mutations/use-delete-story-arc.ts`

**Implementation steps:**
1. Follow same pattern as Scene/Theme hooks
2. List query by seriesId
3. Soft delete (remove from cache)

**Dependencies:** Story Arc contract (T003-NE), Story Arc router (T011-NE)

**Acceptance criteria:**
- Same patterns as other entity hooks
- Soft delete handling

---

## KB Integration (P1)

### T026-NE: Extend KB "All" view to include narrative entities

**Files to modify:**
- `apps/web/src/features/knowledge-base/components/kb-all-view.tsx`

**Implementation steps:**
1. Extend entity type filter to include SCENE, THEME, STORY_ARC
2. Update grid queries to fetch narrative entities alongside existing entities
3. Add entity type icons and colors from ENTITY_METADATA
4. Sort/group option: Group by entity type in grid view
5. Entity cards show:
   - Scene: Scene number badge, heading, script name
   - Theme: Color indicator, name, description preview
   - Story Arc: Status badge, name, description preview
6. Click on card navigates to entity detail page

**Dependencies:** T013-NE (constants), all query hooks

**Acceptance criteria:**
- Filter includes all six entity types
- Grid shows mixed entity types
- Icons and colors correct per entity type
- Clicking navigates to detail page

---

### T027-NE: Add narrative entity tabs to KB

**Files to modify:**
- `apps/web/src/routes/_auth_only/series/$seriesId/knowledge-base.tsx`

**Implementation steps:**
1. Add three new tabs to existing KB tabs: Scenes, Themes, Story Arcs
2. Each tab shows filtered list of that entity type
3. Tab content uses existing list hooks:
   - Scenes tab: `useSceneList` (requires scriptId selector or show all scenes)
   - Themes tab: `useThemeList(seriesId)`
   - Story Arcs tab: `useStoryArcList(seriesId)`
4. Follow existing tab patterns (Characters, Locations, Props tabs)

**Dependencies:** All query hooks, T026-NE

**Acceptance criteria:**
- Three new tabs added
- Each tab shows correct entity list
- Tab switching works
- Empty states handled

---

### T028-NE: Create entity relationship components

**Files to create:**
- `apps/web/src/features/knowledge-base/components/scene-location-link.tsx`
- `apps/web/src/features/knowledge-base/components/theme-character-link.tsx`
- `apps/web/src/features/knowledge-base/components/arc-theme-link.tsx`

**Implementation steps:**
1. **scene-location-link.tsx**: Display scene → location relationship
   - Props: `{ sceneId: string, locationId: string }`
   - Renders location name as clickable link
   - Shows location details on hover (tooltip)

2. **theme-character-link.tsx**: Display theme → character connections
   - Props: `{ themeId: string, characterId: string, connection: string }`
   - Renders character avatar + name + connection text
   - Clickable to character detail

3. **arc-theme-link.tsx**: Display arc → theme relationships
   - Props: `{ arcId: string, themeIds: string[] }`
   - Renders theme badges with colors
   - Clickable to theme detail

**Dependencies:** T013-NE (constants), all query hooks

**Acceptance criteria:**
- All link components render correctly
- Links navigate to entity detail pages
- Tooltips/hovers work
- Entity data fetched and displayed

---

## Testing (P2)

### T045-NE: Targeted tests for narrative entities

**Files to create:**
- `apps/server/test/features/scenes/scene.service.test.ts`
- `apps/server/test/features/themes/theme.service.test.ts`
- `apps/server/test/features/story-arcs/story-arc.service.test.ts`

**Implementation steps:**
1. **Scene tests**:
   - Test scene number uniqueness per script
   - Test scene number auto-generation
   - Test cascade delete when script deleted
   - Test location reference validation

2. **Theme tests**:
   - Test character connection CRUD
   - Test evolution note CRUD
   - Test soft delete

3. **Story Arc tests**:
   - Test timeline generation
   - Test character role CRUD
   - Test status transitions

**Dependencies:** All backend services and models

**Acceptance criteria:**
- All critical paths tested
- Edge cases covered
- Tests pass with >80% coverage
- Integration tests include auth checks

---

## Summary Statistics

- **Total tasks:** 24 (excluding T045-NE testing)
- **P1 tasks:** 24
- **P2 tasks:** 0
- **Backend tasks:** 9 (contracts, models, services, routers)
- **Frontend tasks:** 15 (constants, components, hooks, integration)
- **Estimated effort:** ~12-15 development days for P1 tasks

---

## Dependency Graph (Key Paths)

```
Contracts (T001-T003) → Backend Models (T005-T007) → Backend Routers (T009-T011)
                                                    ↓
                                        Frontend Hooks (T016, T019, T022)
                                                    ↓
                                   Frontend Components (T014-T015, T017-T018, T020-T021)
                                                    ↓
                                         KB Integration (T026-T028)

T013 (Constants) can be done in parallel with backend work
```

---

## Implementation Order Recommendation

### Phase 1: Backend Foundation (Week 1)
1. T001-T003: Verify/complete contracts
2. T005-T007: Create models and services
3. T009-T011: Wire up routers

### Phase 2: Frontend Hooks & Constants (Week 2)
1. T013: Add entity constants
2. T016, T019, T022: Create all query/mutation hooks

### Phase 3: Frontend UI - Scenes & Themes (Week 2-3)
1. T014-T015: Scene detail and form
2. T017-T018: Theme detail and form

### Phase 4: Frontend UI - Story Arcs (Week 3)
1. T020-T021: Story Arc detail and form

### Phase 5: KB Integration (Week 3)
1. T026: Extend KB "All" view
2. T027: Add KB tabs
3. T028: Create relationship components

### Phase 6: Testing & Polish (Week 3-4)
1. T045: Write tests
2. Bug fixes and refinements
