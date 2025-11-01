import { memo } from 'react';

import ErrorPartCard from './ErrorPartCard.jsx';
import TextPartRenderer from './TextPartRenderer.jsx';
import ThinkingPartCard from './ThinkingPartCard.jsx';
import ToolPartCard from './ToolPartCard.jsx';

const MessagePartRenderer = memo(({ part, threadId, mode }) => {
  const partType = part.type || part.part_type || 'text';
  switch (partType) {
    case 'text':
      return (
        <TextPartRenderer
          part={part}
          threadId={threadId}
          mode={mode}
        />
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
});

MessagePartRenderer.displayName = 'MessagePartRenderer';

export default MessagePartRenderer;
