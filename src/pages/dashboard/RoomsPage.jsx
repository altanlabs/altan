import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment, 
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  useTheme
} from '@mui/material';
import { memo, useEffect, useState, useCallback, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import CreateRoomDialog from '../../layouts/dashboard/header/CreateRoomDialog';
import Iconify from '../../components/iconify';
import Room from '../../components/room/Room';
import { CompactLayout } from '../../layouts/dashboard';
import {
  selectUserRooms,
  selectUserRoomsPagination,
  selectSearchRoomsResults,
  selectSearchRoomsLoading,
  selectSearchRoomsQuery,
  selectSearchRoomsHasResults,
  selectRoomId,
  selectRoom,
  selectRoomStateInitialized,
  selectRoomStateLoading,
  fetchUserRooms,
  fetchMoreUserRooms,
  searchUserRooms,
  deleteRoom,
  clearRoomState,
} from '../../redux/slices/room';
import { useSelector, useDispatch } from '../../redux/store';
import { fToNow } from '../../utils/formatTime';

const DRAWER_WIDTH = 280;

// Create stable selectors outside component to prevent recreation
const selectRoomInitialized = selectRoomStateInitialized('room');
const selectRoomLoading = selectRoomStateLoading('room');

// Room List Item Component (ChatGPT style)
const RoomListItem = memo(({ room, isSelected, onSelect, onMenuOpen, isLoading }) => {
  const theme = useTheme();
  
  const handleClick = useCallback(() => {
    onSelect(room);
  }, [room, onSelect]);

  const handleMenuClick = useCallback((e) => {
    e.stopPropagation();
    onMenuOpen(e, room);
  }, [room, onMenuOpen]);

  return (
    <ListItem 
      disablePadding
      sx={{ 
        mb: 0,
        '&:hover .room-menu-button': {
          opacity: 1,
        }
      }}
    >
      <ListItemButton
        onClick={handleClick}
        selected={isSelected}
        sx={{
          borderRadius: 1,
          mx: 1,
          px: 1.5,
          py: 0.75,
          minHeight: 40,
          '&.Mui-selected': {
            bgcolor: theme.palette.primary.main + '15',
            color: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.main + '20',
            }
          },
          '&:hover': {
            bgcolor: theme.palette.action.hover,
          }
        }}
      >
        <ListItemAvatar sx={{ minWidth: 28, mr: 1 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={room.icon_src}
              sx={{
                width: 24,
                height: 24,
                bgcolor: isSelected ? theme.palette.primary.main : theme.palette.grey[400],
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {room.name?.charAt(0)?.toUpperCase() || 'R'}
            </Avatar>
            {isLoading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  color: theme.palette.primary.main,
                }}
              />
            )}
          </Box>
        </ListItemAvatar>
        
        <ListItemText
          primary={
            <Typography
              variant="body2"
              sx={{
                fontWeight: isSelected ? 600 : 400,
                fontSize: '0.875rem',
                color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                pr: 0.5,
                lineHeight: 1.2,
              }}
            >
              {room.name || 'Untitled Room'}
            </Typography>
          }
          sx={{
            m: 0,
            '& .MuiListItemText-primary': {
              mb: 0,
            }
          }}
        />
        
        <IconButton
          className="room-menu-button"
          onClick={handleMenuClick}
          size="small"
          sx={{
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
            color: theme.palette.text.secondary,
            width: 20,
            height: 20,
            '&:hover': {
              bgcolor: theme.palette.action.hover,
              color: theme.palette.text.primary,
            }
          }}
        >
          <Iconify icon="eva:more-vertical-fill" width={14} height={14} />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
});

RoomListItem.displayName = 'RoomListItem';

const RoomsPage = () => {
  const theme = useTheme();
  const history = useHistory();
  const dispatch = useDispatch();
  const { roomId } = useParams();
  
  const userRooms = useSelector(selectUserRooms);
  const userRoomsPagination = useSelector(selectUserRoomsPagination);
  const userRoomsInitialized = useSelector((state) => state.room.initialized.userRooms);
  const searchResults = useSelector(selectSearchRoomsResults);
  const searchLoading = useSelector(selectSearchRoomsLoading);
  const searchQuery = useSelector(selectSearchRoomsQuery);
  const searchHasResults = useSelector(selectSearchRoomsHasResults);
  // SIMPLIFIED selectors to debug infinite loop
  const currentRoomId = useSelector(selectRoomId);
  // const currentRoom = useSelector(selectRoom);
  // const roomInitialized = useSelector(selectRoomInitialized);
  // const roomLoading = useSelector(selectRoomLoading);
  
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [editRoomOpen, setEditRoomOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuRoom, setMenuRoom] = useState(null);
  const debounceRef = useRef(null);
  const hasAutoNavigated = useRef(false);

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

  // Auto-navigate to latest room if no roomId is provided - DISABLED FOR DEBUGGING
  useEffect(() => {
    // Completely disabled to prevent infinite loops
    console.log('Auto-navigation disabled for debugging');
  }, [roomId, userRooms, userRoomsInitialized, history, dispatch]);

  // Reset auto-navigation flag when roomId changes
  useEffect(() => {
    if (roomId) {
      hasAutoNavigated.current = false;
    }
  }, [roomId]);

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

  const handleRoomClick = useCallback((room) => {
    // Only navigate if it's a different room
    if (currentRoomId !== room.id) {
      // DISABLED clearRoomState to debug infinite loop
      console.log('Navigating to room:', room.id);
      // dispatch(clearRoomState());
      history.push(`/rooms/${room.id}`);
    }
  }, [history, currentRoomId, dispatch]);

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
    // Navigate to the new room
    if (result?.room?.id && result.room.id !== currentRoomId) {
      // DISABLED clearRoomState to debug infinite loop
      console.log('Creating room success:', result.room.id);
      // dispatch(clearRoomState());
      history.push(`/rooms/${result.room.id}`);
    }
  };

  const handleEditRoomSuccess = () => {
    // Refresh the room list
    dispatch(fetchUserRooms());
    handleEditRoomClose();
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    console.log('Search query changed:', query);
    setLocalSearchQuery(query);
    // DISABLED debounced search to debug infinite loop
    // debouncedSearch(query);
  };

  const handleSearchClear = () => {
    setLocalSearchQuery('');
    dispatch(searchUserRooms(''));
  };

  const handleDeleteRoom = async () => {
    if (menuRoom) {
      try {
        await dispatch(deleteRoom(menuRoom.id));
        // If we're deleting the current room, navigate to the latest room
        if (menuRoom.id === roomId) {
          const remainingRooms = userRooms.filter(room => room.id !== menuRoom.id);
          if (remainingRooms.length > 0) {
            // DISABLED clearRoomState to debug infinite loop
            console.log('Deleting room, navigating to:', remainingRooms[0].id);
            // dispatch(clearRoomState());
            history.push(`/rooms/${remainingRooms[0].id}`);
          } else {
            // No rooms left, just go to rooms page
            console.log('No rooms left, going to /rooms');
            // dispatch(clearRoomState());
            history.push('/rooms');
          }
        }
        // Refresh the room list after deletion
        dispatch(fetchUserRooms());
        handleMenuClose();
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  // ChatGPT-style drawer content
  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header - Fixed */}
      <Box sx={{ 
        p: 1.5, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        flexShrink: 0
      }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Iconify icon="eva:plus-fill" width={16} height={16} />}
          onClick={handleCreateRoomOpen}
          sx={{
            mb: 1.5,
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            py: 0.75,
            height: 36,
          }}
        >
          New Room
        </Button>
        
        {/* Search - SIMPLIFIED TO DEBUG */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search rooms..."
          value={localSearchQuery}
          onChange={handleSearchChange}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              fontSize: '0.875rem',
            }
          }}
        />
      </Box>

      {/* Room List - Scrollable */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {isSearching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {displayRooms && displayRooms.length > 0 ? (
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: theme.palette.divider,
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: theme.palette.text.disabled,
                  }
                }
              }}>
                <List sx={{ py: 0.5, px: 0 }}>
                  {displayRooms.map((room) => (
                    <RoomListItem
                      key={room.id}
                      room={room}
                      isSelected={room.id === roomId}
                      isLoading={false}
                      onSelect={handleRoomClick}
                      onMenuOpen={handleMenuOpen}
                    />
                  ))}
                  
                  {/* Load More */}
                  {!searchQuery && userRoomsPagination.hasNextPage && (
                    <ListItem>
                      <Button
                        fullWidth
                        variant="text"
                        onClick={handleLoadMore}
                        disabled={userRoomsPagination.isLoadingMore}
                        startIcon={
                          userRoomsPagination.isLoadingMore ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Iconify icon="eva:arrow-down-fill" width={16} />
                          )
                        }
                        sx={{
                          color: theme.palette.text.secondary,
                          textTransform: 'none',
                        }}
                      >
                        {userRoomsPagination.isLoadingMore ? 'Loading...' : 'Load More'}
                      </Button>
                    </ListItem>
                  )}
                </List>
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                textAlign: 'center', 
                py: 4, 
                px: 2 
              }}>
                <Box>
                  <Iconify 
                    icon="material-symbols:chat-bubble-outline" 
                    width={48} 
                    height={48} 
                    color={theme.palette.text.disabled}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {searchQuery ? 'No rooms found' : 'No rooms yet'}
                  </Typography>
                  {!searchQuery && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Iconify icon="eva:plus-fill" />}
                      onClick={handleCreateRoomOpen}
                    >
                      Create Room
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <CompactLayout 
      title="Rooms - Altan" 
      fullWidth
      noPadding
      hideHeader={false}
      drawerVisible={false}
      overflowHidden={true}
    >
      <Box sx={{ 
        display: 'flex', 
        height: 'calc(100vh - 64px)', // Subtract header height
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Left Drawer - ChatGPT Style */}
        <Box
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {drawerContent}
        </Box>

        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1, 
          height: '100%', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {roomId && roomId.trim() !== '' ? (
            <>
              {/* Show loading state when room is being fetched */}
              {false ? (
                <Box 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: theme.palette.background.default,
                  }}
                >
                  <Stack alignItems="center" spacing={3}>
                    <CircularProgress size={40} />
                    <Typography variant="body1" color="text.secondary">
                      Loading room...
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                /* TEMPORARY PLACEHOLDER - Room component disabled for debugging */
                <Box 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: theme.palette.background.default,
                  }}
                >
                  <Stack alignItems="center" spacing={3}>
                    <Typography variant="h6" color="text.primary">
                      Room ID: {roomId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Room component temporarily disabled for debugging
                    </Typography>
                  </Stack>
                </Box>
              )}
            </>
          ) : (
            <Box 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: theme.palette.background.default,
              }}
            >
              <Stack alignItems="center" spacing={3}>
                <Iconify 
                  icon="material-symbols:chat-bubble-outline" 
                  width={80} 
                  height={80} 
                  color={theme.palette.text.disabled}
                />
                <Typography variant="h6" color="text.secondary">
                  Select a room to start chatting
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleEditRoomOpen(menuRoom)}>
          <ListItemIcon>
            <Iconify icon="eva:edit-fill" width={20} height={20} />
          </ListItemIcon>
          Edit Room
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteRoom} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Iconify icon="eva:trash-2-fill" width={20} height={20} color="error.main" />
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
      {selectedRoom && (
        <CreateRoomDialog
          open={editRoomOpen}
          onClose={handleEditRoomClose}
          onSuccess={handleEditRoomSuccess}
          room={selectedRoom}
          isEdit={true}
        />
      )}
    </CompactLayout>
  );
};

export default memo(RoomsPage);
