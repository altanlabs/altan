import { Box, TextField, IconButton, Tooltip, Stack, Chip, useMediaQuery } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useRef, useCallback, useEffect } from 'react';
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
} from '../../../redux/slices/bases';
import { dispatch } from '../../../redux/store';
import Iconify from '../../iconify';

function DatabaseNavigationBar({
  database,
  onQuickFilterChange,
  disabled = false,
  recordCount = 0, // Keep as prop for backward compatibility, but use internal state
  isLoading = false, // Keep as prop for backward compatibility, but use internal state
  onRefresh,
  onRLSSettings,
  onDatabaseInfo,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const inputRef = useRef(null);
  const { tableId } = useParams();

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

  // Use internal state over props for better performance
  const actualRecordCount = currentTableRecordCount || recordCount;
  const actualIsLoading = databaseRefreshing || databaseSearching || isLoading;

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
    
    // Also call the callback if provided (for backward compatibility)
    if (onQuickFilterChange) {
      onQuickFilterChange(value);
    }
  };

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

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
              onClick={onDatabaseInfo}
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

          {/* Refresh */}
          <Tooltip title="Refresh data">
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={disabled || actualIsLoading}
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
                icon={actualIsLoading ? 'svg-spinners:blocks-shuffle-3' : 'mdi:refresh'}
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
            placeholder={isMobile ? 'Search...' : 'Search across all records...'}
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
                color: quickFilter && !databaseSearching 
                  ? theme.palette.primary.main 
                  : 'inherit',
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
              onClick={onRLSSettings}
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
    </Box>
  );
}

DatabaseNavigationBar.propTypes = {
  database: PropTypes.object,
  table: PropTypes.object,
  onQuickFilterChange: PropTypes.func,
  disabled: PropTypes.bool,
  recordCount: PropTypes.number,
  isLoading: PropTypes.bool,
  onRefresh: PropTypes.func,
  onRLSSettings: PropTypes.func,
  onDatabaseInfo: PropTypes.func,
};

export default DatabaseNavigationBar;
