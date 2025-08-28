import { Chip, useTheme, CircularProgress } from '@mui/material';
import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import EditRecordDialog from './EditRecordDialog';
import {
  createRecordPrimaryValueSelector,
  getTableRecord,
  selectTableRecordsState,
  selectTablesByBaseId,
} from '../../../redux/slices/bases';
import { dispatch } from '../../../redux/store';

const RecordChip = ({ baseId, tableId: rawTableId, recordId }) => {
  // Get the actual table ID if a db_name was passed
  const tables = useSelector((state) => selectTablesByBaseId(state, baseId));
  const tableId = tables.find((table) => table.db_name === rawTableId)?.id || rawTableId;
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [edit, setEdit] = useState(false);

  // More defensive record lookup with additional validation
  const record = useSelector((state) => {
    if (!tableId || !recordId) return null;
    const records = state?.bases?.records?.[tableId]?.items;
    if (!Array.isArray(records)) return null;
    return records.find((r) => r?.id === recordId) ?? null;
  });

  // Get the table records state to check if records are already cached
  const recordsState = useSelector((state) => selectTableRecordsState(state, tableId));

  // Enhanced primary value selection with better error handling
  const primaryValue = useSelector((state) => {
    if (!state?.bases || !record) {
      return null;
    }

    try {
      const selector = createRecordPrimaryValueSelector(baseId, tableId, recordId);
      if (typeof selector !== 'function') {
        return null;
      }

      const value = selector(state);
      if (!value && value !== 0 && value !== false) {
        return null;
      }

      return String(value);
    } catch (error) {
      console.warn(
        `Error getting primary value for record ${recordId} in table ${tableId}:`,
        error,
      );
      return null;
    }
  });

  useEffect(() => {
    // Only fetch if the record isn't found AND
    // 1. The table is not yet loaded (recordsState doesn't exist) OR
    // 2. The table is not fully cached (recordsState.cached is false)
    if (!record && tableId && recordId && (!recordsState || !recordsState.cached)) {
      setIsLoading(true);

      // For auth tables, use the rawTableId as the custom table name
      const customTableName = rawTableId && rawTableId.startsWith('auth.') ? rawTableId : null;

      dispatch(getTableRecord(tableId, recordId, customTableName))
        .catch((error) => {
          console.warn(`Error fetching record ${recordId} from table ${tableId}:`, error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [tableId, recordId, record, recordsState, rawTableId]);

  // Early return if missing required props
  if (!tableId || !recordId || !baseId) {
    return null;
  }

  // Handle system auth tables specially for rendering
  if (rawTableId && rawTableId.startsWith('auth.')) {
    // Show loading spinner while fetching
    if (isLoading) {
      return (
        <Chip
          size="small"
          variant="outlined"
          icon={<CircularProgress size={12} />}
          sx={{
            height: '20px',
            '& .MuiChip-label': {
              fontSize: '0.75rem',
              lineHeight: '20px',
              px: 1,
              py: 0,
            },
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(76, 175, 80, 0.08)'
                : 'rgba(76, 175, 80, 0.08)',
            borderColor:
              theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.2)',
            color: theme.palette.mode === 'dark' ? '#4CAF50' : '#4CAF50',
          }}
        />
      );
    }

    // Show the record data if available, otherwise show the ID
    const displayValue = primaryValue || recordId;

    return (
      <Chip
        size="small"
        variant="outlined"
        label={displayValue}
        sx={{
          height: '20px',
          '& .MuiChip-label': {
            fontSize: '0.75rem',
            lineHeight: '20px',
            px: 1,
            py: 0,
          },
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(76, 175, 80, 0.08)'
              : 'rgba(76, 175, 80, 0.08)',
          borderColor:
            theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.2)',
          color: theme.palette.mode === 'dark' ? '#4CAF50' : '#4CAF50',
        }}
      />
    );
  }

  // Show loading spinner while fetching
  if (isLoading) {
    return (
      <Chip
        size="small"
        variant="outlined"
        icon={<CircularProgress size={12} />}
        sx={{
          height: '20px',
          '& .MuiChip-label': {
            fontSize: '0.75rem',
            lineHeight: '20px',
            px: 1,
            py: 0,
          },
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(144, 202, 249, 0.08)'
              : 'rgba(25, 118, 210, 0.08)',
          borderColor:
            theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.2)',
          color: theme.palette.mode === 'dark' ? '#90CAF9' : '#1976D2',
        }}
      />
    );
  }

  // Don't render anything if we don't have valid data
  if (!record || primaryValue === null) {
    return null;
  }

  return (
    <>
      <Chip
        key={`${baseId}_${tableId}_${recordId}`}
        onClick={() => setEdit(true)}
        label={primaryValue}
        size="small"
        variant="outlined"
        sx={{
          height: '20px',
          '& .MuiChip-label': {
            fontSize: '0.75rem',
            lineHeight: '20px',
            px: 1,
            py: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(144, 202, 249, 0.08)'
              : 'rgba(25, 118, 210, 0.08)',
          borderColor:
            theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.2)',
          color: theme.palette.mode === 'dark' ? '#90CAF9' : '#1976D2',
        }}
      />
      {edit && (
        <EditRecordDialog
          baseId={baseId}
          tableId={tableId}
          recordId={recordId}
          open={edit}
          onClose={() => setEdit(false)}
        />
      )}
    </>
  );
};

export default memo(RecordChip);
