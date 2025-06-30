import { useMemo, useRef } from 'react';

// Add this optimization for row data processing
const useOptimizedRowData = (records, fields, recentlyAddedIds) => {
  // Keep a ref of previous records to compare changes
  const prevRecordsRef = useRef([]);

  // Use memo to cache the processed records
  return useMemo(() => {
    if (!Array.isArray(fields)) return [];

    // Create the blank record once
    const safeFields = Array.isArray(fields) ? fields : [];
    const blankRecord = {
      id: '+',
      ...Object.fromEntries(
        safeFields
          .filter((field) => field && field.db_field_name)
          .map((field) => [field.db_field_name, '']),
      ),
    };

    // If records is not an array, return just the blank record
    if (!Array.isArray(records)) return [blankRecord];

    // Compare with previous records to only process changed ones
    const changedRecords = records.filter((record, index) => {
      const prevRecord = prevRecordsRef.current[index];
      return (
        !prevRecord ||
        JSON.stringify(record) !== JSON.stringify(prevRecord) ||
        !recentlyAddedIds.has(record.id)
      );
    });

    // Update previous records reference
    prevRecordsRef.current = records;

    // If no changes, return the previous result
    if (changedRecords.length === 0 && prevRecordsRef.current.length === records.length) {
      return [...prevRecordsRef.current, blankRecord];
    }

    // Filter out undefined records and create shallow copies to avoid mutating originals
    const safeRecords = records
      .filter((record) => record !== undefined)
      .filter((record) => !recentlyAddedIds.has(record.id))
      .map((record) => ({ ...record }));

    // Return our final rows with the blank record at the end
    return [...safeRecords, blankRecord];
  }, [records, fields, recentlyAddedIds]);
};

export default useOptimizedRowData;
