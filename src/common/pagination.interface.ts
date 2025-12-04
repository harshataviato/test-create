/**
 * @module Common
 * @description
 * Defines the structure for pagination options used in repository and service methods.
 */
export interface PaginationOptions {
  /**
   * The current page number (1-indexed).
   * @example 1
   */
  page: number;

  /**
   * The maximum number of items per page.
   * @example 10
   */
  limit: number;
}

/**
 * @module Common
 * @description
 * Defines the structure for a paginated result, containing the items,
 * total count, total pages, and current page.
 * @template T - The type of items in the paginated result.
 */
export interface PaginatedResult<T> {
  /**
   * An array of items for the current page.
   */
  items: T[];

  /**
   * The total number of items across all pages.
   */
  totalItems: number;

  /**
   * The total number of pages available.
   */
  totalPages: number;

  /**
   * The current page number (1-indexed).
   */
  currentPage: number;
}
