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
import { authorizeUser } from '../../utils/axios';

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

const WebSocketProvider = ({ children }) => {
  const generalAccountId = useSelector(selectAccountId);
  const roomAccountId = useSelector(selectRoomAccountId);
  const accountId = generalAccountId || roomAccountId;
  const [isOpen, setIsOpen] = useState(false);
  const [securedWs, setSecuredWs] = useState(false);
  const { isAuthenticated, logout, user } = useAuthContext();

  const user_id = user?.id;

  const wsRef = useRef(null);
  const [waitingToReconnect, setWaitingToReconnect] = useState(null);
  const [subscriptionQueue, setSubscriptionQueue] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);

  const unsubscribe = useCallback(
    (channels, callback = null, type = 'l') => {
      // console.log("WS: UNSUBSCRIBE - ", channels, activeSubscriptions.length);
      const filteredChannels = Array.isArray(channels) ? channels : [channels]; // .filter(c => (!!c && activeSubscriptions.includes(c)));
      // console.log("WS: UNSUBSCRIBE - apres ", filteredChannels);

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
      // console.log("WS: SUBSCRIBE - ", channels);
      const filteredChannels = (Array.isArray(channels) ? channels : [channels]).filter(
        (c) =>
          !!c &&
          !activeSubscriptions.includes(c) &&
          !subscriptionQueue.some((item) => item.channel === c),
      );
      if (!filteredChannels.length) {
        // console.log(`WS: Already subscribed to or queuing ${filteredChannels}`);
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
      const ws = new WebSocket(`wss://api.altan.ai/platform/ws/account/${accountId}/ws`);
      wsRef.current = ws;

      window.clientWs = ws;

      ws.onopen = () => {
        setIsOpen(true);
        // console.log('ws connection established');

        // Use authorizeUser for both user and guest sessions
        authorizeUser()
          .then(({ accessToken }) => {
            ws.send(JSON.stringify({ type: 'authenticate', token: accessToken }));
          })
          .catch((error) => {
            console.error('WebSocket authentication failed:', error);
            logout();
          });
      };

      ws.onclose = () => {
        // console.log('ws connection closed');
        if (wsRef.current) {
          // console.log('ws closed by server');
        } else {
          // console.log('ws closed by app component unmount');
          // return;
        }
        disconnectWebSocket();
        if (waitingToReconnect) {
          return;
        }
        setWaitingToReconnect(true);
        setTimeout(() => setWaitingToReconnect(null), 5000);
      };

      ws.onerror = () => {
        // console.error('ws error:', error);
        if (ws) {
          ws.close();
        }
      };

      ws.onmessage = async (event) => {
        if (!ws) {
          return;
        }
        const data = JSON.parse(atob(await event.data.text()));
        // case 'heartbeat':
        //   memberSocket.send(JSON.stringify({ "type": "heartbeat_ack", "data": "pong" }));
        //   break;
        if (data.entity === 'ServiceMetrics') {
          //     ws.subscribe('sa-service-metrics:*', null, 'p');
          // console.log('@ws:ServiceMetrics', data);
        } else if (data.repo_name) {
          // console.log('@ws event from preview interface', data);
        } else if (data.type === 'ack') {
          // console.log('ws connection secured');
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
          handleWebSocketEvent(data, user_id);
        }
      };

      return () => {
        if (ws) {
          ws.close();
        }
      };
    }
  }, [waitingToReconnect, accountId]);

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

  return <WebSocketContext.Provider value={memoizedValue}>{children}</WebSocketContext.Provider>;
};

export default memo(WebSocketProvider);
