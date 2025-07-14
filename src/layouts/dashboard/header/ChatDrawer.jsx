import {
  Drawer,
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Stack,
} from '@mui/material';
import { m } from 'framer-motion';
import { memo, useEffect, useState, useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import CreateRoomDialog from './CreateRoomDialog';
import Iconify from '../../../components/iconify';
import { HEADER } from '../../../config-global';
import { cn } from '../../../lib/utils';
import {
  selectUserRooms,
  selectUserRoomsPagination,
  selectSearchRoomsResults,
  selectSearchRoomsLoading,
  selectSearchRoomsQuery,
  selectSearchRoomsHasResults,
  fetchUserRooms,
  fetchMoreUserRooms,
  searchUserRooms,
  deleteRoom,
} from '../../../redux/slices/room';
import { useSelector, useDispatch } from '../../../redux/store';
import { fToNow } from '../../../utils/formatTime';
import FloatingNavigation from './FloatingNavigation';

const variants = {
  hidden: { opacity: 0.8, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: 'easeOut' } },
};

// Room Item Component matching ThreadMinified style
const RoomItem = memo(({ room, onSelect, onMenuOpen }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    onSelect(room);
  }, [room, onSelect]);

  const handleMenuClick = useCallback((event) => {
    event.stopPropagation();
    onMenuOpen(event, room);
  }, [room, onMenuOpen]);

  return (
    <m.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="relative"
    >
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        className={cn(
          'group relative flex items-center justify-between px-3 py-2 mx-1 rounded-lg cursor-pointer',
          'transition-all duration-200 ease-out',
          'hover:bg-gray-100 dark:hover:bg-gray-800/50',
        )}
      >
        {/* Room name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Typography
            variant="body2"
            className="font-normal truncate text-gray-900 dark:text-gray-100"
          >
            {room.name || room.title || 'Room'}
          </Typography>
        </div>

        {/* Right side - timestamp or action buttons */}
        <div className="flex items-center ml-4 relative min-w-[100px]">
          {/* Timestamp - hidden on hover */}
          <Typography
            variant="caption"
            className={cn(
              'text-gray-500 dark:text-gray-400 transition-all duration-200 ease-out absolute right-0 whitespace-nowrap',
              isHovered ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0',
            )}
          >
            {room.last_interaction ? fToNow(room.last_interaction) : ''}
          </Typography>

          {/* Action button - shown on hover */}
          <div
            className={cn(
              'flex items-center gap-1 transition-all duration-200 ease-out absolute right-0',
              isHovered
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-2 pointer-events-none',
            )}
          >
            <IconButton
              size="small"
              onClick={handleMenuClick}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              sx={{ width: 24, height: 24 }}
            >
              <Iconify
                icon="eva:more-vertical-fill"
                width={14}
              />
            </IconButton>
          </div>
        </div>
      </Box>
    </m.div>
  );
});

RoomItem.displayName = 'RoomItem';

