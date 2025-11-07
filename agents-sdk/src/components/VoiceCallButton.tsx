/**
 * VoiceCallButton - Pre-built call button component
 * Simple, styled button for starting/stopping voice calls
 */

import React from 'react';

import { useVoiceAgent } from '../hooks/useVoiceAgent';
import type { VoiceCallButtonProps } from '../types';

const PhoneIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const VoiceCallButton: React.FC<VoiceCallButtonProps> = ({ 
  className = '',
  style = {},
  children,
  startLabel = 'Start Call',
  stopLabel = 'End Call',
  connectingLabel = 'Connecting...',
}) => {
  const { isConnected, isConnecting, startConversation, stopConversation, error } = useVoiceAgent();

  const handleClick = () => {
    if (isConnected) {
      stopConversation();
    } else {
      startConversation();
    }
  };

  const getLabel = () => {
    if (isConnecting) return connectingLabel;
    if (isConnected) return stopLabel;
    return startLabel;
  };

  const defaultStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '24px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: isConnecting ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: isConnected ? '#ef4444' : '#000',
    color: '#fff',
    opacity: isConnecting ? 0.6 : 1,
    ...style,
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isConnecting}
        className={className}
        style={defaultStyle}
      >
        <PhoneIcon />
        {children || getLabel()}
      </button>
      {error && (
        <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceCallButton;

