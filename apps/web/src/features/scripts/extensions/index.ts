/**
 * Script editor tiptap extensions
 * Custom nodes for screenplay block types
 */

export { Action } from './action';
export { Character } from './character';
export type { iCharacterAttributes } from './character';
export { Dialogue } from './dialogue';
export { ScriptKeyboardHandler } from './keyboard-handler';
export { Parenthetical } from './parenthetical';
export { SceneHeading } from './scene-heading';
export type { iSceneHeadingAttributes } from './scene-heading';
export { Transition } from './transition';

// Scene metadata extension
export { SceneMetadata, getSceneAtPosition } from './scene-metadata';
export type { iSceneInfo, iSceneMetadataStorage, iSceneMetadataOptions } from './scene-metadata';

// Entity mention extensions
export { MentionMark } from './mention-mark';
export type { iMentionMarkAttributes } from './mention-mark';
export {
  CharacterMention,
  PropMention,
  WildcardMention,
  createEntityMentionExtension,
  configureSuggestion,
} from './entity-mention';
export type { iEntitySuggestion, iEntityMentionOptions, EntityType, EntityMentionRenderProps } from './entity-mention';

// Character block suggestion (auto-trigger in character blocks)
export { CharacterBlockSuggestion, characterBlockSuggestionKey } from './character-block-suggestion';
export type {
  iCharacterBlockSuggestion,
  iCharacterBlockSuggestionOptions,
  CharacterBlockSuggestionRenderProps,
} from './character-block-suggestion';

// Scene heading suggestion (auto-trigger for locations after INT./EXT.)
export { SceneHeadingSuggestion, sceneHeadingSuggestionKey } from './scene-heading-suggestion';
export type {
  iLocationBlockSuggestion,
  iSceneHeadingSuggestionOptions,
  SceneHeadingSuggestionRenderProps,
} from './scene-heading-suggestion';
