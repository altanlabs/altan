// src/components/databases/table/Table.jsx
import { Typography, Button, Alert, Box } from '@mui/material';
import { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';

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
  loadTablePage,
  getTableRecordCount,
  clearRealTimeUpdateFlags,
} from '../../../redux/slices/bases';
import { dispatch, useSelector } from '../../../redux/store';
import Iconify from '../../iconify';
import View from '../View';

const Table = ({ tableId, viewId, baseId, onPaginationChange, triggerImport }) => {
  // eslint-disable-next-line no-console
  console.log('Table re-render');
  // Track loading state
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [recordCountFetched, setRecordCountFetched] = useState(false);

  // Use refs to avoid re-renders on pagination changes
  const paginationHandlersRef = useRef({});

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

  // Check if the table exists in the state (base is loaded)
  const tableExists = !!table;

  // Stable pagination handlers - memoized to prevent re-renders
  const handleGoToFirstPage = useCallback(() => {
    dispatch(loadTablePage(tableId, 0));
  }, [tableId]);

  const handleGoToLastPage = useCallback(() => {
    const totalPages = paginationHandlersRef.current.totalPages;
    if (totalPages > 0) {
      dispatch(loadTablePage(tableId, totalPages - 1));
    }
  }, [tableId]);

  const handleGoToNextPage = useCallback(() => {
    const { currentPage, totalPages } = paginationHandlersRef.current;
    if (currentPage < totalPages - 1) {
      dispatch(loadTablePage(tableId, currentPage + 1));
    }
  }, [tableId]);

  const handleGoToPreviousPage = useCallback(() => {
    const { currentPage } = paginationHandlersRef.current;
    if (currentPage > 0) {
      dispatch(loadTablePage(tableId, currentPage - 1));
    }
  }, [tableId]);

  // Update pagination handlers ref when pagination info changes
  useEffect(() => {
    if (paginationInfo) {
      paginationHandlersRef.current = {
        currentPage: paginationInfo.currentPage || 0,
        totalPages: paginationInfo.totalPages || 1,
      };
    }
  }, [paginationInfo]);

  // Smarter loading management - only load records if they aren't already loaded
  useEffect(() => {
    if (!tableId || !baseId || !tableExists) return;

    const loadRecords = async () => {
      try {
        await dispatch(loadTableRecords(tableId, { limit: 50 }));
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadRecords();
  }, [tableId, baseId, tableExists]);

  // Get accurate record count separately using PostgREST - only once per table
  useEffect(() => {
    if (!tableId || !tableExists || recordCountFetched) return;

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
  }, [tableId, tableExists, recordCountFetched, paginationInfo?.pageSize]);

  // Stable pagination callback - memoized to prevent re-renders
  const stablePaginationCallback = useCallback(() => {
    if (!onPaginationChange || !paginationInfo) return;

    onPaginationChange({
      paginationInfo,
      handlers: {
        onGoToFirstPage: handleGoToFirstPage,
        onGoToLastPage: handleGoToLastPage,
        onGoToNextPage: handleGoToNextPage,
        onGoToPreviousPage: handleGoToPreviousPage,
      },
    });
  }, [
    onPaginationChange,
    paginationInfo,
    handleGoToFirstPage,
    handleGoToLastPage,
    handleGoToNextPage,
    handleGoToPreviousPage,
  ]);

  // Pass pagination info up to parent components - debounced
  useEffect(() => {
    // Use a small delay to batch pagination updates
    const timeoutId = setTimeout(stablePaginationCallback, 10);
    return () => clearTimeout(timeoutId);
  }, [stablePaginationCallback]);

  // Handle new records notification
  const handleGoToFirstPageForNewRecords = useCallback(() => {
    dispatch(loadTablePage(tableId, 0));
    // Clear the new records flag
    dispatch(clearRealTimeUpdateFlags({ tableId }));
  }, [tableId]);

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
      onPaginationChange,
      triggerImport,
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
      onPaginationChange,
      triggerImport,
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
      {/* New Records Notification */}
      {paginationInfo?.hasNewRecordsOnPreviousPages && paginationInfo?.currentPage > 0 && (
        <Box sx={{ p: 1 }}>
          <Alert
            severity="info"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleGoToFirstPageForNewRecords}
              >
                View New Records
              </Button>
            }
          >
            New records have been added. Go to the first page to see them.
          </Alert>
        </Box>
      )}
      <View {...viewProps} />
    </div>
  );
};

export default memo(Table);
