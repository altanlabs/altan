import {
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  useTheme,
} from '@mui/material';
import { memo, useEffect, useState, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import Iconify from '../../components/iconify';
import Room from '../../components/room/Room';
import { CompactLayout } from '../../layouts/dashboard';
import CreateRoomDialog from '../../layouts/dashboard/header/CreateRoomDialog';
import { VoiceConversationProvider } from '../../providers/voice/VoiceConversationProvider';
import {
  selectUserRooms,
  selectUserRoomsPagination,
  fetchUserRooms,
  fetchMoreUserRooms,
  deleteRoom,
  setUserRooms,
  clearRoomState,
} from '../../redux/slices/room';
import { useSelector, useDispatch } from '../../redux/store';

const DRAWER_WIDTH = 260;

// Room List Item Component (ChatGPT style)
const RoomListItem = memo(({ room, isSelected, onSelect, onMenuOpen }) => {
  const theme = useTheme();

  const handleClick = useCallback(() => {
    onSelect(room);
  }, [room, onSelect]);

  const handleMenuClick = useCallback(
    (e) => {
      e.stopPropagation();
      onMenuOpen(e, room);
    },
    [room, onMenuOpen],
  );

  return (
    <ListItem
      disablePadding
      sx={{
        mb: 0.25,
        '&:hover .room-menu-button': {
          opacity: 1,
        },
      }}
    >
      <ListItemButton
        onClick={handleClick}
        selected={isSelected}
        sx={{
          borderRadius: 1.5,
          mx: 1,
          px: 1.25,
          py: 1,
          minHeight: 44,
          gap: 1.25,
          transition: 'all 0.15s ease',
          '&.Mui-selected': {
            bgcolor:
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
            '&:hover': {
              bgcolor:
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.06)',
            },
          },
          '&:hover': {
            bgcolor:
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)',
          },
        }}
      >
        <ListItemAvatar sx={{ minWidth: 'auto', mr: 0 }}>
          <Avatar
            src={room.icon_src}
            sx={{
              width: 28,
              height: 28,
              bgcolor:
                theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300],
              color: theme.palette.text.primary,
              fontSize: '0.813rem',
              fontWeight: 500,
              border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
            }}
          >
            {room.name?.charAt(0)?.toUpperCase() || 'R'}
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Typography
              variant="body2"
              sx={{
                fontWeight: isSelected ? 500 : 400,
                fontSize: '0.875rem',
                color: theme.palette.text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.43,
              }}
            >
              {room.name || 'Untitled Room'}
            </Typography>
          }
          sx={{
            m: 0,
            flex: 1,
            '& .MuiListItemText-primary': {
              mb: 0,
            },
          }}
        />

        <IconButton
          className="room-menu-button"
          onClick={handleMenuClick}
          size="small"
          sx={{
            opacity: 0,
            transition: 'opacity 0.15s ease',
            color: theme.palette.text.secondary,
            width: 24,
            height: 24,
            flexShrink: 0,
            '&:hover': {
              bgcolor:
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              color: theme.palette.text.primary,
            },
          }}
        >
          <Iconify
            icon="eva:more-vertical-fill"
            width={16}
            height={16}
          />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
});

RoomListItem.displayName = 'RoomListItem';

