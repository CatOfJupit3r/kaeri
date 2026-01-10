import { ENTITY_TYPES } from '../enums/kaeri.enums';

export interface iEntityMetadata {
  icon: string;
  color: string;
  bgColor: string;
  label: string;
}

export const ENTITY_METADATA = {
  [ENTITY_TYPES.CHARACTER]: {
    icon: 'User',
    color: 'border-blue-500',
    bgColor: 'bg-blue-50',
    label: 'Character',
  },
  [ENTITY_TYPES.LOCATION]: {
    icon: 'MapPin',
    color: 'border-green-500',
    bgColor: 'bg-green-50',
    label: 'Location',
  },
  [ENTITY_TYPES.PROP]: {
    icon: 'Package',
    color: 'border-yellow-500',
    bgColor: 'bg-yellow-50',
    label: 'Prop',
  },
  [ENTITY_TYPES.SCENE]: {
    icon: 'Drama',
    color: 'border-purple-500',
    bgColor: 'bg-purple-50',
    label: 'Scene',
  },
  [ENTITY_TYPES.THEME]: {
    icon: 'Sparkles',
    color: 'border-pink-500',
    bgColor: 'bg-pink-50',
    label: 'Theme',
  },
  [ENTITY_TYPES.STORY_ARC]: {
    icon: 'TrendingUp',
    color: 'border-orange-500',
    bgColor: 'bg-orange-50',
    label: 'Story Arc',
  },
  [ENTITY_TYPES.SCRIPT]: {
    icon: 'BookOpen',
    color: 'border-indigo-500',
    bgColor: 'bg-indigo-50',
    label: 'Script',
  },
} as const satisfies Record<string, iEntityMetadata>;

// Narrative entity types that appear in Knowledge Base
export const NARRATIVE_ENTITY_TYPES = [
  ENTITY_TYPES.CHARACTER,
  ENTITY_TYPES.LOCATION,
  ENTITY_TYPES.PROP,
  ENTITY_TYPES.SCENE,
  ENTITY_TYPES.THEME,
  ENTITY_TYPES.STORY_ARC,
] as const;

export type NarrativeEntityType = (typeof NARRATIVE_ENTITY_TYPES)[number];

// Filter options for KB views
export const ENTITY_FILTER_OPTIONS = NARRATIVE_ENTITY_TYPES.map((type) => ({
  value: type,
  label: ENTITY_METADATA[type].label,
  icon: ENTITY_METADATA[type].icon,
}));
