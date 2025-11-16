import { Capacitor } from '@capacitor/core';
// Generic OAuth2 Auth
import { GenericOAuth2 } from '@capacitor-community/generic-oauth2';
import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer, useCallback, useMemo, ReactNode } from 'react';

import useMessageListener from '@hooks/useMessageListener';

// utils
import { AUTH_API } from './utils';
import type {
  AuthState,
  AuthAction,
  AuthContextType,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  UserProfileResponse,
  GenericOAuth2Result,
} from './types';
import { analytics } from '../lib/analytics';
import { trackSignUp, trackLogin } from '../utils/analytics';
import { storeRefreshToken, clearStoredRefreshToken, iframeState } from '../utils/auth';
import { optimai, optimai_auth, unauthorizeUser, authorizeUser } from '../utils/axios';
import { getAllTrackingParams, clearTrackingParams, formatTrackingParamsForAPI } from '../utils/queryParams';
import type { AxiosInstance, AxiosResponse } from 'axios';

// ----------------------------------------------------------------------

const initialState: AuthState = {
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
    member: false,
  },
  initialized: {
    user: false,
    member: false,
  },
};

const reducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INITIAL':
      return {
        ...state,
        isInitialized: true,
        isAuthenticated: action.payload?.isAuthenticated ?? false,
        user: action.payload?.user ?? null,
        // Update room-style structure
        initialized: {
          user: true,
          member: true,
        },
        authenticated: {
          user: action.payload?.isAuthenticated ?? false,
          member: action.payload?.isAuthenticated ?? false,
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
        user: action.payload?.user ?? null,
        // Update room-style structure
        authenticated: {
          user: true,
          member: true,
        },
        initialized: {
          user: true,
          member: true,
        },
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isInitialized: true,
        initialized: {
          user: true,
          member: true,
        },
        authenticated: {
          user: false,
          member: false,
        },
      };
    case 'UPDATE_USER_DETAILS':
      return {
        ...state,
        user: { ...state.user, ...action.payload } as AuthUser,
      };
    default:
      return state;
  }
};

const getBaseUrl = (): string => {
  const { protocol, hostname, port } = window.location;
  return port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
};

// Utility function to construct base URL with optional invitation ID
const constructBaseUrl = (base: string, path: string, params: Record<string, string> = {}): string => {
  const url = new URL(`${base}${path}`);
  Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
  return url.toString();
};

// ----------------------------------------------------------------------

export const AuthContext = createContext<AuthContextType | null>(null);

// ----------------------------------------------------------------------

