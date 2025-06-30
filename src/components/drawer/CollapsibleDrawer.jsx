import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Box,
  Drawer,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import React, { memo, useCallback, useState } from 'react';

import Iconify from '../../components/iconify/Iconify.jsx';
import AltanerComponentDialog from '../../pages/dashboard/altaners/components/AltanerComponentDialog.jsx';

const CollapsibleDrawer = ({
  isOpen,
  onToggle,
  width = 240,
  items = [],
  contextMenuItems = [],
  onItemClick,
  renderItem,
  onSearch,
  onCreateClick,
  searchPlaceholder = 'Search...',
  createPlaceholder = 'Create flow',
  selectedId = null,
  altanerId = null,
  altanerComponentId = null,
  disableAnimation = false,
  showEmptyState = false,
  sortComponent = null,
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedItemData, setSelectedItemData] = useState(null);
  const [editAltanerComponentOpen, setEditAltanerComponentOpen] = useState(false);

  const handleContextMenu = useCallback((event, itemData) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedItemData(itemData);
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
  }, []);

  const handleCloseMenu = useCallback(() => {
    setContextMenu(null);
    setSelectedItemData(null);
  }, []);

  const handleOpenEditAltanerComponent = useCallback(() => {
    setEditAltanerComponentOpen(true);
  }, []);

  const handleCloseEditAltanerComponent = useCallback(() => {
    setEditAltanerComponentOpen(false);
  }, []);

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: isOpen ? width : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isOpen ? width : 0,
            position: 'relative',
            height: '100%',
            border: 'none',
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            overflowX: 'hidden',
          },
        }}
      >
        <Stack
          sx={{ height: '100%', p: 2 }}
          spacing={2}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch?.(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Iconify
                    icon="eva:search-fill"
                    sx={{ color: 'text.disabled', width: 20, height: 20, mr: 1 }}
                  />
                ),
              }}
              sx={{ flex: 1 }}
            />
            {sortComponent}
          </Stack>

          <Stack
            className="no-scrollbar"
            spacing={1}
            sx={{ flex: 1, overflowY: 'auto' }}
          >
            {items.length > 0
              ? items.map((item) => (
                  <Box
                    key={item.id}
                    onClick={() => onItemClick?.(item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                    className="group cursor-pointer rounded-md p-1 relative flex flex-row items-center w-full"
                    sx={{
                      bgcolor: selectedId === item.id ? 'action.selected' : 'transparent',
                      '&:hover': {
                        bgcolor: selectedId === item.id ? 'action.selected' : 'action.hover',
                      },
                      opacity: item.is_active ? 1 : 0.6,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: item.is_active ? 'success.main' : 'error.main',
                        mr: 1,
                        flexShrink: 0,
                      }}
                    />

                    {renderItem ? (
                      renderItem(item)
                    ) : (
                      <Typography
                        variant="subtitle1"
                        noWrap
                        className="w-full truncate"
                      >
                        {item.name}
                      </Typography>
                    )}
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleContextMenu(e, item);
                      }}
                      size="small"
                      className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition transition-opacity duration-400"
                    >
                      <Iconify icon="bi:three-dots-vertical" />
                    </IconButton>
                  </Box>
                ))
              : showEmptyState && (
                <Stack
                  spacing={1}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ height: '100%', py: 2 }}
                >
                  <Iconify
                    icon="solar:empty-file-line-duotone"
                    sx={{ width: 40, height: 40, color: 'text.disabled' }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.disabled', textAlign: 'center' }}
                  >
                    No workflows found
                  </Typography>
                </Stack>
              )}
          </Stack>

          {!!(altanerId && altanerComponentId) && (
            <Button
              fullWidth
              color="inherit"
              onClick={handleOpenEditAltanerComponent}
              startIcon={
                <Iconify
                  icon="material-symbols:edit-outline"
                  width={17}
                />
              }
            >
              Edit Component
            </Button>
          )}

          <Button onClick={onCreateClick}>
            <Iconify
              icon="lets-icons:add-duotone"
              sx={{ mr: 1, width: 20, height: 20 }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 500 }}
            >
              {createPlaceholder}
            </Typography>
          </Button>
        </Stack>
      </Drawer>

      {!!(altanerId && altanerComponentId) && (
        <AltanerComponentDialog
          altanerId={altanerId}
          open={editAltanerComponentOpen}
          onClose={handleCloseEditAltanerComponent}
          altanerComponentId={altanerComponentId}
        />
      )}

      <Menu
        open={Boolean(contextMenu)}
        onClose={handleCloseMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
        }
      >
        {contextMenuItems.map((item, index) => {
          if (item.type === 'conditional') {
            const name = typeof item.name === 'function' ? item.name(selectedItemData) : item.name;
            const icon = typeof item.icon === 'function' ? item.icon(selectedItemData) : item.icon;
            const color =
              typeof item.color === 'function' ? item.color(selectedItemData) : item.color;

            return (
              <MenuItem
                key={`${name}-${index}`}
                onClick={() => {
                  item.action(selectedItemData);
                  handleCloseMenu();
                }}
                sx={{ color }}
              >
                <ListItemIcon>
                  <Iconify
                    icon={icon}
                    sx={{ color, width: 20, height: 20 }}
                  />
                </ListItemIcon>
                <Typography>{name}</Typography>
              </MenuItem>
            );
          }

          return (
            <MenuItem
              key={`${item.name}-${index}`}
              onClick={() => {
                item.action(selectedItemData);
                handleCloseMenu();
              }}
              sx={{ color: item.color }}
            >
              <ListItemIcon>
                <Iconify
                  icon={item.icon}
                  sx={{ color: item.color, width: 20, height: 20 }}
                />
              </ListItemIcon>
              <Typography>{item.name}</Typography>
            </MenuItem>
          );
        })}
      </Menu>

      <Box
        onClick={() => onToggle(!isOpen)}
        sx={{
          position: 'absolute',
          left: isOpen ? width : 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1200,
          bgcolor: 'background.paper',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderLeft: isOpen ? undefined : (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: isOpen ? '0 8px 8px 0' : '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0.5,
          cursor: 'pointer',
          transition: (theme) =>
            theme.transitions.create('left', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </Box>
    </>
  );
};

export default memo(CollapsibleDrawer);