const RoomsPageSimple = () => {
  const theme = useTheme();
  const history = useHistory();
  const dispatch = useDispatch();
  const { roomId } = useParams();
  const userRooms = useSelector(selectUserRooms);
  const userRoomsPagination = useSelector(selectUserRoomsPagination);
  const userRoomsInitialized = useSelector((state) => state.room.initialized.userRooms);

  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuRoom, setMenuRoom] = useState(null);

  useEffect(() => {
    if (!userRoomsInitialized) {
      dispatch(fetchUserRooms());
    }
  }, [userRoomsInitialized, dispatch]);

  // Auto-navigate to first room if no roomId provided and rooms are available
  useEffect(() => {
    // Only auto-navigate if we're on /rooms (no roomId) and we have rooms
    if (!roomId && userRoomsInitialized && userRooms && userRooms.length > 0) {
      const firstRoom = userRooms[0];
      history.replace(`/rooms/${firstRoom.id}`);
    }
  }, [roomId, userRoomsInitialized, userRooms, history]);

  const handleRoomClick = useCallback(
    (room) => {
      dispatch(clearRoomState());
      history.push(`/rooms/${room.id}`);
    },
    [history, dispatch],
  );

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

  const handleCreateRoomSuccess = (result) => {
    if (result?.room?.id) {
      history.push(`/rooms/${result.room.id}`);
    }
  };

  const handleDeleteRoom = async () => {
    if (menuRoom) {
      try {
        await dispatch(deleteRoom(menuRoom.id));

        // Update the local rooms list efficiently instead of refetching
        const remainingRooms = userRooms.filter((room) => room.id !== menuRoom.id);
        dispatch(
          setUserRooms({
            rooms: remainingRooms,
            hasNextPage: userRoomsPagination.hasNextPage,
            nextCursor: userRoomsPagination.nextCursor,
            isLoadMore: false,
          }),
        );

        // If we're deleting the current room, navigate to another room
        if (menuRoom.id === roomId) {
          if (remainingRooms.length > 0) {
            history.push(`/rooms/${remainingRooms[0].id}`);
          } else {
            history.push('/rooms');
          }
        }

        handleMenuClose();
      } catch {
        // Error handled silently
      }
    }
  };

  // ChatGPT-style drawer content
  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header - Fixed */}
      <Box
        sx={{
          p: 2,
          flexShrink: 0,
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          startIcon={
            <Iconify
              icon="eva:plus-fill"
              width={18}
              height={18}
            />
          }
          onClick={handleCreateRoomOpen}
          sx={{
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            py: 1,
            height: 40,
            border: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary,
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor:
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)',
              border: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          New Room
        </Button>
      </Box>

      {/* Room List - Scrollable */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {userRooms && userRooms.length > 0 ? (
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                borderRadius: '2px',
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.3)'
                      : 'rgba(0, 0, 0, 0.3)',
                },
              },
            }}
          >
            <List sx={{ py: 1, px: 0 }}>
              {userRooms.map((room) => {
                const isSelected = room.id === roomId;
                return (
                  <RoomListItem
                    key={room.id}
                    room={room}
                    isSelected={isSelected}
                    onSelect={handleRoomClick}
                    onMenuOpen={handleMenuOpen}
                  />
                );
              })}

              {/* Load More */}
              {userRoomsPagination.hasNextPage && (
                <ListItem sx={{ px: 2, py: 0.5 }}>
                  <Button
                    fullWidth
                    variant="text"
                    onClick={handleLoadMore}
                    disabled={userRoomsPagination.isLoadingMore}
                    startIcon={
                      userRoomsPagination.isLoadingMore ? (
                        <CircularProgress size={14} />
                      ) : (
                        <Iconify
                          icon="eva:arrow-down-fill"
                          width={14}
                        />
                      )
                    }
                    sx={{
                      color: theme.palette.text.secondary,
                      textTransform: 'none',
                      fontSize: '0.813rem',
                      py: 0.75,
                      '&:hover': {
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.03)',
                      },
                    }}
                  >
                    {userRoomsPagination.isLoadingMore ? 'Loading...' : 'Load More'}
                  </Button>
                </ListItem>
              )}
            </List>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              textAlign: 'center',
              py: 4,
              px: 3,
            }}
          >
            <Box>
              <Iconify
                icon="material-symbols:chat-bubble-outline"
                width={48}
                height={48}
                color={theme.palette.text.disabled}
                sx={{ mb: 2, opacity: 0.5 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, fontSize: '0.875rem' }}
              >
                No rooms yet
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={
                  <Iconify
                    icon="eva:plus-fill"
                    width={16}
                  />
                }
                onClick={handleCreateRoomOpen}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.813rem',
                }}
              >
                Create Room
              </Button>
            </Box>
          </Box>
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
      <VoiceConversationProvider>
        <Box
          sx={{
            display: 'flex',
            height: 'calc(100vh - 64px)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Left Drawer - ChatGPT Style */}
          <Box
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              borderRight: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fafafa',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {drawerContent}
          </Box>

          {/* Main Content Area */}
          <Box
            sx={{
              flex: 1,
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {roomId && roomId !== 'undefined' && roomId.trim() !== '' ? (
              <Room
                key={roomId}
                roomId={roomId}
                header={true}
                tabs={true}
                conversation_history={true}
                members={true}
                settings={true}
              />
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
                <Stack
                  alignItems="center"
                  spacing={3}
                >
                  <Iconify
                    icon="material-symbols:chat-bubble-outline"
                    width={80}
                    height={80}
                    color={theme.palette.text.disabled}
                  />
                  <Typography
                    variant="h6"
                    color="text.secondary"
                  >
                    Select a room to start chatting
                  </Typography>
                  {roomId && (
                    <Typography
                      variant="body2"
                      color="error.main"
                    >
                      Invalid room ID: {roomId}
                    </Typography>
                  )}
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
          PaperProps={{
            sx: {
              mt: 0.5,
              minWidth: 180,
            },
          }}
        >
          <MenuItem
            onClick={handleDeleteRoom}
            sx={{
              color: 'error.main',
              py: 1,
              px: 1.5,
            }}
          >
            <ListItemIcon>
              <Iconify
                icon="eva:trash-2-fill"
                width={20}
                height={20}
                color="error.main"
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
      </VoiceConversationProvider>
    </CompactLayout>
  );
};

export default memo(RoomsPageSimple);
