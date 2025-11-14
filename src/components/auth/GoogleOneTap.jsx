import { useCallback, useEffect } from 'react';
import { useGoogleOneTapLogin } from '@react-oauth/google';

import { useAuthContext } from '../../auth/useAuthContext';
import { analytics } from '../../lib/analytics';
import { optimai_auth } from '../../utils/axios';
import { getAllTrackingParams, formatTrackingParamsForAPI, clearTrackingParams } from '../../utils/queryParams';

/**
 * Google One Tap component that shows a proactive sign-in popup
 * This component should be placed at the app level to work globally
 *
 * How it works:
 * - Shows a proactive popup with the user's last used Google account
 * - Automatically appears when user is not authenticated
 * - On success, sends the credential to your backend for verification
 */
export default function GoogleOneTap() {
  const { isAuthenticated } = useAuthContext();

  // Debug: Log current origin for troubleshooting
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('🔍 Google One Tap Debug - Current Origin:', window.location.origin);
    // eslint-disable-next-line no-console
    console.log('⚠️ Make sure this origin is in Google Cloud Console > Authorized JavaScript origins');
  }, []);

  const handleOneTapSuccess = useCallback(async (credentialResponse) => {
    try {
      // eslint-disable-next-line no-console
      console.log('✅ Google One Tap Success');

      // The credentialResponse.credential contains the JWT ID token
      const idToken = credentialResponse.credential;

      // Get tracking params from localStorage or URL
      const trackingParams = getAllTrackingParams(false);
      const formattedTrackingParams = trackingParams ? formatTrackingParamsForAPI(trackingParams) : null;

      // Track Google sign-up
      analytics.track('Google One Tap Sign In Attempted');

      // Send the Google One Tap token to backend
      // Using the mobile endpoint since it accepts idToken directly
      const response = await optimai_auth.post('/oauth/google/mobile', {
        idToken,
        accessToken: null, // One Tap only provides ID token
        invitation_id: null,
        idea_id: null,
        tracking_params: formattedTrackingParams,
      });

      if (response.data.status === 'success' || response.data.access_token) {
        // Set up session
        if (response.data.access_token) {
          const { setSession } = await import('../../utils/auth');
          const { optimai } = await import('../../utils/axios');
          setSession(response.data.access_token, optimai);
        }

        // Track successful sign-in
        analytics.track('Google One Tap Sign In Success');

        // Clear tracking params after successful login
        clearTrackingParams();

        // Reload the page to initialize the auth context
        window.location.reload();
      } else {
        throw new Error('Authentication failed - no success status or access token received');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Google One Tap Error:', error);
      analytics.track('Google One Tap Sign In Failed', { error: error.message });
    }
  }, []);

  useGoogleOneTapLogin({
    onSuccess: handleOneTapSuccess,
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error('❌ Google One Tap Failed - Origin not authorized in Google Cloud Console');
      // eslint-disable-next-line no-console
      console.error('Fix: https://console.cloud.google.com/apis/credentials');

      // Log error details for debugging
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Error details:', error);
      }
    },
    // Only show One Tap when user is not authenticated
    disabled: isAuthenticated,
    // Automatically select credential for returning users
    auto_select: true,
    // Cancel the One Tap prompt if user clicks outside
    cancel_on_tap_outside: true,
    // Show the One Tap prompt container
    prompt_parent_id: 'google-one-tap',
    // Use the 'select_account' prompt to show account chooser
    use_fedcm_for_prompt: true,
  });

  // This component doesn't render anything visible
  return null;
}
