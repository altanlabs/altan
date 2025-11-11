/**
 * Scroll Behavior Constants
 */
export const SCROLL_THRESHOLDS = {
  TOP: 300,
  BOTTOM: 300,
  SEMI_BOTTOM: 1500,
} as const;

/**
 * Animation Delays (in milliseconds)
 */
export const ANIMATION_DELAYS = {
  VOICE_RESTART: 1000,
  MESSAGE_SEND: 100,
  SCROLL_SETTLE: 500,
  TRANSITION: 300,
} as const;

/**
 * Room Modes
 */
export const ROOM_MODES = {
  EPHEMERAL: 'ephemeral',
  TABS: 'tabs',
} as const;

/**
 * UI Dimensions
 */
export const UI_CONSTANTS = {
  FLOATING_TEXT_AREA_HEIGHT: 120,
  TAB_BAR_HEIGHT: 48,
  TOOLBAR_HEIGHT: 64,
  MAX_TEXT_AREA_HEIGHT: 200,
} as const;

/**
 * Virtuoso Viewport Configuration
 */
export const VIEWPORT_OVERSCAN = {
  top: 2000,
  bottom: 4000,
} as const;

/**
 * Temporary Thread ID Prefix (matches Redux format)
 */
export const TEMP_THREAD_PREFIX = 'temp-';

/**
 * Check if a thread ID is temporary
 */
export function isTemporaryThread(threadId: string | null | undefined): boolean {
  return !!threadId && threadId.startsWith(TEMP_THREAD_PREFIX);
}

/**
 * Generate a temporary thread ID (matches Redux format)
 */
export function generateTempThreadId(): string {
  return `${TEMP_THREAD_PREFIX}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

