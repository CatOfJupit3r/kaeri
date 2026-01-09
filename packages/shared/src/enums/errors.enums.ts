const userErrorCodes = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_PROFILE_NOT_FOUND: 'USER_PROFILE_NOT_FOUND',
  USER_BADGE_NOT_ALLOWED: 'USER_BADGE_NOT_ALLOWED',
  BADGE_NOT_FOUND: 'BADGE_NOT_FOUND',
  INVALID_PUBLIC_CODE: 'INVALID_PUBLIC_CODE',
  PUBLIC_CODE_GENERATION_FAILED: 'PUBLIC_CODE_GENERATION_FAILED',
} as const;

const kaeriErrorCodes = {
  // Series errors
  SERIES_NOT_FOUND: 'SERIES_NOT_FOUND',
  SERIES_TITLE_REQUIRED: 'SERIES_TITLE_REQUIRED',
  SERIES_DELETE_HAS_DEPENDENCIES: 'SERIES_DELETE_HAS_DEPENDENCIES',
  // Script errors
  SCRIPT_NOT_FOUND: 'SCRIPT_NOT_FOUND',
  SCRIPT_TITLE_REQUIRED: 'SCRIPT_TITLE_REQUIRED',
  SCRIPT_SERIES_MISMATCH: 'SCRIPT_SERIES_MISMATCH',
  SCRIPT_NOT_SAVED: 'SCRIPT_NOT_SAVED',
  // Knowledge Base errors
  CHARACTER_NOT_FOUND: 'CHARACTER_NOT_FOUND',
  LOCATION_NOT_FOUND: 'LOCATION_NOT_FOUND',
  PROP_NOT_FOUND: 'PROP_NOT_FOUND',
  TIMELINE_ENTRY_NOT_FOUND: 'TIMELINE_ENTRY_NOT_FOUND',
  WILDCARD_NOT_FOUND: 'WILDCARD_NOT_FOUND',
  KB_ENTITY_NOT_FOUND: 'KB_ENTITY_NOT_FOUND',
  KB_NAME_REQUIRED: 'KB_NAME_REQUIRED',
  RELATIONSHIP_TARGET_NOT_FOUND: 'RELATIONSHIP_TARGET_NOT_FOUND',
  RELATIONSHIP_NOT_FOUND: 'RELATIONSHIP_NOT_FOUND',
  APPEARANCE_NOT_FOUND: 'APPEARANCE_NOT_FOUND',
  VARIATION_NOT_FOUND: 'VARIATION_NOT_FOUND',
  // Story Arc errors
  STORY_ARC_NOT_FOUND: 'STORY_ARC_NOT_FOUND',
  STORY_ARC_NAME_REQUIRED: 'STORY_ARC_NAME_REQUIRED',
  STORY_ARC_SERIES_MISMATCH: 'STORY_ARC_SERIES_MISMATCH',
  INVALID_STORY_ARC_STATUS: 'INVALID_STORY_ARC_STATUS',
  // Canvas errors
  CANVAS_NODE_NOT_FOUND: 'CANVAS_NODE_NOT_FOUND',
  CANVAS_EDGE_NOT_FOUND: 'CANVAS_EDGE_NOT_FOUND',
  // Export errors
  EXPORT_FAILED: 'EXPORT_FAILED',
  EXPORT_SCRIPT_EMPTY: 'EXPORT_SCRIPT_EMPTY',
  // General errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_INPUT: 'INVALID_INPUT',
} as const;

const userErrorMessages = {
  [userErrorCodes.USER_NOT_FOUND]: 'User not found',
  [userErrorCodes.USER_PROFILE_NOT_FOUND]: 'User profile not found',
  [userErrorCodes.USER_BADGE_NOT_ALLOWED]: 'You do not have the required achievement to use this badge',
  [userErrorCodes.BADGE_NOT_FOUND]: 'Badge not found',
  [userErrorCodes.INVALID_PUBLIC_CODE]: 'Invalid public code',
  [userErrorCodes.PUBLIC_CODE_GENERATION_FAILED]: 'Failed to generate unique public code',
};

