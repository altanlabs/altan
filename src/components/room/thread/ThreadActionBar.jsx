import { IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useMemo, useEffect, useCallback, useState, memo } from 'react';
import { encoding_for_model } from 'tiktoken';

import analytics from '../../../lib/analytics';
import { selectCurrentAltaner } from '../../../redux/slices/altaners';
import {
  makeSelectThreadMessageCount,
  selectMessagesIdsByThread,
  selectRoomState,
  selectMessagesExecutions,
  selectExecutionsById,
  makeSelectMessageRunning,
  makeSelectMessageUserLiked,
  makeSelectMessageUserDisliked,
  reactToMessage,
  copyMessage,
} from '../../../redux/slices/room';
import { dispatch, useSelector } from '../../../redux/store';
import FeedbackDialog from '../../dialogs/FeedbackDialog';
import Iconify from '../../iconify/Iconify.jsx';
import { useSnackbar } from '../../snackbar';

// Maximum token limit for context window
const MAX_TOKENS = 100000;

// Mini pie chart component - extracted to prevent recreation on every render
const TokenPieChart = memo(({ tokenPercentage }) => {
  const size = 20;
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;

  // Cap the visual progress at 100% for the chart display
  const displayPercentage = Math.min(tokenPercentage, 100);
  const strokeDashoffset = circumference - (displayPercentage / 100) * circumference;

  // Determine colors based on usage level
  const isNearLimit = tokenPercentage >= 75;
  const isOverLimit = tokenPercentage >= 100;

  const getProgressColor = () => {
    if (isOverLimit) return 'text-red-500 dark:text-red-400';
    if (isNearLimit) return 'text-orange-500 dark:text-orange-400';
    return 'text-gray-700 dark:text-gray-300';
  };

  const getTextColor = () => {
    if (isOverLimit) return 'text-red-600 dark:text-red-400';
    if (isNearLimit) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="flex items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-300 dark:text-gray-600"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={getProgressColor()}
        />
      </svg>
      {/* Percentage text next to chart */}
      <span className={`text-xs font-medium ${getTextColor()}`}>
        {tokenPercentage}%
      </span>
    </div>
  );
});
TokenPieChart.displayName = 'TokenPieChart';

