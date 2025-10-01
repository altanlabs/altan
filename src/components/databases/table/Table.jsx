// src/components/databases/table/Table.jsx
import { Typography } from '@mui/material';
import { useState, useEffect, useCallback, memo, useMemo } from 'react';

import {
  selectTableById,
  selectFieldsByTableId,
  selectTableRecords,
  selectTableRecordsTotal,
  selectCurrentView,
  selectIsTableRecordsLoading,
  selectTablePaginationInfo,
  selectTableTotalRecords,
  createField,
  createTableRecords,
  updateTableRecordThunk,
  deleteTableRecordThunk,
  selectTableRecordsState,
  setTableRecordsState,
  loadTableRecords,
  getTableRecordCount,
} from '../../../redux/slices/bases';
import { dispatch, useSelector } from '../../../redux/store';
import Iconify from '../../iconify';
import View from '../View';

const Table = ({ tableId, viewId, baseId, triggerImport }) => {
  // Track loading state
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [recordCountFetched, setRecordCountFetched] = useState(false);

  // Reset loading states when tableId changes
  useEffect(() => {
    setIsInitialLoad(true);
    setRecordCountFetched(false);
  }, [tableId]);

  const recordsState = useSelector((state) => selectTableRecordsState(state, tableId));
  const records = useSelector((state) => selectTableRecords(state, tableId));
  const hasRecords = records?.length > 0;

  // Memoize selectors that depend on baseId and tableId
  const baseTableSelectors = useMemo(() => {
    return {
      tableSelector: (state) => selectTableById(state, baseId, tableId),
      fieldsSelector: (state) => selectFieldsByTableId(state, baseId, tableId),
    };
  }, [baseId, tableId]);

  // Memoize selectors that depend on baseId, tableId, and viewId
  const viewSelectors = useMemo(() => {
    return {
      currentViewSelector: (state) => selectCurrentView(state, baseId, tableId, viewId),
    };
  }, [baseId, tableId, viewId]);

  // Memoize selectors that depend only on tableId
  const tableOnlySelectors = useMemo(() => {
    return {
      totalRecordsSelector: (state) => selectTableRecordsTotal(state, tableId),
      isLoadingSelector: (state) => selectIsTableRecordsLoading(state, tableId),
      paginationInfoSelector: (state) => selectTablePaginationInfo(state, tableId),
      totalRecordsCountSelector: (state) => selectTableTotalRecords(state, tableId),
    };
  }, [tableId]);

  // Use the memoized selectors with useSelector
  const table = useSelector(baseTableSelectors.tableSelector);
  const fields = useSelector(baseTableSelectors.fieldsSelector);
  const currentView = useSelector(viewSelectors.currentViewSelector);
  const totalRecords = useSelector(tableOnlySelectors.totalRecordsSelector);
  const isLoading = useSelector(tableOnlySelectors.isLoadingSelector);
  const paginationInfo = useSelector(tableOnlySelectors.paginationInfoSelector);

  // Smarter loading management - load records when table is available
  useEffect(() => {
    if (!tableId || !baseId || !table) return; // Wait for table to be in Redux state

    // Load records for this table (only if not already loaded)
    const loadRecords = async () => {
      try {
        await dispatch(loadTableRecords(tableId, { limit: 50, forceReload: false }));
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadRecords();
  }, [tableId, baseId, table]);

  // Get accurate record count separately using PostgREST - only once per table
  useEffect(() => {
    if (!tableId || recordCountFetched) return;

    const getCount = async () => {
      try {
        const count = await dispatch(getTableRecordCount(tableId));
        if (count > 0) {
          const pageSize = paginationInfo?.pageSize || 50;
          // Update the total records in the state
          dispatch(
            setTableRecordsState({
              tableId,
              totalRecords: count,
              totalPages: Math.ceil(count / pageSize),
            }),
          );
        }
        setRecordCountFetched(true);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to get record count:', error);
        setRecordCountFetched(true); // Mark as attempted even on error
      }
    };

    getCount();
  }, [tableId, recordCountFetched, paginationInfo?.pageSize]);

  // Stable record handlers - memoized to prevent re-renders
  const handleAddField = useCallback(
    (fieldType) => {
      dispatch(createField(baseId, tableId, { type: fieldType }));
    },
    [baseId, tableId],
  );

  const handleAddRecord = useCallback(
    (records) => {
      return dispatch(createTableRecords(tableId, records));
    },
    [tableId],
  );

  const handleUpdateRecord = useCallback(
    (recordId, changes) => {
      return dispatch(updateTableRecordThunk(tableId, recordId, changes));
    },
    [tableId],
  );

  const handleDeleteRecords = useCallback(
    (recordIds) => {
      // Filter out the blank record ('+') but preserve UUID format
      const validRecordIds = recordIds.filter((id) => id !== '+');

      if (validRecordIds.length > 0) {
        dispatch(deleteTableRecordThunk(tableId, validRecordIds));
      }
    },
    [tableId],
  );

  // Memoize loading state calculation
  const displayLoading = useMemo(() => {
    // Show loading if:
    // 1. Initial load (first time loading this table)
    // 2. Loading and no records yet
    // 3. RecordsState explicitly says loading
    return isInitialLoad || (isLoading && !hasRecords) || recordsState?.loading;
  }, [isInitialLoad, isLoading, hasRecords, recordsState?.loading]);

  // Memoize the view props to prevent unnecessary re-renders
  const viewProps = useMemo(
    () => ({
      table,
      view: currentView,
      fields,
      records,
      totalRecords,
      loading: isLoading,
      onPageSizeChange: () => {}, // Placeholder for future implementation
      onAddField: handleAddField,
      onAddRecord: handleAddRecord,
      onUpdateRecord: handleUpdateRecord,
      onDeleteRecords: handleDeleteRecords,
      hasMore: false,
      isLoadingMore: false,
      triggerImport,
      baseId,
    }),
    [
      table,
      currentView,
      fields,
      records,
      totalRecords,
      isLoading,
      handleAddField,
      handleAddRecord,
      handleUpdateRecord,
      handleDeleteRecords,
      triggerImport,
      baseId,
    ],
  );

  if (displayLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-row items-center space-x-4">
          <Iconify
            width={30}
            icon="svg-spinners:blocks-shuffle-3"
          />
          <Typography>Loading table data...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-w-0 flex-col">
      <View {...viewProps} />
    </div>
  );
};

export default memo(Table);
