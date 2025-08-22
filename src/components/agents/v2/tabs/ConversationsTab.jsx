import {
  Box,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  Skeleton,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

import PropTypes from 'prop-types';

import Iconify from '../../../iconify';
import { fetchAgentRooms } from '../../../../redux/slices/agents';

function ConversationsTab({ agentData }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { rooms } = useSelector((state) => state.agents);

  useEffect(() => {
    if (agentData?.id) {
      dispatch(fetchAgentRooms(agentData.id));
    }
  }, [dispatch, agentData?.id]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!rooms.items || rooms.items.length === 0) {
      return {
        totalRooms: 0,
        activeToday: 0,
        activeThisWeek: 0,
        recentActivity: null,
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeToday = rooms.items.filter((room) => {
      if (!room.last_interaction) return false;
      const lastInteraction = new Date(room.last_interaction);
      return lastInteraction >= today;
    }).length;

    const activeThisWeek = rooms.items.filter((room) => {
      if (!room.last_interaction) return false;
      const lastInteraction = new Date(room.last_interaction);
      return lastInteraction >= weekAgo;
    }).length;

    // Find most recent activity
    const roomsWithActivity = rooms.items
      .filter((room) => room.last_interaction)
      .sort((a, b) => new Date(b.last_interaction) - new Date(a.last_interaction));

    return {
      totalRooms: rooms.items.length,
      activeToday,
      activeThisWeek,
      recentActivity: roomsWithActivity[0]?.last_interaction || null,
    };
  }, [rooms.items]);

  const handleRoomClick = (roomId) => {
    // Open room in a new tab
    window.open(`/room/${roomId}`, '_blank');
  };

  const formatLastInteraction = (lastInteraction) => {
    if (!lastInteraction) return 'No activity';

    const date = new Date(lastInteraction);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`;
    }
    
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'HH:mm')}`;
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getActivityColor = (lastInteraction) => {
    if (!lastInteraction) return 'default';
    
    const date = new Date(lastInteraction);
    const now = new Date();
    const hoursDiff = (now - date) / (1000 * 60 * 60);
    
    if (hoursDiff < 1) return 'success';
    if (hoursDiff < 24) return 'warning';
    if (hoursDiff < 168) return 'info'; // 7 days
    return 'default';
  };

  if (rooms.loading) {
    return (
      <Box sx={{ display: 'flex', height: '100%' }}>
        <Box sx={{ overflow: 'auto', width: '100%' }}>
          <Box sx={{ p: 2, pb: { xs: 10, md: 2 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Stats skeleton */}
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" height={32} />
                  </Box>
                </Grid>
              ))}
            </Grid>
            
            {/* List skeleton */}
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
              }}
            >
              <Skeleton variant="text" width="30%" sx={{ mb: 2 }} />
              {[1, 2, 3, 4, 5].map((i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="50%" />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  if (rooms.error) {
    return (
      <Box sx={{ display: 'flex', height: '100%' }}>
        <Box sx={{ overflow: 'auto', width: '100%' }}>
          <Box sx={{ p: 2, pb: { xs: 10, md: 2 } }}>
            <Alert severity="error">
              Failed to load conversations: {rooms.error}
            </Alert>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Left Panel: Configuration */}
      <Box sx={{ overflow: 'auto', width: '100%' }}>
        <Box sx={{ p: 2, pb: { xs: 10, md: 2 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Overview Card */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Overview
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 3 }}
            >
              Monitor your agent's conversation activity and engagement metrics.
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {stats.totalRooms}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Conversations
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <Iconify icon="eva:message-circle-fill" width={24} />
              </Avatar>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {stats.activeToday}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Today
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                <Iconify icon="eva:activity-fill" width={24} />
              </Avatar>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {stats.activeThisWeek}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active This Week
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                <Iconify icon="eva:calendar-fill" width={24} />
              </Avatar>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {stats.recentActivity ? formatLastInteraction(stats.recentActivity) : 'No recent activity'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Activity
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                <Iconify icon="eva:clock-fill" width={24} />
              </Avatar>
            </Box>
          </Box>
          </Grid>
            </Grid>
          </Box>

          {/* Conversations List */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Conversations
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2 }}
            >
              All conversations where this agent is active. Click on any conversation to open it in a new tab.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {stats.totalRooms} conversation{stats.totalRooms !== 1 ? 's' : ''}
              </Typography>
              <Tooltip title="Refresh">
                <IconButton 
                  onClick={() => dispatch(fetchAgentRooms(agentData.id))}
                  size="small"
                >
                  <Iconify icon="eva:refresh-fill" />
                </IconButton>
              </Tooltip>
            </Box>

          <Divider sx={{ mb: 2 }} />

          {rooms.items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'grey.100', width: 64, height: 64 }}>
                <Iconify icon="eva:message-circle-outline" width={32} color="text.disabled" />
              </Avatar>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No conversations yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This agent hasn't started any conversations yet.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {[...rooms.items]
                .sort((a, b) => {
                  // Sort by last interaction, with null values at the end
                  if (!a.last_interaction && !b.last_interaction) return 0;
                  if (!a.last_interaction) return 1;
                  if (!b.last_interaction) return -1;
                  return new Date(b.last_interaction) - new Date(a.last_interaction);
                })
                .map((room, index) => (
                  <ListItem key={room.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleRoomClick(room.id)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }}>
                          <Iconify icon="eva:message-circle-fill" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                              {room.name || `Room ${room.id.slice(-8)}`}
                            </Typography>
                            <Chip
                              size="small"
                              label={formatLastInteraction(room.last_interaction)}
                              color={getActivityColor(room.last_interaction)}
                              variant="outlined"
                              sx={{ ml: 'auto' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            Created {room.date_creation ? formatDistanceToNow(new Date(room.date_creation), { addSuffix: true }) : 'Unknown'}
                          </Typography>
                        }
                      />
                      <Iconify icon="eva:external-link-outline" sx={{ color: 'text.disabled' }} />
                    </ListItemButton>
                  </ListItem>
                ))}
            </List>
          )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

ConversationsTab.propTypes = {
  agentData: PropTypes.object,
};

export default ConversationsTab;
