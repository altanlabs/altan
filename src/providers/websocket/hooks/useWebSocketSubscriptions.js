/**
 * Custom hook for managing WebSocket subscriptions
 * Follows Single Responsibility Principle
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  normalizeChannels,
  sendSubscriptionMessage,
  getSubscriptionKey,
  shouldThrottle,
  updateTimestamp,
} from '../utils/subscriptionHelpers';

/**
 * Process subscription queue
 * @param {WebSocket} ws - WebSocket instance
 * @param {Array} queue - Subscription queue
 * @param {Array} activeSubscriptions - Currently active subscriptions
 * @param {Function} setActiveSubscriptions - State setter for active subscriptions
 */
const processSubscriptionQueue = (ws, queue, activeSubscriptions, setActiveSubscriptions) => {
  queue.forEach(({ channel, callback, type }) => {
    const channels = normalizeChannels(channel);

    // Only subscribe if not already subscribed
    const newChannels = channels.filter((ch) => !activeSubscriptions.includes(ch));
    if (newChannels.length === 0) return;

    if (sendSubscriptionMessage(ws, newChannels, 's', type || 'l')) {
      setActiveSubscriptions((current) => [...current, ...newChannels]);
      callback?.();
    }
  });
};

/**
 * Hook for managing WebSocket subscriptions
 * @returns {Object} - Subscription management functions and state
 */
export const useWebSocketSubscriptions = () => {
  const wsRef = useRef(null);
  const isOpenRef = useRef(false);
  const [subscriptionQueue, setSubscriptionQueue] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const activeSubscriptionsRef = useRef([]);
  const subscriptionTimestamps = useRef(new Map());

  // Keep ref in sync with state
  useEffect(() => {
    activeSubscriptionsRef.current = activeSubscriptions;
  }, [activeSubscriptions]);

  /**
   * Initialize the hook with WebSocket reference
   */
  const initialize = useCallback((ws, isOpen) => {
    wsRef.current = ws.current;
    isOpenRef.current = isOpen;
  }, []);

  /**
   * Subscribe to channels
   */
  const subscribe = useCallback(
    (channel, callback) => {
      const channels = normalizeChannels(channel);

      // Use ref to get current state - avoid stale closure
      const currentActive = activeSubscriptionsRef.current;
      const currentQueue = subscriptionQueue;

      // Filter out already subscribed or queued channels
      const newChannels = channels.filter(
        (ch) =>
          !currentActive.includes(ch) && !currentQueue.some((item) => item.channel === ch),
      );

      if (newChannels.length === 0) return;

      // Throttle rapid subscriptions
      const subscriptionKey = getSubscriptionKey(newChannels);
      if (shouldThrottle(subscriptionTimestamps.current, subscriptionKey)) {
        return;
      }
      updateTimestamp(subscriptionTimestamps.current, subscriptionKey);

      // Queue if not open, otherwise send immediately
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setSubscriptionQueue((current) => [
          ...current,
          ...newChannels.map((ch) => ({ channel: ch, callback, type: 'l' })),
        ]);
        return;
      }

      if (sendSubscriptionMessage(wsRef.current, newChannels, 's')) {
        setActiveSubscriptions((current) => [...current, ...newChannels]);
        callback?.();
      }
    },
    [subscriptionQueue],
  );

  /**
   * Unsubscribe from channels
   */
  const unsubscribe = useCallback((channels, callback = null, type = 'l') => {
    const filteredChannels = normalizeChannels(channels);

    if (
      filteredChannels.length === 0 ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    // Use ref to get current active subscriptions - avoid stale closure
    const currentActive = activeSubscriptionsRef.current;

    // Only unsubscribe from actually subscribed channels
    const channelsToUnsubscribe = filteredChannels.filter((channel) =>
      currentActive.includes(channel),
    );

    if (channelsToUnsubscribe.length > 0) {
      sendSubscriptionMessage(wsRef.current, channelsToUnsubscribe, 'u', type);
    }

    // Use functional update to ensure we work with latest state
    setActiveSubscriptions((current) => current.filter((s) => !filteredChannels.includes(s)));
    callback?.();
  }, []); // No dependencies - always use latest refs

  /**
   * Process subscription queue when connection opens
   */
  useEffect(() => {
    if (
      subscriptionQueue.length > 0 &&
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      processSubscriptionQueue(
        wsRef.current,
        subscriptionQueue,
        activeSubscriptions,
        setActiveSubscriptions,
      );
      setSubscriptionQueue([]);
    }
  }, [subscriptionQueue, activeSubscriptions]);

  /**
   * Handle ACK - process queued subscriptions
   */
  const handleAck = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('📋 WS: Processing subscription queue:', {
      queueLength: subscriptionQueue.length,
      queueItems: subscriptionQueue.map((item) => item.channel),
      currentActiveSubscriptions: activeSubscriptionsRef.current,
      timestamp: new Date().toISOString(),
    });

    if (!wsRef.current) return;

    subscriptionQueue.forEach(({ channel, callback, type }) => {
      const channels = normalizeChannels(channel);

      // eslint-disable-next-line no-console
      console.log('📡 WS: Processing queued subscription:', {
        channel,
        type,
        hasCallback: !!callback,
        currentActiveSubscriptions: activeSubscriptionsRef.current,
        timestamp: new Date().toISOString(),
      });

      if (sendSubscriptionMessage(wsRef.current, channels, 's', type || 'l')) {
        setActiveSubscriptions((current) => {
          const newSubscriptions = [...current, ...channels];
          // eslint-disable-next-line no-console
          console.log('📋 WS: Active subscriptions updated from ACK queue:', {
            previous: current,
            added: channel,
            new: newSubscriptions,
            count: newSubscriptions.length,
            timestamp: new Date().toISOString(),
          });
          return newSubscriptions;
        });
        callback?.();
      }
    });

    setSubscriptionQueue([]);
  }, [subscriptionQueue]);

  return {
    initialize,
    subscribe,
    unsubscribe,
    activeSubscriptions,
    handleAck,
  };
};
