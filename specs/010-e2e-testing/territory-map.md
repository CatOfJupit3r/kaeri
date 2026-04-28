# E2E Territory Map

This document maps the full Playwright territory for Kaeri. It complements `user-stories.md`: that file is the detailed scenario backlog, while this file organizes the suite by product surface, execution ring, current implementation status, and the fixtures/page objects needed to cover the app end to end.

The goal is a complete writer-first E2E suite that covers every meaningful user action, with extra depth around script authoring and the story tooling that makes Kaeri different from a generic CRUD app.

## Status Legend

- `Done`: Automated and currently passing in Playwright.
- `Now`: Route and feature surface exist today and should be automated on the main PR path.
- `Next`: Surface exists or is partially wired; automate after selectors, helpers, or minor UI contracts land.
- `Later`: Planned, collaboration-heavy, or interaction-heavy; keep mapped now and schedule for nightly or deferred coverage.

## Coverage Rings

| Ring | Goal | Suggested Scope |
|------|------|-----------------|
| Ring 0 | Fast merge gate | Auth, protected-route redirects, dashboard load, series create/open, script create/open, basic save |
| Ring 1 | Core writer journey | Script library, editor block behavior, autosave, KB basics, export happy path |
| Ring 2 | Story system confidence | Script x KB integration, narrative entities, continuity, canvas persistence, imports/exports |
| Ring 3 | Collaboration and resilience | Workspaces, invitations, roles, presence, conflicts, session expiry, network failure, large-data behavior |

## Current Baseline

| Domain | Status | Notes |
|--------|--------|-------|
| Auth | Partial | Setup auth state exists; login/signup/logout coverage is started |
| Dashboard and Series shell | Partial | Basic dashboard flows exist; opening a series from the dashboard into the writing surface is covered |
| Workspaces | Mapped only | Routes and UI exist; no dedicated E2E coverage yet |
| Scripts library | Partial | Empty state, create-and-open, card metadata, and reopen coverage exist |
| Script editor core | Partial | Editor route load, split layout, default starting block, toolbar and block-menu type switching, Tab cycling, scene-heading/character/dialogue Enter rules, Backspace deletion guards, arrow navigation, add-block controls, panel collapse/expand, panel tab switching, keyboard shortcuts panel, export/settings shortcuts, breakdown/table-read dialogs, version history open/list/preview/dismiss/restore flows, typing, save-state transition, and explicit save-and-reload persistence are covered |
| Script x KB integration | Partial | Dedicated editor-integration coverage now exists for character-block KB suggestions and keyboard selection |
| Knowledge base | Partial | Route default/deep-link behavior, search-to-tab routing, and character create/edit/delete/detail flows are covered |
| Canvas | Mapped only | Route exists; interaction-heavy coverage should be staged carefully |
| Export and import | Mapped only | JSON export/import and PDF export surfaces exist |
| Continuity and analytics | Mapped only | KB history/graph and analytics routes exist; no executable coverage yet |
| Collaboration and presence | Mapped only | Workspace, invitation, role, activity, and presence surfaces exist or are partially wired |

## Domain Overview

| Domain | Primary Entry Points | Priority | Status |
|--------|----------------------|----------|--------|
| Public shell and auth | `/`, `/auth`, protected routes | P0 | Now |
| Account and shell behavior | `/profile`, `/settings`, header, user menu | P1 | Next |
| Workspaces and invitations | `/workspaces`, `/workspaces/$workspaceId`, `/workspaces/invitations/$code` | P1 | Next |
| Dashboard, series, and episodes | `/dashboard`, `/series/$seriesId`, `/series/$seriesId/episodes` | P1 | Now |
| Scripts library and metadata | `/series/$seriesId/scripts` | P1 | Now |
| Script editor core | `/series/$seriesId/scripts/$scriptId` | P0 | Now |
| Script x KB integration | Script editor + KB routes | P0 | Next |
| Knowledge base entity management | `/series/$seriesId/knowledge-base` and detail routes | P1 | Next |
| Narrative entities and continuity | KB sub-tabs, continuity graph, history | P1 | Next |
| Canvas | `/series/$seriesId/canvas` | P2 | Later |
| Export, import, and analytics | Export modal, import modal, `/series/$seriesId/analytics` | P2 | Next |
| Resilience and multi-user behavior | Cross-cutting | P1 | Later |

