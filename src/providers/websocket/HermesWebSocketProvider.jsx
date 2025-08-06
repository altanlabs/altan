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

import { handleWebSocketEvent } from './ws';
import { useAuthContext } from '../../auth/useAuthContext';
import { selectAccountId } from '../../redux/slices/general';
import { selectRoomAccountId } from '../../redux/slices/room';
import { useSelector } from '../../redux/store';
import { requestRefreshFromParent } from '../../utils/auth';
import { authorizeUser } from '../../utils/axios';

const HermesWebSocketContext = createContext(null);

export const useHermesWebSocket = () => useContext(HermesWebSocketContext);

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
      console.log('WS: UNSUBSCRIBE - ', channels, activeSubscriptions.length);
      const filteredChannels = Array.isArray(channels) ? channels : [channels];
      console.log('WS: UNSUBSCRIBE - apres ', filteredChannels);

      if (
        filteredChannels.length &&
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        securedWs
      ) {
        // Only unsubscribe from channels that are actually subscribed
        const channelsToUnsubscribe = filteredChannels.filter(channel => 
          activeSubscriptions.includes(channel)
        );

        if (channelsToUnsubscribe.length > 0) {
          console.log('WS: Actually unsubscribing from:', channelsToUnsubscribe);
          wsRef.current.send(
            JSON.stringify({
              type: 'subscription',
              subscription: { type, mode: 'u', elements: channelsToUnsubscribe },
            }),
          );
        }

        setActiveSubscriptions((current) => {
          const newSubscriptions = current.filter((s) => !filteredChannels.includes(s));
          console.log('WS: Updated active subscriptions:', {
            removed: filteredChannels,
            remaining: newSubscriptions,
            count: newSubscriptions.length,
          });
          return newSubscriptions;
        });
        
        if (!!callback) {
          callback();
        }
      }
    },
    [securedWs, activeSubscriptions],
  );

  // Log subscription status periodically
  useEffect(() => {
    const logSubscriptionStatus = () => {
      console.log('📊 WS: Current subscription status:', {
        activeSubscriptions,
        subscriptionQueue: subscriptionQueue.map(item => item.channel),
        totalSubscriptions: activeSubscriptions.length + subscriptionQueue.length,
        wsReadyState: wsRef.current?.readyState,
        isSecured: securedWs,
        isOpen,
        timestamp: new Date().toISOString(),
      });
    };

    // Log every 30 seconds instead of 10
    const interval = setInterval(logSubscriptionStatus, 30000);
    
    // Also log immediately
    logSubscriptionStatus();

    return () => clearInterval(interval);
  }, [activeSubscriptions, subscriptionQueue, securedWs, isOpen]);

  const subscribe = useCallback(
    (channel, callback) => {
      const channels = Array.isArray(channel) ? channel : [channel];
      
      // Filter out channels that are already subscribed or in queue
      const newChannels = channels.filter(ch => 
        !activeSubscriptions.includes(ch) && 
        !subscriptionQueue.some(item => item.channel === ch)
      );

      if (newChannels.length === 0) {
        console.log('🔔 WS: Skipping subscription - all channels already subscribed:', {
          requested: channels,
          alreadySubscribed: channels.filter(ch => activeSubscriptions.includes(ch)),
          inQueue: channels.filter(ch => subscriptionQueue.some(item => item.channel === ch)),
        });
        return;
      }

      // Add a small delay to prevent rapid successive subscriptions
      const subscriptionKey = newChannels.sort().join(',');
      const now = Date.now();
      const lastSubscription = subscriptionTimestamps.current.get(subscriptionKey);
      
      if (lastSubscription && (now - lastSubscription) < 100) {
        console.log('🔔 WS: Skipping rapid subscription (throttled):', {
          channels: newChannels,
          timeSinceLast: now - lastSubscription,
        });
        return;
      }
      
      subscriptionTimestamps.current.set(subscriptionKey, now);

      console.log('🔔 WS: Attempting to subscribe to channels:', {
        requested: channels,
        newChannels,
        hasCallback: !!callback,
        wsReadyState: wsRef.current?.readyState,
        isSecured: securedWs,
        timestamp: new Date().toISOString(),
      });

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.warn('⚠️ WS: Cannot subscribe - WebSocket not open:', {
          channels: newChannels,
          wsReadyState: wsRef.current?.readyState,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!securedWs) {
        console.log('⏳ WS: Adding to subscription queue (not secured yet):', {
          channels: newChannels,
          queueLength: subscriptionQueue.length,
          timestamp: new Date().toISOString(),
        });
        setSubscriptionQueue((current) => [
          ...current,
          ...newChannels.map(ch => ({ channel: ch, callback, type: 'l' }))
        ]);
        return;
      }

      console.log('📡 WS: Sending subscription message:', {
        channels: newChannels,
        message: {
          type: 'subscription',
          subscription: { type: 'l', mode: 's', elements: newChannels },
        },
        timestamp: new Date().toISOString(),
      });

      wsRef.current.send(
        JSON.stringify({
          type: 'subscription',
          subscription: { type: 'l', mode: 's', elements: newChannels },
        }),
      );

      console.log('✅ WS: Subscription sent successfully:', {
        channels: newChannels,
        activeSubscriptions: [...activeSubscriptions, ...newChannels],
        totalSubscriptions: activeSubscriptions.length + newChannels.length,
        timestamp: new Date().toISOString(),
      });

      setActiveSubscriptions((current) => [...current, ...newChannels]);
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
      console.log('📋 WS: Processing subscription queue:', {
        queueLength: subscriptionQueue.length,
        queueItems: subscriptionQueue.map(item => item.channel),
        timestamp: new Date().toISOString(),
      });

      subscriptionQueue.forEach(({ channel, callback, type }) => {
        // Only subscribe if not already subscribed
        if (!activeSubscriptions.includes(channel)) {
          console.log('📡 WS: Processing queued subscription:', {
            channel,
            type,
            hasCallback: !!callback,
            timestamp: new Date().toISOString(),
          });
          
          wsRef.current.send(
            JSON.stringify({
              type: 'subscription',
              subscription: { type: type || 'l', mode: 's', elements: [channel] },
            }),
          );
          
          console.log('✅ WS: Queued subscription sent:', {
            channel,
            activeSubscriptions: [...activeSubscriptions, channel],
            timestamp: new Date().toISOString(),
          });
          
          setActiveSubscriptions((current) => [...current, channel]);
          if (callback) {
            callback();
          }
        } else {
          console.log('⏭️ WS: Skipping queued subscription - already subscribed:', {
            channel,
            timestamp: new Date().toISOString(),
          });
        }
      });
      
      console.log('🎯 WS: All queued subscriptions processed');
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
          let accessToken;
          if (guest) {
            const result = await requestRefreshFromParent();
            accessToken = result.accessToken;
          } else {
            const result = await authorizeUser();
            accessToken = result.accessToken;
          }

          if (!accessToken) {
            console.error('❌ WS: No access token available');
            return;
          }

          // Create WebSocket with real token
          const ws = new WebSocket(`wss://hermes.altan.ai/ws?account_id=${accountId}&user_id=${accountId}&token=${accessToken}`);
          console.log('🔗 WS: Connecting to hermes.altan.ai with real token');
          wsRef.current = ws;

          window.hermesWs = ws;

          ws.onopen = () => {
            setIsOpen(true);
            console.log('🔗 WS: Connection established');
            console.log('🔍 WS: Waiting for server response...');
            
            // With hermes, the token is in the URL, so we can mark as secured immediately
            console.log('🔐 WS: Marking connection as secured (token in URL)');
            setSecuredWs(true);
            
            // Send authentication message
            console.log('🔐 WS: Sending authentication message:', {
              hasToken: !!accessToken,
              tokenLength: accessToken?.length,
              timestamp: new Date().toISOString(),
            });
            
            const authMessage = JSON.stringify({ type: 'authenticate', token: accessToken });
            console.log('📤 WS: Raw authentication message:', authMessage);
            
            ws.send(authMessage);
            console.log('✅ WS: Authentication message sent');
            
            // Set a timeout to check if we receive ACK
            setTimeout(() => {
              if (!securedWs) {
                console.warn('⚠️ WS: No ACK received after 5 seconds, connection may not be secured');
              }
            }, 5000);
          };

          ws.onclose = (event) => {
            console.log('🔗 WS: Connection closed', {
              code: event.code,
              reason: event.reason,
              wasClean: event.wasClean,
              timestamp: new Date().toISOString(),
            });
            
            if (wsRef.current) {
              console.log('🔗 WS: Closed by server');
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

            // Log the raw received event
            console.log('🔌 WS Event Raw:', {
              data: event.data,
              type: event.type,
              timestamp: new Date().toISOString(),
            });

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

            console.log('📡 WS Event Decoded:', {
              data,
              timestamp: new Date().toISOString(),
              eventType: data.type,
              isAck: data.type === 'ack',
            });

            // Print all incoming messages
            console.log('🔌 WS: Incoming message:', {
              rawData: rawData,
              parsedData: data,
              eventType: data.type,
              hasPayload: !!data.payload,
              payloadKeys: data.payload ? Object.keys(data.payload) : [],
              timestamp: new Date().toISOString(),
            });

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
                queueItems: subscriptionQueue.map(item => item.channel),
                timestamp: new Date().toISOString(),
              });
              
              subscriptionQueue.forEach(({ channel, callback, type }) => {
                console.log('📡 WS: Processing queued subscription:', {
                  channel,
                  type,
                  hasCallback: !!callback,
                  timestamp: new Date().toISOString(),
                });
                
                ws.send(
                  JSON.stringify({
                    type: 'subscription',
                    subscription: { type: type || 'l', mode: 's', elements: Array.isArray(channel) ? channel : [channel] },
                  }),
                );
                
                console.log('✅ WS: Queued subscription sent:', {
                  channel,
                  activeSubscriptions: [...activeSubscriptions, channel],
                  timestamp: new Date().toISOString(),
                });
                
                setActiveSubscriptions((current) => 
                  Array.isArray(channel) ? [...current, ...channel] : [...current, channel]
                );
                if (callback) {
                  callback();
                }
              });
              
              console.log('🎯 WS: All queued subscriptions processed:', {
                totalActiveSubscriptions: activeSubscriptions.length + subscriptionQueue.length,
                timestamp: new Date().toISOString(),
              });
              
              setSubscriptionQueue([]);
            } else {
              // Log all other events
              console.log('🔄 WS: Event received:', {
                type: data.type,
                entity: data.entity,
                action: data.action,
                payload: data.payload,
                timestamp: new Date().toISOString(),
              });
              
              console.log('🔄 WS Event Handled by handleWebSocketEvent:', {
                data,
                userId: user_id,
                timestamp: new Date().toISOString(),
              });
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
  }, [isAuthenticated, waitingToReconnect, isOpen, accountId, guest, authorizeUser, logout, user_id]);

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

  return <HermesWebSocketContext.Provider value={memoizedValue}>{children}</HermesWebSocketContext.Provider>;
};

export default memo(HermesWebSocketProvider);
