/**
 * Room Mode Types
 */
export type RoomMode = 'ephemeral' | 'tabs';

/**
 * Main Room Configuration
 */
export interface RoomConfig {
  mode: RoomMode;
  roomId: string;
  
  showMembers?: boolean;
  showSettings?: boolean;
  showConversationHistory?: boolean;
  showCloseButton?: boolean;
  showFullscreenButton?: boolean;
  showSidebarButton?: boolean;
  
  // Behavior
  initialMessage?: string;
  title?: string;
  description?: string;
  suggestions?: string[];
  renderCredits?: boolean;
  renderFeedback?: boolean;
  showModeSelector?: boolean;
  
  // Callbacks
  onClose?: () => void;
  onFullscreen?: () => void;
  onSidebar?: () => void;
}

/**
 * Thread Types
 */
export interface Thread {
  id: string;
  name: string;
  is_main: boolean;
  is_temporary?: boolean;
  created_at: string;
  parent?: {
    thread_id: string;
    message_id: string;
  };
}

/**
 * Message Types
 */
export interface Message {
  id: string;
  thread_id: string;
  member_id: string;
  content: string;
  created_at: string;
  response_id?: string;
}

/**
 * Tab Types (for Tabs Mode)
 */
export interface Tab {
  id: string;
  threadId: string;
  threadName: string;
  isMainThread: boolean;
  isActive: boolean;
}

/**
 * File Attachment Types
 */
export interface FileAttachment {
  file_name: string;
  mime_type: string;
  preview?: string;
  url?: string;
}

/**
 * Room Initialization State
 */
export interface RoomInitState {
  initialized: boolean;
  loading: boolean;
  error: Error | null;
}

/**
 * Ephemeral Thread State
 */
export interface EphemeralThreadState {
  tempThread: Thread | null;
  isTemporary: boolean;
  isPromoted: boolean;
}

