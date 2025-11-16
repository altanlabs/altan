/**
 * Subscription helpers - centralized utilities for WebSocket subscriptions
 */

/**
 * Normalize channel input to array format
 * @param channel - Single channel or array of channels
 * @returns Array of channels
 */
export const normalizeChannels = (channel: string | string[]): string[] => {
  return Array.isArray(channel) ? channel : [channel];
};

/**
 * Send subscription message through WebSocket
 * @param ws - WebSocket instance
 * @param channels - Array of channel names
 * @param mode - 's' for subscribe, 'u' for unsubscribe
 * @param type - Subscription type (default 'l')
 * @returns True if message was sent successfully
 */
export const sendSubscriptionMessage = (
  ws: WebSocket | null,
  channels: string[],
  mode: 's' | 'u',
  type: string = 'l'
): boolean => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('Cannot send subscription: WebSocket not open');
    return false;
  }

  ws.send(
    JSON.stringify({
      type: 'subscription',
      subscription: { type, mode, elements: channels },
    }),
  );

  return true;
};

/**
 * Generate subscription key for deduplication
 * @param channels - Array of channel names
 * @returns Sorted, comma-separated channel names
 */
export const getSubscriptionKey = (channels: string[]): string => {
  return channels.sort().join(',');
};

/**
 * Check if subscription should be throttled
 * @param timestampMap - Map of subscription keys to timestamps
 * @param key - Subscription key
 * @param throttleMs - Throttle duration in milliseconds
 * @returns True if should throttle
 */
export const shouldThrottle = (
  timestampMap: Map<string, number>,
  key: string,
  throttleMs: number = 100
): boolean => {
  const now = Date.now();
  const lastTime = timestampMap.get(key);
  return lastTime !== undefined && now - lastTime < throttleMs;
};

/**
 * Update subscription timestamp
 * @param timestampMap - Map of subscription keys to timestamps
 * @param key - Subscription key
 */
export const updateTimestamp = (timestampMap: Map<string, number>, key: string): void => {
  timestampMap.set(key, Date.now());
};

