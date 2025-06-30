import { Box, Chip } from '@mui/material';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
// @mui
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState, useCallback, useMemo, memo } from 'react';

// _mockf
// components
import NotificationItem from './NotificationItem';
import Iconify from '../../../components/iconify';
//
import useResponsive from '../../../hooks/useResponsive';
import { readNotification } from '../../../redux/slices/notifications';
import { dispatch, useSelector } from '../../../redux/store';
import { bgBlur } from '../../../utils/cssStyles';

// ----------------------------------------------------------------------

const selectNotifications = (state) => state.notifications.notifications;

export const selectTotalUnreadNotifications = (state) =>
  selectNotifications(state).filter((n) => n.status === 'unopened').length;

// const sortNotifications = (a, b) => new Date(b.date_creation) - new Date(a.date_creation);

const NotificationsPopover = ({ drawerBoolean }) => {
  const notifications = useSelector(selectNotifications);
  const totalUnRead = useSelector(selectTotalUnreadNotifications);

  const smUp = useResponsive('up', 'sm');

  const [showArchived, setShowArchived] = useState(false);
  const [filter, setFilter] = useState('All');

  // Sort notifications by date (newest first)
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.notification.date_creation) - new Date(a.notification.date_creation),
    );
  }, [notifications]);

  // Filtered notifications based on showArchived and filter
  const filteredNotifications = useMemo(() => {
    return sortedNotifications.filter((n) => {
      if (!showArchived && n.status === 'archived') return false;
      if (filter !== 'All' && n.notification.type !== filter) return false;
      return true;
    });
  }, [sortedNotifications, showArchived, filter]);

  // Group notifications by date (e.g., Today, Yesterday)
  const groupedNotifications = useMemo(() => {
    const groups = {};
    filteredNotifications.forEach((n) => {
      const date = new Date(n.notification.date_creation);
      const today = new Date();
      let groupKey = 'Earlier';

      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (
        date.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString()
      ) {
        groupKey = 'Yesterday';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(n);
    });
    return groups;
  }, [filteredNotifications]);

  const handleMarkAllAsRead = useCallback(() => {
    const unreadNotifications = notifications.filter((n) => n.status === 'unopened');
    unreadNotifications.forEach((n) => dispatch(readNotification(n.id)));
  }, [notifications]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const renderHeader = (
    <Stack
      padding={2}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 99,
        // ...bgBlur({ opacity: 0.5 })
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
      >
        <Typography
          variant="h6"
          sx={{ flexGrow: 1 }}
        >
          Notifications
        </Typography>
        {totalUnRead > 0 && (
          <Tooltip
            title="Mark all as read"
            arrow
            followCursor
          >
            <IconButton
              color="primary"
              onClick={handleMarkAllAsRead}
            >
              <Iconify icon="eva:done-all-fill" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip
          title={showArchived ? 'Hide Archived' : 'See Archived'}
          arrow
          followCursor
        >
          <IconButton
            size="small"
            onClick={() => setShowArchived((prev) => !prev)}
          >
            <Iconify icon={showArchived ? 'eva:eye-off-fill' : 'eva:archive-fill'} />
          </IconButton>
        </Tooltip>
        {!smUp && (
          <IconButton onClick={drawerBoolean.onFalse}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        )}
      </Stack>
      <Stack
        direction="row"
        spacing={1}
      >
        <Chip
          variant={filter === 'All' ? 'contained' : 'outlined'}
          onClick={() => handleFilterChange('All')}
          label="All"
          size="small"
        />
        <Chip
          variant={filter === 'user' ? 'contained' : 'outlined'}
          onClick={() => handleFilterChange('user')}
          label="User"
          size="small"
        />
        <Chip
          variant={filter === 'system' ? 'contained' : 'outlined'}
          onClick={() => handleFilterChange('system')}
          label="System"
          size="small"
        />
        {/* Add more filters based on notification types as needed */}
        <Box sx={{ flexGrow: 1 }} />
      </Stack>
    </Stack>
  );

  const renderNotifications = Object.keys(groupedNotifications).map((groupKey) => (
    <Box
      key={groupKey}
      sx={{ mt: 2 }}
    >
      <Typography
        variant="subtitle2"
        sx={{ px: 2, pb: 1 }}
      >
        {groupKey}
      </Typography>
      <List disablePadding>
        {groupedNotifications[groupKey].map((notification) => (
          <NotificationItem
            key={notification.id}
            notificationItem={notification}
          />
        ))}
      </List>
    </Box>
  ));

  return (
    <Drawer
      open={drawerBoolean.value}
      onClose={drawerBoolean.onFalse}
      anchor="right"
      PaperProps={{
        sx: {
          width: 1,
          maxWidth: 400,
          backgroundColor: 'transparent',
          padding: 1,
          ...bgBlur({ opacity: 0.5 }),
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'transparent',
            opacity: 0,
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {renderHeader}
        <Divider />
        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
          {renderNotifications.length > 0 ? (
            renderNotifications
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ p: 2 }}
            >
              No notifications.
            </Typography>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default memo(NotificationsPopover);
