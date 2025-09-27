import { Stack } from '@mui/material';
import { memo, useMemo } from 'react';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';

import CustomMarkdown from './CustomMarkdown.jsx';
import MessageError from './MessageError.jsx';
import MessagePartRenderer from './MessagePartRenderer.jsx';
import MessageThoughtAccordion from './MessageThoughtAccordion.jsx';
import MessageMedia from './wrapper/MessageMedia.jsx';
import MessageTaskExecutions from './wrapper/MessageTaskExecutions.jsx';
import {
  makeSelectHasMessageContent,
  makeSelectHasMessageMedia,
  makeSelectMessageContent,
  makeSelectMessageParts,
  makeSelectMessagePartsContent,
  selectMessagePartsById,
} from '../../redux/slices/room.js';
import { useSelector } from '../../redux/store.js';

// Function to extract commit resources from message content
function extractCommitResources(message) {
  if (!message) return [];

  const pattern = /\[(.*?)\]\((?:\/)?([^/]+)(?:\/([^/)]+))?\)/g;
  let match;
  const commitResources = [];

  while ((match = pattern.exec(message))) {
    const [, name, resourceType, resourceId] = match;
    if (name && resourceType && resourceType.toLowerCase() === 'commit') {
      commitResources.push({
        id: resourceId || resourceType,
        name,
        resourceName: resourceType,
        fullMatch: match[0], // Store the full match for removal
      });
    }
  }
  return commitResources;
}

// Function to extract database version resources from message content
function extractDatabaseVersionResources(message) {
  if (!message) return [];

  const pattern = /\[(.*?)\]\((?:\/)?([^/]+)(?:\/([^/)]+))?\)/g;
  let match;
  const databaseVersionResources = [];

  while ((match = pattern.exec(message))) {
    const [, name, resourceType, resourceId] = match;
    if (name && resourceType && resourceType.toLowerCase() === 'database-version') {
      databaseVersionResources.push({
        id: resourceId || resourceType,
        name,
        resourceName: resourceType,
        fullMatch: match[0], // Store the full match for removal
      });
    }
  }
  return databaseVersionResources;
}

const MessageContent = ({ message, threadId, mode = 'main' }) => {
  const selectors = useMemo(
    () => ({
      hasContent: makeSelectHasMessageContent(),
      hasMedia: makeSelectHasMessageMedia(),
      content: makeSelectMessageContent(),
      messageParts: makeSelectMessageParts(),
      partsContent: makeSelectMessagePartsContent(),
    }),
    [],
  );

  const hasContent = useSelector((state) => selectors.hasContent(state, message.id));
  const hasMessageMedia = useSelector((state) => selectors.hasMedia(state, message.id));
  const messageContent = useSelector((state) => selectors.content(state, message.id));
  const messageParts = useSelector((state) => selectors.messageParts(state, message.id));
  const partsContent = useSelector((state) => selectors.partsContent(state, message.id));
  const partsById = useSelector(selectMessagePartsById);

  // Use message parts content if available, otherwise fall back to legacy content
  const effectiveContent = useMemo(() => {
    if (messageParts.length > 0) {
      return partsContent;
    }
    return messageContent || '';
  }, [messageParts.length, partsContent, messageContent]);

  // Check if message contains commits
  const commitResources = useMemo(
    () => extractCommitResources(effectiveContent),
    [effectiveContent],
  );
  const hasCommits = commitResources.length > 0;

  // Check if message contains database versions
  const databaseVersionResources = useMemo(
    () => extractDatabaseVersionResources(effectiveContent),
    [effectiveContent],
  );
  const hasDatabaseVersions = databaseVersionResources.length > 0;

  // Combined logic for both commits and database versions
  const hasAnyWidgets = hasCommits || hasDatabaseVersions;
  const allWidgetResources = useMemo(
    () => [...commitResources, ...databaseVersionResources],
    [commitResources, databaseVersionResources],
  );

  // Remove both commits and database versions from text content
  const textContentWithoutWidgets = useMemo(() => {
    let cleanedContent = effectiveContent || '';
    allWidgetResources.forEach((widget) => {
      cleanedContent = cleanedContent.replace(widget.fullMatch, '');
    });
    return cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  }, [effectiveContent, allWidgetResources]);

  // Create markdown with all widgets
  const widgetOnlyContent = useMemo(() => {
    return allWidgetResources
      .map(
        (widget) => `[${widget.name}](${widget.resourceName}${widget.id ? `/${widget.id}` : ''})`,
      )
      .join('\n\n');
  }, [allWidgetResources]);

  // Create sorted parts with fresh data on every render
  // The MessagePartRenderer memoization will handle preventing unnecessary re-renders
  const sortedParts = useMemo(() => {
    if (messageParts.length === 0) return [];

    return messageParts
      .map((partId) => partsById[partId])
      .filter(Boolean)
      .sort((a, b) => (a.order || a.block_order || 0) - (b.order || b.block_order || 0));
  }, [messageParts, partsById]);

  // Show "Thinking..." only if there's no content, no message parts, no media, and no error
  const hasMessageParts = messageParts.length > 0;

  if (!hasContent && !hasMessageParts && !message.error && !hasMessageMedia && !effectiveContent) {
    return (
      <Stack
        spacing={1}
        width="100%"
      >
        <TextShimmer
          className="text-sm font-semibold truncate"
          duration={2}
        >
          Thinking...
        </TextShimmer>
        {message?.thread_id === threadId && (
          <MessageTaskExecutions
            messageId={message.id}
            date_creation={message.date_creation}
          />
        )}
      </Stack>
    );
  }

  return (
    <Stack
      spacing={0}
      width="100%"
      sx={{
        pt: 0.25,
      }}
    >
      {/* Show accordion with thought process when commits are detected */}
      {hasAnyWidgets && (textContentWithoutWidgets || message?.thread_id === threadId) && (
        <MessageThoughtAccordion
          textContentWithoutWidgets={textContentWithoutWidgets}
          message={message}
          threadId={threadId}
        />
      )}

      {/* Main content area */}
      <div>
        {hasMessageParts ? (
          // Render message parts in order
          <div className="message-parts-container">
            {sortedParts.map((part) => (
              <MessagePartRenderer
                key={part.id}
                part={part}
                threadId={threadId}
                mode={mode}
              />
            ))}
          </div>
        ) : hasAnyWidgets ? (
          // Show only commit widgets as main content (legacy)
          <CustomMarkdown
            text={widgetOnlyContent}
            threadId={threadId}
            minified={mode === 'mini'}
          />
        ) : (
          // Show regular content (legacy)
          <CustomMarkdown
            messageId={message?.id}
            threadId={threadId}
            minified={mode === 'mini'}
          />
        )}
      </div>
      <MessageError message={message} />
      <MessageMedia messageId={message.id} />
    </Stack>
  );
};

export default memo(MessageContent);
