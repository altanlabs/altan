/**
 * Unified Voice Agent Provider
 * Supports both ElevenLabs and OpenAI Realtime API
 * Auto-detects provider based on agent configuration
 */

import { useConversation } from '@elevenlabs/react';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

import { ElevenLabsClient } from '../clients/ElevenLabsClient';
import { OpenAIRealtimeClient } from '../clients/OpenAIRealtimeClient';
import { fetchAgentConfig, detectVoiceProvider, getElevenLabsAgentId } from '../utils/api';
import type { 
  VoiceAgentProviderProps, 
  VoiceAgentContextValue, 
  AgentConfig, 
  VoiceProvider, 
  ConnectionStatus,
  VoiceClient,
  ClientTools
} from '../types';

const VoiceAgentContext = createContext<VoiceAgentContextValue | null>(null);

export const VoiceAgentProvider: React.FC<VoiceAgentProviderProps> = ({ 
  agentId, 
  clientTools = {},
  overrides = {},
  onConnect,
  onDisconnect,
  onError,
  onToolCall,
  onMessage,
  children 
}) => {
  const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null);
  const [provider, setProvider] = useState<VoiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  
  const clientRef = useRef<VoiceClient | null>(null);
  const connectionStatusRef = useRef<ConnectionStatus>('idle'); // Always in sync
  
  // ElevenLabs conversation hook with client tools
  const elevenlabsConversation = useConversation({
    clientTools: clientTools as ClientTools,
    onConnect: () => {
      console.log('[SDK] ElevenLabs connected');
      setConnectionStatus('connected');
      if (onConnect) onConnect();
    },
    onDisconnect: () => {
      console.log('[SDK] ElevenLabs disconnected');
      setConnectionStatus('idle');
      if (onDisconnect) onDisconnect();
    },
    onError: (err: Error) => {
      console.error('[SDK] ElevenLabs error:', err);
      setError(err.message || 'Connection error');
      setConnectionStatus('error');
      if (onError) onError(err);
    },
  });

  // Fetch agent configuration on mount
  useEffect(() => {
    const loadAgent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const config = await fetchAgentConfig(agentId);
        setAgentConfig(config);
        
        // Allow provider override
        const detectedProvider = overrides.provider || detectVoiceProvider(config);
        setProvider(detectedProvider);
        
        console.log(`[SDK] Agent loaded: ${config.name}`);
        console.log(`[SDK] Voice provider: ${detectedProvider}`);
        if (overrides.provider) {
          console.log(`[SDK] Provider overridden to: ${overrides.provider}`);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('[SDK] Failed to load agent:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    if (agentId) {
      loadAgent();
    }
  }, [agentId, overrides.provider]);

  // Initialize client when provider is detected (ONLY ONCE!)
  useEffect(() => {
    if (!agentConfig || !provider) return;
    
    // DON'T recreate if we already have a client
    if (clientRef.current) {
      console.log('[SDK] Client already exists, skipping recreation');
      return;
    }

    try {
      if (provider === 'openai') {
        console.log('[SDK] Creating OpenAI client instance (ONCE)');
        clientRef.current = new OpenAIRealtimeClient(agentId, agentConfig, clientTools);
      } else {
        // ElevenLabs
        const elevenlabsAgentId = getElevenLabsAgentId(agentConfig);
        if (!elevenlabsAgentId) {
          throw new Error('No ElevenLabs agent ID found in configuration');
        }
        console.log('[SDK] Creating ElevenLabs client (ONCE)');
        clientRef.current = new ElevenLabsClient(
          elevenlabsAgentId,
          agentConfig,
          elevenlabsConversation,
        );
      }
      
      console.log(`[SDK] ${provider} client initialized`);
    } catch (err) {
      console.error('[SDK] Failed to initialize client:', err);
      setError(err.message);
    }
  }, [agentConfig, provider]);

  // Start conversation
  const startConversation = useCallback(async (options = {}) => {
    const currentStatus = connectionStatusRef.current;
    console.log('[SDK] 🎙️ Start requested - ref status:', currentStatus);
    
    // Prevent starting if already connected (use REF not state)
    if (currentStatus === 'connected' || currentStatus === 'connecting') {
      console.log('[SDK] Already connected, aborting');
      return false;
    }
    
    if (!clientRef.current) {
      console.error('[SDK] No client!');
      return false;
    }

    try {
      console.log('[SDK] Calling client.startSession()...');
      const sessionOptions = { ...overrides, ...options };
      const success = await clientRef.current.startSession({
        ...sessionOptions,
        onConnect: () => {
          connectionStatusRef.current = 'connected';
          setConnectionStatus('connected');
          if (onConnect) onConnect();
        },
        onDisconnect: () => {
          connectionStatusRef.current = 'idle';
          setConnectionStatus('idle');
          if (onDisconnect) onDisconnect();
        },
        onError: (err: Error) => {
          setError(err.message);
          setConnectionStatus('error');
          if (onError) onError(err);
        },
        onStatusChange: (status: ConnectionStatus) => {
          connectionStatusRef.current = status;
          setConnectionStatus(status);
        },
        onToolCall: (toolName: string, args: Record<string, unknown>, result?: unknown) => {
          if (onToolCall) {
            onToolCall(toolName, args, result);
          }
        },
        onMessage: (event) => {
          if (onMessage) {
            onMessage(event);
          }
        },
      });

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[SDK] Failed to start conversation:', err);
      setError(errorMessage);
      return false;
    }
  }, [onConnect, onDisconnect, onError, onToolCall, onMessage, overrides]);

  // Stop conversation
  const stopConversation = useCallback(async () => {
    console.log('[SDK] 🛑 Stopping...');
    
    // Set ref FIRST
    connectionStatusRef.current = 'idle';
    setConnectionStatus('idle');
    
    if (clientRef.current) {
      try {
        await clientRef.current.stopSession();
      } catch (err) {
        console.error('[SDK] Stop error:', err.message);
      }
    }
    
    console.log('[SDK] ✅ Stopped');
    return true;
  }, []);

  // Debug connection status
  useEffect(() => {
    console.log('[SDK] Connection status changed to:', connectionStatus);
  }, [connectionStatus]);

  const value = {
    // Agent data
    agentId,
    agentName: agentConfig?.name,
    agentConfig,
    provider,
    
    // Connection state
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    connectionStatus,
    
    // Loading state
    isLoading,
    error,
    
    // Actions
    startConversation,
    stopConversation,
    
    // Client reference (for advanced usage)
    client: clientRef.current,
  };

  return (
    <VoiceAgentContext.Provider value={value}>
      {children}
    </VoiceAgentContext.Provider>
  );
};

export const useVoiceAgent = (): VoiceAgentContextValue => {
  const context = useContext(VoiceAgentContext);
  if (!context) {
    throw new Error('useVoiceAgent must be used within a VoiceAgentProvider');
  }
  return context;
};

