import { useEffect, useMemo } from 'react';

/**
 * A custom hook to listen to window messages from allowed origins.
 *
 * @param allowedOrigins - An array of exact origin strings or RegExp patterns to match allowed origins.
 * @param handleMessage - Callback function invoked when a valid message event is received.
 */
export const useMessageListener = (
  allowedOrigins: (string | RegExp)[],
  handleMessage: (event: MessageEvent) => void
): void => {
  const originMatchers = useMemo<(string | RegExp)[]>(() => {
    return allowedOrigins.map((origin) => {
      if (origin instanceof RegExp) {
        return origin;
      }
      if (origin.includes('*')) {
        // Convert wildcard patterns to RegExp
        const regexPattern = `^${origin.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`;
        return new RegExp(regexPattern);
      }
      return origin;
    });
  }, [allowedOrigins]);

  useEffect(() => {
    const handleEvent = (event: MessageEvent): void => {
      if (!event.origin) return; // Ignore events with no origin (e.g., same-origin sandboxed iframes)

      const isAllowed = originMatchers.some((matcher) => {
        if (typeof matcher === 'string') {
          return matcher === event.origin;
        }
        return matcher.test(event.origin);
      });

      if (isAllowed) {
        handleMessage(event);
      }
    };

    window.addEventListener('message', handleEvent);

    return () => {
      window.removeEventListener('message', handleEvent);
    };
  }, [originMatchers, handleMessage]);
};

export default useMessageListener;
