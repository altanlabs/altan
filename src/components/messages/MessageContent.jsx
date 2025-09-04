import { Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { CLEAR_EDITOR_COMMAND } from 'lexical';
import { memo, useMemo, useState, useEffect } from 'react';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';

import CustomMarkdown from './CustomMarkdown.jsx';
import Editor from '../editor/Editor.tsx';
import MessageMedia from './wrapper/MessageMedia.jsx';
import MessageTaskExecutions from './wrapper/MessageTaskExecutions.jsx';
import {
  makeSelectHasMessageContent,
  makeSelectHasMessageMedia,
  makeSelectMessageContent,
  sendMessage,
  updateMessage,
  selectMe,
} from '../../redux/slices/room.js';
import { useSelector, dispatch } from '../../redux/store.js';
import Iconify from '../iconify/Iconify.jsx';

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
    }),
    [],
  );

  const hasContent = useSelector((state) => selectors.hasContent(state, message.id));
  const hasMessageMedia = useSelector((state) => selectors.hasMedia(state, message.id));
  const messageContent = useSelector((state) => selectors.content(state, message.id));
  const me = useSelector(selectMe);

  const [isEditing, setIsEditing] = useState(false);
  const [editorEmpty, setEditorEmpty] = useState(false);
  const [thoughtAccordionOpen, setThoughtAccordionOpen] = useState(false);
  const editorRef = useMemo(() => ({ current: {} }), []);

  const isOwnMessage = message.member_id === me?.id;

  // Check if message contains commits
  const commitResources = useMemo(() => extractCommitResources(messageContent), [messageContent]);
  const hasCommits = commitResources.length > 0;

  // Check if message contains database versions
  const databaseVersionResources = useMemo(
    () => extractDatabaseVersionResources(messageContent),
    [messageContent],
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
    let cleanedContent = messageContent || '';
    allWidgetResources.forEach((widget) => {
      cleanedContent = cleanedContent.replace(widget.fullMatch, '');
    });
    return cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  }, [messageContent, allWidgetResources]);

  // Create markdown with all widgets
  const widgetOnlyContent = useMemo(() => {
    return allWidgetResources
      .map(
        (widget) => `[${widget.name}](${widget.resourceName}${widget.id ? `/${widget.id}` : ''})`,
      )
      .join('\n\n');
  }, [allWidgetResources]);

  const handleMessageClick = () => {
    console.log('TODO');
    // if (isOwnMessage && hasContent) {
    //   setIsEditing(true);
    // }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    if (editorRef.current?.editor) {
      editorRef.current.editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
    }
  };

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    const content = editorRef.current?.editor?._editorState.read(() => {
      const root = editorRef.current.editor.getEditorState()._nodeMap.get('root');
      return root.getTextContent();
    });

    if (content && !editorEmpty && content !== messageContent) {
      dispatch(
        updateMessage({
          messageId: message.id,
          content,
          threadId,
        }),
      );
    }
    setIsEditing(false);
    editorRef.current?.editor?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.sendContent = handleSaveEdit;
    }
  }, [handleSaveEdit]);

  if (!hasContent && !message.error && !hasMessageMedia) {
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
        <Accordion
          expanded={thoughtAccordionOpen}
          onChange={() => setThoughtAccordionOpen(!thoughtAccordionOpen)}
          className="w-full"
          sx={{
            margin: 0,
            '&.MuiAccordion-root.Mui-expanded': { margin: 0 },
            '&.MuiAccordion-root': {
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              '&:before': { display: 'none' },
            },
          }}
        >
          <AccordionSummary
            expandIcon={<Iconify icon="mdi:chevron-down" />}
            sx={{
              minHeight: 'auto',
              '& .MuiAccordionSummary-content': {
                margin: '8px 0',
                '&.Mui-expanded': { margin: '8px 0' },
              },
            }}
          >
            <div className="flex items-center gap-2">
              <Iconify
                icon="mdi:brain"
                className="text-gray-600 dark:text-gray-400"
                width={16}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Worked for a while
              </span>
            </div>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '0 16px 16px 16px' }}>
            <Stack spacing={1}>
              {/* Show text content without commits */}
              {textContentWithoutWidgets && (
                <div onClick={handleMessageClick}>
                  {isEditing ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="relative flex w-full mx-16 xl:mx-10 lg:mx-7 md:mx-7 sm:mx-2 max-w-[850px] flex-col pb-3 pt-3 px-4 gap-2 rounded-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-gray-300/20 dark:border-white/10 transition-colors duration-200 hover:bg-white/95 dark:hover:bg-gray-900/95 hover:border-gray-400/30 dark:hover:border-white/15 focus-within:bg-white/95 dark:focus-within:bg-gray-900/95 focus-within:border-blue-500/50 dark:focus-within:border-blue-400/50"
                    >
                      <div className="flex flex-col w-full relative py-1">
                        <Editor
                          key={`edit_${message.id}`}
                          threadId={threadId}
                          editorRef={editorRef}
                          placeholder="Edit your message..."
                          setEditorEmpty={setEditorEmpty}
                          disabled={false}
                          namespace={`edit_${message.id}`}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-1 text-sm font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="px-4 py-1 text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md transition-colors"
                          >
                            Enviar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={isOwnMessage ? 'cursor-pointer hover:opacity-80' : ''}>
                      <CustomMarkdown
                        text={textContentWithoutWidgets}
                        threadId={threadId}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Show task executions in the accordion */}
              {message?.thread_id === threadId && (
                <MessageTaskExecutions
                  messageId={message.id}
                  date_creation={message.date_creation}
                />
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Main content area */}
      <div onClick={handleMessageClick}>
        {isEditing && !hasAnyWidgets ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full mx-16 xl:mx-10 lg:mx-7 md:mx-7 sm:mx-2 max-w-[850px] flex-col pb-3 pt-3 px-4 gap-2 rounded-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-gray-300/20 dark:border-white/10 transition-colors duration-200 hover:bg-white/95 dark:hover:bg-gray-900/95 hover:border-gray-400/30 dark:hover:border-white/15 focus-within:bg-white/95 dark:focus-within:bg-gray-900/95 focus-within:border-blue-500/50 dark:focus-within:border-blue-400/50"
          >
            <div className="flex flex-col w-full relative py-1">
              <Editor
                key={`edit_${message.id}`}
                threadId={threadId}
                editorRef={editorRef}
                placeholder="Edit your message..."
                setEditorEmpty={setEditorEmpty}
                disabled={false}
                namespace={`edit_${message.id}`}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-1 text-sm font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-1 text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={isOwnMessage ? 'cursor-pointer hover:opacity-80' : ''}>
            {hasAnyWidgets ? (
              // Show only commit widgets as main content
              <CustomMarkdown
                text={widgetOnlyContent}
                threadId={threadId}
                minified={mode === 'mini'}
              />
            ) : (
              // Show regular content
              <CustomMarkdown
                messageId={message?.id}
                threadId={threadId}
                minified={mode === 'mini'}
              />
            )}
          </div>
        )}
      </div>

      {message.error && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <Iconify
              icon="bx:error-alt"
              className="text-red-500 dark:text-red-400"
            />
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
              {message.error.type || 'Provider error'}
            </h2>
          </div>
          <div className="mt-2 flex flex-col space-y-3">
            <p className="text-sm text-red-700 dark:text-red-300">
              We are experiencing high demand. {message.error.message}
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  dispatch(
                    sendMessage({
                      content: 'continue',
                      threadId: message.thread_id,
                    }),
                  );
                }}
                className="inline-flex items-center px-3 py-1 text-sm font-medium bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Retry
              </button>
              <a
                href="https://www.altan.ai/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Upgrade
              </a>
            </div>
          </div>
        </div>
      )}
      <MessageMedia messageId={message.id} />

      {!hasAnyWidgets && message?.thread_id === threadId && (
        <MessageTaskExecutions
          messageId={message.id}
          date_creation={message.date_creation}
        />
      )}
    </Stack>
  );
};

export default memo(MessageContent);
