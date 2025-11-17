/**
 * useNavigateToMessage Hook
 * Scrolls to a specific message in the thread
 */

import { useCallback } from 'react';

export const useNavigateToMessage = () => {
  const navigateToMessage = useCallback((messageId: string) => {
    // Find the message element by ID
    const messageElement = document.getElementById(`message-${messageId}`);
    
    if (messageElement) {
      // Smooth scroll to the message
      messageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add a highlight effect (will be removed after animation)
      messageElement.classList.add('highlight-message');
      setTimeout(() => {
        messageElement.classList.remove('highlight-message');
      }, 2000);
    }
  }, []);

  return {
    navigateToMessage,
  };
};

