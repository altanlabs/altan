/**
 * Collection utility functions for normalizing API responses
 */

/**
 * Make a string URL-friendly
 * @param str - String to make URL-friendly
 * @returns URL-friendly string
 */
export const makeUrlFriendly = (str: string): string => {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Collection with pagination
 */
export interface CollectionWithPagination<T> {
  items: T[];
  has_next_page?: boolean | null;
  next_cursor?: string | null;
}

/**
 * Normalized collection result
 */
export interface NormalizedCollection<T> {
  allIds: string[];
  byId: Record<string, T>;
  byName?: Record<string, string>;
  paginationInfo?: {
    hasNextPage: boolean;
    cursor: string | null;
  };
}

/**
 * Item with required id and optional name
 */
export interface CollectionItem {
  id: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * Paginate a collection into normalized format
 * @param collection - Collection with items and pagination info
 * @param byName - Whether to create byName index (for URL routing)
 * @returns Normalized collection
 */
export const paginateCollection = <T extends CollectionItem>(
  collection: CollectionWithPagination<T> | null | undefined,
  byName = false
): NormalizedCollection<T> => {
  const result: NormalizedCollection<T> = {
    allIds: [],
    byId: {},
  };

  if (byName) {
    result.byName = {};
  }

  if (!collection) {
    return result;
  }

  const { items, has_next_page, next_cursor } = collection;

  if (Array.isArray(items)) {
    // Initialize a map to keep track of name occurrences
    const nameOccurrences: Record<string, number> = {};

    items.forEach((item) => {
      if (item && item.id) {
        result.allIds.push(item.id);
        result.byId[item.id] = item;

        if (item.name && byName && result.byName) {
          // Make the item name URL friendly
          let urlFriendlyName = makeUrlFriendly(item.name);

          // Check if the name has already been used
          if (nameOccurrences[urlFriendlyName]) {
            // If the name is repeated, append "-<item.id.slice(0, 5)>" to the end
            urlFriendlyName += `-${item.id.slice(0, 5)}`;
          }

          // Update the nameOccurrences map
          nameOccurrences[urlFriendlyName] = (nameOccurrences[urlFriendlyName] || 0) + 1;

          // Use the potentially modified name as the key
          result.byName[urlFriendlyName] = item.id;
          (result.byId[item.id] as CollectionItem & { _byName?: string })._byName = urlFriendlyName;
        }
      }
    });
  }

  if (has_next_page !== null || next_cursor !== null) {
    result.paginationInfo = {
      hasNextPage: false,
      cursor: null,
    };
    if (has_next_page !== null && has_next_page !== undefined) {
      result.paginationInfo.hasNextPage = has_next_page;
    }
    if (next_cursor !== null && next_cursor !== undefined) {
      result.paginationInfo.cursor = next_cursor;
    }
  }

  return result;
};