const ThreadActionBar = ({ threadId, lastMessageId, isAgentMessage = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  const messageCountSelector = useMemo(makeSelectThreadMessageCount, []);
  const messageCount = useSelector((state) => messageCountSelector(state, threadId));

  // Check if the last message is still running/being generated
  const messageRunningSelector = useMemo(makeSelectMessageRunning, []);
  const isLastMessageRunning = useSelector((state) => messageRunningSelector(state, lastMessageId));

  // Check if current user has liked/disliked the last message
  const userLikedSelector = useMemo(makeSelectMessageUserLiked, []);
  const userDislikedSelector = useMemo(makeSelectMessageUserDisliked, []);
  const hasUserLiked = useSelector((state) => userLikedSelector(state, lastMessageId));
  const hasUserDisliked = useSelector((state) => userDislikedSelector(state, lastMessageId));

  // Create a stable selector for thread message IDs
  const threadMessageIdsSelector = useMemo(
    () => (state) => {
      const idsByThread = selectMessagesIdsByThread(state);
      return idsByThread[threadId] || [];
    },
    [threadId]
  );
  
  // Create a stable selector for thread-specific messages data
  const threadMessagesDataSelector = useMemo(
    () => (state) => {
      const roomState = selectRoomState(state);
      const messagesContent = roomState.messagesContent;
      const messagesExecutions = selectMessagesExecutions(state);
      const executionsById = selectExecutionsById(state);
      const threadIds = selectMessagesIdsByThread(state)[threadId] || [];
      
      // Create a stable reference by stringifying keys and checking values
      const result = {
        messagesContent: {},
        messagesExecutions: {},
        executionsById,
        _version: 0, // Version for change detection
      };
      
      let hasContent = false;
      threadIds.forEach((msgId) => {
        if (messagesContent[msgId]) {
          result.messagesContent[msgId] = messagesContent[msgId];
          hasContent = true;
        }
        if (messagesExecutions[msgId]) {
          result.messagesExecutions[msgId] = messagesExecutions[msgId];
        }
      });
      
      // Create a version hash for shallow comparison
      if (hasContent) {
        result._version = threadIds.length + Object.keys(result.messagesContent).length;
      }
      
      return result;
    },
    [threadId]
  );
  
  const threadMessageIds = useSelector(threadMessageIdsSelector);
  const threadMessagesData = useSelector(threadMessagesDataSelector, (prev, next) => {
    // Only re-render if the version or content actually changed
    if (!prev || !next) return false;
    if (prev._version !== next._version) return false;
    
    // Deep check message content
    const prevMsgKeys = Object.keys(prev.messagesContent);
    const nextMsgKeys = Object.keys(next.messagesContent);
    if (prevMsgKeys.length !== nextMsgKeys.length) return false;
    
    for (const key of prevMsgKeys) {
      if (prev.messagesContent[key] !== next.messagesContent[key]) return false;
    }
    
    return true;
  });

  // Get current altaner and message content for feedback
  const currentAltaner = useSelector(selectCurrentAltaner);
  const lastMessageContent = lastMessageId ? threadMessagesData.messagesContent[lastMessageId] : null;

  // Check if there's an upload in progress for this thread
  const isUploading = useSelector((state) => selectRoomState(state).isUploading);
  const isUploadingForThread = isUploading && isUploading.threadId === threadId;

  // Tiktoken tokenizer for accurate token counting
  const encoder = useMemo(() => {
    try {
      return encoding_for_model('gpt-4');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load tiktoken encoder, falling back to approximation:', error);
      return null;
    }
  }, []);

  const countTokens = useCallback(
    (text) => {
      if (!text || typeof text !== 'string') return 0;

      if (encoder) {
        try {
          const tokens = encoder.encode(text);
          return tokens.length;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Error encoding text with tiktoken:', error);
        }
      }

      // Fallback approximation if tiktoken fails
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      return Math.ceil(words.length * 1.3);
    },
    [encoder],
  );

  // Calculate total tokens for this thread (including executions)
  const totalTokens = useMemo(() => {
    if (!threadId || threadMessageIds.length === 0) return 0;

    let tokens = 0;

    threadMessageIds.forEach((messageId) => {
      // Count tokens from message text
      const messageText = threadMessagesData.messagesContent[messageId];
      if (messageText) {
        tokens += countTokens(messageText);
      }

      // Count tokens from task executions (input and output)
      const executionIds = threadMessagesData.messagesExecutions[messageId];
      if (executionIds && executionIds.length > 0) {
        executionIds.forEach((executionId) => {
          const execution = threadMessagesData.executionsById[executionId];
          if (execution) {
            // Count tokens from execution input
            if (execution.input && typeof execution.input === 'string') {
              tokens += countTokens(execution.input);
            }
            // Count tokens from execution content (output)
            if (execution.content && typeof execution.content === 'string') {
              tokens += countTokens(execution.content);
            }
            // Count tokens from execution arguments if it's a string
            if (execution.arguments && typeof execution.arguments === 'string') {
              tokens += countTokens(execution.arguments);
            } else if (execution.arguments && typeof execution.arguments === 'object') {
              // If arguments is an object, stringify it for token counting
              try {
                const argsString = JSON.stringify(execution.arguments);
                tokens += countTokens(argsString);
              } catch (error) {
                // eslint-disable-next-line no-console
                console.warn('Error stringifying execution arguments:', error);
              }
            }
          }
        });
      }
    });

    return tokens;
  }, [
    threadId,
    threadMessageIds,
    threadMessagesData,
    countTokens,
  ]);

  // Cleanup encoder on unmount
  useEffect(() => {
    return () => {
      if (encoder) {
        try {
          encoder.free();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [encoder]);

  // Feedback submission handler
  const handleFeedbackSubmit = useCallback(async (feedbackData) => {
    try {
      const isLike = feedbackData.reason === 'like';
      const eventName = isLike ? 'liked_message' : 'disliked_message';
      
      await analytics.track(eventName, {
        message_id: feedbackData.messageId,
        thread_id: feedbackData.threadId,
        altaner_id: feedbackData.altanerId || currentAltaner?.id,
        reason: feedbackData.reason,
        additional_feedback: feedbackData.additionalFeedback || '',
        message_length: feedbackData.messageContent?.length || 0,
      });
    } catch (error) {
      // Re-throw error to be handled by the dialog component
      throw error;
    }
  }, [currentAltaner?.id]);

  // Action handlers
  const handleLike = useCallback(async () => {
    if (lastMessageId) {
      // First create the like reaction
      dispatch(reactToMessage({ messageId: lastMessageId, reactionType: 'like' }));

      // Then send feedback data for like
      try {
        await handleFeedbackSubmit({
          messageId: lastMessageId,
          threadId,
          altanerId: currentAltaner?.id,
          messageContent: lastMessageContent,
          reason: 'like',
          additionalFeedback: '',
        });
      } catch {
        // Silently handle error for like feedback - don't show error to user
        // as the like reaction was already successful
      }
    }
  }, [lastMessageId, threadId, currentAltaner?.id, lastMessageContent, handleFeedbackSubmit]);

  const handleDislike = useCallback(() => {
    if (lastMessageId) {
      // First create the dislike reaction
      dispatch(reactToMessage({ messageId: lastMessageId, reactionType: 'dislike' }));
      // Then open the feedback dialog
      setFeedbackDialogOpen(true);
    }
  }, [lastMessageId]);

  const handleCopy = useCallback(() => {
    if (lastMessageId) {
      dispatch(copyMessage({ messageId: lastMessageId }));
      enqueueSnackbar('Message copied to clipboard', { variant: 'success' });
    }
  }, [lastMessageId, enqueueSnackbar]);

  // Don't render if no threadId, no messages, if the last message is still being generated, or if uploading
  if (!threadId || messageCount === 0 || isLastMessageRunning || isUploadingForThread) {
    return null;
  }

  // Token limit and percentage calculation
  const tokenPercentage = Math.round((totalTokens / MAX_TOKENS) * 100);
  const isOverLimit = tokenPercentage >= 75;

  // Format token count for display
  const formatTokenCount = (tokens) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  const getTokenTooltip = () => {
    const formattedLimit = formatTokenCount(MAX_TOKENS);
    const formattedUsed = formatTokenCount(totalTokens);

    if (tokenPercentage >= 100) {
      return `Context is ${tokenPercentage}% full (${formattedUsed}/${formattedLimit}). Context exceeded - start a new chat to improve performance.`;
    }
    if (isOverLimit) {
      return `Context is ${tokenPercentage}% full (${formattedUsed}/${formattedLimit}). Start a new chat to improve performance.`;
    }
    return `${formattedUsed} of ${formattedLimit} context tokens used`;
  };

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto px-4 pb-4">
      {/* Left: Context warning message (when needed) */}
      <div className="flex-1 flex items-center">
        {isOverLimit && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg ${
              tokenPercentage >= 100
                ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700/40'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30'
            }`}
          >
            <Iconify
              icon="mdi:alert-circle-outline"
              width={16}
              className={
                tokenPercentage >= 100
                  ? 'text-red-700 dark:text-red-300 flex-shrink-0'
                  : 'text-red-600 dark:text-red-400 flex-shrink-0'
              }
            />
            <span
              className={`text-sm font-medium ${
                tokenPercentage >= 100
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-red-700 dark:text-red-300'
              }`}
            >
              {isMobile
                ? tokenPercentage >= 100
                  ? 'Context exceeded - new chat needed'
                  : 'Context full - start new chat'
                : tokenPercentage >= 100
                  ? 'Context exceeded - start a new chat immediately.'
                  : 'Start a new chat for better performance.'}
            </span>
          </div>
        )}
      </div>

      {/* Right: Pie chart and action buttons */}
      <div className="flex items-center gap-3">
        {/* Token usage pie chart */}
        <Tooltip
          title={getTokenTooltip()}
          arrow
        >
          <div className="cursor-help">
            <TokenPieChart tokenPercentage={tokenPercentage} />
          </div>
        </Tooltip>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Like/Dislike buttons - only show for agent messages */}
          {isAgentMessage && lastMessageId && (
            <>
              <Tooltip title="Like">
                <IconButton
                  size="small"
                  onClick={handleLike}
                  sx={{
                    width: 28,
                    height: 28,
                    color: hasUserLiked ? 'success.main' : 'text.secondary',
                    backgroundColor: hasUserLiked ? 'rgba(76, 175, 80, 0.12)' : 'transparent',
                    '&:hover': {
                      color: 'success.main',
                      backgroundColor: 'rgba(76, 175, 80, 0.08)',
                    },
                  }}
                >
                  <Iconify
                    icon={hasUserLiked ? 'mdi:thumb-up' : 'mdi:thumb-up-outline'}
                    width={16}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="Dislike">
                <IconButton
                  size="small"
                  onClick={handleDislike}
                  sx={{
                    width: 28,
                    height: 28,
                    color: hasUserDisliked ? 'error.main' : 'text.secondary',
                    backgroundColor: hasUserDisliked ? 'rgba(244, 67, 54, 0.12)' : 'transparent',
                    '&:hover': {
                      color: 'error.main',
                      backgroundColor: 'rgba(244, 67, 54, 0.08)',
                    },
                  }}
                >
                  <Iconify
                    icon={hasUserDisliked ? 'mdi:thumb-down' : 'mdi:thumb-down-outline'}
                    width={16}
                  />
                </IconButton>
              </Tooltip>
            </>
          )}

          {/* Copy message button - only show if there's a last message */}
          {lastMessageId && (
            <Tooltip title="Copy message">
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{
                  width: 28,
                  height: 28,
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  },
                }}
              >
                <Iconify
                  icon="mdi:content-copy"
                  width={16}
                />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        onSubmit={handleFeedbackSubmit}
        messageId={lastMessageId}
        threadId={threadId}
        altanerId={currentAltaner?.id}
        messageContent={lastMessageContent}
      />
    </div>
  );
};

ThreadActionBar.displayName = 'ThreadActionBar';

export default memo(ThreadActionBar);
