/**
 * Custom hook for managing WebSocket subscriptions
 * Follows Single Responsibility Principle
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { SubscriptionQueueItem, WebSocketSubscriptionsReturn } from '../types';
import {
  normalizeChannels,
  sendSubscriptionMessage,
  getSubscriptionKey,
  shouldThrottle,
  updateTimestamp,
} from '../utils/subscriptionHelpers';

/**
 * Process subscription queue
 * @param ws - WebSocket instance
 * @param queue - Subscription queue
 * @param activeSubscriptions - Currently active subscriptions
 * @param setActiveSubscriptions - State setter for active subscriptions
 */
const processSubscriptionQueue = (
  ws: WebSocket,
  queue: SubscriptionQueueItem[],
  activeSubscriptions: string[],
  setActiveSubscriptions: React.Dispatch<React.SetStateAction<string[]>>
): void => {
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
 * @returns Subscription management functions and state
 */
export const useWebSocketSubscriptions = (): WebSocketSubscriptionsReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const isOpenRef = useRef<boolean>(false);
  const [subscriptionQueue, setSubscriptionQueue] = useState<SubscriptionQueueItem[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<string[]>([]);
  const activeSubscriptionsRef = useRef<string[]>([]);
  const subscriptionTimestamps = useRef<Map<string, number>>(new Map());

  // Keep ref in sync with state
  useEffect(() => {
    activeSubscriptionsRef.current = activeSubscriptions;
  }, [activeSubscriptions]);

  /**
   * Initialize the hook with WebSocket reference
   */
  const initialize = useCallback((ws: React.MutableRefObject<WebSocket | null>, isOpen: boolean) => {
    wsRef.current = ws.current;
    isOpenRef.current = isOpen;
  }, []);

  /**
   * Subscribe to channels
   */
  const subscribe = useCallback(
    (channel: string | string[], callback?: () => void) => {
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
  const unsubscribe = useCallback((channels: string | string[], callback: (() => void) | null = null, type: string = 'l') => {
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
  const handleAck = useCallback((): void => {
    // eslint-disable-next-line no-console
    console.log('📋 WS: Processing subscription queue:', {
      queueLength: subscriptionQueue.length,
      queueItems: subscriptionQueue.map((item) => item.channel),
      currentActiveSubscriptions: activeSubscriptionsRef.current,
      timestamp: new Date().toISOString(),
    });

    if (!wsRef.current) {
      return undefined;
    }

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
    return undefined;
  }, [subscriptionQueue]);

  return {
    initialize,
    subscribe,
    unsubscribe,
    activeSubscriptions,
    handleAck,
  };
};

