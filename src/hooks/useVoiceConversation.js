import { useConversation } from '@elevenlabs/react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for managing voice conversations with ElevenLabs
 *
 * @param {Object} options - Configuration options
 * @param {string} options.agentId - The ElevenLabs agent ID
 * @param {string} options.url - Alternative to agentId for signed URLs
 * @param {Object} options.overrides - Conversation overrides
 * @param {Object} options.overrides.agent - Agent-level overrides
 * @param {string} options.overrides.agent.language - Language code (e.g., 'en', 'es', 'fr')
 * @param {string} options.overrides.agent.first_message - Custom first message
 * @param {Object} options.overrides.agent.prompt - Prompt overrides
 * @param {string} options.overrides.agent.prompt.prompt - Custom system prompt
 * @param {Object} options.overrides.tts - TTS-level overrides
 * @param {string} options.overrides.tts.voice_id - Custom voice ID
 * @param {Object} options.clientTools - Custom client tools to register
 * @param {Function} options.onConnect - Callback when connection is established
 * @param {Function} options.onDisconnect - Callback when connection is ended
 * @param {Function} options.onMessage - Callback when a message is received
 * @param {Function} options.onError - Callback when an error occurs
 * @param {Function} options.onToolCall - Custom tool call handler
 * @param {boolean} options.enableNavigation - Whether to enable navigation tools (default: true)
 * @param {boolean} options.autoCloseOnUnmount - Whether to automatically close conversation on unmount (default: false)
 */
export const useVoiceConversation = (options = {}) => {
  const {
    agentId,
    url,
    overrides = {},
    clientTools = {},
    onConnect,
    onDisconnect,
    onMessage,
    onError,
    onToolCall: customOnToolCall,
    enableNavigation = true,
  } = options;

  const [toolCalls, setToolCalls] = useState([]);
  const [navigationPath, setNavigationPath] = useState('');
  const navigate = useNavigate();

  // Tool handler functions
  const handleRedirect = useCallback(
    async (parameters) => {
      const { url, path, delay = 0 } = parameters;

      // Use path if provided, otherwise use url
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
          // External URL - use window.location
          window.location.href = targetPath;
        } else {
          // Internal path - use React Router's navigate
          navigate(targetPath);
        }
      }, delay);

      return {
        success: true,
        message: `Navigating to ${targetPath}`,
        path: targetPath,
      };
    },
    [navigate],
  );

  // Handle client tool calls from the agent
  const handleToolCall = useCallback(async (toolCall) => {
    console.log('Tool call received:', toolCall);

    // Add to tool calls history for debugging
    setToolCalls((prev) => [...prev, toolCall]);

    const { tool_call_id, function_name, parameters } = toolCall;

    try {
      let result;

      // Handle built-in tools
      switch (function_name) {
        case 'redirect':
          if (enableNavigation) {
            result = await handleRedirect(parameters);
          } else {
            result = {
              success: false,
              error: 'Navigation tools are disabled',
            };
          }
          break;

        default:
          // If there's a custom tool call handler, use it
          if (customOnToolCall) {
            const customResult = await customOnToolCall(toolCall);
            if (customResult) {
              return customResult;
            }
          }

          result = {
            success: false,
            error: `Unknown tool: ${function_name}`,
          };
      }

      // Return the result to the agent
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
  }, [customOnToolCall, enableNavigation, handleRedirect]);

  // Default client tools
  const defaultClientTools = enableNavigation ? {
    redirect: async ({ path }) => {
      if (!path) {
        return {
          success: false,
          error: 'No path provided for redirection',
        };
      }

      console.log(`Navigating to: ${path}`);
      setNavigationPath(path);
      navigate(path);

      return {
        success: true,
        message: `Navigated to ${path}`,
        path: path,
      };
    },
  } : {};

  // Merge default tools with custom tools
  const mergedClientTools = { ...defaultClientTools, ...clientTools };

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected');
      onConnect?.();
    },
    onDisconnect: () => {
      console.log('Disconnected');
      onDisconnect?.();
    },
    onMessage: (message) => {
      console.log('Message:', message);
      onMessage?.(message);
    },
    onError: (error) => {
      console.error('Error:', error);
      onError?.(error);
    },
    clientTools: mergedClientTools,
    onToolCall: handleToolCall,
  });

  const startConversation = useCallback(async () => {
    if (!agentId) {
      console.error('No agent ID provided');
      return false;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // Prepare session configuration
      const sessionConfig = {};

      // Add agentId or url (one is required)
      if (agentId) {
        sessionConfig.agentId = agentId;
      }
      if (url) {
        sessionConfig.url = url;
      }

      // Add overrides if provided
      if (Object.keys(overrides).length > 0) {
        sessionConfig.overrides = overrides;
      }
      console.log('sessionConfig', sessionConfig);
      await conversation.startSession(sessionConfig);
      return true;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      onError?.(error);
      return false;
    }
  }, [conversation, agentId, overrides, onError]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
      setToolCalls([]); // Clear tool call history
      setNavigationPath('');
      return true;
    } catch (error) {
      console.error('Failed to stop conversation:', error);
      onError?.(error);
      return false;
    }
  }, [conversation, onError]);

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';

  return {
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
};
