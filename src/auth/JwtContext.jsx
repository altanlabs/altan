import { Capacitor } from '@capacitor/core';
// Generic OAuth2 Auth
import { GenericOAuth2 } from '@capacitor-community/generic-oauth2';
import axios from 'axios';
import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer, useCallback, useMemo } from 'react';

import useMessageListener from '@hooks/useMessageListener.ts';

// utils
import { AUTH_API } from './utils';
import { trackSignUp, trackLogin } from '../utils/analytics';
import { storeRefreshToken, clearStoredRefreshToken, iframeState } from '../utils/auth';
import { optimai, unauthorizeUser, authorizeUser, authorizeGuest } from '../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  // Legacy platform structure (for backward compatibility)
  isInitialized: false,
  isAuthenticated: false,
  user: null,

  // Room structure for CircleAuthGuard compatibility
  loading: {
    user: false,
    member: false,
  },
  authenticated: {
    user: false,
    guest: false,
    member: false,
  },
  initialized: {
    user: false,
    guest: false,
    member: false,
  },
  guest: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIAL':
      return {
        ...state,
        isInitialized: true,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
        // Update room-style structure
        initialized: {
          user: true,
          guest: true,
          member: true,
        },
        authenticated: {
          user: action.payload.isAuthenticated,
          guest: false,
          member: action.payload.isAuthenticated,
        },
        loading: {
          user: false,
          member: false,
        },
      };
    case 'LOGIN':
    case 'REGISTER':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        guest: null, // Clear guest when user logs in
        // Update room-style structure
        authenticated: {
          user: true,
          guest: false,
          member: true,
        },
        initialized: {
          user: true,
          guest: true,
          member: true,
        },
      };
    case 'GUEST_LOGIN':
      const newState = {
        ...state,
        isInitialized: true,
        isAuthenticated: true, // 🔧 Guests ARE authenticated!
        user: null, // Still no user object for guests
        guest: action.payload.guest,
        // Update room-style structure for guest
        authenticated: {
          user: false, // No user, but guest is authenticated
          guest: true,
          member: true, // Guest acts as member for room access
        },
        initialized: {
          user: true,
          guest: true,
          member: true,
        },
        loading: {
          user: false,
          member: false,
        },
      };
      return newState;
    case 'LOGOUT':
      return {
        ...initialState,
        isInitialized: true,
        initialized: {
          user: true,
          guest: true,
          member: true,
        },
        authenticated: {
          user: false,
          guest: false,
          member: false,
        },
      };
    case 'UPDATE_USER_DETAILS':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

const getBaseUrl = () => {
  const { protocol, hostname, port } = window.location;
  return port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
};

// Utility function to construct base URL with optional invitation ID
const constructBaseUrl = (base, path, params = {}) => {
  const url = new URL(`${base}${path}`);
  Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
  return url.toString();
};

// ----------------------------------------------------------------------

export const AuthContext = createContext(null);

// ----------------------------------------------------------------------

AuthProvider.propTypes = {
  children: PropTypes.node,
};

const getUserProfile = async () => {
  try {
    const res = await optimai.post('/user/me/gq', {
      '@fields': '@all',
      member: {
        '@fields': 'id',
      },
      is_superadmin: {
        '@fields': 'id',
      },
      accounts: {
        '@fields': ['@base', 'name', 'logo_url'],
        organisation: {
          '@fields': ['@base', 'name'],
        },
      },
    });

    const user = res.data;
    return {
      isAuthenticated: true,
      user: {
        first_name: user?.first_name,
        last_name: user?.last_name,
        avatar_url: user?.avatar_url,
        member: user.member,
        email: user.email,
        is_banned: user.is_banned,
        is_disabled: user.is_disabled,
        email_verified: user.email_verified,
        id: user.id,
        accounts: user.accounts.items,
        xsup: !!user.is_superadmin,
        birthday: user?.birthday,
        gender: user?.gender,
        phone: user?.phone,
        user_name: user?.user_name,
      },
    };
  } catch {
    throw new Error('Failed to get user profile');
  }
};

