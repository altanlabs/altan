/**
 * Comparators and Sorting Utilities
 * Pure functions for comparing and sorting data
 */

/**
 * Check if value is a finite number
 * @param n - Value to check
 * @returns True if value is a finite number
 */
export const isFiniteNumber = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/**
 * Compare two message parts by order, block_order, created_at, and id
 * Strict ordering: order → block_order → created_at → id
 * @param aIdOrObj - Part ID or object
 * @param bIdOrObj - Part ID or object
 * @param byId - Parts by ID lookup
 * @returns Comparison result (-1, 0, 1)
 */
export const comparePartOrder = (
  aIdOrObj: string | unknown,
  bIdOrObj: string | unknown,
  byId: Record<string, unknown>,
): number => {
  const a = typeof aIdOrObj === 'string' ? byId[aIdOrObj] : aIdOrObj;
  const b = typeof bIdOrObj === 'string' ? byId[bIdOrObj] : bIdOrObj;

  const ao = isFiniteNumber(a?.order) ? a.order : Number.POSITIVE_INFINITY;
  const bo = isFiniteNumber(b?.order) ? b.order : Number.POSITIVE_INFINITY;
  if (ao !== bo) return ao - bo;

  const ab = isFiniteNumber(a?.block_order) ? a.block_order : Number.POSITIVE_INFINITY;
  const bb = isFiniteNumber(b?.block_order) ? b.block_order : Number.POSITIVE_INFINITY;
  if (ab !== bb) return ab - bb;

  const ac = a?.created_at ? Date.parse(a.created_at) || 0 : 0;
  const bc = b?.created_at ? Date.parse(b.created_at) || 0 : 0;
  if (ac !== bc) return ac - bc;

  return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
};

