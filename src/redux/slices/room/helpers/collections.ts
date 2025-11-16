/**
 * Collection Operations
 * Utilities for merging and manipulating collections
 */

/**
 * Deep object assign that recursively merges objects
 * @param target - Target object
 * @param sources - Source objects to merge
 * @returns Merged object
 */
export function Object_assign<T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T {
  sources.forEach((source) => {
    Object.keys(source).forEach((key) => {
      const s_val = source[key as keyof typeof source];
      const t_val = target[key as keyof T];
      if (t_val && s_val && typeof t_val === 'object' && typeof s_val === 'object') {
        target[key as keyof T] = Object_assign(t_val, s_val);
      } else {
        target[key as keyof T] = s_val as unknown;
      }
    });
  });
  return target;
}

/**
 * Merge two arrays without duplicates using Set
 * @param array1 - First array
 * @param array2 - Second array
 * @returns Merged array without duplicates
 */
export const mergeShallowArray = <T>(array1: T[], array2: T[]): T[] => {
  const resultSet = new Set(array1);
  for (const item of array2) {
    resultSet.add(item);
  }
  return Array.from(resultSet);
};

interface NormalizedCollection<T> {
  byId: Record<string, T>;
  allIds: string[];
}

/**
 * Merge a property from current into previous
 * @param previous - Previous object
 * @param current - Current object
 * @param property - Property name to merge
 */
export const mergeProperties = (
  previous: unknown,
  current: unknown,
  property: string,
): void => {
  if (!!current[property]) {
    if (
      !!previous[property] &&
      !!current[property].allIds?.length &&
      Object.keys(current[property].byId ?? {}).length
    ) {
      previous[property].allIds = mergeShallowArray(
        previous[property].allIds,
        current[property].allIds,
      );
      Object.assign(previous[property].byId, current[property].byId);
    } else {
      previous[property] = current[property];
    }
  }
};

/**
 * Merge two thread objects
 * @param previous - Previous thread state
 * @param current - Current thread data
 */
export const mergeThreads = (previous: unknown, current: unknown): void => {
  // Directly assigning properties that always get overwritten
  ['name', 'date_creation', 'parent', 'starter_message_id', 'status', 'read_state'].forEach(
    (prop) => {
      previous[prop] = current[prop];
    },
  );

  // Merge and optimize repetitive structures using a helper function
  ['events', 'media', 'messages'].forEach((prop) => {
    mergeProperties(previous, current, prop);
  });
};

