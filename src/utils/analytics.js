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
 *
 * IMPORTANT: Signup events are ALWAYS sent to Google Analytics regardless of cookie consent
 * because they are critical business metrics. We temporarily grant analytics consent for this event.
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

    // Track with Tracklution (using CompleteRegistration to match Tracklution events)
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('track', 'CompleteRegistration', eventParams);
    }

    // ALWAYS send signup to GA4 regardless of cookie consent (critical business metric)
    if (typeof window !== 'undefined' && window.gtag) {
      // Grant analytics consent for signup events (required for critical business metrics)
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });

      // Use setTimeout to ensure consent update is processed before sending event
      // This is required for GA4 Consent Mode v2 to properly register the event
      setTimeout(() => {
        if (window.gtag) {
          window.gtag('event', 'sign_up', eventParams);
          console.log('✅ GA4 sign-up event sent with consent granted:', eventParams);
        }
      }, 50); // 50ms delay ensures consent is registered
    } else {
      console.warn('❌ gtag not available - GA4 sign-up tracking skipped');
    }

    // Track with Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'CompleteRegistration', eventParams);
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
      console.log('✅ Tracklution Purchase event tracked:', {
        value,
        currency,
        ...additionalParams,
      });
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

/**
 * Track ViewContent event
 * @param {object} properties - Content properties (e.g., content_type, content_id, content_name)
 */
export const trackViewContent = (properties = {}) => {
  try {
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('track', 'ViewContent', properties);
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', properties);
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', properties);
    }

    console.log('✅ ViewContent event tracked:', properties);
    logTrackingEvent('view_content', properties);
  } catch (error) {
    console.error('💥 Error tracking ViewContent event:', error);
  }
};

/**
 * Track Lead event
 * @param {object} properties - Lead properties
 */
export const trackLead = (properties = {}) => {
  try {
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('track', 'Lead', properties);
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'generate_lead', properties);
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', properties);
    }

    console.log('✅ Lead event tracked:', properties);
    logTrackingEvent('lead', properties);
  } catch (error) {
    console.error('💥 Error tracking Lead event:', error);
  }
};

/**
 * Track AddToCart event
 * @param {object} properties - Cart properties (e.g., value, currency, items)
 */
export const trackAddToCart = (properties = {}) => {
  try {
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('track', 'AddToCart', properties);
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', properties);
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', properties);
    }

    console.log('✅ AddToCart event tracked:', properties);
    logTrackingEvent('add_to_cart', properties);
  } catch (error) {
    console.error('💥 Error tracking AddToCart event:', error);
  }
};

/**
 * Track InitiateCheckout event
 * @param {object} properties - Checkout properties (e.g., value, currency, items)
 */
export const trackInitiateCheckout = (properties = {}) => {
  try {
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('track', 'InitiateCheckout', properties);
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', properties);
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', properties);
    }

    console.log('✅ InitiateCheckout event tracked:', properties);
    logTrackingEvent('initiate_checkout', properties);
  } catch (error) {
    console.error('💥 Error tracking InitiateCheckout event:', error);
  }
};

/**
 * Track StartTrial event
 * @param {object} properties - Trial properties (e.g., plan_name, value, currency)
 */
export const trackStartTrial = (properties = {}) => {
  try {
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('track', 'StartTrial', properties);
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'start_trial', properties);
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'StartTrial', properties);
    }

    console.log('✅ StartTrial event tracked:', properties);
    logTrackingEvent('start_trial', properties);
  } catch (error) {
    console.error('💥 Error tracking StartTrial event:', error);
  }
};

/**
 * Track AddPaymentInfo event
 * @param {object} properties - Payment info properties
 */
export const trackAddPaymentInfo = (properties = {}) => {
  try {
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('track', 'AddPaymentInfo', properties);
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_payment_info', properties);
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddPaymentInfo', properties);
    }

    console.log('✅ AddPaymentInfo event tracked:', properties);
    logTrackingEvent('add_payment_info', properties);
  } catch (error) {
    console.error('💥 Error tracking AddPaymentInfo event:', error);
  }
};

/**
 * Track CompleteRegistration event (alias for trackSignUp for consistency with Tracklution)
 * @param {string} method - The method used for registration
 * @param {object} properties - Additional properties
 */
export const trackCompleteRegistration = (method = 'default', properties = {}) => {
  try {
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('track', 'CompleteRegistration', { method, ...properties });
    }

    if (typeof window !== 'undefined' && window.gtag) {
      // Grant consent for signup events
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });

      // Delay to ensure consent is processed
      setTimeout(() => {
        if (window.gtag) {
          window.gtag('event', 'sign_up', { method, ...properties });
        }
      }, 50);
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'CompleteRegistration', { method, ...properties });
    }

    console.log('✅ CompleteRegistration event tracked:', { method, ...properties });
    logTrackingEvent('complete_registration', { method, ...properties });
  } catch (error) {
    console.error('💥 Error tracking CompleteRegistration event:', error);
  }
};
