/**
 * Handles postMessage events from the iframe preview
 * Processes different message types and triggers appropriate actions
 */

export const handleIframeMessage = (
  event,
  { interfaceId, iframeRef, onError, onRebuildNeeded },
) => {
  // Validate that the message came from the iframe
  if (event.source !== iframeRef.current?.contentWindow) {
    return;
  }

  const { data } = event;

  // Check if message has a type field
  if (!data || typeof data !== 'object' || !data.type) {
    return;
  }

  // Handle different message types
  switch (data.type) {
    case 'altan:preview:rebuild-artifact': {
      // eslint-disable-next-line no-console
      console.log('🔨 Rebuild artifact requested:', {
        status: data.status,
        path: data.path,
        host: data.host,
        timestamp: data.timestamp,
      });

      // Handle 404 status - artifact needs rebuild
      if (data.status === 404) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ Preview artifact not found (404) - triggering rebuild');
        if (onRebuildNeeded) {
          onRebuildNeeded({
            interfaceId,
            path: data.path,
            host: data.host,
            status: data.status,
          });
        }
      }
      break;
    }

    case 'altan:preview:error': {
      // eslint-disable-next-line no-console
      console.error('❌ Preview error received:', data);
      if (onError) {
        onError({
          message: data.message,
          stack: data.stack,
          timestamp: data.timestamp,
        });
      }
      break;
    }

    case 'altan:preview:ready': {
      // eslint-disable-next-line no-console
      console.log('✅ Preview iframe ready:', data);
      // Preview is loaded and ready
      break;
    }

    case 'altan:preview:navigation': {
      // eslint-disable-next-line no-console
      console.log('🧭 Preview navigation:', {
        from: data.from,
        to: data.to,
        timestamp: data.timestamp,
      });
      // Track navigation within preview
      break;
    }

    case 'altan:preview:console': {
      // Forward console messages from iframe
      const level = data.level || 'log';
      const prefix = '🖥️ [Preview Console]';

      switch (level) {
        case 'error':
          // eslint-disable-next-line no-console
          console.error(prefix, ...data.args);
          break;
        case 'warn':
          // eslint-disable-next-line no-console
          console.warn(prefix, ...data.args);
          break;
        case 'info':
          // eslint-disable-next-line no-console
          console.info(prefix, ...data.args);
          break;
        default:
          // eslint-disable-next-line no-console
          console.log(prefix, ...data.args);
      }
      break;
    }

    case 'altan:preview:performance': {
      // eslint-disable-next-line no-console
      console.log('📊 Preview performance metrics:', {
        metric: data.metric,
        value: data.value,
        timestamp: data.timestamp,
      });
      // Track performance metrics from preview
      break;
    }

    default: {
      // eslint-disable-next-line no-console
      console.log('📬 Unknown message type:', data.type, data);
      break;
    }
  }
};

export default handleIframeMessage;
