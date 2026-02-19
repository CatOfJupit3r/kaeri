/**
 * Block type configuration for script editor
 * Visual styling, icons, and behavior config following brutalist design
 */
import { LuClapperboard, LuFilm, LuUser, LuMessageSquare, LuArrowRight, LuType } from 'react-icons/lu';

import { SCRIPT_BLOCK_TYPES } from '../types';
import type { iBlockTypeConfig, ScriptBlockType } from '../types';

/**
 * Configuration for each block type
 * Defines visual styling and behavior
 */
export const BLOCK_CONFIG: Record<ScriptBlockType, iBlockTypeConfig> = {
  [SCRIPT_BLOCK_TYPES['scene-heading']]: {
    label: 'Scene Heading',
    shortcut: '1',
    icon: <LuClapperboard className="h-4 w-4" />,
    placeholder: 'INT. LOCATION - TIME',
    borderColorVar: 'var(--block-scene-heading)',
    bgColorVar: 'var(--block-scene-heading-bg)',
    alignment: 'left',
    textTransform: 'uppercase',
    fontStyle: 'normal',
    fontWeight: 'bold',
  },
  [SCRIPT_BLOCK_TYPES.action]: {
    label: 'Action',
    shortcut: '2',
    icon: <LuFilm className="h-4 w-4" />,
    placeholder: 'Describe what is happening in the scene...',
    borderColorVar: 'var(--block-action)',
    bgColorVar: 'var(--block-action-bg)',
    alignment: 'left',
    textTransform: 'none',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
  [SCRIPT_BLOCK_TYPES.character]: {
    label: 'Character',
    shortcut: '3',
    icon: <LuUser className="h-4 w-4" />,
    placeholder: 'CHARACTER NAME',
    borderColorVar: 'var(--block-character)',
    bgColorVar: 'var(--block-character-bg)',
    alignment: 'center',
    textTransform: 'uppercase',
    fontStyle: 'normal',
    fontWeight: 'bold',
  },
  [SCRIPT_BLOCK_TYPES.dialogue]: {
    label: 'Dialogue',
    shortcut: '4',
    icon: <LuMessageSquare className="h-4 w-4" />,
    placeholder: 'What the character says...',
    borderColorVar: 'var(--block-dialogue)',
    bgColorVar: 'var(--block-dialogue-bg)',
    alignment: 'left',
    textTransform: 'none',
    fontStyle: 'normal',
    fontWeight: 'normal',
  },
  [SCRIPT_BLOCK_TYPES.parenthetical]: {
    label: 'Parenthetical',
    shortcut: '5',
    icon: <LuType className="h-4 w-4" />,
    placeholder: '(softly, turning away)',
    borderColorVar: 'var(--block-parenthetical)',
    bgColorVar: 'var(--block-parenthetical-bg)',
    alignment: 'center',
    textTransform: 'none',
    fontStyle: 'italic',
    fontWeight: 'normal',
  },
  [SCRIPT_BLOCK_TYPES.transition]: {
    label: 'Transition',
    shortcut: '6',
    icon: <LuArrowRight className="h-4 w-4" />,
    placeholder: 'CUT TO:',
    borderColorVar: 'var(--block-transition)',
    bgColorVar: 'var(--block-transition-bg)',
    alignment: 'right',
    textTransform: 'uppercase',
    fontStyle: 'normal',
    fontWeight: 'bold',
  },
};

/**
 * Get CSS classes for a block type
 */
export function getBlockClasses(type: ScriptBlockType): string {
  const config = BLOCK_CONFIG[type];
  const classes = ['script-block', `script-block--${type}`];

  if (config.alignment === 'center') classes.push('text-center');
  if (config.alignment === 'right') classes.push('text-right');
  if (config.textTransform === 'uppercase') classes.push('uppercase');
  if (config.fontStyle === 'italic') classes.push('italic');
  if (config.fontWeight === 'bold') classes.push('font-bold');

  return classes.join(' ');
}
