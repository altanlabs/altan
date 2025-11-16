import { useCallback, RefObject } from 'react';

/**
 * Custom hook for handling prompt expansion/collapse
 * Scrolls to hero section when compact prompt is clicked
 * Works with a scrollable container ref
 */
export const usePromptExpansion = (scrollContainerRef: RefObject<HTMLElement>): { expandPrompt: () => void } => {
  const expandPrompt = useCallback(() => {
    const container = scrollContainerRef.current;
    const heroElement = document.getElementById('hero');
    
    if (container && heroElement) {
      // Calculate the position of hero element relative to container
      const containerRect = container.getBoundingClientRect();
      const heroRect = heroElement.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const offset = heroRect.top - containerRect.top + scrollTop;
      
      // Smooth scroll to hero section within the container
      container.scrollTo({
        top: offset,
        behavior: 'smooth',
      });
      
      // Focus on the prompt input after animation
      setTimeout(() => {
        const promptInput = heroElement.querySelector('textarea');
        if (promptInput) {
          promptInput.focus();
        }
      }, 600);
    } else if (container) {
      // Fallback: scroll to top of container
      container.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [scrollContainerRef]);

  return { expandPrompt };
};

