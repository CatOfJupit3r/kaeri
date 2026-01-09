/**
 * Cache TTL (Time To Live) constants in seconds
 */
export const CACHE_TTL = {
  /** Static data that never changes during runtime (1 hour) */
  STATIC: 3600,

  /** Lists with pagination (30 seconds) */
  LIST_SHORT: 30,

  /** Lists with pagination (1 minute) */
  LIST_MEDIUM: 60,

  /** Single entity by ID (2 minutes) */
  ENTITY_SHORT: 120,

  /** Single entity by ID (5 minutes) */
  ENTITY_MEDIUM: 300,

  /** Expensive aggregations (5 minutes) */
  AGGREGATION_MEDIUM: 300,

  /** Expensive aggregations (10 minutes) */
  AGGREGATION_LONG: 600,

  /** User-specific data (1 minute) */
  USER_DATA: 60,
} as const;

/**
 * Cache key prefixes for consistent naming
 */
export const CACHE_PREFIX = {
  SERIES: 'series',
  SERIES_LIST: 'series:list',
  SCRIPT: 'script',
  SCRIPT_LIST: 'script:list',
  KB: 'kb',
  CANVAS: 'canvas',
  CONTINUITY: 'continuity',
  STORY_ARC: 'story-arc',
  BADGES: 'badges',
  ACHIEVEMENTS: 'achievements',
  USER: 'user',
  EXPORT: 'export',
} as const;

/**
 * Helper to build cache keys consistently
 */
export const buildCacheKey = {
  series: (seriesId: string) => `${CACHE_PREFIX.SERIES}:${seriesId}`,
  seriesList: (userId: string, limit: number, offset: number) =>
    `${CACHE_PREFIX.SERIES_LIST}:${userId}:${limit}:${offset}`,

  script: (scriptId: string) => `${CACHE_PREFIX.SCRIPT}:${scriptId}`,
  scriptList: (seriesId: string, limit: number, offset: number) =>
    `${CACHE_PREFIX.SCRIPT_LIST}:${seriesId}:${limit}:${offset}`,

  kbEntity: (seriesId: string, entity: string, id: string) => `${CACHE_PREFIX.KB}:${seriesId}:${entity}:${id}`,
  kbList: (seriesId: string, entity: string, limit: number, offset: number) =>
    `${CACHE_PREFIX.KB}:${seriesId}:${entity}:list:${limit}:${offset}`,
  kbSearch: (seriesId: string, query: string, limit: number, offset: number) =>
    `${CACHE_PREFIX.KB}:${seriesId}:search:${query}:${limit}:${offset}`,

  canvas: (seriesId: string) => `${CACHE_PREFIX.CANVAS}:${seriesId}`,
  continuityGraph: (seriesId: string) => `${CACHE_PREFIX.CONTINUITY}:${seriesId}:graph`,
  appearancesByCharacter: (seriesId: string, characterId: string) =>
    `${CACHE_PREFIX.CONTINUITY}:${seriesId}:appearances:${characterId}`,

  storyArc: (storyArcId: string) => `${CACHE_PREFIX.STORY_ARC}:${storyArcId}`,
  storyArcList: (seriesId: string, status: string | undefined, limit: number, offset: number) =>
    `${CACHE_PREFIX.STORY_ARC}:${seriesId}:list:${status ?? 'all'}:${limit}:${offset}`,

  badges: () => `${CACHE_PREFIX.BADGES}:all`,
  achievements: () => `${CACHE_PREFIX.ACHIEVEMENTS}:all`,
  userAchievements: (userId: string) => `${CACHE_PREFIX.USER}:${userId}:achievements`,
  userProfile: (userId: string) => `${CACHE_PREFIX.USER}:${userId}:profile`,

  exportSeriesJson: (seriesId: string) => `${CACHE_PREFIX.EXPORT}:${seriesId}:json`,
} as const;
