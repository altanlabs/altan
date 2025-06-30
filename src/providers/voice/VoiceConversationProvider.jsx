import { useConversation } from '@elevenlabs/react';
import React, { createContext, useContext, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';

const VoiceConversationContext = createContext(null);

export const VoiceConversationProvider = ({ children }) => {
  const [toolCalls, setToolCalls] = useState([]);
  const [navigationPath, setNavigationPath] = useState('');
  const history = useHistory();

  // Tool handler functions
  const handleRedirect = useCallback(
    async (parameters) => {
      const { url, path, delay = 0 } = parameters;
      const targetPath = path || url;

      if (!targetPath) {
        return {
          success: false,
          error: 'No path or URL provided for redirection',
        };
      }

      console.log(`Navigating to ${targetPath} in ${delay}ms`);
      setNavigationPath(targetPath);

      setTimeout(() => {
        console.log(`Navigating to: ${targetPath}`);
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
    console.log('Tool call received:', toolCall);
    setToolCalls((prev) => [...prev, toolCall]);

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
      console.error('Tool call error:', error);
      return {
        tool_call_id,
        result: JSON.stringify({
          success: false,
          error: error.message,
        }),
      };
    }
  }, [handleRedirect]);

  // Single conversation instance for the entire app
  const conversation = useConversation({
    onConnect: () => {
      console.log('Voice conversation connected!');
    },
    onDisconnect: () => {
      console.log('Voice conversation ended!');
      setToolCalls([]);
      setNavigationPath('');
    },
    onMessage: (message) => {
      console.log('Voice message received:', message);
    },
    onError: (error) => {
      console.error('Voice conversation error:', error);
    },
    clientTools: {
      redirect: async ({ path }) => {
        if (!path) {
          return { success: false, error: 'No path provided for redirection' };
        }
        console.log(`Navigating to: ${path}`);
        setNavigationPath(path);
        history.push(path);
        return { success: true, message: `Navigated to ${path}`, path: path };
      },
    },
    onToolCall: handleToolCall,
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
      console.error('No agent ID provided');
      return false;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionConfig = { agentId };
      if (Object.keys(overrides).length > 0) {
        sessionConfig.overrides = overrides;
      }
      if (Object.keys(dynamicVariables).length > 0) {
        sessionConfig.dynamicVariables = dynamicVariables;
      }
      console.log('sessionConfig', sessionConfig);
      await conversation.startSession(sessionConfig);

      // Call optional callbacks
      onConnect?.();

      return true;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      onError?.(error);
      return false;
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      setToolCalls([]);
      setNavigationPath('');
      return true;
    } catch (error) {
      console.error('Failed to stop conversation:', error);
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

    // Actions
    startConversation,
    stopConversation,

    // Raw conversation object for advanced usage
    conversation,
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
