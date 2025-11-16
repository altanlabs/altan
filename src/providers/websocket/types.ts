/**
 * TypeScript types and interfaces for WebSocket functionality
 */

import type React from 'react';
import type WebSocket from 'ws';

// Base WebSocket data structure
export interface WebSocketData {
  type?: string;
  entity?: string;
  repo_name?: string;
  data?: unknown;
  user_id?: string;
  timestamp?: number;
  [key: string]: unknown;
}

export interface SubscriptionMessage {
  type: 'subscription';
  subscription: {
    type: string;
    mode: 's' | 'u';
    elements: string[];
  };
}

export interface SubscriptionQueueItem {
  channel: string;
  callback?: () => void;
  type: string;
}

export interface WebSocketConnectionParams {
  isAuthenticated: boolean;
  accountId: string | null;
  user_id: string | null;
  logout: () => void;
  onAck: () => void | Promise<void>;
}

export interface WebSocketConnectionReturn {
  wsRef: React.RefObject<WebSocket | null>;
  isOpen: boolean;
  disconnectWebSocket: () => void;
}

export interface WebSocketSubscriptionsReturn {
  initialize: (ws: React.RefObject<WebSocket | null>, isOpen: boolean) => void;
  subscribe: (channel: string | string[], callback?: () => void) => void;
  unsubscribe: (channels: string | string[], callback?: (() => void) | null, type?: string) => void;
  activeSubscriptions: string[];
  handleAck: () => void;
}

export interface HermesWebSocketContextValue {
  websocket: WebSocket | null;
  isOpen: boolean;
  activeSubscriptions: string[];
  disconnect: () => void;
  subscribe: (channel: string | string[], callback?: () => void) => void;
  unsubscribe: (channels: string | string[], callback?: (() => void) | null, type?: string) => void;
}

export type WebSocketEventHandler = (data: WebSocketData, userId?: string) => void;

