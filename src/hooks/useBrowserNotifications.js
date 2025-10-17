import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  isBrowserNotificationSupported,
  getNotificationPermission,
  sendNotificationForItem,
  areBrowserNotificationsEnabled,
} from '../utils/browserNotifications';

/**
 * Hook to handle browser notifications based on Redux notification state
 */
export default function useBrowserNotifications() {
  const history = useHistory();
  const notifications = useSelector((state) => state.notifications.notifications);
  const prevNotificationsRef = useRef([]);

  useEffect(() => {
    // Skip if browser notifications aren't supported or not enabled
    if (!isBrowserNotificationSupported() || !areBrowserNotificationsEnabled()) {
      return;
    }

    // Skip if permission not granted
    if (getNotificationPermission() !== 'granted') {
      return;
    }

    // Get previous notification IDs
    const prevIds = new Set(prevNotificationsRef.current.map((n) => n.id));
    
    // Find new notifications (unopened ones that weren't in previous state)
    const newNotifications = notifications.filter(
      (notification) =>
        notification.status === 'unopened' && !prevIds.has(notification.id)
    );

    // Send browser notifications for each new notification
    newNotifications.forEach((notificationItem) => {
      const category = notificationItem.notification.meta_data?.data?.category;
      
      // Create click handler based on notification type
      const handleNotificationClick = () => {
        switch (category) {
          case 'Mentioned':
            if (notificationItem.notification.meta_data?.data?.thread) {
              const { room_id, id } = notificationItem.notification.meta_data.data.thread;
              history.push(`/room/${room_id}?thread=${id}`);
            }
            break;
          
          case 'Assigned':
            if (notificationItem.notification.meta_data?.data?.task) {
              const { project_id, id } = notificationItem.notification.meta_data.data.task;
              history.push(`/project/${project_id}/tasks/${id}`);
            }
            break;
          
          case 'Invitation':
            history.push('/dashboard/workspaces');
            break;
          
          case 'task_completed':
            if (notificationItem.notification.meta_data?.data?.task) {
              const { room_id, mainthread_id } = notificationItem.notification.meta_data.data.task;
              if (room_id) {
                history.push(`/room/${room_id}`);
              } else if (mainthread_id) {
                history.push(`/room/${mainthread_id}`);
              } else {
                window.focus();
              }
            } else {
              window.focus();
            }
            break;
          
          default:
            // Focus the window by default
            window.focus();
            break;
        }
      };

      // Send the browser notification
      sendNotificationForItem(notificationItem, handleNotificationClick);
    });

    // Update the previous notifications ref
    prevNotificationsRef.current = notifications;
  }, [notifications, history]);

  // Request permission on first mount if not already granted
  useEffect(() => {
    if (isBrowserNotificationSupported() && areBrowserNotificationsEnabled()) {
      const permission = getNotificationPermission();
      if (permission === 'default') {
        // Don't auto-request, let the banner handle it
        console.log('Browser notifications permission not yet requested');
      }
    }
  }, []);

  return {
    isSupported: isBrowserNotificationSupported(),
    permission: getNotificationPermission(),
    isEnabled: areBrowserNotificationsEnabled(),
  };
}

