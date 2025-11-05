/**
 * ConversationBar - Compact bar with waveform and controls
 * Based on ElevenLabs reference implementation
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

import { useVoiceAgent } from '../hooks/useVoiceAgent';
import type { ConversationBarProps, LiveWaveformProps } from '../types';

// Simple waveform
const LiveWaveform: React.FC<LiveWaveformProps> = ({ active, barCount = 25 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = 3;
      const barGap = 1;
      const totalWidth = barCount * (barWidth + barGap);
      const startX = (canvas.width - totalWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + barGap);
        const height = active
          ? Math.random() * (canvas.height - 4) + 4
          : 4;
        const y = (canvas.height - height) / 2;

        ctx.fillStyle = active ? '#ef4444' : '#d1d5db';
        ctx.fillRect(x, y, barWidth, height);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [active, barCount]);

  return <canvas ref={canvasRef} width={120} height={20} style={{ width: '120px', height: '20px' }} />;
};

export const ConversationBar: React.FC<ConversationBarProps> = ({
  className = '',
  style = {},
  onConnect,
  onDisconnect,
  onError,
  onMessage,
  onSendMessage,
}) => {
  const {
    isConnected,
    isConnecting,
    startConversation,
    stopConversation,
    client,
  } = useVoiceAgent();

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [keyboardOpen, setKeyboardOpen] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');

  const toggleMute = useCallback(() => {
    if (client?.toggleMute) {
      const newMutedState = client.toggleMute();
      setIsMuted(newMutedState);
    }
  }, [client]);

  const agentState = isConnecting ? 'connecting' : isConnected ? 'connected' : 'disconnected';

  // Debug: log state changes
  useEffect(() => {
    console.log('[ConversationBar] State:', { isConnected, isConnecting, agentState });
  }, [isConnected, isConnecting, agentState]);

  const handleStartOrEnd = useCallback(async () => {
    console.log('[ConversationBar] Phone clicked - isConnected:', isConnected, 'isConnecting:', isConnecting);
    if (isConnected || isConnecting) {
      console.log('[ConversationBar] -> Stopping...');
      await stopConversation();
      setKeyboardOpen(false);
      setIsMuted(false);
      onDisconnect?.();
    } else {
      console.log('[ConversationBar] -> Starting...');
      console.log('[ConversationBar] startConversation exists?', !!startConversation);
      const success = await startConversation();
      console.log('[ConversationBar] Start success:', success);
      if (success) onConnect?.();
    }
  }, [isConnected, isConnecting, startConversation, stopConversation, onConnect, onDisconnect]);

  const handleSendText = useCallback(() => {
    if (!textInput.trim()) return;
    
    // Send via client if available (OpenAI Realtime API)
    if (client?.sendUserMessage) {
      console.log('[ConversationBar] Sending text via client:', textInput);
      client.sendUserMessage(textInput);
    }
    
    // Notify callbacks
    onMessage?.({ source: 'user', message: textInput });
    onSendMessage?.(textInput);
    
    setTextInput('');
  }, [textInput, client, onMessage, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendText();
      }
    },
    [handleSendText]
  );

  return (
    <div className={className} style={{ display: 'flex', justifyContent: 'center', padding: '16px', ...style }}>
      <div
        style={{
          width: '100%',
          maxWidth: '700px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
        }}
      >
        {/* Collapsible keyboard input */}
        <div
          style={{
            maxHeight: keyboardOpen ? '160px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease-out',
          }}
        >
          <div style={{ position: 'relative', padding: '12px 12px 12px 12px' }}>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your message..."
              disabled={!isConnected}
              rows={3}
              style={{
                width: '100%',
                padding: '12px 48px 12px 12px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'none',
                fontFamily: 'inherit',
                outline: 'none',
                backgroundColor: '#f9fafb',
              }}
            />
            <button
              onClick={handleSendText}
              disabled={!textInput.trim() || !isConnected}
              style={{
                position: 'absolute',
                right: '24px',
                bottom: '24px',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: !textInput.trim() || !isConnected ? '#e5e7eb' : '#000',
                color: '#fff',
                cursor: !textInput.trim() || !isConnected ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-8 8h5v8h6v-8h5z" />
              </svg>
            </button>
          </div>
          <div style={{ borderTop: '1px solid #e5e7eb' }} />
        </div>

        {/* Main control bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 16px' }}>
          {/* Waveform area */}
          <div
            style={{
              width: '120px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '0 8px',
            }}
          >
            {agentState === 'disconnected' ? (
              <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
                Not connected
              </span>
            ) : (
              <LiveWaveform active={isConnected && !isMuted} />
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Mute button */}
            <button
              onClick={toggleMute}
              disabled={!isConnected}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isMuted ? '#f3f4f6' : 'transparent',
                color: !isConnected ? '#d1d5db' : '#6b7280',
                cursor: !isConnected ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                {isMuted && <line x1="1" y1="1" x2="23" y2="23" />}
              </svg>
            </button>

            {/* Keyboard toggle */}
            <button
              onClick={() => setKeyboardOpen(!keyboardOpen)}
              disabled={!isConnected}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: !isConnected ? '#d1d5db' : '#6b7280',
                cursor: !isConnected ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {keyboardOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
                </svg>
              )}
            </button>

            {/* Separator */}
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />

            {/* Phone button */}
            <button
              onClick={handleStartOrEnd}
              disabled={agentState === 'connecting'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#6b7280',
                cursor: agentState === 'connecting' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isConnected || isConnecting ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConversationBar.displayName = 'ConversationBar';

export default ConversationBar;
