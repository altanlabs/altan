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
    // Get all URL parameters
    const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    const eventParams = {
      method,
      ...urlParams, // Captures all query params like ?utm_source=..., ?idea=...
    };

    // Track analytics event
    analytics.signUp(method, eventParams);

    // Track with Tracklution
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('track', 'SignUp', eventParams);
    }

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
    const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    const eventParams = {
      method,
      ...urlParams,
    };

    // Track analytics event
    analytics.signIn(method, eventParams);

    // Track with Tracklution
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('track', 'Login', eventParams);
    }

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
 * Track feature usage event
 * @param {string} featureName - The name of the feature being used
 * @param {object} properties - Additional properties to track with the feature
 */
export const trackFeatureUse = (featureName, properties = {}) => {
  try {
    // Track analytics event
    analytics.featureUsed(featureName, properties);

    // Track with Tracklution
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('track', 'FeatureUsed', {
        feature_name: featureName,
        ...properties,
      });
    }

    // Check if gtag is available for GA4 tracking
    if (typeof window !== 'undefined' && window.gtag) {
      // Send event to GA4
      window.gtag('event', 'feature_used', {
        feature_name: featureName,
        ...properties,
      });
    } else {
      console.warn('❌ gtag not available - GA4 feature tracking skipped');
    }

    const logData = { feature_name: featureName, ...properties };
    logTrackingEvent('feature_used', logData);
  } catch (error) {
    console.error('💥 Error tracking feature usage:', error);
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

/**
 * Track purchase event with Tracklution
 * @param {number} value - The purchase value
 * @param {string} currency - The currency code (e.g., 'USD', 'EUR')
 * @param {object} additionalParams - Additional parameters to track
 */
export const trackPurchase = (value, currency = 'USD', additionalParams = {}) => {
  try {
    // Track with Tracklution
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('track', 'Purchase', {
        value,
        currency,
        ...additionalParams,
      });
      console.log('✅ Tracklution Purchase event tracked:', { value, currency, ...additionalParams });
    } else {
      console.warn('❌ Tracklution (tlq) not available - Purchase tracking skipped');
    }

    // Track with GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        value,
        currency,
        ...additionalParams,
      });
    }

    // Track with Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value,
        currency,
        ...additionalParams,
      });
    }

    logTrackingEvent('purchase', { value, currency, ...additionalParams });
  } catch (error) {
    console.error('💥 Error tracking purchase event:', error);
  }
};

/**
 * Track custom event with Tracklution
 * @param {string} eventName - The name of the custom event
 * @param {object} properties - Additional properties to track with the event
 */
export const trackCustomEvent = (eventName, properties = {}) => {
  try {
    // Track with Tracklution
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('track', eventName, properties);
      console.log(`✅ Tracklution custom event tracked: ${eventName}`, properties);
    } else {
      console.warn('❌ Tracklution (tlq) not available - Custom event tracking skipped');
    }

    // Track with GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, properties);
    }

    logTrackingEvent(eventName, properties);
  } catch (error) {
    console.error(`💥 Error tracking custom event ${eventName}:`, error);
  }
};

/**
 * Set contact information with Tracklution
 * @param {object} contactInfo - Contact information object
 * @param {string} contactInfo.email - Email address
 * @param {string} contactInfo.phoneNumber - Phone number
 * @param {string} contactInfo.firstName - First name
 * @param {string} contactInfo.lastName - Last name
 * @param {string} contactInfo.birthday - Birthday (YYYY-MM-DD format)
 * @param {string} contactInfo.gender - Gender
 * @param {string} contactInfo.address - Street address
 * @param {string} contactInfo.postCode - Postal code
 * @param {string} contactInfo.city - City
 * @param {string} contactInfo.country - Country
 * @param {string} contactInfo.externalId - External ID
 */
export const setContactInfo = (contactInfo) => {
  try {
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('set', 'ContactInfo', contactInfo);
      console.log('✅ Tracklution ContactInfo set:', contactInfo);
    } else {
      console.warn('❌ Tracklution (tlq) not available - ContactInfo tracking skipped');
    }

    logTrackingEvent('contact_info_set', contactInfo);
  } catch (error) {
    console.error('💥 Error setting contact info:', error);
  }
};
