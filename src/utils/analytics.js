// Analytics utility functions for tracking user events

/**
 * Log tracking events to localStorage for debugging
 */
const logTrackingEvent = (eventType, data) => {
  try {
    const logs = JSON.parse(localStorage.getItem('tracking_logs') || '[]');
    logs.push({
      timestamp: new Date().toISOString(),
      eventType,
      data,
    });
    // Keep only last 10 events
    if (logs.length > 10) {
      logs.shift();
    }
    localStorage.setItem('tracking_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('Error logging tracking event:', error);
  }
};

/**
 * Track sign-up event with URL parameters
 * This captures UTM parameters, invitation IDs, idea IDs, and other query params
 * @param {string} method - The method used for sign-up (e.g., 'google', 'email', 'default')
 */
export const trackSignUp = (method = 'default') => {
  try {
    console.log('🔄 Tracking sign-up event before backend call...', { method });

    // Check if gtag is available
    if (typeof window !== 'undefined' && window.gtag) {
      // Get all URL parameters
      const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());

      const eventParams = {
        method,
        ...urlParams, // Captures all query params like ?utm_source=..., ?idea=...
      };

      // Send event to GA4
      window.gtag('event', 'sign_up', eventParams);

      const logData = { method, ...urlParams };
      console.log('✅ Sign-up event tracked successfully:', logData);
      logTrackingEvent('sign_up', logData);
    } else {
      console.warn('❌ gtag not available - sign-up tracking skipped', {
        windowExists: typeof window !== 'undefined',
        gtagExists: typeof window?.gtag,
        dataLayerExists: typeof window?.dataLayer,
      });
    }
  } catch (error) {
    console.error('💥 Error tracking sign-up event:', error);
  }
};

/**
 * Track login event with URL parameters
 * @param {string} method - The method used for login (e.g., 'google', 'email', 'default')
 */
export const trackLogin = (method = 'default') => {
  try {
    console.log('🔄 Tracking login event before backend call...', { method });

    if (typeof window !== 'undefined' && window.gtag) {
      const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());

      const eventParams = {
        method,
        ...urlParams,
      };

      // Send event to GA4
      window.gtag('event', 'login', eventParams);

      const logData = { method, ...urlParams };
      console.log('✅ Login event tracked successfully:', logData);
      logTrackingEvent('login', logData);
    } else {
      console.warn('❌ gtag not available - login tracking skipped', {
        windowExists: typeof window !== 'undefined',
        gtagExists: typeof window?.gtag,
        dataLayerExists: typeof window?.dataLayer,
      });
    }
  } catch (error) {
    console.error('💥 Error tracking login event:', error);
  }
};

/**
 * Get tracking logs from localStorage (for debugging)
 */
export const getTrackingLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('tracking_logs') || '[]');
  } catch (error) {
    console.error('Error getting tracking logs:', error);
    return [];
  }
};

/**
 * Clear tracking logs
 */
export const clearTrackingLogs = () => {
  try {
    localStorage.removeItem('tracking_logs');
    console.log('Tracking logs cleared');
  } catch (error) {
    console.error('Error clearing tracking logs:', error);
  }
};
