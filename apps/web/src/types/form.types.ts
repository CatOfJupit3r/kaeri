import z from 'zod';

/**
 * Mode for edit forms - determines container and auto-save behavior.
 *
 * - `panel`: Renders in side panel with auto-save on blur
 * - `dialog`: Renders in modal dialog with manual submit button
 */
export const editFormModeSchema = z.enum(['panel', 'dialog']);
export const EDIT_FORM_MODES = editFormModeSchema.enum;
export type EditFormMode = z.infer<typeof editFormModeSchema>;
