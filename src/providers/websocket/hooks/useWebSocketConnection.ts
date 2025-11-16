/**
 * Custom hook for managing WebSocket connection lifecycle
 * Follows Single Responsibility Principle
 */

import { useEffect, useRef, useState, useCallback } from 'react';

import { authorizeUser } from '../../../utils/axios';
import { handleAgentResponseEvent } from '../handlers/agentResponse/index';
import { handleAltanerEvent } from '../handlers/altaner';
import { handleAltanerComponentEvent } from '../handlers/altanerComponent';
import { handleAuthorizationRequestEvent } from '../handlers/authorization';
import { handleCommitEvent } from '../handlers/commit';
import { handleConnectionEvent } from '../handlers/connection';
import { handleDeploymentEvent } from '../handlers/deployment';
import { handleInterfaceEvent } from '../handlers/interface';
import { handleMessageEvent } from '../handlers/message';
import { handleRoomEvent } from '../handlers/room';
import { handleRoomMemberEvent } from '../handlers/roomMember';
import { handleTaskEvent } from '../handlers/task';
import { handleThreadEvent } from '../handlers/thread';
import type { WebSocketConnectionParams, WebSocketConnectionReturn, WebSocketData } from '../types';
import { handleWebSocketEvent } from '../ws';

/**
 * Parse WebSocket message data
 * @param rawData - Raw WebSocket data
 * @returns Parsed data or null if error
 */
const parseWebSocketData = async (rawData: string | Blob): Promise<WebSocketData | null> => {
  let dataString: string;

  if (typeof rawData === 'string') {
    dataString = rawData;
  } else if (rawData instanceof Blob) {
    dataString = await rawData.text();
  } else {
    // eslint-disable-next-line no-console
    console.error('❌ WS: Unexpected data type:', typeof rawData);
    return null;
  }

  try {
    return JSON.parse(dataString) as WebSocketData;
  } catch (parseError) {
    try {
      return JSON.parse(atob(dataString)) as WebSocketData;
    } catch (base64Error) {
      // eslint-disable-next-line no-console
      console.error('❌ WS: Error parsing data:', {
        parseError: parseError instanceof Error ? parseError.message : 'Unknown error',
        base64Error: base64Error instanceof Error ? base64Error.message : 'Unknown error',
        dataLength: dataString.length,
      });
      return null;
    }
  }
};

/**
 * Create WebSocket message handler with O(1) lookup performance
 * @param ws - WebSocket instance
 * @param user_id - User ID
 * @param onAck - Callback for ACK messages
 * @returns Message handler function
 */
const createMessageHandler = (
  ws: WebSocket,
  user_id: string | null,
  onAck: () => void,
): (event: MessageEvent) => Promise<void> => {
  // Handler map for exact type matches - O(1) lookup
  const exactHandlers: Record<string, (data: WebSocketData) => void> = {
    ack: () => {
      // eslint-disable-next-line no-console
      console.log('🔐 WS: Received ACK, connection secured');
      onAck();
    },
    TASK_EVENT: (data: WebSocketData) => handleTaskEvent(data as never), // Backward compatibility for old format
  };

  // Handler map for type prefixes - O(1) lookup via prefix extraction
  const prefixHandlers: Record<string, (data: WebSocketData) => void> = {
    response: (data: WebSocketData) => handleAgentResponseEvent(data as never),
    activation: (data: WebSocketData) => handleAgentResponseEvent(data as never),
    message_part: (data: WebSocketData) => handleAgentResponseEvent(data as never),
    message: (data: WebSocketData) => handleMessageEvent(data),
    thread: (data: WebSocketData) => handleThreadEvent(data),
    task: (data: WebSocketData) => handleTaskEvent(data as never),
    plan: (data: WebSocketData) => handleTaskEvent(data as never),
    room_member: (data: WebSocketData) => handleRoomMemberEvent(data, user_id ?? ''),
    room: (data: WebSocketData) => handleRoomEvent(data as never),
    connection: (data: WebSocketData) => handleConnectionEvent(data as never),
    authorization_request: (data: WebSocketData) => handleAuthorizationRequestEvent(data as never),
    commit: (data: WebSocketData) => handleCommitEvent(data as never),
    deployment: (data: WebSocketData) => handleDeploymentEvent(data as never),
    altaner_component: (data: WebSocketData) => handleAltanerComponentEvent(data as never),
    altaner: (data: WebSocketData) => handleAltanerEvent(data as never),
    interface: (data: WebSocketData) => handleInterfaceEvent(data as never),
  };

  return async (event: MessageEvent): Promise<void> => {
    if (!ws) return;

    const data = await parseWebSocketData(event.data as string | Blob);
    if (!data) return;

    // Fast path: Check special entities first
    if (data.entity === 'ServiceMetrics') {
      // eslint-disable-next-line no-console
      console.log('📊 WS ServiceMetrics Event:', data);
      return;
    }

    if (data.repo_name) {
      // eslint-disable-next-line no-console
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
    void handleWebSocketEvent(data as never, user_id);
  };
};

/**
 * Hook for managing WebSocket connection
 * @param params - Hook parameters
 * @returns WebSocket reference and connection state
 */
export const useWebSocketConnection = ({
  isAuthenticated,
  accountId,
  user_id,
  logout,
  onAck,
}: WebSocketConnectionParams): WebSocketConnectionReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [waitingToReconnect, setWaitingToReconnect] = useState<boolean | null>(null);

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

    const initializeWebSocket = async (): Promise<void | (() => void)> => {
      try {
        const result = await authorizeUser();
        const accessToken = result.accessToken;

        if (!accessToken) {
          // eslint-disable-next-line no-console
          console.error('❌ WS: No access token available');
          return;
        }

        const ws = new WebSocket(
          `wss://hermes.altan.ai/ws?account_id=${accountId}&user_id=${accountId}&token=${accessToken}`,
        );
        wsRef.current = ws;
        
        // Store reference globally for debugging purposes
        interface WindowWithHermesWs extends Window {
          hermesWs?: WebSocket;
        }
        (window as WindowWithHermesWs).hermesWs = ws;

        ws.onopen = () => {
          setIsOpen(true);
        };

        ws.onclose = () => {
          disconnectWebSocket();
          if (waitingToReconnect) return;
          setWaitingToReconnect(true);
          setTimeout(() => setWaitingToReconnect(null), 5000);
        };

        ws.onerror = (error: Event) => {
          // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.error('❌ WS: Failed to initialize WebSocket:', error);
        logout();
      }
    };

    void initializeWebSocket();
  }, [
    isAuthenticated,
    waitingToReconnect,
    isOpen,
    accountId,
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