## Prerequisites For Full Coverage

- Stable `data-testid` coverage for the script editor, autocomplete popovers, save indicator, workspace dialogs, member lists, KB cards, canvas handles, export modal, and analytics widgets.
- API seeding helpers for user, workspace, series, script, KB entity, narrative entity, and canvas state setup.
- Multi-user fixtures that can run two browser contexts with separate auth states for collaboration and role tests.
- Download helpers for PDF and JSON assertions.
- Network control helpers for offline, timeout, and retry scenarios.
- Dedicated page objects beyond the current baseline: `WorkspacePage`, `WorkspaceSettingsPage`, `SeriesPage`, `ScenePage`, `CanvasPage`, `ExportPage`, `AnalyticsPage`.

## Territory By Product Surface

### 1. Public Shell, Auth, and Route Protection

Primary surfaces: `/`, `/auth`, protected route redirects, user menu sign-out.

Suggested fixtures and objects:
- `auth.fixture.ts`
- `AuthPage`
- `DashboardPage`

Scenario inventory:
- `AUTH-01` (`Now`): Unauthenticated user visiting `/dashboard` is redirected to `/auth`.
- `AUTH-02` (`Now`): Unauthenticated user visiting a deep protected route is redirected to `/auth`.
- `AUTH-03` (`Now`): New user can sign up and land in authenticated UI.
- `AUTH-04` (`Now`): Existing user can sign in with valid credentials.
- `AUTH-05` (`Now`): Invalid credentials keep the user on `/auth` and show an error state.
- `AUTH-06` (`Now`): Authenticated user visiting `/auth` is redirected to `/dashboard`.
- `AUTH-07` (`Now`): Logout clears the session and removes access to protected routes.
- `AUTH-08` (`Now`): Session survives full page reload.
- `AUTH-09` (`Next`): Signup validation covers required fields and malformed input.
- `AUTH-10` (`Next`): Duplicate signup surfaces a clear server error.
- `AUTH-11` (`Later`): Session expiry during a mutation returns the user to auth without silent failure.
- `AUTH-12` (`Later`): Re-auth after session expiry returns the user to the last relevant route.

### 2. Account Surfaces and Global Shell

Primary surfaces: header, theme toggle, keyboard shortcuts modal, `/profile`, `/settings`.

Suggested fixtures and objects:
- `account.fixture.ts`
- `ProfilePage`
- `SettingsPage`
- `HeaderPage`

Scenario inventory:
- `ACCOUNT-01` (`Next`): Header reflects signed-in vs signed-out state.
- `ACCOUNT-02` (`Next`): User menu exposes profile, settings, and sign-out actions.
- `ACCOUNT-03` (`Next`): Profile page loads the signed-in user's data.
- `ACCOUNT-04` (`Next`): Settings page loads successfully for authenticated users.
- `ACCOUNT-05` (`Next`): Theme toggle changes UI theme and persists after reload.
- `ACCOUNT-06` (`Next`): Keyboard shortcuts modal opens and closes without breaking editor focus state.
- `ACCOUNT-07` (`Later`): Profile mutations supported by the current UI persist across reloads.

### 3. Workspaces, Invitations, Roles, and Team Activity

Primary surfaces: `/workspaces`, `/workspaces/$workspaceId`, `/workspaces/$workspaceId/settings`, `/workspaces/invitations/$code`.

Suggested fixtures and objects:
- `workspace.fixture.ts`
- `multi-user.fixture.ts`
- `WorkspacesPage`
- `WorkspacePage`
- `WorkspaceSettingsPage`
- `InvitationPage`

