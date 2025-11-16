/**
 * Hook for managing interface data and commits
 * Single Responsibility: Interface data fetching and state
 */

import { useEffect, useMemo } from 'react';
import { useSelector, dispatch } from '../../../../redux/store';
import {
  makeSelectInterfaceById,
  makeSelectSortedCommits,
  getInterfaceById,
} from '../../../../redux/slices/general/index';
import type { AltanerComponent, Altaner } from '../types';

const EMPTY_ARRAY: any[] = [];

interface UseInterfaceDataResult {
  interfaceId: string | null;
  interfaceData: any;
  interfaceCommits: any[];
  isInterfaceWithNoCommits: boolean;
}

export function useInterfaceData(
  currentComponent: AltanerComponent | null,
  operateMode: boolean,
  altaner: Altaner | null,
): UseInterfaceDataResult {
  // Create memoized selectors
  const selectInterfaceById = useMemo(makeSelectInterfaceById, []);
  const selectSortedCommits = useMemo(makeSelectSortedCommits, []);

  // Get interface ID from component
  const interfaceId = useMemo(() => {
    if (operateMode) return null;
    if (!currentComponent || currentComponent.type !== 'interface') return null;
    return currentComponent.params?.id || currentComponent.params?.ids?.[0] || null;
  }, [currentComponent, operateMode]);

  // Get interface data and commits
  const interfaceData = useSelector((state) =>
    interfaceId ? selectInterfaceById(state, interfaceId) : null,
  );

  const interfaceCommits = useSelector((state) =>
    interfaceId ? selectSortedCommits(state, interfaceId) : EMPTY_ARRAY,
  );

  // Determine if interface has no commits
  const isInterfaceWithNoCommits = useMemo(() => {
    if (!interfaceId) return false;
    if (!altaner || !altaner.room_id) return false;
    if (!interfaceData) return true;
    return (
      !interfaceCommits ||
      interfaceCommits.length === 0 ||
      !interfaceCommits.some((commit) => commit.build_status === 'success')
    );
  }, [interfaceId, interfaceData, interfaceCommits, altaner]);

  // Fetch interface data
  useEffect(() => {
    if (interfaceId) {
      dispatch(getInterfaceById(interfaceId));
    }
  }, [interfaceId]);

  return {
    interfaceId,
    interfaceData,
    interfaceCommits,
    isInterfaceWithNoCommits,
  };
}
