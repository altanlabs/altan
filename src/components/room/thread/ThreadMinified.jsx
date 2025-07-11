import { Typography, IconButton, Box } from '@mui/material';
import { m } from 'framer-motion';
import { useRef, memo, useCallback, useMemo, useState } from 'react';
import { batch } from 'react-redux';

import ThreadPopoverDetails from './ThreadPopoverDetails.jsx';
import useResponsive from '../../../hooks/useResponsive';
import { cn } from '../../../lib/utils.ts';
import {
  makeHasUnreadMessages,
  makeSelectThreadAttribute,
  makeSelectThreadName,
  setDrawerOpen,
  setThreadMain,
} from '../../../redux/slices/room';
import { dispatch, useSelector } from '../../../redux/store.js';
import { formatRelativeTime } from '../../../utils/dateUtils.js';
import Iconify from '../../iconify/Iconify.jsx';

const variants = {
  hidden: { opacity: 0.8, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: 'easeOut' } },
};

const ThreadMinified = ({
  threadId,
  message = null,
  disableConnector = false,
}) => {
  const selectors = useMemo(
    () => ({
      unreadMessages: makeHasUnreadMessages(),
      threadName: makeSelectThreadName(),
      threadAttribute: makeSelectThreadAttribute(),
    }),
    [],
  );

  const isSmallScreen = useResponsive('down', 'sm');
  const id = !!message
    ? `thread-minified-${message.id}-${threadId}`
    : `thread-minified-${threadId}`;

  const unreadMessages = useSelector((state) => selectors.unreadMessages(state, threadId));
  const threadName = useSelector((state) => selectors.threadName(state, threadId));
  const threadStatus = useSelector((state) => selectors.threadAttribute(state, threadId, 'status'));
  const threadCreationDate = useSelector((state) =>
    selectors.threadAttribute(state, threadId, 'date_creation'),
  );

  const [isHovered, setIsHovered] = useState(false);

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

  const handleEditThread = useCallback((event) => {
    event.stopPropagation();
    console.log('Edit thread:', threadId);
  }, [threadId]);

  const handleShareThread = useCallback((event) => {
    event.stopPropagation();
    console.log('Share thread:', threadId);
  }, [threadId]);

  const handleDeleteThread = useCallback((event) => {
    event.stopPropagation();
    console.log('Delete thread:', threadId);
  }, [threadId]);

  return (
    <m.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="relative"
    >
      <Box
        key={id}
        {...(!disableConnector ? { id } : {})}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={startLongPress}
        onTouchEnd={clearLongPress}
        onClick={handleSelectThread}
        onContextMenu={handleContextMenu}
        className={cn(
          'group relative flex items-center justify-between px-3 py-2 mx-1 rounded-lg cursor-pointer',
          'transition-all duration-200 ease-out',
          'hover:bg-gray-100 dark:hover:bg-gray-800/50',
          threadStatus === 'blocked' && 'bg-orange-50 dark:bg-orange-900/10',
          threadStatus === 'dead' && 'bg-green-50 dark:bg-green-900/10',
          threadStatus === 'fenix' && 'bg-yellow-50 dark:bg-yellow-900/10',
        )}
      >
        {/* Thread name with unread indicator */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Typography
            variant="body2"
            className="text-gray-900 dark:text-gray-100 font-normal truncate"
          >
            {threadName}
          </Typography>
          {unreadMessages && (
            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
          )}
        </div>

        {/* Right side - timestamp or action buttons */}
        <div className="flex items-center ml-4 relative min-w-[100px]">
          {/* Timestamp - hidden on hover */}
          <Typography
            variant="caption"
            className={cn(
              'text-gray-500 dark:text-gray-400 transition-all duration-200 ease-out absolute right-0 whitespace-nowrap',
              isHovered ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0',
            )}
          >
            {threadCreationDate ? formatRelativeTime(threadCreationDate) : ''}
          </Typography>

          {/* Action buttons - shown on hover */}
          <div
            className={cn(
              'flex items-center gap-1 transition-all duration-200 ease-out absolute right-0',
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none',
            )}
          >
            <IconButton
              size="small"
              onClick={handleEditThread}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              sx={{ width: 24, height: 24 }}
            >
              <Iconify icon="solar:pen-bold" width={14} />
            </IconButton>

            <IconButton
              size="small"
              onClick={handleShareThread}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              sx={{ width: 24, height: 24 }}
            >
              <Iconify icon="solar:share-bold" width={14} />
            </IconButton>

            <IconButton
              size="small"
              onClick={handleDeleteThread}
              className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              sx={{ width: 24, height: 24 }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" width={14} />
            </IconButton>
          </div>
        </div>
      </Box>

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
