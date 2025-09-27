import { memo } from 'react';

import CustomMarkdown from './CustomMarkdown.jsx';
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
  // Custom comparison function for better memoization
  // Only re-render if THIS specific part's relevant data has changed
  const prevPart = prevProps.part;
  const nextPart = nextProps.part;

  if (!prevPart || !nextPart || prevPart.id !== nextPart.id) {
    return false; // Different parts, need to re-render
  }

  // For the same part, check if any render-relevant properties changed
  const partType = prevPart.type || prevPart.part_type || 'text';

  // Common properties that always matter
  const commonPropsEqual = (
    prevPart.is_done === nextPart.is_done &&
    prevPart.error === nextPart.error &&
    prevPart.result === nextPart.result &&
    prevProps.threadId === nextProps.threadId &&
    prevProps.mode === nextProps.mode
  );

  if (!commonPropsEqual) return false;

  // Type-specific properties
  if (partType === 'text') {
    return prevPart.text === nextPart.text;
  } else if (partType === 'tool') {
    return (
      prevPart.arguments === nextPart.arguments &&
      prevPart.name === nextPart.name &&
      prevPart.status === nextPart.status
    );
  }

  return true; // For other types, assume no change needed
});

MessagePartRenderer.displayName = 'MessagePartRenderer';

export default MessagePartRenderer;
