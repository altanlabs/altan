import { memo } from 'react';

import CustomMarkdown from './CustomMarkdown.jsx';
import ErrorPartCard from './ErrorPartCard.jsx';
import ThinkingPartCard from './ThinkingPartCard.jsx';
import ToolPartCard from './ToolPartCard.jsx';

const MessagePartRenderer = memo(({ part, threadId, mode }) => {
  const partType = part.type || part.part_type || 'text';
  switch (partType) {
    case 'text':
      return (
        <div className="message-part-text">
          {part.text && (
            <CustomMarkdown
              text={part.text}
              threadId={threadId}
              minified={mode === 'mini'}
            />
          )}
        </div>
      );
    case 'tool':
      return (
        <div className="message-part-tool mb-2">
          <ToolPartCard
            partId={part.id}
            noClick={false}
          />
        </div>
      );
    case 'thinking':
      return (
        <div className="message-part-thinking mb-2">
          <ThinkingPartCard
            partId={part.id}
          />
        </div>
      );
    case 'error':
      return (
        <div className="message-part-error mb-2">
          <ErrorPartCard
            partId={part.id}
          />
        </div>
      );
    default:
      // Only show unknown part types in development
      if (import.meta.env.DEV) {
        return (
          <div className="message-part-unknown">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Unknown part type: {partType}
            </div>
          </div>
        );
      }
      return null;
  }
}, (prevProps, nextProps) => {
  // Simplified comparison function for better streaming reliability
  const prevPart = prevProps.part;
  const nextPart = nextProps.part;

  // If part ID changed, definitely need to re-render
  if (!prevPart || !nextPart || prevPart.id !== nextPart.id) {
    return false;
  }

  // Check if context props changed
  if (prevProps.threadId !== nextProps.threadId || prevProps.mode !== nextProps.mode) {
    return false;
  }

  // For the same part, check if any render-relevant properties changed
  const partType = prevPart.type || prevPart.part_type || 'text';

  // Type-specific properties
  if (partType === 'text') {
    // For text parts, check both text content and is_done status
    // Check text length as well to ensure streaming updates are caught
    const textChanged = prevPart.text !== nextPart.text ||
                        (prevPart.text?.length || 0) !== (nextPart.text?.length || 0);
    const statusChanged = prevPart.is_done !== nextPart.is_done;

    // Return true only if nothing changed (memo should skip render)
    return !textChanged && !statusChanged;
  } else if (partType === 'tool') {
    // Tool parts use their own selectors, allow re-render for safety
    return true;
  } else if (partType === 'thinking') {
    return (
      prevPart.text === nextPart.text &&
      prevPart.status === nextPart.status &&
      prevPart.finished_at === nextPart.finished_at &&
      prevPart.is_done === nextPart.is_done
    );
  } else if (partType === 'error') {
    return (
      prevPart.error_message === nextPart.error_message &&
      prevPart.error_code === nextPart.error_code &&
      prevPart.error_type === nextPart.error_type
    );
  }

  return true; // For other types, assume no change needed
});

MessagePartRenderer.displayName = 'MessagePartRenderer';

export default MessagePartRenderer;
