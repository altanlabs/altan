// Analytics utility functions for tracking user events
import { analytics } from '../lib/analytics';

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

    // No longer need registration tracking since we don't use alias

    // Get all URL parameters
    const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    const eventParams = {
      method,
      ...urlParams, // Captures all query params like ?utm_source=..., ?idea=...
    };

    // Track analytics event
    analytics.signUp(method, eventParams);

    // Check if gtag is available (keep existing GA4 tracking)
    if (typeof window !== 'undefined' && window.gtag) {
      // Send event to GA4
      window.gtag('event', 'sign_up', eventParams);
    } else {
      console.warn('❌ gtag not available - GA4 sign-up tracking skipped');
    }

    const logData = { method, ...urlParams };
    console.log('✅ Sign-up event tracked successfully:', logData);
    logTrackingEvent('sign_up', logData);
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

    const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    const eventParams = {
      method,
      ...urlParams,
    };

    // Track analytics event
    analytics.signIn(method, eventParams);

    // Check if gtag is available (keep existing GA4 tracking)
    if (typeof window !== 'undefined' && window.gtag) {
      // Send event to GA4
      window.gtag('event', 'login', eventParams);
    } else {
      console.warn('❌ gtag not available - GA4 login tracking skipped');
    }

    const logData = { method, ...urlParams };
    console.log('✅ Login event tracked successfully:', logData);
    logTrackingEvent('login', logData);
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