Scenario inventory:
- `WORKSPACE-01` (`Next`): Workspaces index loads personal and team sections correctly.
- `WORKSPACE-02` (`Next`): User can create a new workspace from the workspaces index.
- `WORKSPACE-03` (`Next`): Empty team-workspace state shows the create action.
- `WORKSPACE-04` (`Next`): Workspace dashboard shows role, member count, and joined date.
- `WORKSPACE-05` (`Next`): Owner or admin can open workspace settings.
- `WORKSPACE-06` (`Next`): Non-admin user is blocked from workspace settings.
- `WORKSPACE-07` (`Next`): Workspace name and description edits persist.
- `WORKSPACE-08` (`Next`): Owner can open delete confirmation for non-personal workspace.
- `WORKSPACE-09` (`Next`): Delete cancellation preserves the workspace.
- `WORKSPACE-10` (`Next`): Invitation accept flow routes the invitee into the workspace.
- `WORKSPACE-11` (`Next`): Invitation decline flow routes back to workspaces.
- `WORKSPACE-12` (`Next`): Expired or invalid invitation shows a safe error state.
- `WORKSPACE-13` (`Later`): Owner/admin can invite a member and see them in the member list.
- `WORKSPACE-14` (`Later`): Activity feed shows recent workspace events without leaking inaccessible resources.
- `WORKSPACE-15` (`Later`): Role changes take effect immediately for a second user.
- `WORKSPACE-16` (`Later`): Viewer cannot perform edit actions.
- `WORKSPACE-17` (`Later`): Editor can edit content but cannot delete a workspace or manage members.
- `WORKSPACE-18` (`Later`): Series transfer between workspaces preserves scripts, KB, and canvas data.

### 4. Dashboard, Series Shell, and Episode Routing

Primary surfaces: `/dashboard`, `/series/$seriesId`, `/series/$seriesId/episodes`, series header, series tabs.

Suggested fixtures and objects:
- `series.fixture.ts`
- `DashboardPage`
- `SeriesPage`

Scenario inventory:
- `SERIES-01` (`Now`): Dashboard empty state appears for new accounts.
- `SERIES-02` (`Now`): Create project from empty state creates a visible series card.
- `SERIES-03` (`Now`): Create project from dashboard header action creates a visible series card.
- `SERIES-04` (`Done`, `Now`): Series card opens the selected series.
- `SERIES-05` (`Now`): Series redirect route sends `/series/$seriesId` to the scripts tab.
- `SERIES-06` (`Next`): Series header renders correct title and metadata.
- `SERIES-07` (`Next`): Series metadata edit persists on refresh.
- `SERIES-08` (`Next`): Delete series removes it from dashboard after confirmation.
- `SERIES-09` (`Next`): Delete cancellation preserves the series.
- `SERIES-10` (`Next`): Series tabs navigate among scripts, KB, canvas, analytics, and episodes.
- `SERIES-11` (`Next`): Dashboard handles multi-series libraries correctly.
- `SERIES-12` (`Later`): Dashboard search or filtering narrows visible series without data loss.
- `EPISODE-01` (`Next`): Non-TV series surfaces the "episodes only available for TV series" guard.
- `EPISODE-02` (`Next`): TV series loads the episode list route successfully.
- `EPISODE-03` (`Later`): Episode CRUD flows exposed by `EpisodeList` behave correctly once selectors are added.

### 5. Scripts Library and Script Metadata

Primary surfaces: `/series/$seriesId/scripts` and script settings/export entry points from the editor route.

Suggested fixtures and objects:
- `script.fixture.ts`
- `ScriptLibraryPage`
- `ScriptSettingsPage`

Scenario inventory:
- `SCRIPT-LIB-01` (`Done`, `Now`): Empty script library state appears for a series with no scripts.
- `SCRIPT-LIB-02` (`Done`, `Now`): "New Script" creates a script and navigates directly into the editor.
- `SCRIPT-LIB-03` (`Done`, `Now`): Existing scripts render as cards with title and last-edited metadata.
- `SCRIPT-LIB-04` (`Done`, `Now`): Opening a script card navigates to `/series/$seriesId/scripts/$scriptId`.
- `SCRIPT-LIB-05` (`Next`): Script library pagination works across multiple pages.
- `SCRIPT-LIB-06` (`Next`): Script cover, genre, authors, and logline render when present.
- `SCRIPT-LIB-07` (`Next`): Script settings modal opens from the editor toolbar.
- `SCRIPT-LIB-08` (`Next`): Script metadata edits persist after reload.
- `SCRIPT-LIB-09` (`Next`): Script deletion from settings removes the script from the library.
- `SCRIPT-LIB-10` (`Later`): Library loading and error states recover cleanly.

