import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import {
  fetchTableRecords,
  fetchTableSchema,
  createRecord,
  updateRecord,
  deleteRecord,
  selectTableData,
  createRecords,
  deleteRecords,
} from "../store/tablesSlice";
import { useAppDispatch } from "./useAppDispatch";
import { 
  TableRecordData,
  TableRecordItem,
  FetchOptions,
  DatabaseHookReturn,
  RootState 
} from "../store/types";

export function useDatabase(
  table: string,
  initialQuery?: FetchOptions
): DatabaseHookReturn {
  const dispatch = useAppDispatch();
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const requestInProgress = useRef<Record<string, boolean>>({});
  const tableData = useSelector((state: RootState) =>
    selectTableData(state, table)
  );
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

  // Add mounted ref to prevent state updates after unmount
  const isMounted = useRef(true);
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
      onError?: (e: Error) => void
    ): Promise<T | undefined> => {
      try {
        const result = await dispatch(action).unwrap();
        if (isMounted.current) return result;
      } catch (e) {
        onError?.(e as Error);
      }
      return undefined;
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
    initialized,
    isLoadingRecords,
    isLoadingSchema,
    error,
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
      await safeDispatch<TableRecordItem>(
        createRecord({ tableName: table, record }),
        onError
      );
    },
    [table, safeDispatch]
  );

  const modifyRecord = useCallback(
    async (
      recordId: string,
      updates: Record<string, unknown>,
      onError?: (e: Error) => void
    ) => {
      await safeDispatch<TableRecordItem>(
        updateRecord({ tableName: table, recordId, updates }),
        onError
      );
    },
    [table, safeDispatch]
  );

  const removeRecord = useCallback(
    async (recordId: string, onError?: (e: Error) => void) => {
      await safeDispatch(
        deleteRecord({ tableName: table, recordId }),
        onError
      );
    },
    [table, safeDispatch]
  );

  const addRecords = useCallback(
    async (records: Record<string, unknown>[], onError?: (e: Error) => void) => {
      await safeDispatch(
        createRecords({ tableName: table, records }),
        onError
      );
    },
    [table, safeDispatch]
  );

  const removeRecords = useCallback(
    async (recordIds: string[], onError?: (e: Error) => void) => {
      await safeDispatch(
        deleteRecords({ tableName: table, recordIds }),
        onError
      );
    },
    [table, safeDispatch]
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
