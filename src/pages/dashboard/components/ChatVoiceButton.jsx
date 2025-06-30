import React from 'react';

import { useVoiceConversation } from '../../../hooks/useVoiceConversation';

/**
 * A simple voice button that can be embedded in chat interfaces
 * This shows how the hook can be reused with different configurations
 */
const ChatVoiceButton = ({ agentId, onTranscript, customTools = {} }) => {
  const { isConnected, isConnecting, startConversation, stopConversation } = useVoiceConversation({
    agentId,
    enableNavigation: false, // Disable navigation for chat context
    clientTools: customTools,
    onMessage: (message) => {
      // Pass transcripts to parent component
      if (message.type === 'transcript') {
        onTranscript?.(message.content);
      }
    },
    onError: (error) => {
      console.error('Chat voice error:', error);
    },
  });

  if (isConnected) {
    return (
      <button
        onClick={stopConversation}
        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
        title="Stop voice chat"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={startConversation}
      disabled={isConnecting}
      className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full transition-colors"
      title="Start voice chat"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
      </svg>
    </button>
  );
};

export default ChatVoiceButton;