### 6. Script Editor Core Writing Flow

Primary surface: `/series/$seriesId/scripts/$scriptId`.

This is the most important E2E surface in the product. It should have its own page object and dedicated Ring 0, Ring 1, and Ring 2 suites.

Suggested fixtures and objects:
- `script.fixture.ts`
- `editor.fixture.ts`
- `ScriptEditorPage`

Scenario inventory:
- `EDITOR-01` (`Done`, `Now`): Script editor route loads a saved script.
- `EDITOR-02` (`Done`, `Now`): Split layout renders editor on the left and side panel on the right.
- `EDITOR-03` (`Done`, `Now`): Default empty script starts with at least one editable block.
- `EDITOR-04` (`Done`, `Now`): Typing into the current block updates visible content.
- `EDITOR-05` (`Done`, `Now`): Manual or debounced save persists content across reload.
- `EDITOR-06` (`Done`, `Now`): Save indicator moves through saving and saved states.
- `EDITOR-07` (`Done`, `Next`): Block type dropdown changes the current block type.
- `EDITOR-08` (`Done`, `Next`): `Tab` cycles block types in the expected order.
- `EDITOR-09` (`Done`, `Next`): `Enter` after scene heading creates an action block.
- `EDITOR-10` (`Done`, `Next`): `Enter` after character creates a dialogue block.
- `EDITOR-11` (`Done`, `Next`): `Enter` after dialogue creates the next speaker block according to editor rules.
- `EDITOR-12` (`Done`, `Next`): `Backspace` on an empty block removes it and focuses the previous block.
- `EDITOR-13` (`Done`, `Next`): Minimum one block remains after deleting empty blocks.
- `EDITOR-14` (`Done`, `Next`): Arrow-key navigation moves between adjacent blocks.
- `EDITOR-15` (`Done`, `Next`): Toolbar block-type switcher updates the current block.
- `EDITOR-16` (`Done`, `Next`): Add-block affordance inserts a new block at the end.
- `EDITOR-17` (`Done`, `Next`): Right-panel collapse and expand preserve editor usability.
- `EDITOR-18` (`Done`, `Next`): KB and canvas tabs inside the side panel can be switched without losing editor content.
- `EDITOR-19` (`Done`, `Next`): Keyboard shortcut modal does not trap or break editor interaction after close.
- `EDITOR-20` (`Done`, `Next`): Opening export with `Mod+E` shows the export modal.
- `EDITOR-21` (`Done`, `Next`): Opening script settings with `Mod+,` shows the settings modal.
- `EDITOR-22` (`Done`, `Next`): Breakdown modal opens from the toolbar.
- `EDITOR-23` (`Done`, `Next`): Table-read modal opens from the toolbar.
- `EDITOR-24` (`Done`, `Next`): Version history panel opens and lists versions when version data exists.
- `EDITOR-25` (`Done`, `Next`): Previewing an older version makes the editor read-only.
- `EDITOR-26` (`Done`, `Next`): Dismissing version preview restores the working draft.
- `EDITOR-27` (`Done`, `Next`): Restoring a version makes it the canonical current content.
- `EDITOR-28` (`Later`): Plain-text paste is parsed into screenplay block types correctly.
- `EDITOR-29` (`Later`): Copy and paste preserve block semantics where supported.
- `EDITOR-30` (`Later`): Large scripts remain responsive and save without UI desynchronization.

### 7. Script x Knowledge Base Integration

Primary surfaces: editor autocomplete, mention rendering, hover preview, scene metadata, KB detail routes.

This is the highest-value "unique feature" territory and deserves a dedicated directory such as `editor-integration/`.

