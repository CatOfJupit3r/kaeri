# Concrete Tasks: Series Management

Breakdown modeled after TASK_BREAKDOWN.md structure.

---

## Session S1.1: Series Creation Modal
**Goal**: Complete series creation functionality with modal and validation  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create series modal component: `apps/web/src/features/series/components/series-modal.tsx`
   - Form fields: title (required), genre, logline, coverUrl
   - Use TanStack Form with zod validation
   - Modal/dialog wrapper using shadcn Dialog

2. Wire to "New Project" button in projects route
   - Dialog state management (open/close)
   - Use existing `use-create-series` hook
   - Success closes modal and shows success toast

**Acceptance Criteria**:
- Click "New Project" opens modal with form
- Form validates required field (title)
- Creating series adds to list immediately (optimistic)
- Modal closes on success
- Error handling with toast

**Files to Create**:
- `apps/web/src/features/series/components/series-modal.tsx`

**Files to Update**:
- `apps/web/src/routes/_auth_only/projects.tsx` (wire button to modal)

---

## Session S1.2: Series Editing & Deletion
**Goal**: Enable editing and deleting series with confirmation dialogs  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Update series-modal.tsx to support edit mode
   - Accept initial data prop for pre-filling
   - Update form title and button text based on mode
   - Call update mutation instead of create

2. Add edit/delete actions to series cards in projects.tsx
   - Edit button (icon or dropdown menu)
   - Delete button with confirmation dialog using shadcn AlertDialog
   - Use existing `use-update-series` and `use-delete-series` hooks

3. Ensure optimistic updates work correctly
   - Edit updates card immediately
   - Delete removes card immediately

**Acceptance Criteria**:
- Series cards have edit and delete actions
- Edit opens modal pre-filled with data
- Delete shows confirmation dialog
- Both operations update UI immediately (optimistic)
- Success/error toasts

**Files to Update**:
- `apps/web/src/features/series/components/series-modal.tsx` (edit mode support)
- `apps/web/src/routes/_auth_only/projects.tsx` (add edit/delete actions)

---

## Session S1.3: Series Detail View with Navigation
**Goal**: Create series detail/overview page with navigation tabs  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create route: `apps/web/src/routes/_auth_only/series/$seriesId/index.tsx`
   - Series overview/dashboard layout
   - Show series metadata (title, genre, logline, cover)
   - Quick stats (script count, KB entity counts)
   - Navigation tabs/buttons to Scripts and Knowledge Base

2. Update series cards in projects.tsx to link to detail view
   - Click card navigates to series detail route

3. Add breadcrumb navigation
   - Breadcrumb: Projects > Series Name
   - Navigation back to projects list

**Acceptance Criteria**:
- Clicking series card navigates to detail page
- Detail page shows series info and stats
- Can navigate to scripts and KB from detail page
- Breadcrumb navigation works correctly

**Files to Create**:
- `apps/web/src/routes/_auth_only/series/$seriesId/index.tsx`

**Files to Update**:
- `apps/web/src/routes/_auth_only/projects.tsx` (add click navigation to cards)

---

## Session S1.4: Series List Loading & Error States
**Goal**: Improve loading and error states for series list  
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Create loading skeleton for series grid
   - Skeleton cards matching series card layout
   - Show while query is loading

2. Create error state component
   - Friendly error message
   - Retry button
   - Handle 404 for missing series

3. Add empty state for zero series
   - Illustration/icon
   - CTA to create first series

**Acceptance Criteria**:
- Loading state shows skeleton cards
- Error state shows message with retry option
- Empty state appears when no series exist
- All states are visually polished

**Files to Create**:
- `apps/web/src/components/loading/series-skeleton.tsx`
- `apps/web/src/components/errors/series-error.tsx`

**Files to Update**:
- `apps/web/src/routes/_auth_only/projects.tsx` (integrate states)
