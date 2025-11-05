/**
 * OpenAI Realtime API specific types
 * Based on: https://platform.openai.com/docs/api-reference/realtime
 */

// ============================================================================
// OpenAI Realtime Event Types
// ============================================================================

export interface OpenAIRealtimeEvent {
  type: string;
  event_id?: string;
  
  // ========================================
  // Item-related fields
  // ========================================
  item?: {
    id?: string;
    object?: string;
    role?: string;
    type?: string;
    status?: string;
    content?: Array<{
      type: string;
      transcript?: string;
      text?: string;
      audio?: string; // Base64 encoded
      format?: string;
      [key: string]: unknown;
    }>;
  };
  item_id?: string; // Used in many events to reference an item
  previous_item_id?: string | null; // For maintaining ordering
  
  // ========================================
  // Transcript and delta fields
  // ========================================
  delta?: string; // For streaming updates (text, audio, arguments, etc.)
  transcript?: string; // For completed transcription
  text?: string; // For completed text output
  
  // ========================================
  // Content indexing fields
  // ========================================
  content_index?: number; // Index of content part in item's content array
  output_index?: number; // Index of output item in response
  
  // ========================================
  // Audio-related fields
  // ========================================
  audio_start_ms?: number; // Milliseconds from start of audio
  audio_end_ms?: number; // Milliseconds from start of audio
  
  // ========================================
  // Transcription segment fields
  // ========================================
  id?: string; // Segment identifier
  speaker?: string; // Detected speaker label
  start?: number; // Start time in seconds
  end?: number; // End time in seconds
  
  // ========================================
  // Transcription quality fields
  // ========================================
  logprobs?: Array<{
    token?: string;
    logprob?: number;
    [key: string]: unknown;
  }>;
  obfuscation?: string; // Obfuscation marker for sensitive data
  
  // ========================================
  // Function/Tool call fields
  // ========================================
  name?: string; // Function/tool name
  call_id?: string; // Function call identifier
  arguments?: string; // JSON-encoded arguments
  
  // ========================================
  // Content part fields
  // ========================================
  part?: {
    type?: string;
    text?: string;
    audio?: string;
    transcript?: string;
    [key: string]: unknown;
  };
  
  // ========================================
  // Response fields
  // ========================================
  response?: {
    id?: string;
    object?: string;
    status?: string;
    status_details?: unknown;
    conversation_id?: string;
    output_modalities?: string[];
    max_output_tokens?: string | number;
    output?: Array<{
      id?: string;
      object?: string;
      type?: string;
      status?: string;
      role?: string;
      content?: Array<{
        type: string;
        text?: string;
        audio?: string;
        transcript?: string;
        [key: string]: unknown;
      }>;
      [key: string]: unknown;
    }>;
    audio?: {
      output?: {
        format?: {
          type?: string;
          rate?: number;
        };
        voice?: string;
      };
    };
    usage?: {
      total_tokens?: number;
      input_tokens?: number;
      output_tokens?: number;
      input_token_details?: {
        text_tokens?: number;
        audio_tokens?: number;
        image_tokens?: number;
        cached_tokens?: number;
        cached_tokens_details?: {
          text_tokens?: number;
          audio_tokens?: number;
          image_tokens?: number;
        };
      };
      output_token_details?: {
        text_tokens?: number;
        audio_tokens?: number;
      };
    };
    metadata?: unknown;
    [key: string]: unknown;
  };
  response_id?: string; // Response identifier used in many events
  
  // ========================================
  // Usage fields (for transcription)
  // ========================================
  usage?: {
    type?: string;
    total_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
    input_token_details?: {
      text_tokens?: number;
      audio_tokens?: number;
    };
    [key: string]: unknown;
  };
  
  // ========================================
  // Error fields
  // ========================================
  error?: {
    type?: string;
    code?: string;
    message: string;
    param?: string | null;
    [key: string]: unknown;
  };
  
