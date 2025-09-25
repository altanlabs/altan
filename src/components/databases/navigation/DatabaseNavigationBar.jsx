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
import CreateRecordDialog from '../records/CreateRecordDialog.jsx';
import RLSSettingsDialog from '../table/RLSSettingsDialog.jsx';
import PostgRESTProxyDialog from '../dialogs/PostgRESTProxyDialog.jsx';

function DatabaseNavigationBar({
  disabled = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const inputRef = useRef(null);
  const { baseId: routeBaseId, tableId, componentId } = useParams();
  
  // Dialog states
  const [openCreateRecord, setOpenCreateRecord] = useState(false);
  const [openRLSSettings, setOpenRLSSettings] = useState(false);
  const [openDatabaseInfo, setOpenDatabaseInfo] = useState(false);
  const [openPostgRESTProxy, setOpenPostgRESTProxy] = useState(false);

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

  const handleDatabaseRLSSettings = useCallback(() => {
    setOpenRLSSettings(true);
  }, []);

  const handleDatabaseInfo = useCallback(() => {
    setOpenDatabaseInfo(true);
  }, []);

  const handlePostgRESTProxy = useCallback(() => {
    setOpenPostgRESTProxy(true);
  }, []);

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
        gap: 1,
      }}
    >
      {/* Glassmorphic Container */}
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
          px: 1,
          gap: 1,
          transition: theme.transitions.create(['background-color', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        {/* Left Section - View Controls */}
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
        >
          {/* Database Info */}
          <Tooltip title="Database settings">
            <IconButton
              size="small"
              onClick={handleDatabaseInfo}
              disabled={disabled || !database}
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.info.main, 0.08),
                  color: theme.palette.info.main,
                },
              }}
            >
              <Iconify
                icon="mdi:cog-outline"
                sx={{ width: 16, height: 16 }}
              />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Center Section - Search */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            minWidth: isMobile ? 120 : 200,
            maxWidth: isMobile ? 200 : 400,
          }}
        >
          <Iconify
            icon="mdi:magnify"
            sx={{
              width: 16,
              height: 16,
              color: alpha(theme.palette.text.secondary, 0.5),
              mr: 1,
            }}
          />
          <TextField
            ref={inputRef}
            value={quickFilter}
            onChange={handleFilterChange}
            placeholder="Search..."
            size="small"
            disabled={disabled}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                height: 32,
                borderRadius: 1.5,
                backgroundColor: 'transparent',
                border: databaseSearching
                  ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                  : 'none',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                fontSize: '0.875rem',
                py: 0,
                px: 0,
                color: quickFilter && !databaseSearching ? theme.palette.primary.main : 'inherit',
                '&::placeholder': {
                  color: alpha(theme.palette.text.secondary, 0.5),
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* Right Section - Record Count & Actions */}
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
        >
          {/* Record Count or Search Results - Hide on mobile */}
          {!isMobile && (
            <>
              {searchResults && quickFilter ? (
                <Chip
                  label={
                    searchResults.newRecordsFound > 0
                      ? `+${searchResults.newRecordsFound} new found`
                      : searchResults.totalSearchResults > 0
                        ? `${searchResults.totalSearchResults} matches (all shown)`
                        : 'No matches found'
                  }
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                    border: 'none',
                    '& .MuiChip-label': {
                      px: 1,
                    },
                  }}
                />
              ) : actualRecordCount > 0 ? (
                <Chip
                  label={`${actualRecordCount.toLocaleString()} records`}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    backgroundColor: alpha(theme.palette.text.secondary, 0.08),
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

          {/* RLS Settings */}
          <Tooltip title="RLS Settings">
            <IconButton
              size="small"
              onClick={handleDatabaseRLSSettings}
              disabled={disabled}
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.text.primary,
                },
              }}
            >
              <Iconify
                icon="mdi:shield-account"
                sx={{ width: 16, height: 16 }}
              />
            </IconButton>
          </Tooltip>

          {/* PostgREST Proxy */}
          <Tooltip title="PostgREST Admin Proxy">
            <IconButton
              size="small"
              onClick={handlePostgRESTProxy}
              disabled={disabled || !baseId}
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.warning.main, 0.08),
                  color: theme.palette.warning.main,
                },
              }}
            >
              <Iconify
                icon="mdi:api"
                sx={{ width: 16, height: 16 }}
              />
            </IconButton>
          </Tooltip>

          {/* Add Record - Primary Action */}
          {/* <Button
            size="small"
            variant="contained"
            startIcon={
              !isMobile ? (
                <Iconify
                  icon="mdi:plus"
                  sx={{ width: 16, height: 16 }}
                />
              ) : null
            }
            onClick={onAddRecord}
            disabled={disabled}
            sx={{
              height: 32,
              borderRadius: 1.5,
              px: isMobile ? 1.5 : 2,
              minWidth: isMobile ? 32 : 'auto',
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.24)}`,
              },
            }}
          >
            {isMobile ? (
              <Iconify
                icon="mdi:plus"
                sx={{ width: 16, height: 16 }}
              />
            ) : (
              'Add'
            )}
          </Button> */}
        </Stack>
      </Box>

      {/* Database Dialogs */}
      {baseId && (
        <>
          <DatabaseInfoDialog
            open={openDatabaseInfo}
            onClose={() => setOpenDatabaseInfo(false)}
            database={database}
          />
          <PostgRESTProxyDialog
            open={openPostgRESTProxy}
            onClose={() => setOpenPostgRESTProxy(false)}
            baseId={baseId}
            database={database}
          />
          {database?.tables?.items?.[0] && (
            <>
              <CreateRecordDialog
                baseId={baseId}
                tableId={database.tables.items[0].id}
                open={openCreateRecord}
                onClose={() => setOpenCreateRecord(false)}
              />
              <RLSSettingsDialog
                baseId={baseId}
                table={database.tables.items[0]}
                open={openRLSSettings}
                onClose={() => setOpenRLSSettings(false)}
              />
            </>
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
