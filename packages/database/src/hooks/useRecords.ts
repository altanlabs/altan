import { useCallback, useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { fetchTableRecords, createRecord, updateRecord, deleteRecord, selectTableData } from "../store/tablesSlice";
import { useAppDispatch } from "./useAppDispatch";
import { TableRecordData, FetchOptions, TableRecordAPIResponse, RecordsHookReturn } from "../store/types";

export function useRecords<TRecord = TableRecordData>(
  tableName: string,
  initialQuery?: FetchOptions
): RecordsHookReturn {
  const dispatch = useAppDispatch();
  const tableData = useSelector((state: any) => selectTableData(state, tableName));
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract records and schema from table data
  const records = useMemo(() => tableData?.records ?? [], [tableData]);
  const schema = useMemo(() => tableData?.schema ?? null, [tableData]);
  const lastUpdated = useMemo(() => tableData?.lastUpdated ?? null, [tableData]);

  // Generic error-safe dispatcher
  const safeDispatch = useCallback(
    async <T,>(
      action: any,
      onError?: (e: Error) => void
    ): Promise<T | undefined> => {
      try {
        return await dispatch(action).unwrap();
      } catch (e) {
        onError?.(e as Error);
      }
      return undefined;
    },
    [dispatch]
  );


  // Refresh records
  const refresh = useCallback(async (options: FetchOptions = { limit: 20 }) => {
    setLoading(true);
    const result = await safeDispatch<TableRecordData>(fetchTableRecords({ tableName, queryParams: options }));
    if (result) {
      setNextPageToken(result.nextPageToken ?? null);
    }
    setLoading(false);
  }, [safeDispatch, tableName]);

  // CRUD operations
  const addRecord = useCallback(async (record: Record<string, unknown>) => {
    return await safeDispatch<TableRecordAPIResponse>(createRecord({ tableName, record }));
  }, [safeDispatch, tableName]);

  const modifyRecord = useCallback(async (recordId: string, updates: Record<string, unknown>) => {
    return await safeDispatch<TableRecordAPIResponse>(updateRecord({ tableName, recordId, updates }));
  }, [safeDispatch, tableName]);

  const removeRecord = useCallback(async (recordId: string) => {
    await safeDispatch(deleteRecord({ tableName, recordId }));
  }, [safeDispatch, tableName]);

  // Optionally, fetch next page of records if pagination is needed
  const fetchNextPage = useCallback(async () => {
    if (nextPageToken && !loading) {
      await refresh({ pageToken: nextPageToken, limit: 20 });
    }
  }, [nextPageToken, loading, refresh]);

  // Load initial data on mount
  useEffect(() => {
    refresh(initialQuery || { limit: 100 });
  }, [refresh, initialQuery]);

  return { 
    records, 
    schema, 
    loading, 
    error, 
    lastUpdated,
    nextPageToken,
    refresh, 
    fetchNextPage, 
    addRecord, 
    modifyRecord, 
    removeRecord 
  };
}
