/**
 * VoiceCallCard - Complete voice call interface
 * Combines orb avatar with call controls
 */

import React from 'react';

import { useVoiceAgent } from '../hooks/useVoiceAgent';
import { AgentOrb } from './AgentOrb';
import { VoiceCallButton } from './VoiceCallButton';
import type { VoiceCallCardProps } from '../types';

export const VoiceCallCard: React.FC<VoiceCallCardProps> = ({
  size = 200,
  colors = ['#00fbff', '#68dffd'],
  showAgentName = true,
  className = '',
  style = {},
}) => {
  const {
    agentName,
    isConnected,
    isConnecting,
    isLoading,
    error,
  } = useVoiceAgent();

  if (isLoading) {
    return (
      <div className={className} style={{ textAlign: 'center', padding: '40px', ...style }}>
        <div style={{ marginBottom: '16px' }}>Loading agent...</div>
      </div>
    );
  }

  const agentState = isConnected ? 'speaking' : isConnecting ? 'thinking' : null;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '32px',
        borderRadius: '24px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        ...style,
      }}
    >
      {/* Agent Name */}
      {showAgentName && agentName && (
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
          {agentName}
        </h3>
      )}

      {/* Orb Avatar */}
      <AgentOrb
        size={size}
        agentId={agentName || 'default'}
        colors={colors}
        agentState={agentState}
        isStatic={false}
      />

      {/* Status Text */}
      {isConnected && (
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Talk to interrupt
        </p>
      )}

      {/* Call Button */}
      <VoiceCallButton />

      {/* Error Display */}
      {error && (
        <div
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            color: '#c00',
            fontSize: '12px',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceCallCard;

