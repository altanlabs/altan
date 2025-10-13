import { useEffect, useRef } from 'react';

/**
 * Hook to log component re-renders in development
 * Usage: useRenderLogger('ComponentName', { prop1, prop2 })
 */
export const useRenderLogger = (componentName, props = {}) => {
  const renderCount = useRef(0);
  const prevProps = useRef(props);

  useEffect(() => {
    renderCount.current += 1;

    if (import.meta.env.DEV) {
      const changedProps = {};
      let hasChanges = false;

      Object.keys(props).forEach(key => {
        if (prevProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: prevProps.current[key],
            to: props[key],
          };
          hasChanges = true;
        }
      });

      if (renderCount.current === 1) {
        // eslint-disable-next-line no-console
        console.log(`🎨 [${componentName}] Initial render`);
      } else if (hasChanges) {
        // eslint-disable-next-line no-console
        console.log(
          `🔄 [${componentName}] Re-render #${renderCount.current}`,
          '\n  Changed props:',
          changedProps
        );
      } else {
        // eslint-disable-next-line no-console
        console.log(
          `⚠️ [${componentName}] Re-render #${renderCount.current} (NO PROP CHANGES - potential optimization needed)`
        );
      }

      prevProps.current = props;
    }
  });

  return renderCount.current;
};

export default useRenderLogger;

