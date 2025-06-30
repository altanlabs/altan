import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import React, { useState, useCallback, memo, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import FormDialog from '../../../../components/FormDialog';
import HeaderIconButton from '../../../../components/HeaderIconButton';
import Iconify from '../../../../components/iconify/Iconify';
import IconRenderer from '../../../../components/icons/IconRenderer';
import Logo from '../../../../components/logo/Logo';
import { selectCurrentAltaner, updateAltanerById } from '../../../../redux/slices/altaners';

// Constants
const MENU_CONFIG = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
  paperProps: {
    sx: {
      mt: 1,
      width: 250,
      maxHeight: 300,
      overflowY: 'auto',
    },
  },
};

const ICON_SIZE = 24;

// Selectors
const selectAccountAltaners = (state) => state.general.account.altaners;

// Sub-components
const AltanerMenuItem = memo(({ altaner, isSelected, onSelect }) => (
  <MenuItem
    selected={isSelected}
    onClick={() => onSelect(altaner.id)}
  >
    <ListItemIcon>
      <IconRenderer
        icon={altaner.icon_url}
        size={ICON_SIZE}
      />
    </ListItemIcon>
    <ListItemText primary={altaner.name} />
  </MenuItem>
));

AltanerMenuItem.displayName = 'AltanerMenuItem';

const BackToDashboardButton = memo(({ onBackClick }) => (
  <Tooltip title="Back to Dashboard">
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover .altaner-icon': { opacity: 0 },
        '&:hover .back-icon': { opacity: 1 },
      }}
    >
      <HeaderIconButton
        onClick={onBackClick}
        sx={{
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            className="altaner-icon"
            sx={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              opacity: 1,
              transition: 'opacity 0.2s',
            }}
          >
            <Logo minimal />
          </Box>
          <Box
            className="back-icon"
            sx={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              opacity: 0,
              transition: 'opacity 0.2s',
            }}
          >
            <Iconify
              icon="mdi:arrow-left"
              width={18}
              style={{
                display: 'block',
                margin: 'auto',
              }}
            />
          </Box>
        </Box>
      </HeaderIconButton>
    </Box>
  </Tooltip>
));

BackToDashboardButton.displayName = 'BackToDashboardButton';

const AltanerName = memo(({ name, onEditClick }) => (
  <Tooltip title="Edit project">
    <HeaderIconButton
      onClick={onEditClick}
      sx={{
        width: 'auto',
        px: 1.5,
        ml: 0.5,
        fontSize: '0.875rem',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      {name}
    </HeaderIconButton>
  </Tooltip>
));

AltanerName.displayName = 'AltanerName';

const ChevronButton = memo(() => (
  <Tooltip title="Switch Project">
    <IconButton
      size="small"
      sx={{ ml: 1 }}
    >
      <Iconify
        icon="heroicons:chevron-up-down-20-solid"
        width={16}
      />
    </IconButton>
  </Tooltip>
));

ChevronButton.displayName = 'ChevronButton';

// Main component
const AltanerSwitcher = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  // Redux state
  const altaners = useSelector(selectAccountAltaners);
  const currentAltaner = useSelector(selectCurrentAltaner);

  // Local state
  const [anchorEl, setAnchorEl] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized values
  const isMenuOpen = Boolean(anchorEl);

  // Filter altaners based on search query
  const filteredAltaners = useMemo(() => {
    if (!searchQuery.trim()) return altaners;

    const query = searchQuery.toLowerCase();
    return altaners.filter((altaner) => altaner.name.toLowerCase().includes(query));
  }, [altaners, searchQuery]);

  const editSchema = useMemo(
    () => ({
      properties: {
        name: {
          type: 'string',
          title: 'Name',
          default: currentAltaner?.name,
        },
        description: {
          type: 'string',
          title: 'Description',
          default: currentAltaner?.description,
        },
        icon_url: {
          type: 'string',
          title: 'Icon URL',
          default: currentAltaner?.icon_url,
          'x-component': 'IconAutocomplete',
        },
      },
      required: ['name'],
    }),
    [currentAltaner],
  );

  // Event handlers
  const handleBoxClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSearchQuery(''); // Reset search when closing
  }, []);

  const handleAltanerSelect = useCallback(
    (altanerId) => {
      window.location.href = `/project/${altanerId}`;
      handleMenuClose();
    },
    [handleMenuClose],
  );

  const handleBackToDashboard = useCallback(
    (event) => {
      event.stopPropagation();
      history.push('/');
    },
    [history],
  );

  const handleEditClick = useCallback((event) => {
    event.stopPropagation();
    setEditDialogOpen(true);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditDialogOpen(false);
  }, []);

  const handleConfirmEdit = useCallback(
    async (data) => {
      try {
        await dispatch(updateAltanerById(currentAltaner.id, data));
        handleCloseEditDialog();
      } catch (error) {
        console.error('Failed to update altaner:', error);
        // Consider showing a user-friendly error message here
      }
    },
    [dispatch, currentAltaner?.id, handleCloseEditDialog],
  );

  // Render
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={handleBoxClick}
      >
        <BackToDashboardButton
          onBackClick={handleBackToDashboard}
        />

        <AltanerName
          name={currentAltaner?.name}
          onEditClick={handleEditClick}
        />

        {/* <ChevronButton /> */}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={MENU_CONFIG.anchorOrigin}
        transformOrigin={MENU_CONFIG.transformOrigin}
        slotProps={{ paper: MENU_CONFIG.paperProps }}
      >
        <Box sx={{ px: 1, pb: 1 }}>
          <TextField
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search project..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                fontSize: '0.875rem',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify
                    icon="eva:search-fill"
                    width={20}
                    sx={{ color: 'text.disabled' }}
                  />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {filteredAltaners.length > 0 && <Divider />}

        {filteredAltaners.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              No project found
            </Typography>
          </Box>
        ) : (
          filteredAltaners.map((altaner) => (
            <AltanerMenuItem
              key={altaner.id}
              altaner={altaner}
              isSelected={altaner.id === currentAltaner?.id}
              onSelect={handleAltanerSelect}
            />
          ))
        )}
      </Menu>

      <FormDialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        schema={editSchema}
        title="Edit Project"
        description="Update the altaner details"
        onConfirm={handleConfirmEdit}
      />
    </>
  );
};

export default memo(AltanerSwitcher);
