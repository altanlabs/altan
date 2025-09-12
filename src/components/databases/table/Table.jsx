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
  createField,
  createTableRecords,
  updateTableRecordThunk,
  deleteTableRecordThunk,
  selectTableRecordsState,
  loadAllTableRecords,
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
    };
  }, [tableId]);

  // Use the memoized selectors with useSelector
  const table = useSelector(baseTableSelectors.tableSelector);
  const fields = useSelector(baseTableSelectors.fieldsSelector);
  const currentView = useSelector(viewSelectors.currentViewSelector);
  const totalRecords = useSelector(tableOnlySelectors.totalRecordsSelector);
  const isLoading = useSelector(tableOnlySelectors.isLoadingSelector);

  // Check if the table exists in the state (base is loaded)
  const tableExists = !!table;

  // Smarter loading management - only load records if they aren't already loaded
  useEffect(() => {
    if (!tableId || !baseId || !tableExists) return;

    const loadRecords = async () => {
      try {
        await dispatch(loadAllTableRecords(tableId));
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadRecords();
  }, [tableId, baseId, tableExists]);

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
    <div className="flex h-full grow basis-[500px] flex-col">
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
