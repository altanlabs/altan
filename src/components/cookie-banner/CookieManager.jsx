import { useEffect } from 'react';

import useCookieConsent, { executeWithConsent } from '../../hooks/useCookieConsent';

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

    // Initialize analytics services (Google Analytics, etc.)
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
  // Google Analytics 4 - Update consent for analytics
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
    // eslint-disable-next-line no-console
    console.log('✅ Google Analytics consent updated to granted');
  }

  // Microsoft Clarity
  if (window.clarity) {
    window.clarity('consent');
  }

  // eslint-disable-next-line no-console
  console.log('Analytics services initialized with user consent');
}

function initializeMarketing() {
  // Google Analytics 4 - Marketing & Advertising
  if (window.gtag) {
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
    // eslint-disable-next-line no-console
    console.log('✅ Google Ads consent updated to granted');
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('consent', 'grant');
  }

  // eslint-disable-next-line no-console
  console.log('Marketing services initialized with user consent');
}

function initializeFunctional() {
  // Update consent for functional storage
  if (window.gtag) {
    window.gtag('consent', 'update', {
      functionality_storage: 'granted',
      personalization_storage: 'granted',
    });
    // eslint-disable-next-line no-console
    console.log('✅ Functional storage consent updated to granted');
  }

  // Initialize functional cookies like preferences, chat widgets, etc.
  // Example: Load chat widget script when functional consent is granted

  // eslint-disable-next-line no-console
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
