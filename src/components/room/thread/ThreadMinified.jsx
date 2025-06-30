import { Stack, Typography } from '@mui/material';
import { m } from 'framer-motion';
import { useRef, memo, useCallback, useMemo, useState } from 'react';
import { batch } from 'react-redux';

import MessageMinified from './MessageMinified.jsx';
import ThreadPopoverDetails from './ThreadPopoverDetails.jsx';
import useResponsive from '../../../hooks/useResponsive';
import { cn } from '../../../lib/utils.ts';
import {
  makeSelectLastMessageOfThread,
  makeHasUnreadMessages,
  makeSelectThreadAttribute,
  makeSelectThreadName,
  setDrawerOpen,
  setThreadMain,
} from '../../../redux/slices/room';
import { dispatch, useSelector } from '../../../redux/store.js';
import { formatRelativeTime } from '../../../utils/dateUtils.js';

const variants = {
  hidden: { opacity: 0.8, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: 'easeOut' } },
};

const ThreadMinified = ({
  threadId,
  message = null,
  disableConnector = false,
  // gradientDirection = 'left',
}) => {
  const selectors = useMemo(
    () => ({
      unreadMessages: makeHasUnreadMessages(),
      lastMessage: makeSelectLastMessageOfThread(),
      threadName: makeSelectThreadName(),
      threadAttribute: makeSelectThreadAttribute(),
    }),
    [],
  );
  // const unreadMessagesSelector = useMemo(() => !threadId ? null : (state) => selectUnreadMessageCount(state, threadId), [threadId]);
  const isSmallScreen = useResponsive('down', 'sm');
  // const themeMode = theme.palette.mode || 'dark';
  const id = !!message
    ? `thread-minified-${message.id}-${threadId}`
    : `thread-minified-${threadId}`;
  const lastMessage = useSelector((state) => selectors.lastMessage(state, threadId));
  const unreadMessages = useSelector((state) => selectors.unreadMessages(state, threadId));
  const threadName = useSelector((state) => selectors.threadName(state, threadId));
  const threadStatus = useSelector((state) => selectors.threadAttribute(state, threadId, 'status'));
  const threadCreationDate = useSelector((state) =>
    selectors.threadAttribute(state, threadId, 'date_creation'),
  );

  const bgClassName =
    threadStatus === 'blocked'
      ? 'bg-orange-500/10 dark:bg-orange-500/20'
      : threadStatus === 'dead'
        ? 'bg-green-500/10 dark:bg-green-500/20'
        : threadStatus === 'fenix'
          ? 'bg-yellow-500/10 dark:bg-yellow-500/20'
          : 'bg-gray-100 dark:bg-[#202123] hover:bg-gray-200 dark:hover:bg-[#2A2B32]';

  const handleSelectThread = useCallback(() => {
    batch(() => {
      dispatch(setThreadMain({ current: threadId }));
      if (!!isSmallScreen) {
        dispatch(setDrawerOpen(false));
      }
    });
  }, [isSmallScreen, threadId]);

  const longPressTimeoutRef = useRef(null);

  const startLongPress = useCallback(() => {
    longPressTimeoutRef.current = setTimeout(() => {
      handleSelectThread();
    }, 500);
  }, [handleSelectThread]);

  const clearLongPress = useCallback(() => {
    clearTimeout(longPressTimeoutRef.current);
  }, []);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <m.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="relative pt-1 px-1"
    >
      <Stack
        key={id}
        {...(!disableConnector ? { id } : {})}
        onTouchStart={startLongPress}
        onTouchEnd={clearLongPress}
        onClick={handleSelectThread}
        onContextMenu={handleContextMenu}
        className={cn(
          'relative h-14 px-3 py-2 rounded-lg cursor-pointer',
          'transition-all duration-200 ease-out',
          'border border-transparent',
          bgClassName,
          'hover:border-gray-200 dark:hover:border-gray-700',
        )}
      >
        {unreadMessages && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500"></span>
        )}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
        >
          <Typography
            variant="subtitle2"
            className="text-gray-900 dark:text-gray-100 font-medium"
            noWrap
          >
            {threadName}
          </Typography>
          <Typography
            variant="caption"
            className="text-gray-500 dark:text-gray-400"
            color="text.secondary"
            noWrap
          >
            {threadCreationDate ? formatRelativeTime(threadCreationDate) : ''}
          </Typography>
        </Stack>
        <MessageMinified
          message={lastMessage}
          minimal
        />
      </Stack>

      <ThreadPopoverDetails
        thread={{
          id: threadId,
          status: threadStatus,
          name: threadName,
        }}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
      />
    </m.div>
  );
};

export default memo(ThreadMinified);
