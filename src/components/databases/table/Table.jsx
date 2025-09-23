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
  loadTablePage,
  getTableRecordCount,
} from '../../../redux/slices/bases';
import { dispatch, useSelector } from '../../../redux/store';
import Iconify from '../../iconify';
import View from '../View';

const Table = ({ tableId, viewId, baseId, onPaginationChange, triggerImport }) => {
  // Track loading state
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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

  // Pagination handlers
  const handleGoToFirstPage = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('🔄 Going to first page for table:', tableId);
    dispatch(loadTablePage(tableId, 0));
  }, [tableId]);

  const handleGoToLastPage = useCallback(() => {
    if (paginationInfo?.totalPages) {
      // eslint-disable-next-line no-console
      console.log('🔄 Going to last page:', paginationInfo.totalPages - 1, 'for table:', tableId);
      dispatch(loadTablePage(tableId, paginationInfo.totalPages - 1));
    }
  }, [tableId, paginationInfo?.totalPages]);

  const handleGoToNextPage = useCallback(() => {
    if (paginationInfo && paginationInfo.currentPage < paginationInfo.totalPages - 1) {
      // eslint-disable-next-line no-console
      console.log('🔄 Going to next page:', paginationInfo.currentPage + 1, 'for table:', tableId);
      dispatch(loadTablePage(tableId, paginationInfo.currentPage + 1));
    }
  }, [tableId, paginationInfo]);

  const handleGoToPreviousPage = useCallback(() => {
    if (paginationInfo && paginationInfo.currentPage > 0) {
      // eslint-disable-next-line no-console
      console.log('🔄 Going to previous page:', paginationInfo.currentPage - 1, 'for table:', tableId);
      dispatch(loadTablePage(tableId, paginationInfo.currentPage - 1));
    }
  }, [tableId, paginationInfo]);

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

  // Get accurate record count separately using PostgREST
  useEffect(() => {
    if (!tableId || !tableExists) return;

    const getCount = async () => {
      try {
        // eslint-disable-next-line no-console
        console.log('🔢 Table component getting count for tableId:', tableId);
        const count = await dispatch(getTableRecordCount(tableId));
        // eslint-disable-next-line no-console
        console.log('📊 Table component got count:', count);
        
        if (count > 0) {
          // Update the total records in the state
          dispatch(setTableRecordsState({
            tableId,
            totalRecords: count,
            totalPages: Math.ceil(count / (paginationInfo?.pageSize || 50)),
          }));
          // eslint-disable-next-line no-console
          console.log('✅ Table component updated state with count:', count);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to get record count:', error);
      }
    };

    getCount();
  }, [tableId, tableExists, paginationInfo?.pageSize]);

  // Pass pagination info up to parent components
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('📊 Table pagination info:', paginationInfo);
    
    if (onPaginationChange && paginationInfo) {
      // eslint-disable-next-line no-console
      console.log('📤 Passing pagination info to parent:', paginationInfo);
      
      onPaginationChange({
        paginationInfo,
        handlers: {
          onGoToFirstPage: handleGoToFirstPage,
          onGoToLastPage: handleGoToLastPage,
          onGoToNextPage: handleGoToNextPage,
          onGoToPreviousPage: handleGoToPreviousPage,
        },
      });
    }
  }, [
    paginationInfo,
    onPaginationChange,
    handleGoToFirstPage,
    handleGoToLastPage,
    handleGoToNextPage,
    handleGoToPreviousPage,
  ]);

  // Add throttling to handle frequent page size changes
  const handlePageSizeChange = useCallback(() => {
    // For future implementation if needed
  }, []);

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

  // Show loading state if this is the initial load, records are still loading,
  // or we don't have records yet
  const displayLoading = isInitialLoad || (isLoading && !hasRecords) || recordsState?.loading;

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
      <View
        table={table}
        view={currentView}
        fields={fields}
        records={records}
        totalRecords={totalRecords}
        loading={isLoading}
        onPageSizeChange={handlePageSizeChange}
        onAddField={handleAddField}
        onAddRecord={handleAddRecord}
        onUpdateRecord={handleUpdateRecord}
        onDeleteRecords={handleDeleteRecords}
        hasMore={false}
        isLoadingMore={false}
        onPaginationChange={onPaginationChange}
        triggerImport={triggerImport}
      />
    </div>
  );
};

export default memo(Table);
