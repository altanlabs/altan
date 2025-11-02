import { useMemo, useRef } from 'react';

// Helper function to generate a unique key for records without an id field
// This is needed for junction tables with composite primary keys
const getRecordKey = (record) => {
  if (record?.id !== undefined) return String(record.id);
  
  // For records without an id field, create a stable composite key
  const sortedKeys = Object.keys(record || {}).sort();
  const keyParts = sortedKeys
    .filter(key => key !== '__typename') // Exclude GraphQL metadata
    .map(key => `${key}:${record[key]}`);
  
  return keyParts.join('|') || 'unknown';
};

// Add this optimization for row data processing
const useOptimizedRowData = (records, fields, recentlyAddedIds) => {
  // Keep a ref of previous processed data to avoid unnecessary recalculations
  const prevProcessedDataRef = useRef([]);

  // Use memo to cache the processed records
  return useMemo(() => {
    // If records is not an array, return empty array
    if (!Array.isArray(records)) return [];

    // Filter out undefined records and deduplicate by composite key
    const recordsMap = new Map();
    records
      .filter((record) => record !== undefined && record !== null)
      .forEach((record) => {
        const recordKey = getRecordKey(record);
        // Only keep the latest version of each record (in case of duplicates)
        recordsMap.set(recordKey, { ...record });
      });

    // Convert back to array and sort by creation date for consistency
    const deduplicatedRecords = Array.from(recordsMap.values()).sort((a, b) => {
      // Sort by created_at if available, otherwise by the first sortable field
      if (a.created_at && b.created_at) {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      // Fallback to comparing string representation of keys
      const aKey = getRecordKey(a);
      const bKey = getRecordKey(b);
      return aKey.localeCompare(bKey);
    });

    // Store processed data for future comparisons
    prevProcessedDataRef.current = deduplicatedRecords;

    // Return just the records (no blank row for inline creation)
    return deduplicatedRecords;
  }, [records, fields, recentlyAddedIds]);
};

export default useOptimizedRowData;
