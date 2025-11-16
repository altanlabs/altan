/**
 * Authentication Types
 * Shared type definitions for authentication context and state
 */

import type { Account } from '../redux/slices/general/types/state';

// ============================================================================
// Auth State Types
// ============================================================================

export interface AuthLoadingState {
  user: boolean;
  member: boolean;
}

export interface AuthenticatedState {
  user: boolean;
  member: boolean;
}

export interface AuthInitializedState {
  user: boolean;
  member: boolean;
}

export interface AuthState {
  // Legacy platform structure (for backward compatibility)
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;

  // Room structure for CircleAuthGuard compatibility
  loading: AuthLoadingState;
  authenticated: AuthenticatedState;
  initialized: AuthInitializedState;
}

// ============================================================================
// Auth User Type (extended User with auth-specific fields)
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  first_name: string | undefined;
  last_name: string | undefined;
  avatar_url: string | undefined;
  member: { id: string } | undefined;
  is_banned: boolean | undefined;
  is_disabled: boolean | undefined;
  email_verified: boolean | undefined;
  accounts: Account[] | undefined;
  xsup: boolean | undefined;
  birthday: string | undefined;
  gender: string | undefined;
  phone: string | undefined;
  user_name: string | undefined;
}

// ============================================================================
// Auth Action Types
// ============================================================================

export type AuthActionType =
  | 'INITIAL'
  | 'LOGIN'
  | 'REGISTER'
  | 'LOGOUT'
  | 'UPDATE_USER_DETAILS';

export interface AuthAction {
  type: AuthActionType;
  payload?: {
    isAuthenticated?: boolean;
    user?: AuthUser | null;
    [key: string]: unknown;
  };
}

// ============================================================================
// Auth Context Type
// ============================================================================

export interface AuthContextType {
  // Legacy platform context (for backward compatibility)
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  method: string;

  // Auth methods
  login: (payload: LoginPayload, idea?: string, invitation_id?: string) => Promise<void>;
  loginWithGoogle: (invitation_id?: string, idea_id?: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    iid?: string,
    idea?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  patchUser: (details: Partial<AuthUser>) => Promise<{ user: AuthUser }>;
  verifyEmail: (code: string) => Promise<unknown>;
  resendVerification: () => Promise<unknown>;

  // Mobile token management
  storeRefreshToken: (token: string) => void;

  // Room context for CircleAuthGuard
  initialized: AuthInitializedState;
  loading: AuthLoadingState;
  authenticated: AuthenticatedState;
}

// ============================================================================
// Auth Requirement Context Type (for AuthGuard)
// ============================================================================

export interface AuthRequirementContextType {
  requireAuth: () => boolean;
  isAuthenticated: boolean;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

// ============================================================================
// Login/Register Payloads
// ============================================================================

export interface LoginPayload {
  email: string;
  password: string;
  [key: string]: unknown;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  user_name: string;
  invitation_id?: string | null;
  idea?: string | null;
  tracking_params?: TrackingParams | null;
}

export interface TrackingParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: unknown;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface AuthResponse {
  status?: string;
  access_token?: string;
  refresh_token?: string;
  redirect?: string;
  user?: AuthUser;
}

export interface UserProfileResponse {
  isAuthenticated: boolean;
  user: AuthUser;
  [key: string]: unknown;
}

export interface GenericOAuth2Result {
  access_token_response?: {
    id_token?: string;
    access_token?: string;
  };
  id_token?: string;
  idToken?: string;
  access_token?: string;
  accessToken?: string;
  authentication?: {
    id_token?: string;
    access_token?: string;
  };
  response?: {
    id_token?: string;
  };
  [key: string]: unknown;
}

