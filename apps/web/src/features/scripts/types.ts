import type { ReactNode } from 'react';
import z from 'zod';

/**
 * Script block types for screenplay formatting
 * Based on spec 002-scripts
 */
export const scriptBlockTypeSchema = z.enum([
  'scene-heading',
  'action',
  'character',
  'dialogue',
  'parenthetical',
  'transition',
]);

export const SCRIPT_BLOCK_TYPES = scriptBlockTypeSchema.enum;
export type ScriptBlockType = z.infer<typeof scriptBlockTypeSchema>;

/**
 * Script block data structure (frontend-only)
 */
export interface iScriptBlock {
  id: string;
  type: ScriptBlockType;
  content: string;
  /** For dialogue blocks - which characters are speaking */
  characters?: string[];
  metadata?: {
    location?: string;
    timeOfDay?: string;
    notes?: string;
  };
}

/**
 * Block type configuration for styling and behavior
 */
export interface iBlockTypeConfig {
  label: string;
  shortcut: string;
  icon: ReactNode;
  placeholder: string;
  /** CSS variable reference for border color */
  borderColorVar: string;
  /** CSS variable reference for background color */
  bgColorVar: string;
  /** Text alignment: left, center, right */
  alignment: 'left' | 'center' | 'right';
  /** Text transform: uppercase, normal */
  textTransform: 'uppercase' | 'none';
  /** Font style: normal, italic */
  fontStyle: 'normal' | 'italic';
  /** Font weight: normal, bold */
  fontWeight: 'normal' | 'bold';
}

/**
 * Context-aware next block type mapping
 * When Enter is pressed, determines what block type to create next
 */
export const NEXT_BLOCK_TYPE_MAP: Record<ScriptBlockType, ScriptBlockType> = {
  [SCRIPT_BLOCK_TYPES['scene-heading']]: SCRIPT_BLOCK_TYPES.action,
  [SCRIPT_BLOCK_TYPES.action]: SCRIPT_BLOCK_TYPES.action,
  [SCRIPT_BLOCK_TYPES.character]: SCRIPT_BLOCK_TYPES.dialogue,
  [SCRIPT_BLOCK_TYPES.dialogue]: SCRIPT_BLOCK_TYPES.character,
  [SCRIPT_BLOCK_TYPES.parenthetical]: SCRIPT_BLOCK_TYPES.dialogue,
  [SCRIPT_BLOCK_TYPES.transition]: SCRIPT_BLOCK_TYPES['scene-heading'],
};

/**
 * Block type cycle order for Tab key navigation
 */
export const BLOCK_TYPE_CYCLE_ORDER: ScriptBlockType[] = [
  SCRIPT_BLOCK_TYPES['scene-heading'],
  SCRIPT_BLOCK_TYPES.action,
  SCRIPT_BLOCK_TYPES.character,
  SCRIPT_BLOCK_TYPES.dialogue,
  SCRIPT_BLOCK_TYPES.parenthetical,
  SCRIPT_BLOCK_TYPES.transition,
];

/**
 * Keyboard shortcuts for quick block type changes
 * Ctrl/Cmd + number
 */
export const BLOCK_TYPE_SHORTCUTS: Record<string, ScriptBlockType> = {
  '1': SCRIPT_BLOCK_TYPES['scene-heading'],
  s: SCRIPT_BLOCK_TYPES['scene-heading'],
  '2': SCRIPT_BLOCK_TYPES.action,
  a: SCRIPT_BLOCK_TYPES.action,
  '3': SCRIPT_BLOCK_TYPES.character,
  c: SCRIPT_BLOCK_TYPES.character,
  '4': SCRIPT_BLOCK_TYPES.dialogue,
  d: SCRIPT_BLOCK_TYPES.dialogue,
  '5': SCRIPT_BLOCK_TYPES.parenthetical,
  w: SCRIPT_BLOCK_TYPES.parenthetical,
  '6': SCRIPT_BLOCK_TYPES.transition,
  t: SCRIPT_BLOCK_TYPES.transition,
};

/**
 * Patterns for detecting block types from plain text
 */
export const BLOCK_DETECTION_PATTERNS: { type: ScriptBlockType; pattern: RegExp }[] = [
  { type: SCRIPT_BLOCK_TYPES['scene-heading'], pattern: /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i },
  {
    type: SCRIPT_BLOCK_TYPES.transition,
    pattern: /^(FADE IN:|FADE OUT|CUT TO:|DISSOLVE TO:|SMASH CUT TO:|MATCH CUT TO:)$/i,
  },
  { type: SCRIPT_BLOCK_TYPES.parenthetical, pattern: /^\(.*\)$/ },
];