const ChatDrawer = ({ open, onClose, persistent = false }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const userRooms = useSelector(selectUserRooms);
  const userRoomsPagination = useSelector(selectUserRoomsPagination);
  const userRoomsInitialized = useSelector((state) => state.room.initialized.userRooms);
  const searchResults = useSelector(selectSearchRoomsResults);
  const searchLoading = useSelector(selectSearchRoomsLoading);
  const searchQuery = useSelector(selectSearchRoomsQuery);
  const searchHasResults = useSelector(selectSearchRoomsHasResults);
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [editRoomOpen, setEditRoomOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuRoom, setMenuRoom] = useState(null);
  const debounceRef = useRef(null);

  // Create debounced search function
  const debouncedSearch = useCallback(
    (query) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        dispatch(searchUserRooms(query));
      }, 300);
    },
    [dispatch],
  );

  useEffect(() => {
    if (!userRoomsInitialized) {
      dispatch(fetchUserRooms());
    }
  }, [userRoomsInitialized, dispatch]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Determine which rooms to display
  const displayRooms = searchQuery ? searchResults : userRooms;
  const isSearching = searchQuery && searchLoading;
  const noRoomsMessage = searchQuery
    ? (searchHasResults ? '' : 'No rooms found matching your search.')
    : 'No chat rooms found.';

  const handleRoomClick = useCallback((room) => {
    // Navigate to the room and close the drawer only if not persistent
    history.push(`/room/${room.id}`);
    if (!persistent) {
      onClose();
    }
  }, [history, persistent, onClose]);

  const handleLoadMore = () => {
    dispatch(fetchMoreUserRooms());
  };

  const handleCreateRoomOpen = () => {
    setCreateRoomOpen(true);
  };

  const handleCreateRoomClose = () => {
    setCreateRoomOpen(false);
  };

  const handleMenuOpen = useCallback((event, room) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuRoom(room);
  }, []);

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuRoom(null);
  };

  const handleEditRoomOpen = (room) => {
    setSelectedRoom(room);
    setEditRoomOpen(true);
    handleMenuClose();
  };

  const handleEditRoomClose = () => {
    setEditRoomOpen(false);
    setSelectedRoom(null);
  };

  const handleCreateRoomSuccess = (result) => {
    // Navigate to the new room and close only if not persistent
    if (result?.room?.id) {
      history.push(`/room/${result.room.id}`);
      if (!persistent) {
        onClose();
      }
    }
  };

  const handleEditRoomSuccess = () => {
    // Refresh the room list
    dispatch(fetchUserRooms());
    handleEditRoomClose();
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setLocalSearchQuery(query);
    debouncedSearch(query);
  };

  const handleSearchClear = () => {
    setLocalSearchQuery('');
    dispatch(searchUserRooms(''));
  };

  const handleDeleteRoom = async () => {
    if (menuRoom) {
      try {
        await dispatch(deleteRoom(menuRoom.id));
        // Refresh the room list after deletion
        dispatch(fetchUserRooms());
        handleMenuClose();
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  const drawerProps = persistent
    ? {
        variant: 'persistent',
        anchor: 'left',
        open,
        // Don't provide onClose for persistent variant as it shouldn't close on backdrop click
      }
    : {
        variant: 'temporary',
        anchor: 'left',
        open,
        onClose,
      };

  // Calculate header height for positioning
  const headerHeight = HEADER.H_MOBILE;

  return (
    <>
      <Drawer
        {...drawerProps}
        PaperProps={{
          sx: {
            width: 275,
            border: 'none',
            backgroundColor: 'background.default',
            ...(persistent && {
              position: 'fixed',
              top: `${headerHeight}px`,
              height: `calc(100vh - ${headerHeight}px)`,
            }),
            ...(!persistent && {
              marginTop: `${headerHeight}px`,
              height: `calc(100vh - ${headerHeight}px)`,
            }),
          },
        }}
        // For persistent drawer, we need to adjust the modal props to not create a backdrop
        ModalProps={{
          keepMounted: true,
          ...(persistent && {
            BackdropProps: {
              style: { display: 'none' },
            },
          }),
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ px: 1.5, mt: -1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                my: 1.5,
              }}
            >
              <Button
                variant="soft"
                color="inherit"
                size="small"
                fullWidth
                onClick={handleCreateRoomOpen}
                startIcon={<Iconify icon="eva:plus-fill" />}
                sx={{ fontSize: '0.75rem', py: 0.5, px: 1 }}
              >
                New chat room
              </Button>
            </Box>

            {/* Search Bar */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search rooms..."
              value={localSearchQuery}
              onChange={handleSearchChange}
              sx={{
                '& .MuiInputBase-root': {
                  height: 36,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify
                      icon="eva:search-fill"
                      sx={{ fontSize: 18 }}
                    />
                  </InputAdornment>
                ),
                endAdornment: localSearchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleSearchClear}
                      sx={{ p: 0.5 }}
                    >
                      <Iconify
                        icon="eva:close-fill"
                        sx={{ fontSize: 16 }}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {/* Loading State */}
            {isSearching && (
              <Stack
                spacing={2}
                sx={{ p: 1.5 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center' }}
                >
                  Searching...
                </Typography>
              </Stack>
            )}

            {/* Room List View */}
            {!isSearching && (
              <Stack>
                <Box sx={{ maxHeight: '100%', overflow: 'auto' }}>
                  {displayRooms && displayRooms.length > 0 ? (
                    <Stack
                      spacing={0.5}
                      sx={{ p: 1 }}
                    >
                      {displayRooms.map((room) => (
                        <RoomItem
                          key={room.id}
                          room={room}
                          onSelect={handleRoomClick}
                          onMenuOpen={handleMenuOpen}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        textAlign: 'center',
                        whiteSpace: 'pre-line',
                        p: 1.5,
                      }}
                    >
                      {noRoomsMessage}
                    </Typography>
                  )}
                </Box>

                {/* Load More Button - only show if not searching */}
                {!searchQuery && userRoomsPagination.hasNextPage && (
                  <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      onClick={handleLoadMore}
                      disabled={userRoomsPagination.isLoadingMore}
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: '0.75rem', py: 0.5 }}
                      startIcon={
                        userRoomsPagination.isLoadingMore ? (
                          <CircularProgress size={14} />
                        ) : (
                          <Iconify icon="eva:plus-fill" />
                        )
                      }
                    >
                      {userRoomsPagination.isLoadingMore ? 'Loading...' : 'Load More'}
                    </Button>
                  </Box>
                )}
              </Stack>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Three Dots Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 150,
          },
        }}
      >
        <MenuItem onClick={() => handleEditRoomOpen(menuRoom)}>
          <ListItemIcon>
            <Iconify
              icon="eva:edit-fill"
              sx={{ fontSize: 18 }}
            />
          </ListItemIcon>
          Edit Room
        </MenuItem>
        <MenuItem
          onClick={handleDeleteRoom}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Iconify
              icon="eva:trash-2-fill"
              sx={{ fontSize: 18, color: 'error.main' }}
            />
          </ListItemIcon>
          Delete Room
        </MenuItem>
      </Menu>

      {/* Create Room Dialog */}
      <CreateRoomDialog
        open={createRoomOpen}
        onClose={handleCreateRoomClose}
        onSuccess={handleCreateRoomSuccess}
      />

      {/* Edit Room Dialog */}
      <CreateRoomDialog
        open={editRoomOpen}
        onClose={handleEditRoomClose}
        onSuccess={handleEditRoomSuccess}
        editMode={true}
        roomData={selectedRoom}
      />
    </>
  );
};

export default memo(ChatDrawer);
