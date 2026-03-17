````markdown
# E2E Testing - Test ID Reference

This document lists recommended `data-testid` attributes to add to components for reliable E2E test selectors.

## Why Test IDs?

Test IDs provide stable selectors that:
- Don't change with UI refactoring
- Are independent of text content (localization-safe)
- Are explicit about testing intent
- Are easier to maintain than CSS selectors

## Naming Convention

Use kebab-case with the pattern: `{component}-{element}-{variant?}`

Examples:
- `series-card`
- `series-card-title`
- `create-series-button`
- `script-editor-block`

## Required Test IDs by Feature

### Authentication (`apps/web/src/features/auth/`)

| Component | Test ID | Element |
|-----------|---------|---------|
| Auth form | `auth-form` | Form container |
| Auth form | `auth-error` | Error message display |
| Auth form | `auth-submit` | Submit button |
| Auth tabs | `auth-tab-login` | Login tab |
| Auth tabs | `auth-tab-signup` | Signup tab |

### Dashboard (`apps/web/src/routes/_auth_only/dashboard.tsx`)

| Component | Test ID | Element |
|-----------|---------|---------|
| Series grid | `series-grid` | Grid container |
| Series card | `series-card` | Individual series card |
| Series card | `series-card-title` | Series title |
| Series card | `series-card-menu` | Card action menu |
| Empty state | `empty-series` | No series message |
| Create button | `create-series-button` | Create series button |
| Search | `search-input` | Search input field |

### Series View (`apps/web/src/routes/_auth_only/series/`)

| Component | Test ID | Element |
|-----------|---------|---------|
| Header | `series-header` | Series header section |
| Header | `series-title` | Series title display |
| Tabs | `series-tab-scripts` | Scripts tab |
| Tabs | `series-tab-knowledge-base` | KB tab |
| Tabs | `series-tab-canvas` | Canvas tab |
| Tabs | `series-tab-settings` | Settings tab |
| Scripts list | `scripts-list` | Scripts container |
| Script card | `script-card` | Individual script card |
| Create script | `create-script-button` | Create script button |

### Script Editor (`apps/web/src/features/scripts/`)

| Component | Test ID | Element |
|-----------|---------|---------|
| Editor | `script-editor` | Editor container |
| Block | `block` | Script block (also add `data-block-type`) |
| Block | `block-type-selector` | Block type dropdown |
| Block | `block-textarea` | Block content input |
| Add block | `add-block-button` | Add block button |
| Save indicator | `save-indicator` | Save status display |
| KB panel | `knowledge-base-panel` | KB side panel |
| Autocomplete | `autocomplete-dropdown` | Autocomplete menu |

### Knowledge Base (`apps/web/src/features/knowledge-base/`)

| Component | Test ID | Element |
|-----------|---------|---------|
| Tabs | `kb-entity-tabs` | Entity type tabs |
| Tab | `kb-tab-characters` | Characters tab |
| Tab | `kb-tab-locations` | Locations tab |
| Tab | `kb-tab-props` | Props tab |
| Tab | `kb-tab-themes` | Themes tab |
| Entity list | `entity-list` | Entity grid/list |
| Entity card | `entity-card` | Individual entity card |
| Create button | `create-entity-button` | Create entity button |
| Search | `entity-search-input` | Entity search input |

### Canvas (`apps/web/src/features/canvas/`) - DEFERRED

> **Note**: Canvas E2E tests are deferred due to complexity. These test IDs are documented for future implementation.

| Component | Test ID | Element |
|-----------|---------|---------|
| Container | `canvas-container` | Canvas wrapper |
| Toolbar | `canvas-toolbar` | Canvas toolbar |
| Add node | `add-node-button` | Add node button |
| Node type menu | `node-type-menu` | Node type selector |
| Zoom controls | `canvas-zoom-in` | Zoom in button |
| Zoom controls | `canvas-zoom-out` | Zoom out button |
| Zoom controls | `canvas-fit-view` | Fit view button |

### User Menu (`apps/web/src/components/`)

| Component | Test ID | Element |
|-----------|---------|---------|
| Avatar | `user-avatar` | User avatar trigger |
| Menu | `user-menu` | User dropdown menu |
| Profile link | `user-menu-profile` | Profile link |
| Settings link | `user-menu-settings` | Settings link |
| Logout button | `user-menu-logout` | Logout button |

### Modals (Global)

| Component | Test ID | Element |
|-----------|---------|---------|
| Modal | `modal-{name}` | Modal container |
| Modal title | `modal-title` | Modal title |
| Modal close | `modal-close` | Close button |
| Modal save | `modal-save` | Save/Submit button |
| Modal cancel | `modal-cancel` | Cancel button |

### Loading States (Global)

| Component | Test ID | Element |
|-----------|---------|---------|
| Skeleton | `skeleton` | Skeleton loader |
| Spinner | `loading-spinner` | Loading spinner |
| Loading overlay | `loading-overlay` | Full-page loading |

## Adding Test IDs to Components

### React Component Example

```tsx
// Before
<div className="series-card">
  <h3>{series.title}</h3>
  <button onClick={onEdit}>Edit</button>
</div>

// After
<div 
  className="series-card"
  data-testid="series-card"
>
  <h3 data-testid="series-card-title">{series.title}</h3>
  <button 
    onClick={onEdit}
    data-testid="series-card-edit"
  >
    Edit
  </button>
</div>
```

### Dynamic Test IDs

For lists, include a unique identifier:

```tsx
<div
  data-testid={`series-card-${series.id}`}
>
```

### Conditional Test IDs (Development Only)

If you want to strip test IDs in production:

```tsx
// In a utility file
export const testId = (id: string) => 
  process.env.NODE_ENV === 'production' ? {} : { 'data-testid': id };

// Usage
<div {...testId('series-card')}>
```

## Block Type Data Attributes

For script blocks, add both `data-testid` and `data-block-type`:

```tsx
<div
  data-testid="block"
  data-block-type={block.type}  // 'scene-heading' | 'action' | 'character' | etc.
>
```

## State Attributes

Add data attributes for state tracking:

```tsx
<div
  data-testid="save-indicator"
  data-save-status={isSaving ? 'saving' : 'saved'}
>
  {isSaving ? 'Saving...' : 'Saved'}
</div>
```

## Toast/Sonner Attributes

Sonner automatically adds `data-sonner-toast` and `data-type` attributes. Use these in tests:

```typescript
// Success toast
this.page.locator('[data-sonner-toast][data-type="success"]')

// Error toast  
this.page.locator('[data-sonner-toast][data-type="error"]')
```

## Implementation Checklist

- [ ] Auth components
- [ ] Dashboard components
- [ ] Series header and tabs
- [ ] Script editor blocks
- [ ] Knowledge base entity cards
- [ ] User menu
- [ ] All modal dialogs
- [ ] Loading states
- [ ] Canvas controls (deferred)

## Notes

1. Only add test IDs to elements that tests actually need to interact with
2. Prefer semantic HTML and ARIA roles when possible (Playwright can target these)
3. Keep test IDs stable - changing them breaks tests
4. Document test IDs in component prop types for discoverability

````