  // ========================================
  // Session fields
  // ========================================
  session?: {
    id?: string;
    object?: string;
    model?: string;
    modalities?: string[];
    instructions?: string;
    voice?: string;
    input_audio_format?: string;
    output_audio_format?: string;
    input_audio_transcription?: {
      model?: string;
    };
    turn_detection?: {
      type?: string;
      threshold?: number;
      prefix_padding_ms?: number;
      silence_duration_ms?: number;
      create_response?: boolean;
    };
    tools?: Array<{
      type?: string;
      name?: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
    tool_choice?: string;
    temperature?: number;
    max_response_output_tokens?: number | string;
    [key: string]: unknown;
  };
  
  // ========================================
  // Rate limit fields
  // ========================================
  rate_limits?: Array<{
    name?: string;
    limit?: number;
    remaining?: number;
    reset_seconds?: number;
  }>;
  
  // Extensible for any other event-specific fields
  [key: string]: unknown;
}

// ============================================================================
// OpenAI Session Configuration
// ============================================================================

export interface OpenAISessionConfig {
  model?: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  instructions?: string;
  modalities?: Array<'text' | 'audio'>;
  input_audio_format?: 'pcm16' | 'g711_ulaw' | 'g711_alaw';
  output_audio_format?: 'pcm16' | 'g711_ulaw' | 'g711_alaw';
  input_audio_transcription?: {
    model?: string;
  };
  turn_detection?: {
    type: 'server_vad';
    threshold?: number;
    prefix_padding_ms?: number;
    silence_duration_ms?: number;
  };
  tools?: Array<{
    type: 'function';
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  }>;
  temperature?: number;
  max_response_output_tokens?: number;
}

// ============================================================================
// OpenAI Event Types (Complete Enumeration)
// Based on: https://platform.openai.com/docs/api-reference/realtime-server-events
// ============================================================================

export const OpenAIEventTypes = {
  // ========================================
  // Session events
  // ========================================
  SESSION_CREATED: 'session.created',
  SESSION_UPDATED: 'session.updated',
  
  // ========================================
  // Conversation events
  // ========================================
  CONVERSATION_CREATED: 'conversation.created',
  CONVERSATION_ITEM_CREATED: 'conversation.item.created',
  CONVERSATION_ITEM_ADDED: 'conversation.item.added',
  CONVERSATION_ITEM_DONE: 'conversation.item.done',
  CONVERSATION_ITEM_RETRIEVED: 'conversation.item.retrieved',
  CONVERSATION_ITEM_TRUNCATED: 'conversation.item.truncated',
  CONVERSATION_ITEM_DELETED: 'conversation.item.deleted',
  
  // ========================================
  // Input Audio Transcription events
  // ========================================
  CONVERSATION_ITEM_INPUT_AUDIO_TRANSCRIPTION_COMPLETED: 'conversation.item.input_audio_transcription.completed',
  CONVERSATION_ITEM_INPUT_AUDIO_TRANSCRIPTION_DELTA: 'conversation.item.input_audio_transcription.delta',
  CONVERSATION_ITEM_INPUT_AUDIO_TRANSCRIPTION_SEGMENT: 'conversation.item.input_audio_transcription.segment',
  CONVERSATION_ITEM_INPUT_AUDIO_TRANSCRIPTION_FAILED: 'conversation.item.input_audio_transcription.failed',
  
  // ========================================
  // Input Audio Buffer events
  // ========================================
  INPUT_AUDIO_BUFFER_COMMITTED: 'input_audio_buffer.committed',
  INPUT_AUDIO_BUFFER_CLEARED: 'input_audio_buffer.cleared',
  INPUT_AUDIO_BUFFER_SPEECH_STARTED: 'input_audio_buffer.speech_started',
  INPUT_AUDIO_BUFFER_SPEECH_STOPPED: 'input_audio_buffer.speech_stopped',
  INPUT_AUDIO_BUFFER_TIMEOUT_TRIGGERED: 'input_audio_buffer.timeout_triggered',
  
  // ========================================
  // Output Audio Buffer events (WebRTC only)
  // ========================================
  OUTPUT_AUDIO_BUFFER_STARTED: 'output_audio_buffer.started',
  OUTPUT_AUDIO_BUFFER_STOPPED: 'output_audio_buffer.stopped',
  OUTPUT_AUDIO_BUFFER_CLEARED: 'output_audio_buffer.cleared',
  
  // ========================================
  // Response events
  // ========================================
  RESPONSE_CREATED: 'response.created',
  RESPONSE_DONE: 'response.done',
  
  // ========================================
  // Response Output Item events
  // ========================================
  RESPONSE_OUTPUT_ITEM_ADDED: 'response.output_item.added',
  RESPONSE_OUTPUT_ITEM_DONE: 'response.output_item.done',
  
  // ========================================
  // Response Content Part events
  // ========================================
  RESPONSE_CONTENT_PART_ADDED: 'response.content_part.added',
  RESPONSE_CONTENT_PART_DONE: 'response.content_part.done',
  
  // ========================================
  // Response Output Text events
  // ========================================
  RESPONSE_OUTPUT_TEXT_DELTA: 'response.output_text.delta',
  RESPONSE_OUTPUT_TEXT_DONE: 'response.output_text.done',
  
  // ========================================
  // Response Output Audio Transcript events
  // ========================================
  RESPONSE_OUTPUT_AUDIO_TRANSCRIPT_DELTA: 'response.output_audio_transcript.delta',
  RESPONSE_OUTPUT_AUDIO_TRANSCRIPT_DONE: 'response.output_audio_transcript.done',
  
  // ========================================
  // Response Output Audio events
  // ========================================
  RESPONSE_OUTPUT_AUDIO_DELTA: 'response.output_audio.delta',
  RESPONSE_OUTPUT_AUDIO_DONE: 'response.output_audio.done',
  
  // ========================================
  // Response Function Call events
  // ========================================
  RESPONSE_FUNCTION_CALL_ARGUMENTS_DELTA: 'response.function_call_arguments.delta',
  RESPONSE_FUNCTION_CALL_ARGUMENTS_DONE: 'response.function_call_arguments.done',
  
  // ========================================
  // Response MCP (Model Context Protocol) Call events
  // ========================================
  RESPONSE_MCP_CALL_ARGUMENTS_DELTA: 'response.mcp_call_arguments.delta',
  RESPONSE_MCP_CALL_ARGUMENTS_DONE: 'response.mcp_call_arguments.done',
  RESPONSE_MCP_CALL_IN_PROGRESS: 'response.mcp_call.in_progress',
  RESPONSE_MCP_CALL_COMPLETED: 'response.mcp_call.completed',
  RESPONSE_MCP_CALL_FAILED: 'response.mcp_call.failed',
  
  // ========================================
  // MCP List Tools events
  // ========================================
  MCP_LIST_TOOLS_IN_PROGRESS: 'mcp_list_tools.in_progress',
  MCP_LIST_TOOLS_COMPLETED: 'mcp_list_tools.completed',
  MCP_LIST_TOOLS_FAILED: 'mcp_list_tools.failed',
  
  // ========================================
  // Rate Limit events
  // ========================================
  RATE_LIMITS_UPDATED: 'rate_limits.updated',
  
  // ========================================
  // Error events
  // ========================================
  ERROR: 'error',
} as const;

export type OpenAIEventType = typeof OpenAIEventTypes[keyof typeof OpenAIEventTypes];

