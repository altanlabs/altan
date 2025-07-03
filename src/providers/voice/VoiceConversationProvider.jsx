import { Capacitor } from '@capacitor/core';
import { useConversation } from '@elevenlabs/react';
import React, { createContext, useContext, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';

const VoiceConversationContext = createContext(null);

// Helper function to detect Capacitor native platform
const isCapacitorNative = () => {
  try {
    const result = Capacitor.isNativePlatform();
    console.log('⚡ [VoiceProvider] Capacitor Native Detection:', { result, platform: Capacitor.getPlatform() });
    return result;
  } catch (error) {
    console.log('⚡ [VoiceProvider] Capacitor not available:', error);
    return false;
  }
};

// Helper function to detect iOS
const isIOS = () => {
  const result = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
         (isCapacitorNative() && Capacitor.getPlatform() === 'ios');
  console.log('🍎 [VoiceProvider] iOS Detection:', { result, userAgent: navigator.userAgent, platform: navigator.platform, capacitorPlatform: isCapacitorNative() ? Capacitor.getPlatform() : 'none' });
  return result;
};

// Helper function to detect mobile browsers
const isMobile = () => {
  const result = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (isCapacitorNative() && ['ios', 'android'].includes(Capacitor.getPlatform()));
  console.log('📱 [VoiceProvider] Mobile Detection:', { result, userAgent: navigator.userAgent, capacitorPlatform: isCapacitorNative() ? Capacitor.getPlatform() : 'none' });
  return result;
};

// iOS-specific microphone permission request with retry
const requestMicrophonePermission = async (retries = 3) => {
  console.log('🎤 [VoiceProvider] Requesting microphone permission with retries:', retries);

  for (let i = 0; i < retries; i++) {
    console.log(`🔄 [VoiceProvider] Microphone permission attempt ${i + 1}/${retries}`);

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

      console.log('✅ [VoiceProvider] Microphone stream obtained:', {
        audioTracks: stream.getAudioTracks().length,
        trackDetails: stream.getAudioTracks().map(track => ({
          id: track.id,
          kind: track.kind,
          label: track.label,
          enabled: track.enabled,
        })),
      });

      // Test that we actually have audio
      if (stream.getAudioTracks().length === 0) {
        console.error('❌ [VoiceProvider] No audio tracks available in stream');
        stream.getTracks().forEach(track => track.stop());
        throw new Error('No audio tracks available');
      }

      // Clean up test stream
      stream.getTracks().forEach(track => {
        console.log('🔇 [VoiceProvider] Stopping permission test track:', track.kind, track.id);
        track.stop();
      });

      // Small delay for iOS cleanup
      if (isIOS()) {
        console.log('⏱️ [VoiceProvider] iOS cleanup delay...');
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('✅ [VoiceProvider] Microphone permission granted successfully');
      return true;
    } catch (error) {
      console.warn(`⚠️ [VoiceProvider] Microphone permission attempt ${i + 1} failed:`, {
        error: error.message,
        name: error.name,
        code: error.code,
      });

      if (i === retries - 1) {
        console.error('❌ [VoiceProvider] All microphone permission attempts failed');
        throw error;
      }

      // Wait before retry
      console.log(`⏱️ [VoiceProvider] Waiting 1s before retry ${i + 2}...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
};

export const VoiceConversationProvider = ({ children }) => {
  console.log('🔧 [VoiceProvider] Initializing VoiceConversationProvider');

  const [toolCalls, setToolCalls] = useState([]);
  const [navigationPath, setNavigationPath] = useState('');
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const history = useHistory();

  // Tool handler functions
  const handleRedirect = useCallback(
    async (parameters) => {
      console.log('🔄 [VoiceProvider] Handling redirect with parameters:', parameters);

      const { url, path, delay = 0 } = parameters;
      const targetPath = path || url;

      if (!targetPath) {
        const error = 'No path or URL provided for redirection';
        console.error('❌ [VoiceProvider] Redirect error:', error);
        return {
          success: false,
          error,
        };
      }

      console.log(`🧭 [VoiceProvider] Navigating to ${targetPath} in ${delay}ms`);
      setNavigationPath(targetPath);

      setTimeout(() => {
        console.log(`🧭 [VoiceProvider] Executing navigation to: ${targetPath}`);
        if (targetPath.startsWith('http')) {
          console.log('🌐 [VoiceProvider] External navigation');
          window.location.href = targetPath;
        } else {
          console.log('🏠 [VoiceProvider] Internal navigation');
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
    console.log('🔧 [VoiceProvider] Tool call received:', toolCall);
    setToolCalls((prev) => {
      const updated = [...prev, toolCall];
      console.log('📊 [VoiceProvider] Tool calls updated, total:', updated.length);
      return updated;
    });

    const { tool_call_id, function_name, parameters } = toolCall;

    try {
      let result;

      console.log(`🛠️ [VoiceProvider] Executing tool: ${function_name}`);
      switch (function_name) {
        case 'redirect':
          result = await handleRedirect(parameters);
          break;
        default:
          result = {
            success: false,
            error: `Unknown tool: ${function_name}`,
          };
          console.error('❌ [VoiceProvider] Unknown tool requested:', function_name);
      }

      console.log(`✅ [VoiceProvider] Tool ${function_name} executed:`, result);
      return {
        tool_call_id,
        result: JSON.stringify(result),
      };
    } catch (error) {
      console.error('💥 [VoiceProvider] Tool call error:', error);
      return {
        tool_call_id,
        result: JSON.stringify({
          success: false,
          error: error.message,
        }),
      };
    }
  }, [handleRedirect]);

  // Enhanced conversation with iOS-specific handling
  const conversation = useConversation({
    onConnect: () => {
      console.log('🔗 [VoiceProvider] Voice conversation connected!');
      setConnectionAttempts(0); // Reset attempts on successful connection
      console.log('📊 [VoiceProvider] Connection attempts reset to 0');
    },
    onDisconnect: () => {
      console.log('🔌 [VoiceProvider] Voice conversation ended!');
      setToolCalls([]);
      setNavigationPath('');
      console.log('🧹 [VoiceProvider] State cleaned up after disconnect');
    },
    onMessage: (message) => {
      console.log('💬 [VoiceProvider] Voice message received:', {
        type: message.type,
        content: message.content ? message.content.substring(0, 100) + '...' : 'No content',
        timestamp: new Date().toISOString(),
      });
    },
    onError: (error) => {
      console.error('❌ [VoiceProvider] Voice conversation error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });

      setConnectionAttempts(prev => {
        const newAttempts = prev + 1;
        console.log(`📊 [VoiceProvider] Connection attempts incremented to: ${newAttempts}`);
        return newAttempts;
      });

      // iOS-specific error handling
      if (isIOS() || isMobile()) {
        if (error.message?.includes('capture failure') ||
            error.message?.includes('MediaStreamTrack ended')) {
          console.warn('🍎 [VoiceProvider] iOS Safari audio capture failure detected');
        }
      }
    },
    clientTools: {
      redirect: async ({ path }) => {
        console.log('🧭 [VoiceProvider] Client tool redirect called with path:', path);
        if (!path) {
          const error = 'No path provided for redirection';
          console.error('❌ [VoiceProvider] Client redirect error:', error);
          return { success: false, error };
        }
        console.log(`🧭 [VoiceProvider] Client navigating to: ${path}`);
        setNavigationPath(path);
        history.push(path);
        return { success: true, message: `Navigated to ${path}`, path: path };
      },
    },
    onToolCall: handleToolCall,
  });

  const startConversation = useCallback(async (options = {}) => {
    console.log('🚀 [VoiceProvider] Starting conversation with options:', options);

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
      console.error('❌ [VoiceProvider] No agent ID provided');
      return false;
    }

    console.log('🎯 [VoiceProvider] Conversation config:', {
      agentId,
      hasOverrides: Object.keys(overrides).length > 0,
      hasDynamicVariables: Object.keys(dynamicVariables).length > 0,
      overrides,
      dynamicVariables,
    });

    try {
      // iOS-specific microphone permission handling
      if (isIOS() || isMobile()) {
        console.log('📱 [VoiceProvider] iOS/Mobile detected, requesting microphone permission...');
        await requestMicrophonePermission();
      } else {
        console.log('🖥️ [VoiceProvider] Desktop detected, requesting standard microphone permission...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ [VoiceProvider] Standard microphone permission granted');
        stream.getTracks().forEach(track => {
          console.log('🔇 [VoiceProvider] Stopping standard permission test track:', track.kind);
          track.stop();
        });
      }

      // Prepare session configuration with iOS-optimized settings
      const sessionConfig = {
        agentId,
        ...(Object.keys(overrides).length > 0 && { overrides }),
        ...(Object.keys(dynamicVariables).length > 0 && { dynamicVariables }),
      };

      // Add callbacks to session config
      const callbackConfig = {};
      if (onConnect) callbackConfig.onConnect = onConnect;
      if (onDisconnect) callbackConfig.onDisconnect = onDisconnect;
      if (onMessage) callbackConfig.onMessage = onMessage;
      if (onError) callbackConfig.onError = onError;

      // iOS-specific session configuration
      if (isIOS() || isMobile()) {
        console.log('📱 [VoiceProvider] Applying iOS/Mobile optimizations...');
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

      console.log('🎤 [VoiceProvider] Final session config:', sessionConfig);
      console.log('🔄 [VoiceProvider] Starting ElevenLabs session...');

      await conversation.startSession({
        ...sessionConfig,
        ...callbackConfig,
      });
      console.log('✅ [VoiceProvider] ElevenLabs session started successfully');

      return true;
    } catch (error) {
      console.error('💥 [VoiceProvider] Failed to start conversation:', {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack,
      });

      // Enhanced error handling for iOS
      if (isIOS() || isMobile()) {
        console.log('📱 [VoiceProvider] Applying iOS/Mobile error handling...');

        if (error.name === 'NotAllowedError' || error.message?.includes('Permission denied')) {
          const enhancedError = new Error('Microphone permission denied. Please enable microphone access in Safari settings.');
          console.error('🚫 [VoiceProvider] Permission denied error enhanced');
          onError?.(enhancedError);
        } else if (error.message?.includes('NotReadableError') || error.message?.includes('capture failure')) {
          const enhancedError = new Error('Microphone is busy or not available. Please close other apps using the microphone and try again.');
          console.error('📱 [VoiceProvider] Device busy error enhanced');
          onError?.(enhancedError);
        } else {
          console.error('❓ [VoiceProvider] Unknown iOS/Mobile error, passing through');
          onError?.(error);
        }
      } else {
        console.error('🖥️ [VoiceProvider] Desktop error, passing through');
        onError?.(error);
      }

      return false;
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    console.log('🛑 [VoiceProvider] Stopping conversation...');

    try {
      await conversation.endSession();
      console.log('✅ [VoiceProvider] Conversation ended successfully');

      setToolCalls([]);
      setNavigationPath('');
      setConnectionAttempts(0);
      console.log('🧹 [VoiceProvider] Provider state cleaned up');

      return true;
    } catch (error) {
      console.error('❌ [VoiceProvider] Failed to stop conversation:', error);
      return false;
    }
  }, [conversation]);

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';

  console.log('📊 [VoiceProvider] Current state:', {
    status: conversation.status,
    isConnected,
    isConnecting,
    toolCallsCount: toolCalls.length,
    navigationPath,
    connectionAttempts,
  });

  const value = {
    // State
    isConnected,
    isConnecting,
    status: conversation.status,
    toolCalls,
    navigationPath,
    connectionAttempts,

    // Actions
    startConversation,
    stopConversation,

    // Raw conversation object for advanced usage
    conversation,

    // Utility functions
    isIOS: isIOS(),
    isMobile: isMobile(),
  };

  console.log('🔧 [VoiceProvider] Provider value created:', {
    hasStartConversation: !!value.startConversation,
    hasStopConversation: !!value.stopConversation,
    hasConversation: !!value.conversation,
    isIOS: value.isIOS,
    isMobile: value.isMobile,
  });

  return (
    <VoiceConversationContext.Provider value={value}>
      {children}
    </VoiceConversationContext.Provider>
  );
};

export const useVoiceConversation = () => {
  const context = useContext(VoiceConversationContext);
  if (!context) {
    console.error('❌ [VoiceProvider] useVoiceConversation called outside of provider');
    throw new Error('useVoiceConversation must be used within a VoiceConversationProvider');
  }
  console.log('🎤 [VoiceProvider] useVoiceConversation hook called, returning context');
  return context;
};