const kaeriErrorMessages = {
  // Series errors
  [kaeriErrorCodes.SERIES_NOT_FOUND]: 'Series not found',
  [kaeriErrorCodes.SERIES_TITLE_REQUIRED]: 'Series title is required',
  [kaeriErrorCodes.SERIES_DELETE_HAS_DEPENDENCIES]:
    'Cannot delete series with existing scripts or knowledge base entities',
  // Script errors
  [kaeriErrorCodes.SCRIPT_NOT_FOUND]: 'Script not found',
  [kaeriErrorCodes.SCRIPT_TITLE_REQUIRED]: 'Script title is required',
  [kaeriErrorCodes.SCRIPT_SERIES_MISMATCH]: 'Script does not belong to the specified series',
  [kaeriErrorCodes.SCRIPT_NOT_SAVED]: 'Script has unsaved changes',
  // Knowledge Base errors
  [kaeriErrorCodes.CHARACTER_NOT_FOUND]: 'Character not found',
  [kaeriErrorCodes.LOCATION_NOT_FOUND]: 'Location not found',
  [kaeriErrorCodes.PROP_NOT_FOUND]: 'Prop not found',
  [kaeriErrorCodes.TIMELINE_ENTRY_NOT_FOUND]: 'Timeline entry not found',
  [kaeriErrorCodes.WILDCARD_NOT_FOUND]: 'Wild card not found',
  [kaeriErrorCodes.KB_ENTITY_NOT_FOUND]: 'Knowledge base entity not found',
  [kaeriErrorCodes.KB_NAME_REQUIRED]: 'Name is required for knowledge base entity',
  [kaeriErrorCodes.RELATIONSHIP_TARGET_NOT_FOUND]: 'Relationship target character not found',
  [kaeriErrorCodes.RELATIONSHIP_NOT_FOUND]: 'Relationship not found',
  [kaeriErrorCodes.APPEARANCE_NOT_FOUND]: 'Appearance not found',
  [kaeriErrorCodes.VARIATION_NOT_FOUND]: 'Variation not found',
  // Story Arc errors
  [kaeriErrorCodes.STORY_ARC_NOT_FOUND]: 'Story arc not found',
  [kaeriErrorCodes.STORY_ARC_NAME_REQUIRED]: 'Story arc name is required',
  [kaeriErrorCodes.STORY_ARC_SERIES_MISMATCH]: 'Story arc does not belong to the specified series',
  [kaeriErrorCodes.INVALID_STORY_ARC_STATUS]: 'Invalid story arc status',
  // Canvas errors
  [kaeriErrorCodes.CANVAS_NODE_NOT_FOUND]: 'Canvas node not found',
  [kaeriErrorCodes.CANVAS_EDGE_NOT_FOUND]: 'Canvas edge not found',
  // Export errors
  [kaeriErrorCodes.EXPORT_FAILED]: 'Export failed',
  [kaeriErrorCodes.EXPORT_SCRIPT_EMPTY]: 'Cannot export empty script',
  // General errors
  [kaeriErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',
  [kaeriErrorCodes.INVALID_INPUT]: 'Invalid input provided',
};

export const errorCodes = {
  ...userErrorCodes,
  ...kaeriErrorCodes,
};

export type ErrorCodesType = (typeof errorCodes)[keyof typeof errorCodes];

export const errorMessages: Record<ErrorCodesType, string> = {
  ...userErrorMessages,
  ...kaeriErrorMessages,
};

const validateErrorCodesWithoutMessages = () => {
  if (Object.keys(errorCodes).length !== Object.keys(errorMessages).length) {
    const errorCodesWithoutMessages = Object.keys(errorCodes).filter((code) => !errorMessages[code as ErrorCodesType]);
    throw new Error(`Error codes without messages found: ${errorCodesWithoutMessages.join(', ')}`);
  }
};

validateErrorCodesWithoutMessages();
