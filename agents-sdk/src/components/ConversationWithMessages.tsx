/**
 * ConversationWithMessages - Wrapper that manages message state
 * Connects Conversation display + ConversationBar
 */

import { useState, useCallback } from 'react';

import { Conversation } from './Conversation';
import { VoiceAgentProvider } from '../providers/VoiceAgentProvider';
import type { ConversationWithMessagesProps, Message, OpenAIRealtimeEvent } from '../types';
import { OpenAIEventTypes } from '../types';

export const ConversationWithMessages: React.FC<ConversationWithMessagesProps> = ({
  agentId,
  clientTools = {},
  overrides = {},
  maxHeight = '600px',
  className = '',
  style = {},
}) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleMessage = useCallback((event: OpenAIRealtimeEvent | any) => {
    console.log('[ConversationWithMessages] Event:', event.type, event);
    
    // ========================================
    // ELEVENLABS EVENTS (Simple format)
    // ========================================
    
    // ElevenLabs sends events like: { source: 'ai' | 'user', message: '...' }
    if (event.source && event.message && !event.type) {
      const role = event.source === 'ai' ? 'assistant' : 'user';
      console.log(`[ConversationWithMessages] ✅ ElevenLabs ${role} message:`, event.message);
      
      setMessages((prev) => {
        // Avoid duplicates
        const alreadyExists = prev.some(m => m.role === role && m.content === event.message);
        if (alreadyExists) return prev;
        return [...prev, { role, content: event.message }];
      });
      return;
    }
    
    // ========================================
    // OPENAI REALTIME EVENTS (Complex format)
    // ========================================
    // USER MESSAGES
    // ========================================
    
    // Primary: User audio transcription completed (most reliable)
    if (event.type === OpenAIEventTypes.CONVERSATION_ITEM_INPUT_AUDIO_TRANSCRIPTION_COMPLETED) {
      const transcript = event.transcript;
      if (transcript) {
        console.log('[ConversationWithMessages] ✅ User transcript (completed):', transcript);
        setMessages((prev) => [...prev, { role: 'user', content: transcript }]);
      }
    }
    
    // Fallback: conversation.item.added - user message added to conversation
    if (event.type === OpenAIEventTypes.CONVERSATION_ITEM_ADDED && 
        event.item?.role === 'user' && 
        event.item?.type === 'message') {
      const audioContent = event.item.content?.find(c => c.type === 'input_audio' || c.type === 'input_text');
      const transcript = audioContent?.transcript || audioContent?.text;
      if (transcript) {
        console.log('[ConversationWithMessages] ✅ User message (added):', transcript);
        setMessages((prev) => {
          // Avoid duplicates - check if we already have this message
          const alreadyExists = prev.some(m => m.role === 'user' && m.content === transcript);
          if (alreadyExists) return prev;
          return [...prev, { role: 'user', content: transcript }];
        });
      }
    }
    
    // ========================================
    // ASSISTANT MESSAGES (Streaming)
    // ========================================
    
    // Assistant transcript streaming (delta)
    if (event.type === OpenAIEventTypes.RESPONSE_OUTPUT_AUDIO_TRANSCRIPT_DELTA && event.delta) {
      console.log('[ConversationWithMessages] 💬 Assistant delta:', event.delta);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && last.streaming) {
          return [...prev.slice(0, -1), { ...last, content: (last.content || '') + event.delta }];
        }
        return [...prev, { role: 'assistant', content: event.delta!, streaming: true }];
      });
    }
    
    // Assistant transcript done (mark as complete)
    if (event.type === OpenAIEventTypes.RESPONSE_OUTPUT_AUDIO_TRANSCRIPT_DONE) {
      console.log('[ConversationWithMessages] ✅ Assistant transcript done');
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.streaming) {
          return [...prev.slice(0, -1), { ...last, streaming: false }];
        }
        return prev;
      });
    }
    
    // ========================================
    // TEXT RESPONSES (for text-only mode)
    // ========================================
    
    // Assistant text output streaming
    if (event.type === OpenAIEventTypes.RESPONSE_OUTPUT_TEXT_DELTA && event.delta) {
      console.log('[ConversationWithMessages] 📝 Text delta:', event.delta);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && last.streaming) {
          return [...prev.slice(0, -1), { ...last, content: (last.content || '') + event.delta }];
        }
        return [...prev, { role: 'assistant', content: event.delta!, streaming: true }];
      });
    }
    
    // Assistant text done
    if (event.type === OpenAIEventTypes.RESPONSE_OUTPUT_TEXT_DONE) {
      console.log('[ConversationWithMessages] ✅ Text output done');
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.streaming) {
          return [...prev.slice(0, -1), { ...last, streaming: false }];
        }
        return prev;
      });
    }
    
    // ========================================
    // RESPONSE COMPLETE (Fallback)
    // ========================================
    
    // Response done - full response complete (use as fallback if streaming didn't work)
    if (event.type === OpenAIEventTypes.RESPONSE_DONE && event.response?.output) {
      console.log('[ConversationWithMessages] 🏁 Response done:', event.response);
      const outputs = Array.isArray(event.response.output) ? event.response.output : [];
      outputs.forEach((output) => {
        if (output.type === 'message' && output.role === 'assistant') {
          const audioContent = output.content?.find((c) => c.type === 'output_audio');
          const textContent = output.content?.find((c) => c.type === 'text' || c.type === 'output_text');
          const content = audioContent?.transcript || textContent?.text;
          
          if (content) {
            // Only add if not already present (avoid duplicate from streaming)
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              // If we already have this exact content, don't add it again
              if (last && last.role === 'assistant' && last.content === content) {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, streaming: false } : m);
              }
              // If we have streaming content, replace it
              if (last && last.streaming) {
                return prev.filter(m => !m.streaming).concat({ role: 'assistant', content });
              }
              return [...prev, { role: 'assistant', content }];
            });
          }
        }
      });
    }
  }, []);

  // Reset messages on disconnect
  const handleDisconnect = useCallback(() => {
    console.log('[ConversationWithMessages] Disconnected - keeping messages');
    // Keep messages for review
  }, []);

  return (
    <VoiceAgentProvider
      agentId={agentId}
      clientTools={clientTools}
      overrides={overrides}
      onMessage={handleMessage}
      onDisconnect={handleDisconnect}
    >
      <Conversation 
        maxHeight={maxHeight}
        className={className}
        style={style}
        externalMessages={messages}
      />
    </VoiceAgentProvider>
  );
};

export default ConversationWithMessages;

