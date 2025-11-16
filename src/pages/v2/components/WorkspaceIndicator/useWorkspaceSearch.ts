import { useState, useCallback, useMemo, useRef } from 'react';
import { getSuperAdminService } from '../../../../services';
import type { Account, SearchParams, UseWorkspaceSearchReturn } from './types';

interface UseWorkspaceSearchProps {
  isSuperAdmin: boolean;
  showAllAccounts: boolean;
}

export const useWorkspaceSearch = ({
  isSuperAdmin,
  showAllAccounts,
}: UseWorkspaceSearchProps): UseWorkspaceSearchReturn => {
  const [searchById, setSearchById] = useState('');
  const [searchByName, setSearchByName] = useState('');
  const [searchByEmail, setSearchByEmail] = useState('');
  const [searchResults, setSearchResults] = useState<Account[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const isSearchingRef = useRef(false);

  const hasAnySearchTerm = useMemo(
    () => Boolean(searchById.trim() || searchByName.trim() || searchByEmail.trim()),
    [searchById, searchByName, searchByEmail]
  );

  const performSearch = useCallback(async () => {
    if (!isSuperAdmin || !showAllAccounts) {
      setSearchResults([]);
      return;
    }

    const searchParams: SearchParams = {};
    if (searchById.trim()) searchParams.id = searchById.trim();
    if (searchByName.trim()) searchParams.name = searchByName.trim();
    if (searchByEmail.trim()) searchParams.owner_email = searchByEmail.trim();

    if (Object.keys(searchParams).length === 0) {
      setSearchResults([]);
      return;
    }

    if (isSearchingRef.current) return;

    isSearchingRef.current = true;
    setIsSearching(true);

    try {
      const service = getSuperAdminService();
      const results = await service.searchAccounts(searchParams);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      isSearchingRef.current = false;
    }
  }, [isSuperAdmin, showAllAccounts, searchById, searchByName, searchByEmail]);

  const clearSearch = useCallback(() => {
    setSearchById('');
    setSearchByName('');
    setSearchByEmail('');
    setSearchResults([]);
  }, []);

  return {
    searchById,
    searchByName,
    searchByEmail,
    searchResults,
    isSearching,
    setSearchById,
    setSearchByName,
    setSearchByEmail,
    performSearch,
    clearSearch,
    hasAnySearchTerm,
  };
};

