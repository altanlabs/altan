import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Stack,
  Chip,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useSelector } from 'react-redux';

import { selectDatabaseQuickFilter } from '../../../redux/slices/bases';
import Iconify from '../../iconify';

function DatabaseNavigationBar({
  database,
  onQuickFilterChange,
  disabled = false,
  recordCount = 0,
  isLoading = false,
  onRefresh,
  onRLSSettings,
  onDatabaseInfo,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const inputRef = useRef(null);

  // Get values from Redux
  const quickFilter = useSelector(selectDatabaseQuickFilter);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    if (onQuickFilterChange) {
      onQuickFilterChange(value);
    }
  };

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
        height: 48,
        px: 2,
        gap: 1,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      {/* Glassmorphic Container */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          height: 40,
          borderRadius: 3,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.8)} 0%, 
            ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden',
          px: 1,
          gap: 1,
          '&:hover': {
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${alpha(theme.palette.divider, 0.24)}`,
          },
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
          <Tooltip title="Database information">
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
                icon="mdi:information-outline"
                sx={{ width: 16, height: 16 }}
              />
            </IconButton>
          </Tooltip>

          {/* Refresh */}
          <Tooltip title="Refresh data">
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={disabled || isLoading}
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
                icon={isLoading ? 'svg-spinners:blocks-shuffle-3' : 'mdi:refresh'}
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
            placeholder={isMobile ? 'Search...' : 'Search records...'}
            size="small"
            disabled={disabled}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                height: 32,
                borderRadius: 1.5,
                backgroundColor: 'transparent',
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
          {/* Record Count - Hide on mobile */}
          {recordCount > 0 && !isMobile && (
            <Chip
              label={`${recordCount.toLocaleString() - 1} records`}
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
