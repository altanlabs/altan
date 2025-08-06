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
  const { isAuthenticated, logout, user, guest, authenticated } = useAuthContext();

  const user_id = user?.id;

  const wsRef = useRef(null);
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
        wsRef.current.send(
          JSON.stringify({
            type: 'subscription',
            subscription: { type, mode: 'u', elements: filteredChannels },
          }),
        );
        setActiveSubscriptions((current) => {
          const fil = filteredChannels.filter((c) => current.includes(c));
          if (fil?.length && !!wsRef.current) {
            wsRef.current.send(
              JSON.stringify({
                type: 'subscription',
                subscription: { type, mode: 'u', elements: fil },
              }),
            );
          }
          return current.filter((s) => !filteredChannels.includes(s));
        });
        if (!!callback) {
          callback();
        }
      }
    },
    [securedWs, setActiveSubscriptions],
  );

  const subscribe = useCallback(
    (channels, callback = null, type = 'l') => {
      const filteredChannels = (Array.isArray(channels) ? channels : [channels]).filter(
        (c) =>
          !!c &&
          !activeSubscriptions.includes(c) &&
          !subscriptionQueue.some((item) => item.channel === c),
      );
      if (!filteredChannels.length) {
        return;
      }

      if (!!wsRef.current && wsRef.current.readyState === WebSocket.OPEN && securedWs) {
        wsRef.current.send(
          JSON.stringify({
            type: 'subscription',
            subscription: { type, mode: 's', elements: filteredChannels },
          }),
        );
        setActiveSubscriptions((current) => [...current, ...filteredChannels]);
        if (!!callback) {
          callback();
        }
      } else {
        // Queue the subscription request
        setSubscriptionQueue((current) => [
          ...current,
          ...filteredChannels.map((channel) => ({ channel, callback, type })),
        ]);
      }
    },
    [securedWs, activeSubscriptions, setActiveSubscriptions, subscriptionQueue],
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
        wsRef.current.send(
          JSON.stringify({
            type: 'subscription',
            subscription: { type, mode: 's', elements: [channel] },
          }),
        );
        setActiveSubscriptions((current) => [...current, channel]);
        if (callback) {
          callback();
        }
      });
      setSubscriptionQueue([]);
    }
  }, [securedWs, subscriptionQueue]);

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
      // Connect to Hermes WebSocket endpoint
      const ws = new WebSocket('wss://hermes.altan.ai/ws');
      wsRef.current = ws;

      // Store reference for debugging (optional)
      window.hermesWs = ws;

      ws.onopen = () => {
        setIsOpen(true);
        // console.log('Hermes WebSocket connection established');

        // Check if this is a guest session
        const isGuestSession = authenticated.guest && guest;
        if (isGuestSession) {
          // For guest sessions, request token from parent widget
          requestRefreshFromParent('guest')
            .then(({ accessToken }) => {
              if (accessToken) {
                ws.send(JSON.stringify({ type: 'authenticate', token: accessToken }));
              } else {
                throw new Error('No guest token received');
              }
            })
            .catch(() => {
              // console.error('Hermes WebSocket guest authentication failed:', error);
            });
        } else {
          // Regular user authentication
          authorizeUser()
            .then(({ accessToken }) => {
              ws.send(JSON.stringify({ type: 'authenticate', token: accessToken }));
            })
            .catch(() => logout());
        }
      };

      ws.onclose = () => {
        // console.log('Hermes WebSocket connection closed');
        disconnectWebSocket();
        if (waitingToReconnect) {
          return;
        }
        setWaitingToReconnect(true);
        setTimeout(() => setWaitingToReconnect(null), 5000);
      };

      ws.onerror = () => {
        // console.error('Hermes WebSocket error');
        if (ws) {
          ws.close();
        }
      };

      ws.onmessage = async (event) => {
        if (!ws) {
          return;
        }
        const data = JSON.parse(atob(await event.data.text()));
        if (data.type === 'ack') {
          // console.log('Hermes WebSocket connection secured');
          setSecuredWs(true);
          // Process the subscription queue now that the connection is secured
          subscriptionQueue.forEach(({ channel, callback }) => {
            ws.send(
              JSON.stringify({
                type: 'subscription',
                subscription: { type: 'l', mode: 's', elements: [channel] },
              }),
            );
            setActiveSubscriptions((current) => [...current, channel]);
            if (callback) {
              callback();
            }
          });
          setSubscriptionQueue([]);
        } else {
          // Handle Hermes-specific events or reuse the same handler
          handleWebSocketEvent(data, user_id);
        }
      };

      return () => {
        if (ws) {
          ws.close();
        }
      };
    }
  }, [waitingToReconnect, accountId, isAuthenticated, isOpen, authenticated, guest, logout, user_id, subscriptionQueue]);

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
