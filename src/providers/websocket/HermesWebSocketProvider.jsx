import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { batch } from 'react-redux';

import { handleWebSocketEvent } from './ws';
import { useAuthContext } from '../../auth/useAuthContext';
import analytics from '../../lib/analytics';
import { selectAccountId } from '../../redux/slices/general';
import { selectRoomAccountId,
  addMessage,
  addMessagePart,
  updateMessagePart,
  markMessagePartDone,
  deleteMessagePart,
  updateMessageStreamingState,
  addRunningResponse,
  deleteRunningResponse,
  addActivationLifecycle,
  completeActivationLifecycle,
  discardActivationLifecycle,
  addResponseLifecycle,
  completeResponseLifecycle,
} from '../../redux/slices/room';
import { useSelector, dispatch } from '../../redux/store';
import { authorizeUser } from '../../utils/axios';
import { messagePartBatcher } from '../../utils/eventBatcher';

const HermesWebSocketContext = createContext(null);

export const useHermesWebSocket = () => useContext(HermesWebSocketContext);

/**
 * Handle AGENT_RESPONSE events from WhisperStream WebSocket
 *
 * @param {Object} data - The WebSocket event data
 *
 * @description
 * Processes AGENT_RESPONSE events including:
 * - activation.* lifecycle events
 * - response.* lifecycle events
 * - message_part.* events
 */
