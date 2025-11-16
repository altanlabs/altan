import { Typography, IconButton, Box, TextField } from '@mui/material';
import { m } from 'framer-motion';
import { useRef, memo, useCallback, useMemo, useState } from 'react';
import { batch } from 'react-redux';

import ThreadPopoverDetails from './ThreadPopoverDetails.jsx';
import useResponsive from '../../hooks/useResponsive.js';
import { cn } from '../../lib/utils.ts';
import {
  makeHasUnreadMessages,
  makeSelectThreadAttribute,
  makeSelectThreadName,
} from '../../redux/slices/room/selectors';
import { setDrawerOpen } from '../../redux/slices/room/slices/uiSlice';
import { patchThread, deleteThread, switchToThreadInTab } from '../../redux/slices/room/thunks';
import { dispatch, useSelector } from '../../redux/store.ts';
import { formatRelativeTime } from '../../utils/dateUtils.js';
import Iconify from '../iconify/Iconify.jsx';

const variants = {
  hidden: { opacity: 0.8, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: 'easeOut' } },
};

const ThreadMinified = ({ threadId, message = null, disableConnector = false, onSelect = null }) => {
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
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedName, setEditedName] = useState('');
  const inputRef = useRef(null);

  const handleSelectThread = useCallback(() => {
    if (isEditing || isDeleting) return; // Don't select thread when editing or deleting

    if (onSelect) {
      // If onSelect is provided, use it (for external contexts like popover)
      onSelect(threadId);
    } else {
      // Default behavior for internal usage
      batch(() => {
        dispatch(switchToThreadInTab(threadId));
        if (!!isSmallScreen) {
          dispatch(setDrawerOpen(false));
        }
      });
    }
  }, [isSmallScreen, threadId, isEditing, isDeleting, onSelect]);

  const longPressTimeoutRef = useRef(null);

  const startLongPress = useCallback(() => {
    if (isEditing || isDeleting) return;
    longPressTimeoutRef.current = setTimeout(() => {
      handleSelectThread();
    }, 500);
  }, [handleSelectThread, isEditing, isDeleting]);

  const clearLongPress = useCallback(() => {
    clearTimeout(longPressTimeoutRef.current);
  }, []);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleContextMenu = useCallback(
    (event) => {
      if (isEditing || isDeleting) return;
      event.preventDefault();
      setAnchorEl(event.currentTarget);
    },
    [isEditing, isDeleting],
  );

  const handleClosePopover = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleEditThread = useCallback(
    (event) => {
      event.stopPropagation();
      setIsEditing(true);
      setEditedName(threadName);
      // Focus the input after it's rendered
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    },
    [threadName],
  );

  const handleSaveEdit = useCallback(
    async (event) => {
      event.stopPropagation();
      if (editedName.trim() && editedName !== threadName) {
        try {
          await dispatch(patchThread({ threadId, name: editedName.trim() }));
        } catch (error) {
          console.error('Failed to update thread name:', error);
        }
      }
      setIsEditing(false);
      setEditedName('');
    },
    [threadId, editedName, threadName],
  );

  const handleCancelEdit = useCallback((event) => {
    event.stopPropagation();
    setIsEditing(false);
    setEditedName('');
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        handleSaveEdit(event);
      } else if (event.key === 'Escape') {
        handleCancelEdit(event);
      }
    },
    [handleSaveEdit, handleCancelEdit],
  );

  const handleDeleteThread = useCallback((event) => {
    event.stopPropagation();
    setIsDeleting(true);
  }, []);

  const handleConfirmDelete = useCallback(
    async (event) => {
      event.stopPropagation();
      try {
        await dispatch(deleteThread(threadId));
      } catch (error) {
        console.error('Failed to delete thread:', error);
      }
      setIsDeleting(false);
    },
    [threadId],
  );

  const handleCancelDelete = useCallback((event) => {
    event.stopPropagation();
    setIsDeleting(false);
  }, []);

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
          isEditing && 'bg-blue-50 dark:bg-blue-900/10',
          isDeleting && 'bg-red-50 dark:bg-red-900/10',
        )}
      >
        {/* Thread name with unread indicator */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditing ? (
            <TextField
              ref={inputRef}
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyDown}
              variant="standard"
              size="small"
              className="flex-1"
              sx={{
                '& .MuiInput-root': {
                  fontSize: '0.875rem',
                  '&:before': { borderBottom: 'none' },
                  '&:after': { borderBottom: '1px solid #3b82f6' },
                  '&:hover:before': { borderBottom: 'none' },
                },
                '& .MuiInput-input': {
                  padding: '2px 0',
                },
              }}
            />
          ) : (
            <Typography
              variant="body2"
              className={cn(
                'font-normal truncate',
                isDeleting ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100',
              )}
            >
              {threadName}
            </Typography>
          )}
          {unreadMessages && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>}
        </div>

        {/* Right side - timestamp or action buttons */}
        <div className="flex items-center ml-4 relative min-w-[100px]">
          {/* Timestamp - hidden on hover, edit, or delete */}
          <Typography
            variant="caption"
            className={cn(
              'text-gray-500 dark:text-gray-400 transition-all duration-200 ease-out absolute right-0 whitespace-nowrap',
              isHovered || isEditing || isDeleting
                ? 'opacity-0 translate-x-2'
                : 'opacity-100 translate-x-0',
            )}
          >
            {threadCreationDate ? formatRelativeTime(threadCreationDate) : ''}
          </Typography>

          {/* Edit mode buttons */}
          {isEditing && (
            <div className="flex items-center gap-1 absolute right-0">
              <IconButton
                size="small"
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                sx={{ width: 24, height: 24 }}
              >
                <Iconify
                  icon="solar:close-circle-bold"
                  width={14}
                />
              </IconButton>

              <IconButton
                size="small"
                onClick={handleSaveEdit}
                className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                sx={{ width: 24, height: 24 }}
              >
                <Iconify
                  icon="solar:check-circle-bold"
                  width={14}
                />
              </IconButton>
            </div>
          )}

          {/* Delete confirmation buttons */}
          {isDeleting && (
            <div className="flex items-center gap-1 absolute right-0">
              <IconButton
                size="small"
                onClick={handleCancelDelete}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                sx={{ width: 24, height: 24 }}
              >
                <Iconify
                  icon="solar:close-circle-bold"
                  width={14}
                />
              </IconButton>

              <IconButton
                size="small"
                onClick={handleConfirmDelete}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                sx={{ width: 24, height: 24 }}
              >
                <Iconify
                  icon="solar:trash-bin-trash-bold"
                  width={14}
                />
              </IconButton>
            </div>
          )}

          {/* Regular action buttons - shown on hover when not editing or deleting */}
          {!isEditing && !isDeleting && (
            <div
              className={cn(
                'flex items-center gap-1 transition-all duration-200 ease-out absolute right-0',
                isHovered
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-2 pointer-events-none',
              )}
            >
              <IconButton
                size="small"
                onClick={handleEditThread}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                sx={{ width: 24, height: 24 }}
              >
                <Iconify
                  icon="solar:pen-bold"
                  width={14}
                />
              </IconButton>

              <IconButton
                size="small"
                onClick={handleDeleteThread}
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                sx={{ width: 24, height: 24 }}
              >
                <Iconify
                  icon="solar:trash-bin-trash-bold"
                  width={14}
                />
              </IconButton>
            </div>
          )}
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
