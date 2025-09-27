import { useEffect } from 'react';
import useCookieConsent, {
  executeWithConsent,
  loadScriptWithConsent,
} from '../../hooks/useCookieConsent';

// ----------------------------------------------------------------------

/**
 * CookieManager component handles the initialization of cookie-dependent services
 * based on user consent preferences. This ensures GDPR compliance by only loading
 * analytics, marketing, and functional scripts when users have given consent.
 */
export default function CookieManager() {
  const { hasConsent, preferences, isLoading } = useCookieConsent();

  useEffect(() => {
    if (isLoading || !hasConsent) return;

    // Initialize analytics services (Google Analytics, PostHog, etc.)
    executeWithConsent(
      () => {
        initializeAnalytics();
      },
      'analytics',
      preferences,
    );

    // Initialize marketing services (Facebook Pixel, Google Ads, etc.)
    executeWithConsent(
      () => {
        initializeMarketing();
      },
      'marketing',
      preferences,
    );

    // Initialize functional services (Chat widgets, etc.)
    executeWithConsent(
      () => {
        initializeFunctional();
      },
      'functional',
      preferences,
    );
  }, [hasConsent, preferences, isLoading]);

  return null; // This component doesn't render anything
}

// ----------------------------------------------------------------------

function initializeAnalytics() {
  // Google Analytics 4
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
  }

  // PostHog
  if (window.posthog) {
    window.posthog.opt_in_capturing();
  }

  // Microsoft Clarity
  if (window.clarity) {
    window.clarity('consent');
  }

  console.log('Analytics services initialized with user consent');
}

function initializeMarketing() {
  // Google Analytics 4 - Marketing
  if (window.gtag) {
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('consent', 'grant');
  }

  console.log('Marketing services initialized with user consent');
}

function initializeFunctional() {
  // Initialize functional cookies like preferences, chat widgets, etc.

  // Example: Load chat widget
  // loadScriptWithConsent('https://widget.intercom.io/widget/app_id', 'functional', preferences)
  //   .then(() => console.log('Chat widget loaded'))
  //   .catch(() => console.log('Chat widget not loaded - no consent'));

  console.log('Functional services initialized with user consent');
}

// ----------------------------------------------------------------------

/**
 * Utility function to check if a specific cookie category is allowed
 * @param {string} category - The cookie category ('analytics', 'marketing', 'functional')
 * @returns {boolean} - Whether the category is allowed
 */
export function isCookieCategoryAllowed(category) {
  const preferences = JSON.parse(localStorage.getItem('altan-cookie-preferences') || '{}');
  return preferences[category] || false;
}

/**
 * Utility function to conditionally execute code based on cookie consent
 * @param {Function} callback - The function to execute
 * @param {string} category - The required cookie category
 */
export function withCookieConsent(callback, category) {
  if (isCookieCategoryAllowed(category)) {
    callback();
  }
}
