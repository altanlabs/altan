import { Capacitor } from '@capacitor/core';
import { useConversation } from '@elevenlabs/react';
import React, { createContext, useContext, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';

const VoiceConversationContext = createContext(null);

// Helper function to detect Capacitor native platform
const isCapacitorNative = () => {
  try {
    const result = Capacitor.isNativePlatform();
    return result;
  } catch {
    return false;
  }
};

// Helper function to detect iOS
const isIOS = () => {
  const result = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
         (isCapacitorNative() && Capacitor.getPlatform() === 'ios');
  return result;
};

// Helper function to detect mobile browsers
const isMobile = () => {
  const result = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (isCapacitorNative() && ['ios', 'android'].includes(Capacitor.getPlatform()));
  return result;
};

// iOS-specific microphone permission request with retry
const requestMicrophonePermission = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // iOS Safari specific settings
          ...(isIOS() && {
            sampleRate: 44100,
            channelCount: 1,
          }),
        },
        video: false,
      });

      // Test that we actually have audio
      if (stream.getAudioTracks().length === 0) {
        stream.getTracks().forEach(track => track.stop());
        throw new Error('No audio tracks available');
      }

      // Clean up test stream
      stream.getTracks().forEach(track => {
        track.stop();
      });

      // Small delay for iOS cleanup
      if (isIOS()) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      return true;
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
};

