import { useState, useEffect } from 'react';

// ----------------------------------------------------------------------

const COOKIE_CONSENT_KEY = 'altan-cookie-consent';
const COOKIE_PREFERENCES_KEY = 'altan-cookie-preferences';

export default function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const storedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (consent && storedPreferences) {
      try {
        const parsedPreferences = JSON.parse(storedPreferences);
        setHasConsent(true);
        setPreferences(parsedPreferences);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
        // Clear invalid data
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        localStorage.removeItem(COOKIE_PREFERENCES_KEY);
      }
    }

    setIsLoading(false);

    // Listen for consent events
    const handleConsentGranted = (event) => {
      setHasConsent(true);
      setPreferences(event.detail);
    };

    window.addEventListener('cookieConsentGranted', handleConsentGranted);

    return () => {
      window.removeEventListener('cookieConsentGranted', handleConsentGranted);
    };
  }, []);

  const clearConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    setHasConsent(false);
    setPreferences(null);
  };

  const updatePreferences = (newPreferences) => {
    const updatedPreferences = {
      ...newPreferences,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem(COOKIE_CONSENT_KEY, 'updated');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(updatedPreferences));
    setPreferences(updatedPreferences);
    
    window.dispatchEvent(new CustomEvent('cookieConsentGranted', { 
      detail: updatedPreferences 
    }));
  };

  // Helper functions to check specific cookie categories
  const canUseAnalytics = () => preferences?.analytics || false;
  const canUseMarketing = () => preferences?.marketing || false;
  const canUseFunctional = () => preferences?.functional || false;

  return {
    hasConsent,
    preferences,
    isLoading,
    clearConsent,
    updatePreferences,
    canUseAnalytics,
    canUseMarketing,
    canUseFunctional,
  };
}

// ----------------------------------------------------------------------

// Utility function to conditionally load scripts based on consent
export const loadScriptWithConsent = (src, cookieType, preferences) => {
  if (!preferences || !preferences[cookieType]) {
    return Promise.reject(new Error(`No consent for ${cookieType} cookies`));
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Utility function to conditionally execute code based on consent
export const executeWithConsent = (callback, cookieType, preferences) => {
  if (preferences && preferences[cookieType]) {
    callback();
  }
};

