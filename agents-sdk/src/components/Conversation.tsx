/**
 * Conversation - Full conversation interface
 * Chat history + ConversationBar at the bottom
 */

import React, { useEffect, useRef } from 'react';

import { ConversationBar } from './ConversationBar';
import { useVoiceAgent } from '../hooks/useVoiceAgent';
import type { ConversationProps, Message } from '../types';

export const Conversation: React.FC<ConversationProps> = ({
  maxHeight = '600px',
  className = '',
  style = {},
  externalMessages = null,
}) => {
  const {
    isLoading,
  } = useVoiceAgent();

  const messages: Message[] = externalMessages || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className={className} style={{ padding: '40px', textAlign: 'center', ...style }}>
        Loading agent...
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: maxHeight,
        backgroundColor: '#fafafa',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        ...style,
      }}
    >
      {/* Messages/Transcript */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '80px 20px' }}>
            <p>Start a voice call to see the conversation transcript here</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: message.role === 'user' ? '#000' : '#e5e7eb',
                    color: message.role === 'user' ? '#fff' : '#000',
                    fontSize: '14px',
                    lineHeight: '1.5',
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ConversationBar at bottom */}
      <ConversationBar />
    </div>
  );
};

export default Conversation;


