/**
 * Browser Notifications Utility
 * Handles native browser notifications with elegant error handling
 */

const NOTIFICATION_PERMISSION_KEY = 'altan_notification_permission_requested';
const NOTIFICATION_ENABLED_KEY = 'altan_browser_notifications_enabled';

/**
 * Check if browser supports notifications
 */
export function isBrowserNotificationSupported() {
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 * @returns {'granted' | 'denied' | 'default'}
 */
export function getNotificationPermission() {
  if (!isBrowserNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Check if we've already asked for permission
 */
export function hasRequestedPermission() {
  return localStorage.getItem(NOTIFICATION_PERMISSION_KEY) === 'true';
}

/**
 * Mark that we've requested permission
 */
export function setPermissionRequested() {
  localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
}

/**
 * Check if user has enabled browser notifications in settings
 */
export function areBrowserNotificationsEnabled() {
  const enabled = localStorage.getItem(NOTIFICATION_ENABLED_KEY);
  return enabled === null ? false : enabled === 'true'; // Default to false if not set
}

/**
 * Enable/disable browser notifications in settings
 */
export function setBrowserNotificationsEnabled(enabled) {
  localStorage.setItem(NOTIFICATION_ENABLED_KEY, enabled.toString());
}

/**
 * Request notification permission from user
 * @returns {Promise<'granted' | 'denied' | 'default'>}
 */
export async function requestNotificationPermission() {
  if (!isBrowserNotificationSupported()) {
    console.warn('Browser notifications are not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    setPermissionRequested();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Send a browser notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @returns {Notification | null}
 */
export function sendBrowserNotification(title, options = {}) {
  console.log('🔔 sendBrowserNotification called:', { title, options });

  // Check if notifications are supported and enabled
  if (!isBrowserNotificationSupported()) {
    console.warn('❌ Browser notifications not supported');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('❌ Notification permission not granted:', Notification.permission);
    return null;
  }

  if (!areBrowserNotificationsEnabled()) {
    console.warn('❌ Browser notifications disabled in settings');
    return null;
  }

  // Don't send notifications if user is on the page and it's focused
  if (options.onlyWhenInactive && document.visibilityState === 'visible') {
    console.log('⏸️ Skipping notification - page is visible and onlyWhenInactive is true');
    console.log('Document visibility state:', document.visibilityState);
    return null;
  }

  try {
    console.log('✅ Creating notification...');
    const notification = new Notification(title, {
      body: options.body || '',
      icon: options.icon || '/logos/logoBlack.png',
      badge: options.badge || '/favicon-96x96.png',
      tag: options.tag, // Unique tag to replace similar notifications
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      vibrate: options.vibrate || [200, 100, 200],
      ...options,
    });

    console.log('✅ Notification created successfully:', notification);

    // Auto close after duration if specified
    if (options.autoClose) {
      setTimeout(() => {
        notification.close();
      }, options.autoClose);
    }

    // Handle notification click
    if (options.onClick) {
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        options.onClick(event);
        notification.close();
      };
    }

    // Handle notification close
    if (options.onClose) {
      notification.onclose = options.onClose;
    }

    // Handle notification error
    if (options.onError) {
      notification.onerror = options.onError;
    }

    return notification;
  } catch (error) {
    console.error('Error sending browser notification:', error);
    return null;
  }
}

/**
 * Format notification data from Redux notification object
 * @param {Object} notificationItem - Redux notification item
 * @returns {Object} - Formatted notification data
 */
export function formatNotificationForBrowser(notificationItem) {
  const { notification, status } = notificationItem;
  const metaData = notification.meta_data || {};

  // Get title based on notification type
  let title = 'New Notification';
  let body = '';
  let icon = '/logos/logoBlack.png';

  // Extract relevant data
  const category = metaData.data?.category || notification.type;

  switch (category) {
    case 'Mentioned':
      title = '💬 New Mention';
      body = `${metaData.member?.user?.person?.name || 'Someone'} mentioned you in ${metaData.data?.thread?.name || 'a thread'}`;
      icon = metaData.avatar_url || metaData.member?.user?.person?.avatar_url || icon;
      break;

    case 'Assigned':
      title = '📋 New Assignment';
      body = `You were assigned to ${metaData.data?.task?.name || 'a task'}`;
      icon = metaData.avatar_url || icon;
      break;

    case 'Comment':
      title = '💬 New Comment';
      body = `${metaData.member?.user?.person?.name || 'Someone'} commented on your post`;
      icon = metaData.member?.user?.person?.avatar_url || icon;
      break;

    case 'Invitation':
      title = '🎉 New Invitation';
      body = `You've been invited to ${metaData.data?.room?.name || 'a workspace'}`;
      icon = metaData.avatar_url || icon;
      break;

    case 'task_completed':
      title = '✅ Task Completed';
      body = notification.body || `"${metaData.data?.task?.name || 'A task'}" has been completed!`;
      icon = metaData.avatar_url || icon;
      break;

    case 'system':
      title = '🔔 System Notification';
      body = notification.body || notification.message || 'You have a new system notification';
      break;

    default:
      title = notification.title || '🔔 New Notification';
      body = notification.body || notification.message || 'You have a new notification';
      if (metaData.avatar_url) {
        icon = metaData.avatar_url;
      }
      break;
  }

  return {
    title,
    body,
    icon,
    tag: `notification-${notificationItem.id}`,
    data: {
      notificationId: notificationItem.id,
      category,
      metaData,
    },
  };
}

/**
 * Send notification for Redux notification item
 * @param {Object} notificationItem - Redux notification item
 * @param {Function} onClickHandler - Optional click handler
 * @returns {Notification | null}
 */
export function sendNotificationForItem(notificationItem, onClickHandler) {
  const { title, body, icon, tag, data } = formatNotificationForBrowser(notificationItem);

  return sendBrowserNotification(title, {
    body,
    icon,
    tag,
    data,
    onlyWhenInactive: true, // Only show when user is not actively using the app
    autoClose: 8000, // Auto close after 8 seconds
    onClick: onClickHandler,
  });
}

/**
 * Clear all notifications with a specific tag
 * @param {string} tag - Notification tag
 */
export function clearNotificationsByTag(tag) {
  // Note: There's no API to programmatically clear notifications
  // They auto-clear based on OS settings or our autoClose timer
  console.log(`Clearing notifications with tag: ${tag}`);
}

export default {
  isBrowserNotificationSupported,
  getNotificationPermission,
  hasRequestedPermission,
  requestNotificationPermission,
  sendBrowserNotification,
  formatNotificationForBrowser,
  sendNotificationForItem,
  areBrowserNotificationsEnabled,
  setBrowserNotificationsEnabled,
};