Suggested fixtures and objects:
- `kb.fixture.ts`
- `narrative.fixture.ts`
- `ScriptEditorPage`
- `KnowledgeBasePage`
- `CharacterPage`
- `ScenePage`

Scenario inventory:
- `INTEGRATION-01` (`Done`, `Next`): Typing in a character block shows character suggestions from the KB.
- `INTEGRATION-02` (`Done`, `Next`): Character suggestions can be navigated with arrow keys and confirmed with `Enter`.
- `INTEGRATION-03` (`Later`): Quick-create from character suggestion flow pre-fills the new character name.
- `INTEGRATION-04` (`Next`): Typing a scene heading after `INT.` or `EXT.` shows location suggestions.
- `INTEGRATION-05` (`Later`): Time-of-day suggestions appear after selecting a location and typing a separator.
- `INTEGRATION-06` (`Later`): Quick-create from scene-heading location autocomplete opens with parsed location data.
- `INTEGRATION-07` (`Next`): Typing `@` in an action block shows character mention suggestions.
- `INTEGRATION-08` (`Next`): Typing `#` in an action block shows prop suggestions.
- `INTEGRATION-09` (`Next`): Typing `!` in a block shows wildcard or research suggestions.
- `INTEGRATION-10` (`Next`): Selecting an entity mention inserts the linked mention into content.
- `INTEGRATION-11` (`Next`): Hovering a linked entity shows the preview card.
- `INTEGRATION-12` (`Next`): Clicking "Open in KB" from a preview routes to the relevant detail surface.
- `INTEGRATION-13` (`Later`): Renaming an entity in the KB updates linked editor references.
- `INTEGRATION-14` (`Later`): Deleting a linked entity produces a visible orphaned-reference state instead of silent corruption.
- `INTEGRATION-15` (`Later`): Scene quick editor opens from the scene block menu and persists metadata.
- `INTEGRATION-16` (`Later`): Linking a scene to characters or props updates the associated narrative entity detail views.
- `INTEGRATION-17` (`Later`): Character appearances written in the editor show up in character detail appearance lists.
- `INTEGRATION-18` (`Later`): Theme tagging from selected text persists and surfaces in theme appearances.
- `INTEGRATION-19` (`Later`): Story-arc linking from scene metadata persists and is visible in arc detail flows.
- `INTEGRATION-20` (`Later`): Timeline linking from scene metadata appears in timeline views.

### 8. Knowledge Base Entity Management

Primary surface: `/series/$seriesId/knowledge-base` plus detail routes for characters and scenes.

Suggested fixtures and objects:
- `kb.fixture.ts`
- `KnowledgeBasePage`
- `CharacterPage`
- `ScenePage`

Scenario inventory:
- `KB-01` (`Done`, `Next`): Knowledge Base route loads with the `all` tab by default.
- `KB-02` (`Done`, `Next`): Query-string tab state persists and deep-links correctly.
- `KB-03` (`Next`): Grid/list toggle switches presentation without losing the selected tab.
- `KB-04` (`Done`, `Next`): Global KB search returns matching results across entity families.
- `KB-05` (`Done`, `Next`): Clicking a search result routes the user to the matching tab or detail surface.
- `KB-06` (`Done`, `Next`): Character create, edit, and delete flows work end to end.
- `KB-07` (`Next`): Location create, edit, and delete flows work end to end.
- `KB-08` (`Next`): Prop create, edit, and delete flows work end to end.
- `KB-09` (`Next`): Scene entity list and detail flows work end to end.
- `KB-10` (`Next`): Timeline entry create, edit, and delete flows work end to end.
- `KB-11` (`Next`): Wildcard create, edit, and delete flows work end to end.
- `KB-12` (`Next`): Story arc create, edit, and delete flows work end to end.
- `KB-13` (`Next`): Theme create, edit, and delete flows work end to end.
- `KB-14` (`Next`): Research-item flows exposed in the research tab work end to end.
- `KB-15` (`Done`, `Next`): Character detail route loads overview data.
- `KB-16` (`Next`): Character relationships render and navigate safely.
- `KB-17` (`Next`): Character appearances tab shows linked script/scene references when data exists.
- `KB-18` (`Later`): Duplicate-name handling stays usable and disambiguated.
- `KB-19` (`Later`): Delete flows involving linked entities surface the correct warnings or repair paths.
- `KB-20` (`Later`): Large KB datasets preserve usable loading and search behavior.

