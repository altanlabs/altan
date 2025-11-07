import { Box, TextField, IconButton, Tooltip, Chip, useMediaQuery } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Plus, Download } from 'lucide-react';
import PropTypes from 'prop-types';
import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { debounce } from 'lodash-es';

import {
  selectQuickFilter,
  setQuickFilter,
  selectSearching,
  selectSearchResults,
  searchTableRecords,
  selectTableState,
  fetchRecords,
  selectTablesByCloudId,
} from '../../../redux/slices/cloud';
import { dispatch } from '../../../redux/store';
import { optimai_cloud } from '../../../utils/axios.js';
import CreateRecordDrawer from '../records/CreateRecordDrawer.jsx';
import Iconify from '../../iconify';

function DatabaseNavigationBar({ disabled = false }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const inputRef = useRef(null);
  const { cloudId, tableId } = useParams();
  const [openCreateRecord, setOpenCreateRecord] = useState(false);

  // Get values from Redux - using cloud.js selectors
  const quickFilter = useSelector(selectQuickFilter);
  const isSearching = useSelector(selectSearching);
  const searchResults = useSelector((state) =>
    tableId ? selectSearchResults(state, tableId) : null,
  );
  const tableState = useSelector((state) =>
    tableId ? selectTableState(state, tableId) : null,
  );
  const tables = useSelector((state) => selectTablesByCloudId(state, cloudId));

  const validTables = useMemo(() => {
    if (!Array.isArray(tables)) return [];
    return tables.filter((table) => table && table.id);
  }, [tables]);

  // Use internal state for better performance
  const actualRecordCount = tableState?.total || 0;
  const actualIsLoading = tableState?.loading || isSearching;

  // Create debounced search function to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      // eslint-disable-next-line no-console
      console.log('🎯 DatabaseNavigationBar debouncedSearch triggered:', { cloudId, tableId, searchQuery });

      if (cloudId && tableId && searchQuery.trim()) {
        // eslint-disable-next-line no-console
        console.log('🔍 Dispatching searchTableRecords...');
        // Trigger database search across all records
        dispatch(searchTableRecords(cloudId, tableId, searchQuery.trim()));
      } else if (cloudId && tableId && !searchQuery.trim()) {
        // eslint-disable-next-line no-console
        console.log('🧹 Clearing search...');
        // Clear search when query is empty
        dispatch(searchTableRecords(cloudId, tableId, ''));
      }
    }, 300), // 300ms delay for better UX
    [cloudId, tableId],
  );

  const handleFilterChange = (e) => {
    const value = e.target.value;
    // eslint-disable-next-line no-console
    console.log('📝 DatabaseNavigationBar handleFilterChange:', { value, tableId });

    // Update Redux state directly for immediate UI feedback
    dispatch(setQuickFilter(value));

    // Trigger debounced database search
    // eslint-disable-next-line no-console
    console.log('🚀 Calling debouncedSearch with value:', value);
    debouncedSearch(value);
  };

  const handleExportCSV = useCallback(async () => {
    if (!cloudId || !tableId) return;

    const currentTable = validTables.find((t) => t.id === Number(tableId));
    if (!currentTable) return;

    try {
      const tableName = currentTable.db_name || currentTable.name;
      const response = await optimai_cloud.post(
        `/v1/instances/${cloudId}/export-csv`,
        { table_name: tableName },
        { responseType: 'blob' },
      );

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${tableName}_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Error handled silently
    }
  }, [cloudId, tableId, validTables]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 42,
        px: 2,
        gap: 1.5,
      }}
    >
      
      {/* Search Bar - Glassmorphic Container */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          height: 38,
          borderRadius: 3,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.8)} 0%, 
            ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
          backdropFilter: 'blur(10px)',
          border:
            theme.palette.mode === 'light'
              ? `1px solid ${alpha(theme.palette.divider, 0.12)}`
              : 'none',
          overflow: 'hidden',
          px: 1.5,
          gap: 1.5,
          transition: theme.transitions.create(['background-color', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        {/* Search Icon */}
        <Iconify
          icon="mdi:magnify"
          sx={{
            width: 18,
            height: 18,
            color: alpha(theme.palette.text.secondary, 0.6),
            flexShrink: 0,
          }}
        />

        {/* Search Input */}
        <TextField
          ref={inputRef}
          value={quickFilter}
          onChange={handleFilterChange}
          placeholder="Search records..."
          size="small"
          disabled={disabled}
          sx={{
            flex: 1,
            minWidth: isMobile ? 100 : 180,
            '& .MuiOutlinedInput-root': {
              height: 32,
              backgroundColor: 'transparent',
              '& fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              fontSize: '0.875rem',
              py: 0,
              px: 0,
              color: quickFilter ? theme.palette.primary.main : 'inherit',
              fontWeight: quickFilter ? 500 : 400,
              '&::placeholder': {
                color: alpha(theme.palette.text.secondary, 0.5),
                opacity: 1,
              },
            },
          }}
        />

        {/* Record Count - Inside search bar */}
        {!isMobile && (
          <>
            {searchResults && quickFilter ? (
              <Chip
                label={
                  searchResults.newRecordsFound > 0
                    ? `+${searchResults.newRecordsFound} new`
                    : searchResults.totalSearchResults > 0
                      ? `${searchResults.totalSearchResults} found`
                      : 'No matches'
                }
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.main,
                  border: 'none',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            ) : actualRecordCount > 0 ? (
              <Chip
                label={`${actualRecordCount.toLocaleString()}`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                  color: theme.palette.text.secondary,
                  border: 'none',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            ) : null}
          </>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Export CSV">
          <IconButton
            size="small"
            onClick={handleExportCSV}
            disabled={disabled || !tableId}
            sx={{
              width: 32,
              height: 32,
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
              },
            }}
          >
            <Download size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add Record">
          <IconButton
            size="small"
            onClick={() => setOpenCreateRecord(true)}
            disabled={disabled || !tableId}
            sx={{
              width: 32,
              height: 32,
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.16),
              },
            }}
          >
            <Plus size={16} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Create Record Drawer */}
      {tableId && (
        <CreateRecordDrawer
          baseId={cloudId}
          tableId={tableId}
          open={openCreateRecord}
          onClose={() => setOpenCreateRecord(false)}
        />
      )}
    </Box>
  );
}

DatabaseNavigationBar.propTypes = {
  disabled: PropTypes.bool,
};

export default DatabaseNavigationBar;