interface AuthProviderProps {
  children: ReactNode;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

const getUserProfile = async (): Promise<UserProfileResponse> => {
  try {
    const res: AxiosResponse<{
      first_name?: string;
      last_name?: string;
      avatar_url?: string;
      member?: { id: string };
      email: string;
      is_banned?: boolean;
      is_disabled?: boolean;
      email_verified?: boolean;
      id: string;
      accounts: { items: AuthUser['accounts'] };
      is_superadmin?: { id: string };
      birthday?: string;
      gender?: string;
      phone?: string;
      user_name?: string;
    }> = await optimai_auth.post('/user/me/gq', {
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
        first_name: user?.first_name ?? undefined,
        last_name: user?.last_name ?? undefined,
        avatar_url: user?.avatar_url ?? undefined,
        member: user.member ?? undefined,
        email: user.email,
        is_banned: user.is_banned ?? undefined,
        is_disabled: user.is_disabled ?? undefined,
        email_verified: user.email_verified ?? undefined,
        id: user.id,
        accounts: user.accounts.items ?? undefined,
        xsup: (!!user.is_superadmin) ? true : undefined,
        birthday: user?.birthday ?? undefined,
        gender: user?.gender ?? undefined,
        phone: user?.phone ?? undefined,
        user_name: user?.user_name ?? undefined,
      },
    };
  } catch {
    throw new Error('Failed to get user profile');
  }
};

const verifyEmail = async (code: string): Promise<unknown> => {
  try {
    const response = await optimai_auth.post(`/user/verify-email?code=${code}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to verify email');
  }
};

const resendVerification = async (): Promise<unknown> => {
  try {
    const response = await optimai_auth.post('/user/resend-verification');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to resend verification');
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useMessageListener(['*'], (event: MessageEvent) => {
    const { data } = event;
    if (data.type === 'activate_interface_parenthood') {
      // Set the flag using the imported state object
      iframeState.activated = true;
      console.log('IframeChild activated by parent');
    }
  });


  useEffect(() => {
    const initialize = async () => {
      try {
        // First, try to authorize user (refresh tokens if needed)
        try {
          await authorizeUser();
        } catch (authError) {
          // If authorization fails, user might not be logged in yet
          // Continue to try getting user profile which will handle the error
          console.debug('Initial authorization attempt failed:', authError);
        }

        // Get user profile from session
        const userProfile = await getUserProfile();

        // Identify user in analytics on initialization
        if (userProfile.isAuthenticated && userProfile.user) {
          analytics.identify(userProfile.user.id, {
            email: userProfile.user.email,
            first_name: userProfile.user.first_name,
            last_name: userProfile.user.last_name,
            method: 'existing_session',
            is_superadmin: userProfile.user.xsup,
          });
        }

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
  }, []);

  const loginWithGoogle = useCallback(async (invitation_id?: string, idea_id?: string): Promise<void> => {
    const isMobile = Capacitor.isNativePlatform();

    // Get tracking params from localStorage or URL
    const trackingParams = getAllTrackingParams(false);
    const formattedTrackingParams = trackingParams ? formatTrackingParamsForAPI(trackingParams) : null;

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
        }) as GenericOAuth2Result;

        // Debug: Check what GenericOAuth2 is actually returning
        console.log('Full GenericOAuth2 result:', JSON.stringify(result, null, 2));

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
        const response: AxiosResponse<AuthResponse> = await optimai_auth.post(
          '/oauth/google/mobile',
          {
            idToken,
            accessToken,
            invitation_id: invitation_id || null,
            idea_id: idea_id || null,
            tracking_params: formattedTrackingParams,
          },
        );

        if (response.data.status === 'success' || response.data.access_token) {
          // Store tokens for mobile
          if (response.data.refresh_token) {
            storeRefreshToken(response.data.refresh_token);
          }

          // Set up session - if we have an access_token use it, otherwise rely on refresh token flow
          if (response.data.access_token) {
            const { setSession } = await import('../utils/auth');
            setSession(response.data.access_token, optimai as AxiosInstance);
          }

          // Get user profile and update state
          try {
            const userProfile = await getUserProfile();

            // Identify user in analytics
            if (userProfile.user) {
              analytics.identify(userProfile.user.id, {
                email: userProfile.user.email,
                first_name: userProfile.user.first_name,
                last_name: userProfile.user.last_name,
                method: 'google',
                is_superadmin: userProfile.user.xsup,
              });
            }

            dispatch({
              type: 'LOGIN',
              payload: userProfile,
            });

            // Clear tracking params after successful Google login
            clearTrackingParams();
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
      const params: Record<string, string> = {
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

      // Add tracking params to URL if they exist
      if (formattedTrackingParams) {
        // Encode tracking params as a JSON string to pass through URL
        params.tracking_params = JSON.stringify(formattedTrackingParams);
      }

      const url = constructBaseUrl(AUTH_API, '/login/google', params);

      // Track Google sign-up BEFORE opening popup
      trackSignUp('google');

      // Clear tracking params before opening popup (they're included in the URL)
      clearTrackingParams();

      const width = 600;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const windowFeatures = `toolbar=no, menubar=no, width=${width}, height=${height}, top=${top}, left=${left}`;
      const popup = window.open(url, 'GoogleLogin', windowFeatures);

      const checkPopup = setInterval(() => {
        if (popup?.closed) {
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
  const login = useCallback(async (payload: LoginPayload, idea?: string, invitation_id?: string): Promise<void> => {
    // Track email login BEFORE backend call
    trackLogin('email');

    const { protocol, hostname, port } = window.location;
    const baseUrl = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
    const dev = hostname === 'localhost' ? '&dev=345647hhnurhguiefiu5CHAOSDOVEtrbvmirotrmgi' : '';
    const response: AxiosResponse<AuthResponse> = await optimai_auth.post(
      `/login?origin=${encodeURIComponent(baseUrl)}${dev}`,
      payload,
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
        setSession(response.data.access_token, optimai as AxiosInstance);
      } else {
        console.warn('No access token in mobile login response');
      }

      // Get user profile and update state
      try {
        const userProfile = await getUserProfile();

        // Identify user in analytics
        if (userProfile.user) {
          analytics.identify(userProfile.user.id, {
            email: userProfile.user.email,
            first_name: userProfile.user.first_name,
            last_name: userProfile.user.last_name,
            method: 'email',
            is_superadmin: userProfile.user.xsup,
          });
        }

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

          // Identify user in analytics for fallback
          if (userProfile.user) {
            analytics.identify(userProfile.user.id, {
              email: userProfile.user.email,
              first_name: userProfile.user.first_name,
              last_name: userProfile.user.last_name,
              method: 'email',
              is_superadmin: userProfile.user.xsup,
            });
          }

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

  const patchUser = useCallback(async (details: Partial<AuthUser>): Promise<{ user: AuthUser }> => {
    try {
      const response: AxiosResponse<{ user: AuthUser }> = await optimai.patch('/user/me', details);
      dispatch({
        type: 'UPDATE_USER_DETAILS',
        payload: response.data.user as any,
      });
      return response.data;
    } catch {
      throw new Error('Failed to update user details');
    }
  }, []);

  // REGISTER
  const register = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    iid?: string,
    idea?: string
  ): Promise<void> => {
    // Track email registration BEFORE backend call
    trackSignUp('email');

    // Get tracking params from localStorage or URL
    const trackingParams = getAllTrackingParams(false);
    const formattedTrackingParams = trackingParams ? formatTrackingParamsForAPI(trackingParams) : null;

    const { protocol, hostname, port } = window.location;
    const baseUrl = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
    const dev = hostname === 'localhost' ? '&dev=345647hhnurhguiefiu5CHAOSDOVEtrbvmirotrmgi' : '';
    
    const registerPayload: RegisterPayload = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      user_name: email,
      invitation_id: iid !== undefined ? iid : null,
      idea: idea !== undefined ? idea : null,
      tracking_params: formattedTrackingParams,
    };
    
    const response: AxiosResponse<AuthResponse> = await optimai_auth.post(
      `/register?origin=${baseUrl}${dev}`,
      registerPayload,
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
        setSession(response.data.access_token, optimai as AxiosInstance);
      } else {
        console.warn('No access token in mobile register response');
      }

      // Get user profile and update state
      try {
        const userProfile = await getUserProfile();

        // Identify user in analytics
        if (userProfile.user) {
          analytics.identify(userProfile.user.id, {
            email: userProfile.user.email,
            first_name: userProfile.user.first_name,
            last_name: userProfile.user.last_name,
            method: 'email',
            is_superadmin: userProfile.user.xsup,
          });
        }

        dispatch({
          type: 'REGISTER',
          payload: userProfile,
        });

        // Clear tracking params after successful registration
        clearTrackingParams();
      } catch (error) {
        console.error('Failed to get user profile after mobile registration:', error);
        // Try to authorize user as fallback
        try {
          await authorizeUser();
          const userProfile = await getUserProfile();

          // Identify user in analytics for fallback
          if (userProfile.user) {
            analytics.identify(userProfile.user.id, {
              email: userProfile.user.email,
              first_name: userProfile.user.first_name,
              last_name: userProfile.user.last_name,
              method: 'email',
              is_superadmin: userProfile.user.xsup,
            });
          }

          dispatch({
            type: 'REGISTER',
            payload: userProfile,
          });

          // Clear tracking params after successful registration
          clearTrackingParams();
        } catch (fallbackError) {
          console.error('Mobile registration fallback also failed:', fallbackError);
          throw new Error('Failed to complete mobile registration');
        }
      }
    } else {
      // Web authentication flow (existing behavior)
      // Clear tracking params before redirect (they're already sent to backend)
      clearTrackingParams();

      // Convert the redirect string to URL object
      if (!response.data.redirect) {
        throw new Error('Invalid register response - no redirect URL');
      }
      
      const redirectUrl = new URL(response.data.redirect);

      // Safely append the idea parameter if it exists
      if (idea) {
        redirectUrl.searchParams.append('idea', idea);
      }

      window.location.href = redirectUrl.toString();
    }
  }, []);

  // LOGOUT
  const logout = useCallback(async (): Promise<void> => {
    // Track logout event
    analytics.signOut();

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

    await optimai_auth.post('/logout/user', null).finally(() => {
      clearStoredRefreshToken(); // Clear mobile refresh token
      unauthorizeUser();

      // Reset analytics session
      analytics.reset();

      dispatch({
        type: 'LOGOUT',
      });
    });
  }, []);

  const contextValue = useMemo(() => {
    const value: AuthContextType = {
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

      // Mobile token management
      storeRefreshToken,

      // Room context for CircleAuthGuard
      initialized: state.initialized,
      loading: state.loading,
      authenticated: state.authenticated,
    };

    // Expose auth context globally for interceptors
    (window as any).authContext = value;

    return value;
  }, [
    state.isAuthenticated,
    state.isInitialized,
    state.user,
    state.initialized,
    state.loading,
    state.authenticated,
    login,
    loginWithGoogle,
    logout,
    register,
    patchUser,
  ]);

  // Don't render children until auth is initialized
  if (!state.isInitialized) {
    return null;
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

