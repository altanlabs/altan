import Fuse from 'fuse.js';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { selectAccountId } from '../redux/slices/general/index.ts';

const getAccountName = (account) =>
  account?.company?.name ||
  account?.name ||
  account?.meta_data?.name ||
  account?.meta_data?.displayName;

/**
 * useFilteredAccounts
 *
 * @param {Object} params
 * @param {Array} params.allAccounts - The full list of accounts.
 * @param {Object} params.account - The current account object.
 * @param {string} params.searchTerm - The search term to filter the accounts.
 * @param {boolean} params.showAllAccounts - Flag to choose between all accounts or just the current account.
 *
 * @returns {Array} The filtered accounts sorted by relevance.
 */
export const useFilteredAccounts = ({ allAccounts, accounts, searchTerm, showAllAccounts }) => {
  const currentAccountId = useSelector(selectAccountId);
  // First, filter accounts based on simple string inclusion in the account name.
  const filteredAccounts = useMemo(() => {
    const sourceAccounts = showAllAccounts ? allAccounts : accounts;
    return sourceAccounts.filter((elem) => elem.id !== currentAccountId);
  }, [showAllAccounts, allAccounts, accounts, currentAccountId]);

  // Then, apply Fuse.js for advanced fuzzy search.
  const fuseFilteredAccounts = useMemo(() => {
    if (!searchTerm?.length) return filteredAccounts;

    const fuseOptions = {
      threshold: 0.3, // Lower threshold = stricter matching.
      shouldSort: true, // Include the match score.
      keys: [
        {
          name: 'accountName',
          // Use our helper to extract the account name.
          getFn: getAccountName,
          weight: 3, // Increase weight so that account name matches are more important.
        },
        {
          name: 'userEmail',
          // Search by user email.
          getFn: (obj) => obj.user?.email,
          weight: 2,
        },
        {
          name: 'userName',
          // Search by a combination of user's first and last names.
          getFn: (obj) =>
            `${obj.user?.person?.first_name || ''} ${obj.user?.person?.last_name || ''}`.trim(),
          weight: 1,
        },
        {
          name: 'user.user_name',
          weight: 1,
        },
        {
          name: 'user.person.nickname',
          weight: 1,
        },
      ],
    };

    const fuse = new Fuse(filteredAccounts, fuseOptions);
    const fuseResults = fuse.search(searchTerm);
    return fuseResults.map((result) => result.item);
  }, [filteredAccounts, searchTerm]);

  return fuseFilteredAccounts;
};
