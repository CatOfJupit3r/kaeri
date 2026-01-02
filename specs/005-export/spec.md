# Feature Specification: Export

**Feature Branch**: `[export-domain]`  
**Created**: 2026-01-02  
**Status**: Draft  
**Input**: Export scripts to PDF and series to JSON with basic screenplay formatting and backups

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Export Draft (Priority: P3)
A writer exports a script to PDF with screenplay-friendly formatting and can download it.

**Why this priority**: Enables external sharing and backups.

**Independent Test**: Export produces a PDF with scene headings and dialogue indentation; a saved script exports without errors.

**Acceptance Scenarios**:
1. Given a saved script, when export is triggered, then a PDF downloads with scene headings and dialogue indentation preserved.
2. Given an invalid or unsaved script, when export is triggered, then the user is prompted to save first.

### Edge Cases
- Empty scripts export with a clear placeholder message.
- Very large scripts (500+ pages) may require streaming or job-based exports to avoid timeouts.
- Scene heading detection failures gracefully fall back to action formatting.
- Export failures retry once and surface error details; file size warnings appear for exports over 50MB.
- Special characters (emojis, non-Latin) are preserved in PDF output.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-007**: System MUST export a script to PDF with screenplay-friendly formatting (scene heading detection and dialogue indentation) and support JSON export for series data.

### Key Entities *(include if feature involves data)*

- **ExportJob** (future for large exports): id (UUID), seriesId, scriptId?, type (`pdf` | `json`), status (`pending` | `processing` | `completed` | `failed`), downloadUrl?, errorMessage?, options, createdAt, completedAt?.
- **ExportOptions**: includeLineNumbers?, fontSize?, pageSize?, includeKnowledgeBase?, includeCanvas?, includeScripts?.

### Constitution Alignment

- Contracts: oRPC procedures in `packages/shared/src/contract/export.contract.ts` define PDF and JSON exports before handlers/UI.
- Canonical continuity: JSON exports preserve canonical IDs across series, scripts, knowledge base, and canvas data.
- Access and collaboration: Auth required; ownership verified; NOT_FOUND stance for hidden resources before export.
- Quality gates: `bun run check-types`, `bun run lint`, and export tests (blocked by Mongo memory server download issue and post-MVP priority).
- Observability and recovery: Add timing logs and error telemetry for exports; consider job tracking for long-running tasks.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-004**: Script export completes within 5s for a 120-page script and produces a valid PDF download; JSON export includes series, scripts, knowledge base, and canvas data without missing entities.
