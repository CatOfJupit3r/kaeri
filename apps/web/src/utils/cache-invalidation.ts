import type { QueryClient, QueryKey } from '@tanstack/react-query';

/**
 * Check if a query key represents a paginated list for a specific entity type.
 * This matcher ignores pagination params (limit, offset) to match all pages.
 */
function isPaginatedListQuery(
  queryKey: QueryKey,
  matchers: {
    /** Strings that must appear in the query key */
    includes: string[];
    /** Strings that must NOT appear in the query key */
    excludes?: string[];
  },
): boolean {
  if (!Array.isArray(queryKey)) return false;

  const serialized = JSON.stringify(queryKey);

  // Check all required strings are present
  for (const include of matchers.includes) {
    if (!serialized.includes(include)) {
      return false;
    }
  }

  // Check none of the excluded strings are present
  if (matchers.excludes) {
    for (const exclude of matchers.excludes) {
      if (serialized.includes(exclude)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Invalidate all scene list queries for a specific script.
 * Matches any pagination params.
 */
export const invalidateSceneListByScript = async (client: QueryClient, scriptId: string) =>
  client.invalidateQueries({
    predicate: (query) =>
      isPaginatedListQuery(query.queryKey, {
        includes: ['"scene"', '"listScenesByScript"', scriptId],
      }),
  });

/**
 * Invalidate all scene list queries for a specific series.
 * Matches any pagination params.
 */
export const invalidateSceneListBySeries = async (client: QueryClient, seriesId: string) =>
  client.invalidateQueries({
    predicate: (query) =>
      isPaginatedListQuery(query.queryKey, {
        includes: ['"scene"', '"listScenesBySeries"', seriesId],
      }),
  });

/**
 * Invalidate all script list queries for a specific series.
 * Matches any pagination params.
 */
export const invalidateScriptListBySeries = async (client: QueryClient, seriesId: string) =>
  client.invalidateQueries({
    predicate: (query) =>
      isPaginatedListQuery(query.queryKey, {
        includes: ['"scripts"', '"listScriptsBySeries"', seriesId],
      }),
  });

/**
 * Invalidate all story arc list queries for a specific series.
 * Matches any pagination params.
 */
export const invalidateStoryArcList = async (client: QueryClient, seriesId: string) =>
  client.invalidateQueries({
    predicate: (query) =>
      isPaginatedListQuery(query.queryKey, {
        includes: ['"storyArc"', seriesId],
      }),
  });

/**
 * Invalidate all theme list queries for a specific series.
 * Matches any pagination params.
 */
export const invalidateThemeList = async (client: QueryClient, seriesId: string) =>
  client.invalidateQueries({
    predicate: (query) =>
      isPaginatedListQuery(query.queryKey, {
        includes: ['"theme"', seriesId],
      }),
  });

/**
 * Invalidate all research list queries for a specific series.
 * Matches any pagination params.
 */
export const invalidateResearchList = async (client: QueryClient, seriesId: string) =>
  client.invalidateQueries({
    predicate: (query) =>
      isPaginatedListQuery(query.queryKey, {
        includes: ['"research"', seriesId],
      }),
  });

/**
 * Invalidate all series list queries for the current user.
 * Matches any pagination params.
 */
export const invalidateSeriesList = async (client: QueryClient) =>
  client.invalidateQueries({
    predicate: (query) =>
      isPaginatedListQuery(query.queryKey, {
        includes: ['"series"', '"listUserSeries"'],
      }),
  });

/**
 * Invalidate all workspace list queries.
 * Matches any pagination params.
 */
export const invalidateWorkspaceList = async (client: QueryClient) =>
  client.invalidateQueries({
    predicate: (query) =>
      isPaginatedListQuery(query.queryKey, {
        includes: ['"workspace"', '"listWorkspaces"'],
      }),
  });
