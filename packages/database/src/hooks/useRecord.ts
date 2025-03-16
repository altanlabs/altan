import { useCallback, useEffect, useState } from "react";
import { useRecords } from "./useRecords";
import { RecordHookReturn, TableRecordItem } from "../store/types";


export function useRecord<TRecord extends TableRecordItem = TableRecordItem>(
  tableName: string,
  recordId: number
): RecordHookReturn<TRecord> {
  // Get all records from the table
  const { records, refresh, modifyRecord, removeRecord } = useRecords<TRecord>(tableName);
  const [record, setRecord] = useState<TRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find the record by ID whenever records update
  useEffect(() => {
    const rec = records.find((r: any) => r.id === recordId) || null;
    setRecord(rec as TRecord | null);
  }, [records, recordId]);

  // Refresh the record by re-fetching the table records
  const refreshRecord = useCallback(async () => {
    setLoading(true);
    try {
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }, [refresh]);

  // Update the record with new values
  const updateRecord = useCallback(async (updates: Record<string, unknown>): Promise<TRecord | null> => {
    const response = await modifyRecord(recordId, updates);
    return response?.record as TRecord ?? null;
  }, [modifyRecord, recordId]);

  // Delete the record
  const deleteRecord = useCallback(async () => {
    await removeRecord(recordId);
  }, [removeRecord, recordId]);

  return { record, loading, error, refresh: refreshRecord, modify: updateRecord, remove: deleteRecord };
};