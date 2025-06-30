import { useState, useEffect } from 'react';

/**
 * Custom hook to track page visibility state.
 * Returns true when the document is visible.
 */
const usePageVisibility = (): boolean => {
  const [isVisible, setIsVisible] = useState<boolean>(
    typeof document !== 'undefined' && document.visibilityState === 'visible'
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};

export default usePageVisibility;