### 9. Narrative Entities, Continuity, and Analytics

Primary surfaces: KB `scenes`, `themes`, `story-arcs`, `timeline`, `graph`, `history` tabs and `/series/$seriesId/analytics`.

Suggested fixtures and objects:
- `narrative.fixture.ts`
- `continuity.fixture.ts`
- `KnowledgeBasePage`
- `ScenePage`
- `AnalyticsPage`

Scenario inventory:
- `NARRATIVE-01` (`Next`): Scene detail page loads scene metadata and linked entities.
- `NARRATIVE-02` (`Next`): Theme list and theme detail behaviors work for existing data.
- `NARRATIVE-03` (`Next`): Story-arc list and arc-detail behaviors work for existing data.
- `NARRATIVE-04` (`Next`): Timeline list renders ordered entries correctly.
- `NARRATIVE-05` (`Next`): Continuity graph tab loads graph data for a populated series.
- `NARRATIVE-06` (`Next`): Audit history tab loads paginated canon history.
- `NARRATIVE-07` (`Next`): Series analytics dashboard loads without route errors.
- `NARRATIVE-08` (`Later`): Clicking a continuity-graph node opens the correct detail surface.
- `NARRATIVE-09` (`Later`): History filters narrow to the selected entity type without leaking other data.
- `NARRATIVE-10` (`Later`): Analytics widgets reflect recent script and KB changes.

### 10. Canvas

Primary surface: `/series/$seriesId/canvas`.

Suggested fixtures and objects:
- `canvas.fixture.ts`
- `CanvasPage`

Scenario inventory:
- `CANVAS-01` (`Later`): Canvas route loads existing board data for a series.
- `CANVAS-02` (`Later`): Adding a text node persists after reload.
- `CANVAS-03` (`Later`): Adding a shape or sticky node persists after reload.
- `CANVAS-04` (`Later`): Connecting two nodes creates a persistent edge.
- `CANVAS-05` (`Later`): Dragging a node updates its position and survives reload.
- `CANVAS-06` (`Later`): Pan and zoom interactions preserve user control and do not corrupt state.
- `CANVAS-07` (`Later`): Editing node labels or styles persists.
- `CANVAS-08` (`Later`): Deleting nodes or edges removes them cleanly.
- `CANVAS-09` (`Later`): Linked entity nodes navigate back into the relevant content surface when supported.
- `CANVAS-10` (`Later`): High-node-count boards remain usable enough for production workflows.

### 11. Export, Import, and Downloads

Primary surfaces: editor export modal, KB JSON export/import actions.

Suggested fixtures and objects:
- `download.fixture.ts`
- `ExportPage`
- `KnowledgeBasePage`

Scenario inventory:
- `EXPORT-01` (`Next`): Export modal opens from the editor toolbar.
- `EXPORT-02` (`Next`): Export modal opens from the `Mod+E` shortcut.
- `EXPORT-03` (`Next`): PDF export triggers a file download.
- `EXPORT-04` (`Next`): Downloaded PDF is non-empty and named correctly.
- `EXPORT-05` (`Later`): Exported PDF preserves expected screenplay formatting for scene headings, dialogue, and action.
- `EXPORT-06` (`Later`): Exporting an empty or invalid script surfaces the correct user feedback.
- `EXPORT-07` (`Next`): Series JSON export from KB triggers successfully.
- `EXPORT-08` (`Next`): Import modal opens from KB.
- `EXPORT-09` (`Later`): Importing valid series JSON materializes data in the KB.
- `EXPORT-10` (`Later`): Invalid import surfaces a clear error and leaves existing data intact.

### 12. Presence, Collaboration, and Multi-User Authoring

Primary surfaces: workspace member flows, script-presence behavior, activity feed, role-guarded actions.

