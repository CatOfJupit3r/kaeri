# Concrete Tasks: Export

Export domain has no sessions in original TASK_BREAKDOWN.md (deferred post-MVP). Creating session plan for PDF and JSON export.

---

## Session EX1.1: Install PDF Library & Basic PDF Generation
**Goal**: Integrate pdf-lib and implement basic script PDF export  
**Estimated Time**: 60-75 minutes

**Deliverables**:
1. Install pdf-lib: `bun add pdf-lib`

2. Implement PDF generation in `apps/server/src/features/export/export.service.ts`:
   - Replace TODO in `exportScriptPdf` with real PDF generation
   - Use pdf-lib to create PDF document
   - Set Courier New font, 12pt
   - Add pages and basic text rendering
   - Return PDF as buffer/blob

3. Test basic export
   - Export simple script with plain text
   - Verify PDF opens correctly

**Acceptance Criteria**:
- pdf-lib integrated successfully
- exportScriptPdf generates valid PDF file
- PDF uses Courier New, 12pt
- Basic script content appears in PDF

**Files to Update**:
- `apps/server/src/features/export/export.service.ts` (implement exportScriptPdf)

---

## Session EX1.2: Screenplay Formatting - Scene Headings & Dialogue
**Goal**: Add screenplay formatting detection and indentation  
**Estimated Time**: 60-75 minutes

**Deliverables**:
1. Parse script content for screenplay elements:
   - Scene headings (INT., EXT., INT./EXT.)
   - Character names (uppercase line before dialogue)
   - Dialogue (indented lines after character name)
   - Action (left-aligned narrative)

2. Apply formatting in PDF:
   - Scene headings: Bold, uppercase, left-aligned
   - Character names: Centered, uppercase
   - Dialogue: Indented (~20% from left, ~20% from right)
   - Action: Left-aligned
   - Page breaks: Avoid mid-dialogue

**Acceptance Criteria**:
- Scene headings detected and formatted bold
- Character names centered correctly
- Dialogue indented appropriately
- Action/narrative left-aligned
- Page breaks avoid splitting dialogue

**Files to Update**:
- `apps/server/src/features/export/export.service.ts` (add screenplay parser and formatter)

---

## Session EX1.3: PDF Export Options (Line Numbers, Font Size, Page Size)
**Goal**: Support export options for line numbers, font size, and page size  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Extend exportScriptPdf to accept options:
   - includeLineNumbers (boolean)
   - fontSize (10-14, default 12)
   - pageSize ("letter" | "a4", default "letter")

2. Implement line numbers in PDF (optional feature):
   - Add line numbers in left margin if enabled
   - Gray, 10pt font
   - Increment every line

3. Support page size variations:
   - Letter: 8.5" x 11"
   - A4: 210mm x 297mm

**Acceptance Criteria**:
- Export options passed from client to server
- Line numbers appear when enabled
- Font size adjusts correctly (10-14pt)
- Page size matches selected option

**Files to Update**:
- `apps/server/src/features/export/export.service.ts` (add options support)
- `packages/shared/src/contract/export.contract.ts` (add options to input schema)

---

## Session EX1.4: JSON Export Polish & Validation
**Goal**: Ensure JSON export includes all entities and metadata  
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Verify exportSeriesJson includes:
   - Series metadata
   - All scripts (with content)
   - KB entities (characters, locations, props, timeline, wildcards)
   - Canvas nodes and edges
   - Relationships and appearances

2. Add version and timestamp metadata to JSON output

3. Add size guard/warning for large exports (>50MB)

**Acceptance Criteria**:
- JSON export contains all entities
- Export includes version/timestamp
- Large exports (>50MB) log warning or fail gracefully

**Files to Update**:
- `apps/server/src/features/export/export.service.ts` (validate exportSeriesJSON completeness)

---

## Session EX1.5: Export UI in Script Editor
**Goal**: Add Export button and options modal in script editor toolbar  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Add Export button to script editor toolbar
   - Opens export options modal

2. Create export options modal: `apps/web/src/features/scripts/components/export-modal.tsx`
   - Options: Include line numbers, font size, page size
   - Buttons: Export to PDF, Export Series (JSON)
   - Loading spinner during export

3. Wire to export mutation hooks

**Acceptance Criteria**:
- Export button appears in script editor toolbar
- Options modal opens with configurable options
- Selecting export triggers download
- Loading state shows during export

**Files to Create**:
- `apps/web/src/features/scripts/components/export-modal.tsx`

**Files to Update**:
- `apps/web/src/features/scripts/components/split-editor-layout.tsx` (add export button)

---

## Session EX1.6: Export Hooks & Download Handling
**Goal**: Create export mutation hooks with progress and error handling  
**Estimated Time**: 45-60 minutes

**Deliverables**:
1. Create export hooks:
   - `apps/web/src/features/scripts/hooks/use-export-script-pdf.ts`
   - `apps/web/src/features/scripts/hooks/use-export-series-json.ts`

2. Handle file download:
   - Trigger browser download on success
   - Use blob URL for PDF/JSON
   - Clean up blob URL after download

3. Error handling:
   - Show error toast on failure
   - Handle unsaved script (prompt to save first)
   - Handle large export warnings

**Acceptance Criteria**:
- Hooks call tanstackRPC.export endpoints correctly
- PDF/JSON downloads trigger in browser
- Error toasts appear for failures
- Unsaved scripts prompt save before export

**Files to Create**:
- `apps/web/src/features/scripts/hooks/use-export-script-pdf.ts`
- `apps/web/src/features/scripts/hooks/use-export-series-json.ts`

**Files to Update**:
- `apps/web/src/features/scripts/components/export-modal.tsx` (wire hooks)

---

## Session EX1.7: Export Timing & Performance Logging
**Goal**: Add timing logs and performance assertions for exports  
**Estimated Time**: 30-45 minutes

**Deliverables**:
1. Add timing logs in export service:
   - Log start and end time for PDF generation
   - Log start and end time for JSON serialization
   - Include script/series ID and size metrics

2. Add performance assertions:
   - Warn if PDF export >5s for 120-page script
   - Warn if JSON export >10s for large series

**Acceptance Criteria**:
- Export operations log timing metrics
- Warnings appear for slow exports
- Logs include script/series IDs and sizes

**Files to Update**:
- `apps/server/src/features/export/export.service.ts` (add timing logs)
