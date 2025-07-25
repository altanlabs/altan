/**
 * Altan AI SDK
 * Main entry point for the SDK
 * 
 * @version 1.0.0
 * @author Altan AI
 */

// Core SDK exports
export {
  AltanSDK,
  createAltanSDK,
  type AltanConfig,
  type GuestData,
  type RoomData,
  type AuthTokens,
  type ChatMessage,
  type AltanEventMap,
  type AltanEventListener,
} from './altan-sdk';

// React hooks exports
export {
  useAltanSDK,
  useAltanAuth,
  useAltanRoom,
  useAltanEvent,
  useAltanConnection,
  useAltan,
} from './react-hooks';

// React components exports
export {
  AltanProvider,
  useAltanContext,
  ChatWidget,
  Room,
  InlineChat, // Backward compatibility alias
  AuthStatus,
} from './components';

// Version information
export const SDK_VERSION = '1.0.0';

// Default configuration values
export const DEFAULT_CONFIG = {
  apiBaseUrl: 'https://api.altan.ai/platform/guest',
  authBaseUrl: 'https://api.altan.ai/auth/login/guest',
  roomBaseUrl: 'https://altan.ai/r',
  enableStorage: true,
  debug: false,
} as const; 