export const VoiceConversationProvider = ({ children }) => {
  const [toolCalls, setToolCalls] = useState([]);
  const [navigationPath, setNavigationPath] = useState('');
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [disconnectionReason, setDisconnectionReason] = useState(null);
  const [connectionStartTime, setConnectionStartTime] = useState(null);
  const history = useHistory();

  // Tool handler functions
  const handleRedirect = useCallback(
    async (parameters) => {
      const { url, path, delay = 0 } = parameters;
      const targetPath = path || url;

      if (!targetPath) {
        const error = 'No path or URL provided for redirection';
        return {
          success: false,
          error,
        };
      }

      setNavigationPath(targetPath);

      setTimeout(() => {
        if (targetPath.startsWith('http')) {
          window.location.href = targetPath;
        } else {
          history.push(targetPath);
        }
      }, delay);

      return {
        success: true,
        message: `Navigating to ${targetPath}`,
        path: targetPath,
      };
    },
    [history],
  );

  // Handle client tool calls from the agent
  const handleToolCall = useCallback(async (toolCall) => {
    setToolCalls((prev) => {
      const updated = [...prev, toolCall];
      return updated;
    });

    const { tool_call_id, function_name, parameters } = toolCall;

    try {
      let result;

      switch (function_name) {
        case 'redirect':
          result = await handleRedirect(parameters);
          break;
        default:
          result = {
            success: false,
            error: `Unknown tool: ${function_name}`,
          };
      }

      return {
        tool_call_id,
        result: JSON.stringify(result),
      };
    } catch (error) {
      return {
        tool_call_id,
        result: JSON.stringify({
          success: false,
          error: error.message,
        }),
      };
    }
  }, [handleRedirect]);

  // Enhanced conversation with comprehensive debugging
  const conversation = useConversation({
    clientTools: {
      redirect: async ({ path }) => {
        if (!path) {
          const error = 'No path provided for redirection';
          return { success: false, error };
        }
        setNavigationPath(path);
        history.push(path);
        return { success: true, message: `Navigated to ${path}`, path: path };
      },
    },
    onToolCall: handleToolCall,
    // Add comprehensive event listeners for debugging
    onConnect: () => {
      console.log('🔗 [VoiceConversationProvider] Global onConnect - ElevenLabs connected');
      setConnectionStartTime(Date.now());
      setDisconnectionReason(null);
    },
    onDisconnect: () => {
      const connectionDuration = connectionStartTime ? Date.now() - connectionStartTime : 0;
      console.log('🔌 [VoiceConversationProvider] Global onDisconnect - ElevenLabs disconnected');
      console.log('⏱️ [VoiceConversationProvider] Connection duration:', connectionDuration, 'ms');
      if (connectionDuration < 5000) {
        console.warn('⚠️ [VoiceConversationProvider] Short connection duration detected - possible configuration issue');
      }
      setDisconnectionReason('ElevenLabs SDK disconnected');
      setConnectionStartTime(null);
    },
    onError: (error) => {
      console.log('❌ [VoiceConversationProvider] Global onError:', error);
      console.log('❌ [VoiceConversationProvider] Error type:', typeof error);
      console.log('❌ [VoiceConversationProvider] Error name:', error?.name);
      console.log('❌ [VoiceConversationProvider] Error message:', error?.message);
      console.log('❌ [VoiceConversationProvider] Error stack:', error?.stack);
      console.log('❌ [VoiceConversationProvider] Error details:', JSON.stringify(error, null, 2));
      
      // Check for specific ElevenLabs error patterns
      if (error?.message?.includes('ping') || error?.message?.includes('pong')) {
        console.warn('⚠️ [VoiceConversationProvider] Ping/Pong error - connection keepalive issue');
      }
      if (error?.message?.includes('WebSocket')) {
        console.warn('⚠️ [VoiceConversationProvider] WebSocket error - network or protocol issue');
      }
      if (error?.message?.includes('agent')) {
        console.warn('⚠️ [VoiceConversationProvider] Agent error - check agent configuration');
      }
      
      setDisconnectionReason(`Error: ${error.message}`);
    },
    onMessage: (message) => {
      console.log('💬 [VoiceConversationProvider] Global onMessage:', message);
      console.log('💬 [VoiceConversationProvider] Message type:', typeof message);
      console.log('💬 [VoiceConversationProvider] Message details:', JSON.stringify(message, null, 2));
      
      // Check for specific message types that might indicate issues
      if (message?.type === 'interruption') {
        console.warn('⚠️ [VoiceConversationProvider] Interruption message received:', message);
      }
      if (message?.type === 'ping') {
        console.log('🏓 [VoiceConversationProvider] Ping message received');
      }
      if (message?.type === 'pong') {
        console.log('🏓 [VoiceConversationProvider] Pong message received');
      }
    },
    onModeChange: (mode) => {
      console.log('🔄 [VoiceConversationProvider] Mode change:', mode);
      console.log('🔄 [VoiceConversationProvider] Mode details:', JSON.stringify(mode, null, 2));
    },
    onStatusChange: (status) => {
      console.log('📊 [VoiceConversationProvider] Status change:', status);
      console.log('📊 [VoiceConversationProvider] Status details:', JSON.stringify(status, null, 2));
    },
  });

  const startConversation = useCallback(async (options = {}) => {
    const {
      agentId = 'agent_01jy1hqg8jehq8v9zd7j9qxa2a',
      overrides = {},
      dynamicVariables = {},
      onConnect,
      onDisconnect,
      onMessage,
      onError,
    } = options;

    if (!agentId) {
      return false;
    }

    try {
      // iOS-specific microphone permission handling
      if (isIOS() || isMobile()) {
        await requestMicrophonePermission();
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }

      // Prepare session configuration with iOS-optimized settings
      const sessionConfig = {
        agentId,
        ...(Object.keys(overrides).length > 0 && { overrides }),
        ...(Object.keys(dynamicVariables).length > 0 && { dynamicVariables }),
      };

      // Add callbacks to session config with internal state management
      const callbackConfig = {};
      if (onConnect) {
        callbackConfig.onConnect = () => {
          console.log('🔗 [VoiceConversationProvider] Internal onConnect called');
          setConnectionAttempts(0); // Reset attempts on successful connection
          onConnect();
        };
      } else {
        callbackConfig.onConnect = () => {
          console.log('🔗 [VoiceConversationProvider] Internal onConnect called (no user callback)');
          setConnectionAttempts(0); // Reset attempts on successful connection
        };
      }

      if (onDisconnect) {
        callbackConfig.onDisconnect = () => {
          console.log('🔌 [VoiceConversationProvider] Internal onDisconnect called');
          setToolCalls([]);
          setNavigationPath('');
          onDisconnect();
        };
      } else {
        callbackConfig.onDisconnect = () => {
          console.log('🔌 [VoiceConversationProvider] Internal onDisconnect called (no user callback)');
          setToolCalls([]);
          setNavigationPath('');
        };
      }

      if (onMessage) callbackConfig.onMessage = onMessage;

      if (onError) {
        callbackConfig.onError = (error) => {
          console.log('❌ [VoiceConversationProvider] Internal onError called:', error);
          setConnectionAttempts(prev => {
            const newAttempts = prev + 1;
            return newAttempts;
          });
          onError(error);
        };
      } else {
        callbackConfig.onError = () => {
          console.log('❌ [VoiceConversationProvider] Internal onError called (no user callback)');
          setConnectionAttempts(prev => {
            const newAttempts = prev + 1;
            return newAttempts;
          });
        };
      }

      // iOS-specific session configuration
      if (isIOS() || isMobile()) {
        sessionConfig.options = {
          ...sessionConfig.options,
          audioOptions: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
            channelCount: 1,
          },
        };
      }

      await conversation.startSession({
        ...sessionConfig,
        ...callbackConfig,
      });

      return true;
    } catch (error) {
      // Enhanced error handling for iOS
      if (isIOS() || isMobile()) {
        if (error.name === 'NotAllowedError' || error.message?.includes('Permission denied')) {
          const enhancedError = new Error('Microphone permission denied. Please enable microphone access in Safari settings.');
          onError?.(enhancedError);
        } else if (error.message?.includes('NotReadableError') || error.message?.includes('capture failure')) {
          const enhancedError = new Error('Microphone is busy or not available. Please close other apps using the microphone and try again.');
          onError?.(enhancedError);
        } else {
          onError?.(error);
        }
      } else {
        onError?.(error);
      }

      return false;
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();

      setToolCalls([]);
      setNavigationPath('');
      setConnectionAttempts(0);

      return true;
    } catch {
      return false;
    }
  }, [conversation]);

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';

  const value = {
    // State
    isConnected,
    isConnecting,
    status: conversation.status,
    toolCalls,
    navigationPath,
    connectionAttempts,
    disconnectionReason,
    connectionStartTime,

    // Actions
    startConversation,
    stopConversation,

    // Raw conversation object for advanced usage
    conversation,

    // Utility functions
    isIOS: isIOS(),
    isMobile: isMobile(),
  };

  return (
    <VoiceConversationContext.Provider value={value}>
      {children}
    </VoiceConversationContext.Provider>
  );
};

export const useVoiceConversation = () => {
  const context = useContext(VoiceConversationContext);
  if (!context) {
    throw new Error('useVoiceConversation must be used within a VoiceConversationProvider');
  }
  return context;
};