Suggested fixtures and objects:
- `multi-user.fixture.ts`
- dual-context page objects for editor and workspace surfaces

Scenario inventory:
- `COLLAB-01` (`Later`): Two users in the same workspace can both open the same series.
- `COLLAB-02` (`Later`): Presence indicators appear when another user opens the same script.
- `COLLAB-03` (`Later`): Presence indicators clear when the other user leaves the script.
- `COLLAB-04` (`Later`): Viewer role can read but cannot mutate workspace or series content.
- `COLLAB-05` (`Later`): Editor role can mutate content but cannot access admin-only workspace settings.
- `COLLAB-06` (`Later`): Activity feed records edits from multiple users without cross-workspace leakage.
- `COLLAB-07` (`Later`): Invitation acceptance by a second user grants the expected role and access.
- `COLLAB-08` (`Later`): Concurrent edits surface the intended reconciliation behavior once collaboration rules are finalized.

### 13. Cross-Cutting Resilience and UX Guarantees

Primary surfaces: all main routes and mutations.

Suggested fixtures and objects:
- `network.fixture.ts`
- `resilience.fixture.ts`
- shared helpers for toasts, skeletons, route assertions, and download cleanup

Scenario inventory:
- `RESILIENCE-01` (`Next`): Loading skeletons or placeholders appear on major route transitions.
- `RESILIENCE-02` (`Next`): Success toasts appear for key create and update mutations.
- `RESILIENCE-03` (`Next`): Error toasts appear for failed mutations.
- `RESILIENCE-04` (`Next`): Browser back and forward preserve expected route history through dashboard, series, and script flows.
- `RESILIENCE-05` (`Next`): Inaccessible resources return a safe UX (`/auth`, redirect, or not-found behavior) without leaking protected data.
- `RESILIENCE-06` (`Later`): Network failure during autosave surfaces a recoverable error.
- `RESILIENCE-07` (`Later`): Retry flows recover after transient network failure.
- `RESILIENCE-08` (`Later`): Session expiry during save or export does not silently drop work.
- `RESILIENCE-09` (`Later`): Unsaved-change handling behaves correctly when navigating away from the editor.
- `RESILIENCE-10` (`Later`): High-volume datasets do not break pagination, search, or route stability.

## Recommended Spec Directory Layout

The current `apps/web/test/e2e` directory should grow into feature slices that match this map.

```text
apps/web/test/e2e/
  auth/
  account/
  workspaces/
  dashboard/
  series/
  scripts-library/
  editor/
  editor-integration/
  knowledge-base/
  narrative/
  canvas/
  export/
  analytics/
  collaboration/
  resilience/
```

## Recommended Fixture Layers

| Fixture | Purpose |
|--------|---------|
| `auth.fixture.ts` | Authenticated and anonymous contexts |
| `workspace.fixture.ts` | Workspace, membership, invitation, role setup |
| `series.fixture.ts` | Series creation and cleanup |
| `script.fixture.ts` | Script creation, seeded content, and cleanup |
| `kb.fixture.ts` | Characters, locations, props, wildcards, timeline, and search data |
| `narrative.fixture.ts` | Scenes, themes, story arcs, appearances, and continuity-rich seed data |
| `canvas.fixture.ts` | Nodes, edges, and viewport-ready canvas state |
| `download.fixture.ts` | PDF and JSON download handling |
| `multi-user.fixture.ts` | Dual-user browser contexts for invitations, roles, and presence |
| `network.fixture.ts` | Fault injection and retry validation |

## Execution Strategy

- Ring 0 runs on every PR.
- Ring 1 runs on every PR once the editor and KB selectors are stable.
- Ring 2 runs on merge and nightly.
- Ring 3 runs nightly until the collaboration model and heavy-interaction surfaces stabilize.

## Source Specs

This map is derived from the following specs and current route surfaces:

- `001-series`
- `002-scripts`
- `003-knowledge-base`
- `004-canvas`
- `005-export`
- `006-continuity`
- `007-narrative-entities`
- `008-script-kb-integration`
- `009-collaboration`
- `010-e2e-testing`
