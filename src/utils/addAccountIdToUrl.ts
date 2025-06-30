/**
 * Inserts the 'account_id' query parameter into the URL if it's not already present.
 *
 * @param {string} url - The original URL.
 * @param {string} accountId - The account ID to be inserted.
 * @returns {string} - The updated URL with the 'account_id' parameter.
 */

export default function addAccountIdToUrl(url: string, accountId: string): string {
  if (!url?.length) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    const params = parsedUrl.searchParams;

    if (!params.has('account_id')) {
      params.append('account_id', accountId);
      parsedUrl.search = params.toString();
    }

    return parsedUrl.toString();
  } catch {
    return url;
  }
}
