/**
 * Subscription helpers - centralized utilities for WebSocket subscriptions
 */

/**
 * Normalize channel input to array format
 * @param {string|string[]} channel - Single channel or array of channels
 * @returns {string[]} - Array of channels
 */
export const normalizeChannels = (channel) => {
  return Array.isArray(channel) ? channel : [channel];
};

/**
 * Send subscription message through WebSocket
 * @param {WebSocket} ws - WebSocket instance
 * @param {string[]} channels - Array of channel names
 * @param {'s'|'u'} mode - 's' for subscribe, 'u' for unsubscribe
 * @param {string} type - Subscription type (default 'l')
 */
export const sendSubscriptionMessage = (ws, channels, mode, type = 'l') => {
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
 * @param {string[]} channels - Array of channel names
 * @returns {string} - Sorted, comma-separated channel names
 */
export const getSubscriptionKey = (channels) => {
  return channels.sort().join(',');
};

/**
 * Check if subscription should be throttled
 * @param {Map} timestampMap - Map of subscription keys to timestamps
 * @param {string} key - Subscription key
 * @param {number} throttleMs - Throttle duration in milliseconds
 * @returns {boolean} - True if should throttle
 */
export const shouldThrottle = (timestampMap, key, throttleMs = 100) => {
  const now = Date.now();
  const lastTime = timestampMap.get(key);
  return lastTime && now - lastTime < throttleMs;
};

/**
 * Update subscription timestamp
 * @param {Map} timestampMap - Map of subscription keys to timestamps
 * @param {string} key - Subscription key
 */
export const updateTimestamp = (timestampMap, key) => {
  timestampMap.set(key, Date.now());
};

