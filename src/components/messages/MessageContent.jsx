import { Stack } from '@mui/material';
import { memo, useMemo } from 'react';

import CustomMarkdown from './CustomMarkdown.jsx';
import MessageError from './MessageError.jsx';
import MessagePartRenderer from './MessagePartRenderer.jsx';
import MessageMedia from './wrapper/MessageMedia.jsx';
import {
  makeSelectHasMessageContent,
  makeSelectHasMessageMedia,
  makeSelectMessageParts,
  selectMessagePartsById,
} from '../../redux/slices/room.js';
import { useSelector } from '../../redux/store.js';
import Iconify from '../iconify/Iconify.jsx';

const MessageContent = ({ message, threadId, mode = 'main' }) => {
  const selectors = useMemo(
    () => ({
      hasContent: makeSelectHasMessageContent(),
      hasMedia: makeSelectHasMessageMedia(),
      messageParts: makeSelectMessageParts(),
    }),
    [],
  );

  const hasContent = useSelector((state) => selectors.hasContent(state, message.id));
  const hasMessageMedia = useSelector((state) => selectors.hasMedia(state, message.id));
  const messageParts = useSelector((state) => selectors.messageParts(state, message.id));
  const partsById = useSelector(selectMessagePartsById);
  console.log('messageParts', messageParts);

  // Create sorted parts with fresh data on every render
  // The MessagePartRenderer memoization will handle preventing unnecessary re-renders
  const sortedParts = useMemo(() => {
    if (messageParts.length === 0) return [];

    return messageParts
      .map((partId) => partsById[partId])
      .filter(Boolean)
      .sort((a, b) => {
        // First, sort by order
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // Then, sort by block_order
        const blockOrderA = a.block_order ?? 0;
        const blockOrderB = b.block_order ?? 0;
        return blockOrderA - blockOrderB;
      });
  }, [messageParts, partsById]);

  // Show "Thinking..." only if there's no content, no message parts, no media, and no error
  const hasMessageParts = messageParts.length > 0;

  // Check if message has error in meta_data
  const hasMetaDataError = useMemo(() => {
    return !!(message.meta_data?.error_code || message.meta_data?.error_message || message.meta_data?.error_type);
  }, [message.meta_data]);

  // Check if response is empty
  const isEmptyResponse = useMemo(() => {
    return message.meta_data?.is_empty === true;
  }, [message.meta_data]);

  if (!hasContent && !hasMessageParts && !message.error && !hasMessageMedia && !hasMetaDataError && !isEmptyResponse) {
    return (
      <Stack
        spacing={1}
        width="100%"
      >
        <Iconify icon="svg-spinners:3-dots-fade" />
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
      {/* Main content area */}
      <div>
        {isEmptyResponse ? (
          // Show empty response indicator
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
            <Iconify icon="mdi:information-outline" className="w-4 h-4" />
            <span>No response generated</span>
          </div>
        ) : hasMetaDataError && !hasMessageParts ? (
          // Render error from meta_data if no message parts exist
          <div className="mb-2">
            <div className="w-full rounded-md bg-red-50/30 dark:bg-red-950/10 border-l-2 border-red-400 dark:border-red-600">
              <div className="px-2.5 py-2">
                <div className="flex items-start gap-1.5">
                  <Iconify icon="mdi:alert-circle-outline" className="w-3.5 h-3.5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5 opacity-70" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-medium text-red-800 dark:text-red-200 text-xs">
                        {message.meta_data.error_type || 'Error'}
                      </span>
                      {message.meta_data.error_code && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100/60 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                          {message.meta_data.error_code}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-red-700 dark:text-red-300 leading-relaxed mb-1.5">
                      {message.meta_data.error_message || 'An error occurred'}
                    </div>
                    {(message.meta_data.failed_in || message.meta_data.total_attempts) && (
                      <div className="flex flex-wrap gap-2 text-[11px] text-red-600/70 dark:text-red-400/70">
                        {message.meta_data.failed_in && (
                          <div className="flex items-center gap-1">
                            <Iconify icon="mdi:map-marker" className="w-2.5 h-2.5" />
                            <span>{message.meta_data.failed_in}</span>
                          </div>
                        )}
                        {message.meta_data.total_attempts && (
                          <div className="flex items-center gap-1">
                            <Iconify icon="mdi:refresh" className="w-2.5 h-2.5" />
                            <span>{message.meta_data.total_attempts} attempt{message.meta_data.total_attempts > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : hasMessageParts ? (
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
        ) : (
          // Show regular content
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
