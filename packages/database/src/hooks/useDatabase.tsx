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
import { FetchOptions, DatabaseHookReturn, RootState } from "../store/types";

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

  useEffect(() => {
    if (!table || error) return;
    if (
      !schema &&
      !isLoadingSchema &&
      !requestInProgress.current[`schema_${table}`]
    ) {
      requestInProgress.current[`schema_${table}`] = true;
      dispatch(fetchTableSchema({ tableName: table })).finally(() => {
        requestInProgress.current[`schema_${table}`] = false;
      });
    }
    if (
      !initialized &&
      !isLoadingRecords &&
      !requestInProgress.current[`records_${table}`]
    ) {
      requestInProgress.current[`records_${table}`] = true;
      dispatch(
        fetchTableRecords({
          tableName: table,
          queryParams: initialQuery || { limit: 100 },
        })
      ).finally(() => {
        requestInProgress.current[`records_${table}`] = false;
      });
    }
  }, [
    table,
    schema,
    initialized,
    isLoadingRecords,
    isLoadingSchema,
    dispatch,
    error,
    initialQuery,
  ]);

  const refresh = useCallback(
    async (
      options: FetchOptions = { limit: 20 },
      onError?: (e: Error) => void
    ) => {
      if (!isLoadingRecords) {
        try {
          const result = await dispatch(
            fetchTableRecords({ tableName: table, queryParams: options })
          ).unwrap();
          setNextPageToken(result.nextPageToken);
        } catch (e) {
          onError?.(e as Error);
        }
      }
    },
    [table, dispatch, isLoadingRecords]
  );

  const addRecord = useCallback(
    async (record: Record<string, unknown>, onError?: (e: Error) => void) => {
      try {
        await dispatch(createRecord({ tableName: table, record })).unwrap();
      } catch (e) {
        onError?.(e as Error);
      }
    },
    [dispatch, table]
  );

  const modifyRecord = useCallback(
    async (
      recordId: string,
      updates: Record<string, unknown>,
      onError?: (e: Error) => void
    ) => {
      try {
        await dispatch(
          updateRecord({ tableName: table, recordId, updates })
        ).unwrap();
      } catch (e) {
        onError?.(e as Error);
      }
    },
    [dispatch, table]
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
      removeRecord: async (recordId: string, onError?: (e: Error) => void) => {
        try {
          await dispatch(deleteRecord({ tableName: table, recordId })).unwrap();
        } catch (e) {
          onError?.(e as Error);
        }
      },
      addRecords: async (records: Record<string, unknown>[], onError?: (e: Error) => void) => {
        try {
          await dispatch(createRecords({ tableName: table, records })).unwrap();
        } catch (e) {
          onError?.(e as Error);
        }
      },
      removeRecords: async (recordIds: string[], onError?: (e: Error) => void) => {
        try {
          await dispatch(deleteRecords({ tableName: table, recordIds })).unwrap();
        } catch (e) {
          onError?.(e as Error);
        }
      },
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
    ]
  );
}
