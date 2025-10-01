import { Box, TextField, IconButton, Tooltip, Stack, Chip, useMediaQuery } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useRef, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { debounce } from 'lodash-es';

import {
  selectDatabaseQuickFilter,
  setDatabaseQuickFilter,
  selectDatabaseRefreshing,
  selectTableTotalRecords,
  searchTableRecords,
  selectDatabaseSearching,
  selectDatabaseSearchResults,
  selectBaseById,
  setDatabaseRefreshing,
  loadTableRecords,
} from '../../../redux/slices/bases';
import { dispatch } from '../../../redux/store';
import Iconify from '../../iconify';
import DatabaseInfoDialog from '../dialogs/DatabaseInfoDialog.jsx';
import CreateRecordDrawer from '../records/CreateRecordDrawer.jsx';

function DatabaseNavigationBar({
  disabled = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const inputRef = useRef(null);
  const { baseId: routeBaseId, tableId, componentId } = useParams();
  
  // Dialog states
  const [openCreateRecord, setOpenCreateRecord] = useState(false);
  const [openDatabaseInfo, setOpenDatabaseInfo] = useState(false);

  // Get baseId from route params
  const baseId = routeBaseId;
  
  // Get database from Redux using the baseId
  const database = useSelector((state) => 
    baseId ? selectBaseById(state, baseId) : null
  );

  // Get values from Redux - only when this component is actually rendered for database
  const quickFilter = useSelector(selectDatabaseQuickFilter);
  const databaseRefreshing = useSelector(selectDatabaseRefreshing);
  const databaseSearching = useSelector(selectDatabaseSearching);
  const searchResults = useSelector((state) =>
    tableId ? selectDatabaseSearchResults(state, tableId) : null,
  );
  const currentTableRecordCount = useSelector((state) =>
    tableId ? selectTableTotalRecords(state, tableId) : 0,
  );

  // Use internal state for better performance
  const actualRecordCount = currentTableRecordCount;
  const actualIsLoading = databaseRefreshing || databaseSearching;

  // Create debounced search function to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      // eslint-disable-next-line no-console
      console.log('🎯 DatabaseNavigationBar debouncedSearch triggered:', { tableId, searchQuery });
      
      if (tableId && searchQuery.trim()) {
        // eslint-disable-next-line no-console
        console.log('🔍 Dispatching searchTableRecords...');
        // Trigger database search across all records
        dispatch(searchTableRecords(tableId, searchQuery.trim()));
      } else if (tableId && !searchQuery.trim()) {
        // eslint-disable-next-line no-console
        console.log('🧹 Clearing search...');
        // Clear search when query is empty
        dispatch(searchTableRecords(tableId, ''));
      }
    }, 300), // 300ms delay for better UX
    [tableId]
  );

  const handleFilterChange = (e) => {
    const value = e.target.value;
    // eslint-disable-next-line no-console
    console.log('📝 DatabaseNavigationBar handleFilterChange:', { value, tableId });
    
    // Update Redux state directly for immediate UI feedback
    dispatch(setDatabaseQuickFilter(value));
    
    // Trigger debounced database search
    // eslint-disable-next-line no-console
    console.log('🚀 Calling debouncedSearch with value:', value);
    debouncedSearch(value);
  };

  // Database operation handlers
  const handleDatabaseRefresh = useCallback(() => {
    const currentTableId = tableId;
    if (baseId && currentTableId) {
      dispatch(setDatabaseRefreshing(true));
      // Refresh the current table
      dispatch(loadTableRecords(currentTableId, { forceReload: true })).finally(() =>
        dispatch(setDatabaseRefreshing(false)),
      );
    } else if (baseId && database?.tables?.items?.length > 0) {
      dispatch(setDatabaseRefreshing(true));
      // Fallback: refresh the first table
      const fallbackTableId = database.tables.items[0]?.id;
      if (fallbackTableId) {
        dispatch(loadTableRecords(fallbackTableId, { forceReload: true })).finally(() =>
          dispatch(setDatabaseRefreshing(false)),
        );
      }
    }
  }, [baseId, tableId, database]);

  const handleDatabaseAddRecord = useCallback(() => {
    setOpenCreateRecord(true);
  }, []);

  const handleDatabaseInfo = useCallback(() => {
    setOpenDatabaseInfo(true);
  }, []);

  const handleExportCSV = useCallback(() => {
    if (!database || !tableId) return;

    // Find current table
    const currentTable = database.tables?.items?.find(t => t.id === tableId);
    if (!currentTable) return;

    // Get records from the current table
    const records = currentTable.records?.items || [];
    if (records.length === 0) {
      // eslint-disable-next-line no-console
      console.warn('No records to export');
      return;
    }

    // Get column headers from the first record
    const headers = Object.keys(records[0]);
    
    // Create CSV content
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    records.forEach(record => {
      const values = headers.map(header => {
        const value = record[header];
        // Escape commas and quotes in values
        const escaped = String(value ?? '').replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentTable.name || 'table'}_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [database, tableId]);

  // Cleanup debounced function on unmount
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

      {/* Action Buttons - Outside search bar */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
      >
        {/* Settings Button */}
        <Tooltip title="Database settings">
          <IconButton
            size="small"
            onClick={handleDatabaseInfo}
            disabled={disabled || !database}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              color: theme.palette.text.secondary,
              backgroundColor: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              transition: theme.transitions.create(['all'], {
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                backgroundColor: alpha(theme.palette.info.main, 0.12),
                color: theme.palette.info.main,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Iconify
              icon="mdi:cog-outline"
              sx={{ width: 18, height: 18 }}
            />
          </IconButton>
        </Tooltip>

        {/* Export CSV Button */}
        <Tooltip title="Export to CSV">
          <IconButton
            size="small"
            onClick={handleExportCSV}
            disabled={disabled || !tableId || actualRecordCount === 0}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              color: theme.palette.success.main,
              backgroundColor: alpha(theme.palette.success.main, 0.12),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              transition: theme.transitions.create(['all'], {
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                backgroundColor: alpha(theme.palette.success.main, 0.2),
                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Iconify
              icon="mdi:download"
              sx={{ width: 18, height: 18 }}
            />
          </IconButton>
        </Tooltip>

        {/* Create Record Button - Primary */}
        <Tooltip title="Create new record">
          <IconButton
            size="small"
            onClick={handleDatabaseAddRecord}
            disabled={disabled || !tableId}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              color: theme.palette.mode === 'dark' ? theme.palette.primary.lighter : '#fff',
              backgroundColor: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
              transition: theme.transitions.create(['all'], {
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                border: `1px solid ${alpha(theme.palette.primary.dark, 0.5)}`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Iconify
              icon="mdi:plus"
              sx={{ width: 20, height: 20 }}
            />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Database Dialogs */}
      {baseId && (
        <>
          <DatabaseInfoDialog
            open={openDatabaseInfo}
            onClose={() => setOpenDatabaseInfo(false)}
            database={database}
            baseId={baseId}
          />
          {tableId && (
            <CreateRecordDrawer
              baseId={baseId}
              tableId={tableId}
              open={openCreateRecord}
              onClose={() => setOpenCreateRecord(false)}
            />
          )}
        </>
      )}
    </Box>
  );
}

DatabaseNavigationBar.propTypes = {
  disabled: PropTypes.bool,
};

export default DatabaseNavigationBar;
