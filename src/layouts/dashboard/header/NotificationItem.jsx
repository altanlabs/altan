import { IconButton, Menu, MenuItem, Paper } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// import ListItemButton from '@mui/material/ListItemButton';
// import Label from '@components/label';
// import FileThumbnail from '@components/file-thumbnail';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useHistory } from 'react-router-dom';

import { archiveNotification, readNotification } from '@redux/slices/notifications';

import { CustomAvatar } from '../../../components/custom-avatar';
import Iconify from '../../../components/iconify';
// import { acceptRoomInvitation } from '../../../redux/slices/notifications';
import { dispatch } from '../../../redux/store';
import { fToNow } from '../../../utils/formatTime';

// ----------------------------------------------------------------------

const NotificationItem = ({ notificationItem }) => {
  const history = useHistory();
  const { notification, status } = notificationItem;

  const [anchorEl, setAnchorEl] = useState(null);
  const isContextMenuOpen = Boolean(anchorEl);

  // Handle context menu open
  const handleContextMenuOpen = (event) => {
    event.preventDefault(); // Prevent default context menu
    setAnchorEl(event.currentTarget);
  };

  // Handle context menu close
  const handleContextMenuClose = () => {
    setAnchorEl(null);
  };

  // Archive notification
  const handleArchive = () => {
    dispatch(archiveNotification(notificationItem.id));
    handleContextMenuClose();
  };

  // Mark notification as read
  const handleMarkAsRead = () => {
    dispatch(readNotification(notificationItem.id));
    handleContextMenuClose();
  };

  // Mark notification as unread
  const handleMarkAsUnread = () => {
    // dispatch(markAsUnread(notificationItem.id));
    handleContextMenuClose();
  };

  // Handle notification click
  const handleNotificationClick = () => {
    if (status === 'unopened') {
      // dispatch(markAsRead(notificationItem.id));
    }

    const category = notification.meta_data.data?.category;

    switch (category) {
      case 'Mentioned':
        history.push(
          `/room/${notification.meta_data.data.thread.room_id}?thread=${notification.meta_data.data.thread.id}`,
        );
        break;
      // Handle other categories as needed
      default:
        break;
    }
  };

  // Get avatar URL
  const getAvatarUrl = () => {
    return (
      notification.meta_data.avatar_url ||
      notification.meta_data.member?.agent?.avatar_url ||
      notification.meta_data.member?.user?.person?.avatar_url ||
      null
    );
  };

  // Get icon URL based on category or type
  const getIconUrl = () => {
    const category = notification.meta_data.data?.category || notification.type;
    let iconName = '';

    switch (category) {
      case 'Knowledge Base':
        iconName = 'ic_file';
        break;
      case 'Apps':
        iconName = 'ic_app';
        break;
      case 'invitation':
      case 'Invitation':
        iconName = 'ic_user';
        break;
      case 'delivery':
        iconName = 'ic_delivery';
        break;
      default:
        iconName = 'ic_notification';
        break;
    }

    return `/assets/icons/notification/${iconName}.svg`;
  };

  const avatarUrl = getAvatarUrl();
  const iconUrl = getIconUrl();

  // Render avatar or icon
  const renderAvatar = (
    <ListItemAvatar>
      <CustomAvatar
        name="n"
        src={avatarUrl}
        sx={{ width: 40, height: 40 }}
      />
    </ListItemAvatar>
  );

  // Render notification text
  const renderText = (
    <ListItemText
      disableTypography
      primary={
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => (
              <Typography
                noWrap
                variant="subtitle1"
                component="div"
                sx={{
                  color: 'text.primary',
                  fontWeight: status === 'unopened' ? 600 : 400,
                  cursor: 'pointer',
                  width: 250,
                }}
                onClick={handleNotificationClick}
                {...props}
              />
            ),
          }}
        >
          {(notification.meta_data.title || 'New Notification').replace(/\n/g, ' ')}
        </ReactMarkdown>
      }
      secondary={
        <>
          {notification.meta_data.message && (
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ cursor: 'pointer' }}
                    onClick={handleNotificationClick}
                    {...props}
                  />
                ),
              }}
            >
              {notification.meta_data.message}
            </ReactMarkdown>
          )}
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: 'block' }}
          >
            {fToNow(notification.date_creation)}
          </Typography>
        </>
      }
    />
  );

  // Render action buttons
  const renderActions = () => {
    const actions = notification.meta_data.actions;
    if (!actions || actions.length === 0) {
      return null;
    }

    return (
      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 1 }}
      >
        {actions.map((action, index) => {
          const handleActionClick = () => {
            if (action.url) {
              window.open(action.url, '_blank');
            }
            if (action.type === 'dismiss') {
              handleArchive();
            }
            // Handle other action types if needed
          };

          let variant = 'text';
          if (action.type === 'button') variant = 'contained';
          if (action.type === 'link') variant = 'outlined';

          return (
            <Button
              key={index}
              size="small"
              variant={variant}
              onClick={handleActionClick}
            >
              {action.label}
            </Button>
          );
        })}
      </Stack>
    );
  };

  // Render context menu
  const renderContextMenu = (
    <Menu
      anchorEl={anchorEl}
      open={isContextMenuOpen}
      onClose={handleContextMenuClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      {status === 'unopened' ? (
        <MenuItem onClick={handleMarkAsRead}>Mark as Read</MenuItem>
      ) : (
        <MenuItem onClick={handleMarkAsUnread}>Mark as Unread</MenuItem>
      )}
      <MenuItem onClick={handleArchive}>Archive</MenuItem>
    </Menu>
  );

  return (
    <Paper
      elevation={status === 'unopened' ? 3 : 1}
      sx={{
        mb: 1,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        '&:hover .more-options-button': {
          opacity: 1,
        },
      }}
      onContextMenu={handleContextMenuOpen}
    >
      {renderContextMenu}
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        {renderAvatar}

        <Box sx={{ flexGrow: 1 }}>
          {renderText}
          {renderActions()}
        </Box>

        <IconButton
          size="small"
          className="more-options-button"
          onClick={handleContextMenuOpen}
          sx={{
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
        >
          <Iconify icon="nrk:more" />
        </IconButton>
      </Box>
    </Paper>
  );
};

NotificationItem.propTypes = {
  notificationItem: PropTypes.object,
};

export default memo(NotificationItem);

// ----------------------------------------------------------------------

// function reader(data) {
//   return (
//     <Box
//       dangerouslySetInnerHTML={{ __html: data }}
//       sx={{
//         mb: 0.5,
//         '& p': { typography: 'body', m: 0 },
//         '& a': { color: 'inherit', textDecoration: 'none' },
//         '& strong': { typography: 'subtitle2' },
//       }}
//     />
//   );
// }
