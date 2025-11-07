/**
 * Custom hook for managing WebSocket connection lifecycle
 * Follows Single Responsibility Principle
 */

import { useEffect, useRef, useState, useCallback } from 'react';

import { authorizeUser } from '../../../utils/axios';
import { handleAgentResponseEvent } from '../handlers/handleAgentResponse';
import { handleMessageEvent } from '../handlers/handleMessage';
import { handleTaskEvent } from '../handlers/handleTask';
import { handleThreadEvent } from '../handlers/handleThread';
import { handleWebSocketEvent } from '../ws';

/**
 * Parse WebSocket message data
 * @param {string|Blob} rawData - Raw WebSocket data
 * @returns {Promise<Object|null>} - Parsed data or null if error
 */
const parseWebSocketData = async (rawData) => {
  let dataString;

  if (typeof rawData === 'string') {
    dataString = rawData;
  } else if (rawData instanceof Blob) {
    dataString = await rawData.text();
  } else {
    console.error('❌ WS: Unexpected data type:', typeof rawData);
    return null;
  }

  try {
    return JSON.parse(dataString);
  } catch (parseError) {
    try {
      return JSON.parse(atob(dataString));
    } catch (base64Error) {
      console.error('❌ WS: Error parsing data:', {
        parseError: parseError.message,
        base64Error: base64Error.message,
        dataLength: dataString.length,
      });
      return null;
    }
  }
};

/**
 * Create WebSocket message handler with O(1) lookup performance
 * @param {WebSocket} ws - WebSocket instance
 * @param {string} user_id - User ID
 * @param {Function} onAck - Callback for ACK messages
 * @returns {Function} - Message handler function
 */
const createMessageHandler = (ws, user_id, onAck) => {
  // Handler map for exact type matches - O(1) lookup
  const exactHandlers = {
    ack: () => {
      console.log('🔐 WS: Received ACK, connection secured');
      onAck();
    },
    TASK_EVENT: handleTaskEvent, // Backward compatibility for old format
  };

  // Handler map for type prefixes - O(1) lookup via prefix extraction
  const prefixHandlers = {
    response: handleAgentResponseEvent,
    activation: handleAgentResponseEvent,
    message_part: handleAgentResponseEvent,
    message: handleMessageEvent,
    thread: handleThreadEvent,
    task: handleTaskEvent,
    plan: handleTaskEvent,
  };

  return async (event) => {
    if (!ws) return;

    const data = await parseWebSocketData(event.data);
    if (!data) return;

    // Fast path: Check special entities first
    if (data.entity === 'ServiceMetrics') {
      console.log('📊 WS ServiceMetrics Event:', data);
      return;
    }

    if (data.repo_name) {
      console.log('🔧 WS Preview Interface Event:', data);
      return;
    }

    // Fast path: O(1) type routing
    if (data.type) {
      // Exact match - O(1)
      const exactHandler = exactHandlers[data.type];
      if (exactHandler) {
        exactHandler(data);
        return;
      }

      // Prefix match - O(1) via direct lookup
      const dotIndex = data.type.indexOf('.');
      if (dotIndex !== -1) {
        const prefix = data.type.slice(0, dotIndex);
        const prefixHandler = prefixHandlers[prefix];
        if (prefixHandler) {
          prefixHandler(data);
          return;
        }
      }
    }

    // Default handler
    handleWebSocketEvent(data, user_id);
  };
};

/**
 * Hook for managing WebSocket connection
 * @param {Object} params - Hook parameters
 * @param {boolean} params.isAuthenticated - Whether user is authenticated
 * @param {string} params.accountId - Account ID
 * @param {string} params.user_id - User ID
 * @param {boolean} params.guest - Whether user is guest
 * @param {Function} params.logout - Logout function
 * @param {Function} params.onAck - Callback for ACK messages
 * @returns {Object} - WebSocket reference and connection state
 */
export const useWebSocketConnection = ({
  isAuthenticated,
  accountId,
  user_id,
  guest,
  logout,
  onAck,
}) => {
  const wsRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [waitingToReconnect, setWaitingToReconnect] = useState(null);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      setIsOpen(false);
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || waitingToReconnect || wsRef.current || isOpen || !accountId) {
      return;
    }

    const initializeWebSocket = async () => {
      try {
        const result = await authorizeUser();
        const accessToken = result.accessToken;

        if (!accessToken) {
          console.error('❌ WS: No access token available');
          return;
        }

        const ws = new WebSocket(
          `wss://hermes.altan.ai/ws?account_id=${accountId}&user_id=${accountId}&token=${accessToken}`,
        );
        wsRef.current = ws;
        window.hermesWs = ws;

        ws.onopen = () => {
          setIsOpen(true);
        };

        ws.onclose = () => {
          disconnectWebSocket();
          if (waitingToReconnect) return;
          setWaitingToReconnect(true);
          setTimeout(() => setWaitingToReconnect(null), 5000);
        };

        ws.onerror = (error) => {
          console.error('🔗 WS: Error:', {
            error,
            wsReadyState: ws.readyState,
            timestamp: new Date().toISOString(),
          });
          ws?.close();
        };

        ws.onmessage = createMessageHandler(ws, user_id, onAck);

        return () => {
          ws?.close();
        };
      } catch (error) {
        console.error('❌ WS: Failed to initialize WebSocket:', error);
        if (!guest) {
          logout();
        }
      }
    };

    initializeWebSocket();
  }, [
    isAuthenticated,
    waitingToReconnect,
    isOpen,
    accountId,
    guest,
    logout,
    user_id,
    disconnectWebSocket,
    onAck,
  ]);

  return {
    wsRef,
    isOpen,
    disconnectWebSocket,
  };
};