const handleAgentResponseEvent = (data) => {
  // Handle different event structures:
  // NEW FORMAT: Event data is directly in data (not nested under agent_event)
  // The event has: { type: "AGENT_RESPONSE", event: "agent_response", agent_id, thread_id, event_name, ... }
  const eventData = data.data?.agent_event || data.data;

  if (!eventData) {
    console.warn('Hermes WS: AGENT_RESPONSE missing event data, skipping');
    return;
  }

  // Use event_name from the event data
  const eventType = eventData?.event_name || eventData?.event_type;

  // Validate event_type exists
  if (!eventType || typeof eventType !== 'string') {
    console.warn('Hermes WS: AGENT_RESPONSE missing or invalid event_type');
    return;
  }

  // Try multiple timestamp sources in order of preference
  const timestamp = data.timestamp || new Date().toISOString();

  // Handle activation and response lifecycle events
  if (eventType.startsWith('activation.') || eventType.startsWith('response.')) {
    batch(() => {
      // Activation lifecycle (before response starts)
      if (eventType.startsWith('activation.')) {
        // Add to activation lifecycle
        dispatch(
          addActivationLifecycle({
            response_id: eventData.response_id,
            agent_id: eventData.agent_id,
            thread_id: eventData.thread_id,
            event_type: eventType,
            event_data: eventData,
            timestamp,
          }),
        );

        // Complete activation lifecycle when scheduled or rescheduled
        if (['activation.scheduled', 'activation.rescheduled'].includes(eventType)) {
          dispatch(
            completeActivationLifecycle({
              response_id: eventData.response_id,
              thread_id: eventData.thread_id,
            }),
          );
        }

        // Discard activation when discarded
        if (eventType === 'activation.discarded') {
          dispatch(
            discardActivationLifecycle({
              response_id: eventData.response_id,
              thread_id: eventData.thread_id,
            }),
          );
        }
      }

      // Response lifecycle (after response starts)
      if (eventType.startsWith('response.')) {
        // Add to response lifecycle - with safety check for eventData
        if (eventData && eventData.response_id) {
          dispatch(
            addResponseLifecycle({
              response_id: eventData.response_id,
              agent_id: eventData.agent_id,
              thread_id: eventData.thread_id,
              event_type: eventType,
              event_data: eventData,
              timestamp,
            }),
          );
        } else {
          console.warn('⚠️ WhisperStream WS: Received response event without response_id');
        }

        // Complete response lifecycle on completion events
        if (
          [
            'response.completed',
            'response.failed',
            'response.empty',
            'response.stopped',
            'response.interrupted',
            'response.suspended',
            'response.requeued',
          ].includes(eventType)
        ) {
          dispatch(
            completeResponseLifecycle({
              response_id: eventData.response_id,
              thread_id: eventData.thread_id,
              message_id: eventData.message_id,
              status: eventType.replace('response.', ''),
            }),
          );
        }
      }
    });
  }

  // Handle specific events
  switch (eventType) {
    // this is what makes the loading dots appear
    // if we receive a response.scheduled event, stream delay for many seconds
    case 'response.scheduled':
    case 'response.started':
      // Flush pending updates before starting new response
      messagePartBatcher.flush();
      batch(() => {
        // Create message if we have a message_id
        if (eventData.message_id) {
          const messageData = {
            id: eventData.message_id,
            thread_id: eventData.thread_id,
            member_id: eventData.room_member_id,
            date_creation: timestamp,
            text: '',
            is_streaming: true,
            response_id: eventData.response_id, // Include response_id to match with placeholder
          };
          dispatch(addMessage(messageData));
        }
        dispatch(addRunningResponse(eventData));
      });
      break;

    case 'response.completed':
      // Flush pending updates before completing response
      messagePartBatcher.flush();
      batch(() => {
        dispatch(deleteRunningResponse(eventData));
        if (eventData.message_id) {
          dispatch(
            updateMessageStreamingState({
              messageId: eventData.message_id,
              isStreaming: false,
            }),
          );
        }
      });
      break;

    case 'response.empty':
      // Flush pending updates before marking as empty
      messagePartBatcher.flush();
      batch(() => {
        dispatch(deleteRunningResponse(eventData));
        if (eventData.message_id) {
          dispatch(
            updateMessageStreamingState({
              messageId: eventData.message_id,
              isStreaming: false,
            }),
          );

          // Mark message as empty response
          dispatch(
            addMessage({
              id: eventData.message_id,
              thread_id: eventData.thread_id,
              meta_data: {
                is_empty: true,
              },
            }),
          );
        }
      });
      break;

    case 'response.failed':
      // Flush pending updates before handling failure
      messagePartBatcher.flush();
      batch(() => {
        dispatch(deleteRunningResponse(eventData));
        if (eventData.message_id) {
          dispatch(
            updateMessageStreamingState({
              messageId: eventData.message_id,
              isStreaming: false,
            }),
          );

          // Update message meta_data with error information
          dispatch(
            addMessage({
              id: eventData.message_id,
              thread_id: eventData.thread_id,
              meta_data: {
                error_code: eventData.error_code,
                error_message: eventData.error_message,
                error_type: eventData.error_type,
                failed_in: eventData.failed_in,
                retryable: eventData.retryable,
                total_attempts: eventData.total_attempts,
              },
            }),
          );

          // Add error message part to display the error
          // Use a deterministic ID so multiple errors for the same message replace each other
          const errorPartId = `${eventData.message_id}-error`;
          dispatch(
            addMessagePart({
              id: errorPartId,
              message_id: eventData.message_id,
              thread_id: eventData.thread_id,
              type: 'error',
              error_code: eventData.error_code,
              error_message: eventData.error_message,
              error_type: eventData.error_type,
              failed_in: eventData.failed_in,
              retryable: eventData.retryable,
              total_attempts: eventData.total_attempts,
              order: 999, // Put error at the end
              is_done: true,
            }),
          );
        }
      });
      break;

    case 'message_part.added':
      // Process immediately - new part lifecycle event
      dispatch(addMessagePart(eventData));
      break;

    case 'message_part.updated':
      // Batch for performance - high frequency event
      messagePartBatcher.enqueue('updated', eventData);
      break;

    case 'message_part.completed':
      // Flush pending updates before marking as completed (ensures proper ordering)
      messagePartBatcher.flush();
      dispatch(markMessagePartDone(eventData));
      break;

    case 'MessagePartDeleted':
      // Flush pending updates before deletion (ensures proper ordering)
      messagePartBatcher.flush();
      dispatch(deleteMessagePart(eventData));
      break;

    case 'activation.failed':
      // Check if it's a not_enough_credits error
      if (eventData.error_type === 'not_enough_credits') {
        function getSimulatedDate() {
          const date = new Date();
          // Format the date in ISO format without the trailing Z, and extend milliseconds to microseconds by appending "000"
          const isoString = date.toISOString().slice(0, -1); // remove "Z"
          const splitTime = isoString.split('.');
          const milliseconds = splitTime[1] || '000';
          // Simulated microseconds by appending "000" to the milliseconds
          const microseconds = milliseconds.padEnd(6, '0');
          return `${splitTime[0]}.${microseconds}`;
        }

        // Track credits finished event
        analytics.track('credits_finished', {
          thread_id: eventData.thread_id,
          error_type: eventData.error_type,
        });

        dispatch(
          addMessage({
            text: '[no_credits](no_credits/no_credits)',
            thread_id: eventData.thread_id,
            member_id: 'system',
            date_creation: getSimulatedDate(),
            id: 'credits-not-enough',
          }),
        );
      }
      break;

      // Lifecycle events that are already handled above but don't need specific switch handling
      // case 'activation.acknowledged':
      // case 'activation.scheduled':
      // case 'activation.rescheduled':
      // case 'activation.discarded':
      // case 'activation.failed':
      // case 'response.scheduled':
      // case 'response.started':
      // case 'response.completed':
      // case 'response.failed':
      // case 'response.empty':
      // case 'response.stopped':
      // case 'response.interrupted':
      // case 'response.suspended':
      // case 'response.requeued':
      //   // These are already handled by lifecycle logic above (lines 179-260)
      //   // No additional action needed in switch
      //   break;

    default:
      // Lifecycle events are already handled above, no additional logging needed
      break;
  }
};

