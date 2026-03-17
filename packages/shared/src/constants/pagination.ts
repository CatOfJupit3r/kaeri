/**
 * Pagination constants used throughout the application.
 * These should be the ONLY source of truth for pagination values.
 */

/**
 * Default page sizes for different contexts
 */
export const PAGE_SIZES = {
  /** Default page size for tables and grids */
  DEFAULT: 20,
  /** Page size for summary/preview views */
  SUMMARY: 3,
  /** Page size for selects and dropdowns */
  SELECT: 50,
  /** Page size for autocomplete suggestions */
  AUTOCOMPLETE: 10,
  /** Page size for initial load with load more pattern */
  INITIAL_LOAD: 20,
  /** Maximum allowed page size */
  MAX: 100,
} as const;

/**
 * Type for page size values
 */
export type PageSize = (typeof PAGE_SIZES)[keyof typeof PAGE_SIZES];
