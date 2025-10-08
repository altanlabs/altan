import { useMemo, useRef } from 'react';

// Add this optimization for row data processing
const useOptimizedRowData = (records, fields, recentlyAddedIds) => {
  // Keep a ref of previous processed data to avoid unnecessary recalculations
  const prevProcessedDataRef = useRef([]);

  // Use memo to cache the processed records
  return useMemo(() => {
    // If records is not an array, return empty array
    if (!Array.isArray(records)) return [];

    // Filter out undefined records and deduplicate by ID
    const recordsMap = new Map();
    records
      .filter((record) => record !== undefined && record !== null && record.id !== undefined)
      .forEach((record) => {
        // Only keep the latest version of each record (in case of duplicates)
        recordsMap.set(record.id, { ...record });
      });

    // Convert back to array and sort by creation date for consistency
    const deduplicatedRecords = Array.from(recordsMap.values()).sort((a, b) => {
      // Sort by created_at if available, otherwise by id
      if (a.created_at && b.created_at) {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      return String(a.id).localeCompare(String(b.id));
    });

    // Store processed data for future comparisons
    prevProcessedDataRef.current = deduplicatedRecords;

    // Return just the records (no blank row for inline creation)
    return deduplicatedRecords;
  }, [records, fields, recentlyAddedIds]);
};

export default useOptimizedRowData;
