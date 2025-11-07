/**
 * Simple Example - Minimal implementation showing SDK usage
 * This is what external developers will write
 */

import React from 'react';

import { useVoiceAgent } from '../hooks/useVoiceAgent';
import { AgentOrb } from './AgentOrb';

export const SimpleExample: React.FC = () => {
  const {
    agentName,
    isConnected,
    isConnecting,
    isLoading,
    startConversation,
    stopConversation,
    error,
    provider,
  } = useVoiceAgent();

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading agent...</div>;
  }

  const handleClick = () => {
    if (isConnected) {
      stopConversation();
    } else {
      startConversation();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        padding: '40px',
        maxWidth: '400px',
        margin: '0 auto',
      }}
    >
      {/* Agent Name */}
      {agentName && (
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>{agentName}</h2>
      )}

      {/* Animated Orb */}
      <AgentOrb
        size={200}
        agentId={agentName}
        colors={['#00fbff', '#68dffd']}
        agentState={isConnected ? 'speaking' : isConnecting ? 'thinking' : null}
        isStatic={false}
      />

      {/* Status Text */}
      {isConnected && (
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Talk to interrupt</p>
      )}

      {/* Call Button */}
      <button
        onClick={handleClick}
        disabled={isConnecting}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          borderRadius: '24px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '500',
          cursor: isConnecting ? 'not-allowed' : 'pointer',
          backgroundColor: isConnected ? '#ef4444' : '#000',
          color: '#fff',
          opacity: isConnecting ? 0.6 : 1,
        }}
      >
        {isConnecting ? 'Connecting...' : isConnected ? 'End Call' : 'Start Call'}
      </button>

      {/* Provider Badge */}
      {provider && (
        <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase' }}>
          {provider === 'openai' ? 'OpenAI Realtime' : 'ElevenLabs'}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default SimpleExample;

