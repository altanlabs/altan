/**
 * Component prop types for SDK UI components
 */

import { CSSProperties, ReactNode } from 'react';
import type { AgentState } from './common';
import type { Message } from './common';
import type { ClientTools } from './common';

// ============================================================================
// Orb Component Props
// ============================================================================

export interface OrbProps {
  colors?: [string, string];
  seed?: number;
  agentState?: AgentState;
  className?: string;
  static?: boolean;
}

export interface AgentOrbProps {
  size?: number;
  agentId?: string;
  colors?: [string, string];
  agentState?: AgentState;
  isStatic?: boolean;
  onClick?: () => void;
}

// ============================================================================
// Button Component Props
// ============================================================================

export interface VoiceCallButtonProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  startLabel?: string;
  stopLabel?: string;
  connectingLabel?: string;
}

export interface VoiceCallCardProps {
  size?: number;
  colors?: [string, string];
  showAgentName?: boolean;
  className?: string;
  style?: CSSProperties;
}

// ============================================================================
// Conversation Component Props
// ============================================================================

export interface ConversationProps {
  maxHeight?: string;
  className?: string;
  style?: CSSProperties;
  externalMessages?: Message[] | null;
}

export interface ConversationWithMessagesProps {
  agentId: string;
  clientTools?: ClientTools;
  overrides?: Record<string, unknown>;
  maxHeight?: string;
  className?: string;
  style?: CSSProperties;
}

export interface ConversationBarProps {
  className?: string;
  style?: CSSProperties;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onMessage?: (message: { source: string; message: string }) => void;
  onSendMessage?: (message: string) => void;
}

export interface LiveWaveformProps {
  active: boolean;
  barCount?: number;
}

