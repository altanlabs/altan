// Common types used across RoomPromptInput components and hooks

export interface Agent {
  id: string;
  name: string;
}

export interface FileAttachment {
  file_name: string;
  mime_type: string;
  url?: string;
  preview?: string;
}

export interface Attachment {
  file_name: string;
  mime_type: string;
  url?: string;
}

export interface Altaner {
  components?: {
    items?: Array<{
      type: string;
      params?: {
        ids?: string[];
      };
    }>;
  };
}

export interface RoomMember {
  member?: {
    member_type?: string;
    agent?: {
      id?: string;
    };
    agent_id?: string;
  };
}

export interface Members {
  byId?: Record<string, RoomMember>;
}

