/**
 * Altan AI SDK
 * Account-centric SDK for integrating with Altan AI
 * 
 * @version 2.3.0
 * @author Altan AI
 */

// ============================================================================
// CORE SDK EXPORTS
// ============================================================================

// Core SDK exports
export {
  type AltanSDKConfig,
  type GuestData,
  type CreateGuestRequest,
  type RoomData,
  type AuthTokens,
  type AltanEventMap,
  type AltanEventListener,
} from './altan-sdk';

// React hooks exports
export {
  useAltanSDK,
  useAltanGuest,
  useAltanAuth,
  useAltanRoom,
  useAltanEvent,
  useAltan,
} from './react-hooks';

// React components exports
export {
  AltanProvider,
  useAltanContext,
  Room,
  type RoomConfigProps,
} from './components';

// ============================================================================
// VERSION INFO & DEFAULTS
// ============================================================================

// Version information
export const SDK_VERSION = '2.6.2';

// Default configuration values
export const DEFAULT_CONFIG = {
  apiBaseUrl: 'https://api.altan.ai/platform/guest',
  authBaseUrl: 'https://api.altan.ai/auth/login/guest',
  roomBaseUrl: 'https://altan.ai/r',
  enableStorage: true,
  debug: false,
} as const; 