const verifyEmail = async (code) => {
  try {
    const response = await optimai.post(`/user/verify-email?code=${code}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to verify email');
  }
};

const resendVerification = async () => {
  try {
    const response = await optimai.post('/user/resend-verification');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to resend verification');
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useMessageListener(['*'], (event) => {
    const { data } = event;
    if (data.type === 'activate_interface_parenthood') {
      // Set the flag using the imported state object
      iframeState.activated = true;
      console.log('IframeChild activated by parent');
    }
  });

  // Function to request guest authentication from parent window
  const requestGuestAuthFromParent = useCallback(() => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handleAuthResponse);
        reject(new Error('Parent authentication request timeout'));
      }, 10000); // 10 second timeout

      function handleAuthResponse(event) {
        const { data } = event;

        if (data.type === 'guest_auth_response') {
          clearTimeout(timeout);
          window.removeEventListener('message', handleAuthResponse);

          console.log('📥 Received guest auth response from parent:', data);

          if (data.isAuthenticated && data.guest) {
            resolve({
              guest: data.guest,
              accessToken: data.accessToken,
            });
          } else {
            reject(new Error('Guest not authenticated in parent'));
          }
        }
      }

      window.addEventListener('message', handleAuthResponse);

      // Request authentication from parent
      window.parent.postMessage({
        type: 'request_guest_auth',
      }, '*');
    });
  }, []);

  // Guest login function (defined before useEffect to avoid "used before defined" error)
  const loginAsGuest = useCallback(async (guestId, agentId) => {
    try {
      // Check if we're in an iframe and should use parent authentication
      const isInIframe = window !== window.parent;

      if (isInIframe) {
        // Request authentication from parent window
        const guestData = await requestGuestAuthFromParent();

        if (guestData && guestData.guest) {
          // Set up guest authentication for axios instances
          console.log('🔑 Setting up guest auth with token:', guestData.accessToken);
          try {
            await authorizeGuest(guestData.accessToken);
            console.log('✅ Guest axios authentication set up successfully');
          } catch (authError) {
            console.warn('⚠️ Failed to set up guest axios authentication:', authError);
          }

          dispatch({
            type: 'GUEST_LOGIN',
            payload: {
              guest: guestData.guest,
            },
          });

          return guestData.guest;
        } else {
          throw new Error('Parent authentication failed or not available');
        }
      } else {
        // Fallback to direct API call if not in iframe (only if guestId/agentId provided)
        if (!guestId || !agentId) {
          throw new Error('Guest ID and Agent ID are required for direct authentication');
        }

        const response = await axios.post(
          `${AUTH_API}/login/guest?guest_id=${guestId}&agent_id=${agentId}`,
          {},
          { withCredentials: true },
        );

        if (response.data && response.data.guest) {
          const guestData = response.data.guest;
          console.log('guestData', guestData);

          // Set up guest authentication for axios instances
          try {
            await authorizeGuest(response.data.access_token);
            console.log('✅ Direct guest axios authentication set up successfully');
          } catch (authError) {
            console.warn('⚠️ Failed to set up direct guest axios authentication:', authError);
          }

          dispatch({
            type: 'GUEST_LOGIN',
            payload: {
              guest: guestData,
            },
          });

          return guestData;
        } else {
          throw new Error('Guest authentication failed');
        }
      }
    } catch (error) {
      throw error;
    }
  }, [requestGuestAuthFromParent]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const userProfile = await getUserProfile();
        dispatch({
          type: 'INITIAL',
          payload: userProfile,
        });
      } catch {
        dispatch({
          type: 'INITIAL',
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };
    initialize();
  }, [loginAsGuest]);

  const loginWithGoogle = useCallback(async (invitation_id, idea_id) => {
    const isMobile = Capacitor.isNativePlatform();

    if (isMobile) {
      // Native mobile authentication using GenericOAuth2
      try {
        const result = await GenericOAuth2.authenticate({
          authorizationBaseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          accessTokenEndpoint: 'https://oauth2.googleapis.com/token',
          scope: 'openid email profile',
          responseType: 'code',
          pkceEnabled: true,
          appId: '389448867152-le0q74dqqbiu5ekdvej0h6dav69bbd1p.apps.googleusercontent.com',
          resourceUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
          additionalParameters: {
            access_type: 'offline',
          },
          web: {
            redirectUrl: window.location.origin,
            responseType: 'code',
          },
          ios: {
            redirectUrl:
              'com.googleusercontent.apps.389448867152-le0q74dqqbiu5ekdvej0h6dav69bbd1p://',
            responseType: 'code',
          },
          android: {
            redirectUrl:
              'com.googleusercontent.apps.389448867152-le0q74dqqbiu5ekdvej0h6dav69bbd1p://',
            responseType: 'code',
          },
        });

        // Debug: Check what GenericOAuth2 is actually returning
        console.log('✅ Full GenericOAuth2 result:', JSON.stringify(result, null, 2));

        // Extract tokens
        const idToken =
          result.access_token_response?.id_token ||
          result.id_token ||
          result.idToken ||
          result.authentication?.id_token ||
          result.response?.id_token ||
          null;
        const accessToken =
          result.access_token_response?.access_token ||
          result.access_token ||
          result.accessToken ||
          result.authentication?.access_token;
        // Track Google sign-up BEFORE backend call
        trackSignUp('google');

        // Send the Google token to your backend for verification
        const response = await axios.post(
          `${AUTH_API}/oauth/google/mobile`,
          {
            idToken,
            accessToken,
            invitation_id: invitation_id || null,
            idea_id: idea_id || null,
          },
          { withCredentials: true },
        );

        if (response.data.status === 'success' || response.data.access_token) {
          // Store tokens for mobile
          if (response.data.refresh_token) {
            storeRefreshToken(response.data.refresh_token);
          }

          // Set up session - if we have an access_token use it, otherwise rely on refresh token flow
          if (response.data.access_token) {
            const { setSession } = await import('../utils/auth');
            setSession(response.data.access_token, optimai);
          }

          // Get user profile and update state
          try {
            const userProfile = await getUserProfile();
            dispatch({
              type: 'LOGIN',
              payload: userProfile,
            });
          } catch {
            throw new Error('Failed to complete mobile Google authentication');
          }
        } else {
          throw new Error('Authentication failed - no success status or access token received');
        }
      } catch (error) {
        throw error;
      }
    } else {
      // Web authentication (existing popup behavior)
      const params = {
        origin: getBaseUrl(),
        origin_redirect: window.location.pathname,
      };
      const hostname = window.location.hostname;
      if (hostname === 'localhost') {
        params.dev = '345647hhnurhguiefiu5CHAOSDOVEtrbvmirotrmgi';
      }
      if (invitation_id) {
        params.iid = invitation_id;
      }
      const url = constructBaseUrl(AUTH_API, '/login/google', params);

      // Track Google sign-up BEFORE opening popup
      trackSignUp('google');

      const width = 600;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const windowFeatures = `toolbar=no, menubar=no, width=${width}, height=${height}, top=${top}, left=${left}`;
      const popup = window.open(url, 'GoogleLogin', windowFeatures);

      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);

          const redirectUrl = new URL('https://www.altan.ai');
          if (invitation_id) {
            redirectUrl.searchParams.append('iid', invitation_id);
          }
          if (idea_id) {
            redirectUrl.searchParams.append('idea', idea_id);
          }
          window.location.href = redirectUrl.toString();
        }
      }, 1000);
    }
  }, []);

  // LOGIN
  const login = useCallback(async (payload, idea, invitation_id) => {
    // Track email login BEFORE backend call
    trackLogin('email');

    const { protocol, hostname, port } = window.location;
    const baseUrl = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
    const dev = hostname === 'localhost' ? '&dev=345647hhnurhguiefiu5CHAOSDOVEtrbvmirotrmgi' : '';
    const response = await axios.post(
      `${AUTH_API}/login?origin=${encodeURIComponent(baseUrl)}${dev}`,
      payload,
      {
        withCredentials: true,
      },
    );

    if (!response || !response.data) {
      throw new Error('Invalid login response');
    }

    // Check if running on mobile platform
    const isMobile = Capacitor.isNativePlatform();

    if (isMobile) {
      if (response.data.refresh_token) {
        storeRefreshToken(response.data.refresh_token);
      }

      // Set up access token directly if provided
      if (response.data.access_token) {
        // Import setSession to set the token directly
        const { setSession } = await import('../utils/auth');
        setSession(response.data.access_token, optimai);
      } else {
        console.warn('No access token in mobile login response');
      }

      // Get user profile and update state
      try {
        const userProfile = await getUserProfile();
        dispatch({
          type: 'LOGIN',
          payload: userProfile,
        });
      } catch (error) {
        console.error('Failed to get user profile after mobile login:', error);
        // Try to authorize user as fallback
        try {
          await authorizeUser();
          const userProfile = await getUserProfile();
          dispatch({
            type: 'LOGIN',
            payload: userProfile,
          });
        } catch (fallbackError) {
          console.error('Mobile login fallback also failed:', fallbackError);
          throw new Error('Failed to complete mobile authentication');
        }
      }
    } else {
      // Web authentication flow (existing behavior)
      if (!response.data.redirect) {
        throw new Error('Invalid login response - no redirect URL');
      }

      const redirectUrl = new URL(response.data.redirect);

      // Append parameters if they exist
      if (idea) {
        redirectUrl.searchParams.append('idea', idea);
      }
      if (invitation_id) {
        redirectUrl.searchParams.append('iid', invitation_id);
      }

      window.location.href = redirectUrl.toString();
    }
  }, []);

  const patchUser = useCallback(async (details) => {
    try {
      const response = await optimai.patch('/user/me', details);
      dispatch({
        type: 'UPDATE_USER_DETAILS',
        payload: response.data.user,
      });
      return response.data;
    } catch {
      throw new Error('Failed to update user details');
    }
  }, []);

  // REGISTER
  const register = useCallback(async (email, password, firstName, lastName, iid, idea) => {
    // Track email registration BEFORE backend call
    trackSignUp('email');

    const { protocol, hostname, port } = window.location;
    const baseUrl = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
    const dev = hostname === 'localhost' ? '&dev=345647hhnurhguiefiu5CHAOSDOVEtrbvmirotrmgi' : '';
    const response = await axios.post(
      `${AUTH_API}/register?origin=${baseUrl}${dev}`,
      {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        user_name: email,
        invitation_id: iid !== undefined ? iid : null,
        idea: idea !== undefined ? idea : null,
      },
      { withCredentials: true },
    );

    // Check if running on mobile platform
    const isMobile = Capacitor.isNativePlatform();

    if (isMobile) {
      // Mobile authentication flow

      // Store refresh token if provided
      if (response.data.refresh_token) {
        storeRefreshToken(response.data.refresh_token);
      }

      // Set up access token directly if provided
      if (response.data.access_token) {
        // Import setSession to set the token directly
        const { setSession } = await import('../utils/auth');
        setSession(response.data.access_token, optimai);
      } else {
        console.warn('No access token in mobile register response');
      }

      // Get user profile and update state
      try {
        const userProfile = await getUserProfile();
        dispatch({
          type: 'REGISTER',
          payload: userProfile,
        });
      } catch (error) {
        console.error('Failed to get user profile after mobile registration:', error);
        // Try to authorize user as fallback
        try {
          await authorizeUser();
          const userProfile = await getUserProfile();
          dispatch({
            type: 'REGISTER',
            payload: userProfile,
          });
        } catch (fallbackError) {
          console.error('Mobile registration fallback also failed:', fallbackError);
          throw new Error('Failed to complete mobile registration');
        }
      }
    } else {
      // Web authentication flow (existing behavior)
      // Convert the redirect string to URL object
      const redirectUrl = new URL(response.data.redirect);

      // Safely append the idea parameter if it exists
      if (idea) {
        redirectUrl.searchParams.append('idea', idea);
      }

      window.location.href = redirectUrl.toString();
    }
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    const isMobile = Capacitor.isNativePlatform();

    if (isMobile) {
      // Sign out from Generic OAuth2 on mobile
      try {
        await GenericOAuth2.logout({
          appId: '389448867152-le0q74dqqbiu5ekdvej0h6dav69bbd1p.apps.googleusercontent.com',
        });
      } catch (error) {
        console.warn('Failed to sign out from GenericOAuth2:', error);
      }
    }

    await axios.post(`${AUTH_API}/logout/user`, null, { withCredentials: true }).finally(() => {
      clearStoredRefreshToken(); // Clear mobile refresh token
      unauthorizeUser();
      dispatch({
        type: 'LOGOUT',
      });
    });
  }, []);

  const contextValue = useMemo(() => {
    const value = {
      // Legacy platform context (for backward compatibility)
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      method: 'jwt',
      login,
      loginWithGoogle,
      register,
      logout,
      patchUser,
      verifyEmail,
      resendVerification,

      // Guest authentication
      loginAsGuest,

      // Mobile token management
      storeRefreshToken,

      // Room context for CircleAuthGuard
      initialized: state.initialized,
      loading: state.loading,
      authenticated: state.authenticated,
      guest: state.guest,
    };

    // Expose auth context globally for interceptors
    window.authContext = value;

    return value;
  }, [
    state.isAuthenticated,
    state.isInitialized,
    state.user,
    state.initialized,
    state.loading,
    state.authenticated,
    state.guest,
    login,
    loginWithGoogle,
    logout,
    register,
    patchUser,
    loginAsGuest,
  ]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
