import {
  Drawer,
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { memo, useEffect, useState, useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import CreateRoomDialog from './CreateRoomDialog';
import Iconify from '../../../components/iconify';
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

const ChatDrawer = ({ open, onClose }) => {
  const theme = useTheme();
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

  const handleRoomClick = (room) => {
    // Navigate to the room and close the drawer
    history.push(`/room/${room.id}`);
    onClose();
  };

  const handleLoadMore = () => {
    dispatch(fetchMoreUserRooms());
  };

  const handleCreateRoomOpen = () => {
    setCreateRoomOpen(true);
  };

  const handleCreateRoomClose = () => {
    setCreateRoomOpen(false);
  };

  const handleMenuOpen = (event, room) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuRoom(room);
  };

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
    // Optionally navigate to the new room
    if (result?.room?.id) {
      history.push(`/room/${result.room.id}`);
      onClose();
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

  return (
    <>
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 350,
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}
              >
                Chat Rooms
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={handleCreateRoomOpen}
                startIcon={<Iconify icon="eva:plus-fill" />}
                sx={{ fontSize: '0.75rem', py: 0.5, px: 1 }}
              >
                Create
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
                    <Iconify icon="eva:search-fill" sx={{ fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: localSearchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleSearchClear}
                      sx={{ p: 0.5 }}
                    >
                      <Iconify icon="eva:close-fill" sx={{ fontSize: 16 }} />
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
              <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontSize: '0.875rem' }}>
                  Searching...
                </Typography>
              </Box>
            )}

            {/* Room List View */}
            {!isSearching && (
              <Box>
                <List sx={{ p: 0 }}>
                  {displayRooms && displayRooms.length > 0 ? (
                    displayRooms.map((room) => (
                      <ListItem
                        key={room.id}
                        button
                        onClick={() => handleRoomClick(room)}
                        sx={{
                          py: 1,
                          px: 1.5,
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 36 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'primary.main',
                              width: 32,
                              height: 32,
                              fontSize: '0.875rem',
                            }}
                          >
                            {room.name ? room.name[0] : '?'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={room.name || room.title || 'Room'}
                          secondary={room.last_interaction ? fToNow(room.last_interaction) : null}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            noWrap: true,
                          }}
                          secondaryTypographyProps={{
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={(event) => handleMenuOpen(event, room)}
                          sx={{
                            opacity: 0.7,
                            '&:hover': { opacity: 1 },
                          }}
                        >
                          <Iconify icon="eva:more-vertical-fill" sx={{ fontSize: 18 }} />
                        </IconButton>
                      </ListItem>
                    ))
                  ) : (
                    <Box sx={{ p: 1.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        {noRoomsMessage}
                      </Typography>
                    </Box>
                  )}
                </List>

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
              </Box>
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
            <Iconify icon="eva:edit-fill" sx={{ fontSize: 18 }} />
          </ListItemIcon>
          Edit Room
        </MenuItem>
        <MenuItem onClick={handleDeleteRoom} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Iconify icon="eva:trash-2-fill" sx={{ fontSize: 18, color: 'error.main' }} />
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
