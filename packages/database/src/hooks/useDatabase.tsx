import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import {
  fetchTableRecords,
  fetchTableSchema,
  createRecord,
  updateRecord,
  deleteRecord,
  selectTableData,
  selectTableId,
  createRecords,
  deleteRecords,
  optimisticAddRecord,
  optimisticUpdateRecord,
  optimisticDeleteRecord,
  optimisticAddRecords,
  optimisticDeleteRecords,
  rollbackAddRecord,
  rollbackUpdateRecord
} from "../store/tablesSlice";
import { useAppDispatch } from "./useAppDispatch";
import { 
  TableRecordData,
  FetchOptions,
  DatabaseHookReturn,
  RootState, 
  TableRecordAPIResponse,
  TableRecordsAPIResponse
} from "../store/types";

export function useDatabase(
  table: string,
  initialQuery?: FetchOptions
): DatabaseHookReturn {
  // Add mounted ref to prevent state updates after unmount
  const isMounted = useRef(true);
  const dispatch = useAppDispatch();
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const requestInProgress = useRef<Record<string, boolean>>({});
  
  // Use useSelector for all Redux state access
  const tableId = useSelector((state: RootState) => selectTableId(state, table));
  const tableData = useSelector((state: RootState) => selectTableData(state, table));
  const isLoadingRecords = useSelector(
    (state: RootState) => state.tables.loading.records === "loading"
  );
  const isLoadingSchema = useSelector(
    (state: RootState) => state.tables.loading.schemas === "loading"
  );
  const error = useSelector((state: RootState) => state.tables.error);
  
  const { records, schema, initialized, lastUpdated } = useMemo(
    () => ({
      records: tableData?.records || [],
      schema: tableData?.schema || null,
      initialized: tableData?.initialized || false,
      lastUpdated: tableData?.lastUpdated || null,
    }),
    [tableData]
  );

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Memoize initialQuery to prevent unnecessary effect re-runs
  const memoizedInitialQuery = useMemo(
    () => initialQuery || { limit: 100 },
    [initialQuery]
  );

  // Helper to safely dispatch actions with error handling and cancellation check
  const safeDispatch = useCallback(
    async <T,>(
      action: any,
      onError?: (error: Error) => void
    ): Promise<T | undefined | null> => {
      try {
        const result = await dispatch(action).unwrap();
        if (!isMounted.current) return undefined;
        return result;
      } catch (e) {
        onError?.(e as Error);
        return null;
      }
    },
    [dispatch]
  );

  // Update effect to use safeDispatch
  useEffect(() => {
    if (!table || error) return;

    const schemaKey = `schema_${table}`;
    const recordsKey = `records_${table}`;

    if (!schema && !isLoadingSchema && !requestInProgress.current[schemaKey]) {
      requestInProgress.current[schemaKey] = true;
      safeDispatch(
        fetchTableSchema({ tableName: table })
      ).finally(() => {
        if (isMounted.current) {
          requestInProgress.current[schemaKey] = false;
        }
      });
    }

    if (!initialized && !isLoadingRecords && !requestInProgress.current[recordsKey]) {
      requestInProgress.current[recordsKey] = true;
      safeDispatch(
        fetchTableRecords({ tableName: table, queryParams: memoizedInitialQuery })
      ).finally(() => {
        if (isMounted.current) {
          requestInProgress.current[recordsKey] = false;
        }
      });
    }
  }, [
    table,
    schema,
    memoizedInitialQuery,
    safeDispatch,
  ]);

  // Update refresh to use safeDispatch and check mounted state
  const refresh = useCallback(
    async (options: FetchOptions = { limit: 20 }, onError?: (e: Error) => void) => {
      if (!isLoadingRecords) {
        const result = await safeDispatch<TableRecordData>(
          fetchTableRecords({ tableName: table, queryParams: options }),
          onError
        );
        if (result && isMounted.current) {
          setNextPageToken(result.nextPageToken ?? null);
        }
      }
    },
    [table, safeDispatch, isLoadingRecords]
  );

  const addRecord = useCallback(
    async (record: Record<string, unknown>, onError?: (e: Error) => void) => {
      if (!tableId) throw new Error(`Table ${table} not found`);

      // Generate a temporary negative ID for optimistic update
      const tempId = -Date.now();  // Use negative numbers to avoid conflicts with server IDs
      const tempRecord = { id: tempId, ...record };

      // Optimistically add the record
      dispatch(optimisticAddRecord({ tableId, record: tempRecord }));

      try {
        const result = await safeDispatch<TableRecordAPIResponse>(
          createRecord({ tableName: table, record }),
          onError
        );

        // If the request failed, rollback the optimistic update
        if (!result) {
          dispatch(rollbackAddRecord({ tableId, tempId }));
        }

        return result;
      } catch (error) {
        // Rollback on error
        dispatch(rollbackAddRecord({ tableId, tempId }));
        throw error;
      }
    },
    [table, tableId, safeDispatch, dispatch]
  );

  const modifyRecord = useCallback(
    async (
      recordId: number,
      updates: Record<string, unknown>,
      onError?: (e: Error) => void
    ) => {
      if (!tableId) throw new Error(`Table ${table} not found`);

      // Get the original record for potential rollback
      const originalRecord = records.find(r => r.id === recordId);
      if (!originalRecord) throw new Error(`Record ${recordId} not found`);

      // Optimistically update the record
      dispatch(optimisticUpdateRecord({ tableId, recordId, updates }));

      try {
        const result = await safeDispatch<TableRecordAPIResponse>(
          updateRecord({ tableName: table, recordId, updates }),
          onError
        );

        // Only rollback if there was an actual error response
        if (result === null) {  // null means error, undefined means unmounted
          dispatch(rollbackUpdateRecord({ tableId, recordId, originalRecord }));
        }

        return result;
      } catch (error) {
        // Rollback on error
        dispatch(rollbackUpdateRecord({ tableId, recordId, originalRecord }));
        throw error;
      }
    },
    [table, tableId, safeDispatch, dispatch, records]
  );

  const removeRecord = useCallback(
    async (recordId: number, onError?: (e: Error) => void) => {
      if (!tableId) throw new Error(`Table ${table} not found`);

      // Get the original record for potential rollback
      const originalRecord = records.find(r => r.id === recordId);
      if (!originalRecord) throw new Error(`Record ${recordId} not found`);

      // Optimistically delete the record
      dispatch(optimisticDeleteRecord({ tableId, recordId }));

      try {
        await safeDispatch(
          deleteRecord({ tableName: table, recordId }),
          onError
        );
      } catch (error) {
        // Rollback on error by re-adding the original record
        dispatch(optimisticAddRecord({ tableId, record: originalRecord }));
        throw error;
      }
    },
    [table, tableId, safeDispatch, dispatch, records]
  );

  const addRecords = useCallback(
    async (records: Record<string, unknown>[], onError?: (e: Error) => void) => {
      if (!tableId) throw new Error(`Table ${table} not found`);

      // Generate temporary negative IDs for optimistic updates
      const baseId = -Date.now();
      const tempRecords = records.map((record, index) => ({
        id: baseId - index,  // Use negative numbers to avoid conflicts with server IDs
        ...record
      }));

      // Optimistically add the records
      dispatch(optimisticAddRecords({ tableId, records: tempRecords }));

      try {
        const result = await safeDispatch<TableRecordsAPIResponse>(
          createRecords({ tableName: table, records }),
          onError
        );

        // If the request failed, rollback the optimistic updates
        if (!result) {
          dispatch(optimisticDeleteRecords({ 
            tableId, 
            recordIds: tempRecords.map(r => r.id)
          }));
        }

        return result;
      } catch (error) {
        // Rollback on error
        dispatch(optimisticDeleteRecords({ 
          tableId, 
          recordIds: tempRecords.map(r => r.id)
        }));
        throw error;
      }
    },
    [table, tableId, safeDispatch, dispatch]
  );

  const removeRecords = useCallback(
    async (recordIds: number[], onError?: (e: Error) => void) => {
      if (!tableId) throw new Error(`Table ${table} not found`);

      // Get the original records for potential rollback
      const originalRecords = records.filter(r => recordIds.includes(r.id));
      if (originalRecords.length !== recordIds.length) {
        throw new Error(`Some records not found`);
      }

      // Optimistically delete the records
      dispatch(optimisticDeleteRecords({ tableId, recordIds }));

      try {
        await safeDispatch(
          deleteRecords({ tableName: table, recordIds }),
          onError
        );
      } catch (error) {
        // Rollback on error by re-adding the original records
        dispatch(optimisticAddRecords({ tableId, records: originalRecords }));
        throw error;
      }
    },
    [table, tableId, safeDispatch, dispatch, records]
  );

  return useMemo(
    () => ({
      records,
      schema,
      isLoading: isLoadingRecords,
      schemaLoading: isLoadingSchema,
      error,
      nextPageToken,
      lastUpdated,
      refresh,
      fetchNextPage: async (onError?: (e: Error) => void) => {
        if (nextPageToken && !isLoadingRecords) {
          await refresh({ pageToken: nextPageToken, limit: 20 }, onError);
        }
      },
      addRecord,
      modifyRecord,
      removeRecord,
      addRecords,
      removeRecords,
    }),
    [
      records,
      schema,
      isLoadingRecords,
      isLoadingSchema,
      error,
      nextPageToken,
      lastUpdated,
      refresh,
      table,
      dispatch,
      addRecord,
      modifyRecord,
      removeRecord,
      addRecords,
      removeRecords,
    ]
  );
}