// Register the message part batcher handler once
// This handler processes all batched message_part.updated events
messagePartBatcher.registerHandler('updated', (eventData) => {
  dispatch(updateMessagePart(eventData));
});

const HermesWebSocketProvider = ({ children }) => {
  const generalAccountId = useSelector(selectAccountId);
  const roomAccountId = useSelector(selectRoomAccountId);
  const accountId = generalAccountId || roomAccountId;
  const [isOpen, setIsOpen] = useState(false);
  const [securedWs, setSecuredWs] = useState(false);
  const { isAuthenticated, logout, user, guest } = useAuthContext();

  const user_id = user?.id;

  const wsRef = useRef(null);
  const subscriptionTimestamps = useRef(new Map());
  const [waitingToReconnect, setWaitingToReconnect] = useState(null);
  const [subscriptionQueue, setSubscriptionQueue] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);

  const unsubscribe = useCallback(
    (channels, callback = null, type = 'l') => {
      const filteredChannels = Array.isArray(channels) ? channels : [channels];

      if (
        filteredChannels.length &&
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        securedWs
      ) {
        // Only unsubscribe from channels that are actually subscribed
        const channelsToUnsubscribe = filteredChannels.filter((channel) =>
          activeSubscriptions.includes(channel),
        );

        if (channelsToUnsubscribe.length > 0) {
          wsRef.current.send(
            JSON.stringify({
              type: 'subscription',
              subscription: { type, mode: 'u', elements: channelsToUnsubscribe },
            }),
          );
        }

        setActiveSubscriptions((current) => {
          const newSubscriptions = current.filter((s) => !filteredChannels.includes(s));
          return newSubscriptions;
        });

        if (!!callback) {
          callback();
        }
      }
    },
    [securedWs, activeSubscriptions],
  );

  const subscribe = useCallback(
    (channel, callback) => {
      const channels = Array.isArray(channel) ? channel : [channel];

      // Filter out channels that are already subscribed or in queue
      const newChannels = channels.filter(
        (ch) =>
          !activeSubscriptions.includes(ch) &&
          !subscriptionQueue.some((item) => item.channel === ch),
      );

      if (newChannels.length === 0) {
        return;
      }

      // Add a small delay to prevent rapid successive subscriptions
      const subscriptionKey = newChannels.sort().join(',');
      const now = Date.now();
      const lastSubscription = subscriptionTimestamps.current.get(subscriptionKey);

      if (lastSubscription && now - lastSubscription < 100) {
        return;
      }

      subscriptionTimestamps.current.set(subscriptionKey, now);

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return;
      }

      if (!securedWs) {
        setSubscriptionQueue((current) => [
          ...current,
          ...newChannels.map((ch) => ({ channel: ch, callback, type: 'l' })),
        ]);
        return;
      }

      wsRef.current.send(
        JSON.stringify({
          type: 'subscription',
          subscription: { type: 'l', mode: 's', elements: newChannels },
        }),
      );

      setActiveSubscriptions((current) => {
        const newSubscriptions = [...current, ...newChannels];
        return newSubscriptions;
      });
      if (callback) {
        callback();
      }
    },
    [securedWs, activeSubscriptions, subscriptionQueue],
  );

  const sendCommand = useCallback(
    (command, payload) => {
      if (!!wsRef.current && wsRef.current.readyState === WebSocket.OPEN && securedWs) {
        wsRef.current.send(
          JSON.stringify({
            type: 'command',
            command,
            payload,
          }),
        );
      }
    },
    [securedWs],
  );

  useEffect(() => {
    if (securedWs && subscriptionQueue.length > 0 && !!wsRef.current) {
      subscriptionQueue.forEach(({ channel, callback, type }) => {
        // Only subscribe if not already subscribed
        if (!activeSubscriptions.includes(channel)) {
          wsRef.current.send(
            JSON.stringify({
              type: 'subscription',
              subscription: { type: type || 'l', mode: 's', elements: [channel] },
            }),
          );

          setActiveSubscriptions((current) => {
            const newSubscriptions = [...current, channel];
            return newSubscriptions;
          });
          if (callback) {
            callback();
          }
        } else {
        }
      });

      setSubscriptionQueue([]);
    }
  }, [securedWs, subscriptionQueue, activeSubscriptions]);

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      setIsOpen(false);
      setSecuredWs(false);
      setActiveSubscriptions([]);
      wsRef.current = null;
    }
  };

  useEffect(() => {
    if (isAuthenticated && !waitingToReconnect && !wsRef.current && !isOpen && !!accountId) {
      // Get the authentication token first
      const initializeWebSocket = async () => {
        try {
          // Use authorizeUser for both user and guest sessions
          const result = await authorizeUser();
          const accessToken = result.accessToken;

          if (!accessToken) {
            console.error('❌ WS: No access token available');
            return;
          }

          // Create WebSocket with real token
          const ws = new WebSocket(
            `wss://hermes.altan.ai/ws?account_id=${accountId}&user_id=${accountId}&token=${accessToken}`,
          );
          wsRef.current = ws;

          window.hermesWs = ws;

          ws.onopen = () => {
            setIsOpen(true);

            // With hermes, the token is in the URL, so we can mark as secured immediately
            setSecuredWs(true);

            // Send authentication message

            const authMessage = JSON.stringify({ type: 'authenticate', token: accessToken });

            ws.send(authMessage);

            // Set a timeout to check if we receive ACK
            setTimeout(() => {
              if (!securedWs) {
                console.warn(
                  '⚠️ WS: No ACK received after 5 seconds, connection may not be secured',
                );
              }
            }, 5000);
          };

          ws.onclose = () => {
            if (wsRef.current) {
            }
            disconnectWebSocket();
            if (waitingToReconnect) {
              return;
            }
            setWaitingToReconnect(true);
            setTimeout(() => setWaitingToReconnect(null), 5000);
          };

          ws.onerror = (error) => {
            console.error('🔗 WS: Error:', {
              error,
              wsReadyState: ws.readyState,
              currentActiveSubscriptions: activeSubscriptions,
              timestamp: new Date().toISOString(),
            });
            if (ws) {
              ws.close();
            }
          };

          ws.onmessage = async (event) => {
            if (!ws) {
              return;
            }

            // Check if event.data is a string or a Blob
            let rawData;
            if (typeof event.data === 'string') {
              rawData = event.data;
            } else if (event.data instanceof Blob) {
              rawData = await event.data.text();
            } else {
              console.error('❌ WS: Unexpected data type:', typeof event.data);
              return;
            }

            // Try to parse data directly first
            let data;
            try {
              data = JSON.parse(rawData);
            } catch (parseError) {
              // If direct parse fails, try base64 decode
              try {
                data = JSON.parse(atob(rawData));
              } catch (base64Error) {
                console.error('❌ WS: Error parsing data:', {
                  parseError: parseError.message,
                  base64Error: base64Error.message,
                  rawData: rawData.substring(0, 100) + '...', // Only show first 100 characters
                  dataLength: rawData.length,
                });
                return;
              }
            }

            if (data.entity === 'ServiceMetrics') {
              console.log('📊 WS ServiceMetrics Event:', data);
            } else if (data.repo_name) {
              console.log('🔧 WS Preview Interface Event:', data);
            } else if (data.type === 'ack') {
              console.log('🔐 WS: Received ACK, connection secured');
              setSecuredWs(true);

              // Process the subscription queue now that the connection is secured
              console.log('📋 WS: Processing subscription queue:', {
                queueLength: subscriptionQueue.length,
                queueItems: subscriptionQueue.map((item) => item.channel),
                currentActiveSubscriptions: activeSubscriptions,
                timestamp: new Date().toISOString(),
              });

              subscriptionQueue.forEach(({ channel, callback, type }) => {
                console.log('📡 WS: Processing queued subscription:', {
                  channel,
                  type,
                  hasCallback: !!callback,
                  currentActiveSubscriptions: activeSubscriptions,
                  timestamp: new Date().toISOString(),
                });

                ws.send(
                  JSON.stringify({
                    type: 'subscription',
                    subscription: {
                      type: type || 'l',
                      mode: 's',
                      elements: Array.isArray(channel) ? channel : [channel],
                    },
                  }),
                );
                setActiveSubscriptions((current) => {
                  const newSubscriptions = Array.isArray(channel)
                    ? [...current, ...channel]
                    : [...current, channel];
                  console.log('📋 WS: Active subscriptions updated from ACK queue:', {
                    previous: current,
                    added: channel,
                    new: newSubscriptions,
                    count: newSubscriptions.length,
                    timestamp: new Date().toISOString(),
                  });
                  return newSubscriptions;
                });
                if (callback) {
                  callback();
                }
              });
              setSubscriptionQueue([]);
            } else if (data.type === 'AGENT_RESPONSE') {
              // Handle AGENT_RESPONSE events directly in Hermes provider
              handleAgentResponseEvent(data);
            } else {
              handleWebSocketEvent(data, user_id);
            }
          };
          return () => {
            if (ws) {
              ws.close();
            }
          };
        } catch (error) {
          console.error('❌ WS: Failed to initialize WebSocket:', error);
          if (!guest) {
            logout();
          }
        }
      };

      initializeWebSocket();
    }
  }, [
    isAuthenticated,
    waitingToReconnect,
    isOpen,
    accountId,
    guest,
    logout,
    user_id,
    securedWs,
    disconnectWebSocket,
    activeSubscriptions,
    subscriptionQueue,
  ]);

  const memoizedValue = useMemo(
    () => ({
      websocket: wsRef.current,
      isOpen: securedWs,
      activeSubscriptions,
      disconnect: disconnectWebSocket,
      subscribe,
      unsubscribe,
      sendCommand,
    }),
    [activeSubscriptions, securedWs, sendCommand, subscribe, unsubscribe],
  );

  return (
    <HermesWebSocketContext.Provider value={memoizedValue}>
      {children}
    </HermesWebSocketContext.Provider>
  );
};

export default memo(HermesWebSocketProvider);
