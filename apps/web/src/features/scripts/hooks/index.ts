// Entity suggestions
export {
  useEntitySuggestions,
  useCharacterSuggestions,
  useLocationSuggestions,
  usePropSuggestions,
  useWildcardSuggestions,
} from './use-entity-suggestions';
export type { iUseEntitySuggestionsOptions, iUseEntitySuggestionsReturn } from './use-entity-suggestions';

// Appearance tracking
export { useAppearanceTracker, getAppearancesFromScenes } from './use-appearance-tracker';
export type { iAppearance, iUseAppearanceTrackerOptions, iUseAppearanceTrackerResult } from './use-appearance-tracker';

// KB Integration
export { useKBIntegration } from './use-kb-integration';
export type { iUseKBIntegrationOptions, iUseKBIntegrationResult } from './use-kb-integration';

// Mutations - Script CRUD
export { useCreateScript } from './mutations/use-create-script';
export { useUpdateScript } from './mutations/use-update-script';
export { useDeleteScript } from './mutations/use-delete-script';
export { useSaveScriptContent } from './mutations/use-save-script-content';

// Mutations - KB Integration
export { useQuickCreateEntity } from './mutations/use-quick-create-entity';
export type { iQuickCreateEntityInput } from './mutations/use-quick-create-entity';
export { useEnsureScene } from './mutations/use-ensure-scene';
export type { iEnsureSceneInput, iEnsureSceneResult } from './mutations/use-ensure-scene';

// Queries
export { useScript } from './queries/use-script';
export { useScriptList } from './queries/use-script-list';
export { useValidateEntityLinks } from './queries/use-validate-entity-links';
export type { iEntityLinkToValidate } from './queries/use-validate-entity-links';
export { usePollEntityUpdates } from './queries/use-poll-entity-updates';
export type { iUsePollEntityUpdatesOptions } from './queries/use-poll-entity-updates';

// Suggestion rendering
export { useSuggestionRenderer } from './use-suggestion-renderer';
export type { iUseSuggestionRendererOptions } from './use-suggestion-renderer';

// Character block suggestion rendering (auto-trigger in character blocks)
export { useCharacterBlockSuggestionRenderer } from './use-character-block-suggestion-renderer';
export type { iUseCharacterBlockSuggestionRendererOptions } from './use-character-block-suggestion-renderer';

// Scene heading suggestion rendering (auto-trigger for locations)
export { useSceneHeadingSuggestionRenderer } from './use-scene-heading-suggestion-renderer';
export type { iUseSceneHeadingSuggestionRendererOptions } from './use-scene-heading-suggestion-renderer';

// Entity Sync (unified sync hook)
export { useEntitySync } from './use-entity-sync';
export type { iUseEntitySyncOptions, iUseEntitySyncResult } from './use-entity-sync';

// Mention hover preview
export { useMentionHoverPreview } from './use-mention-hover-preview';
export type { iUseMentionHoverPreviewOptions, iUseMentionHoverPreviewResult } from './use-mention-hover-preview';
