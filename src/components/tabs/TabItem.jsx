import { IconButton, Tooltip } from '@mui/material';
import { memo, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { cn } from '@lib/utils';

import { switchTab, closeTab, makeSelectThreadName } from '../../redux/slices/room';
import { dispatch } from '../../redux/store.js';
import Iconify from '../iconify/Iconify.jsx';

const TabItem = ({
  tab,
  isActive,
  onSwitch,
  onClose,
  className,
  maxWidth = 200,
  canClose = true,
}) => {
  // Use the thread name selector to get the real-time thread name
  const threadNameSelector = useMemo(makeSelectThreadName, []);
  const actualThreadName = useSelector((state) => threadNameSelector(state, tab.threadId));

  // Use the actual thread name or fallback to tab name
  const displayName = actualThreadName || 'Thread';

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (onSwitch) {
        onSwitch(tab.id);
      } else {
        dispatch(switchTab({ tabId: tab.id }));
      }
    },
    [tab.id, onSwitch],
  );

  const handleClose = useCallback(
    (e) => {
      e.stopPropagation();
      if (onClose) {
        onClose(tab.id);
      } else {
        dispatch(closeTab({ tabId: tab.id }));
      }
    },
    [tab.id, onClose],
  );

  const handleCloseKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClose(e);
      }
    },
    [handleClose],
  );

  return (
    <div
      className={cn(
        'relative flex items-center gap-1 px-3 py-1.5 text-sm cursor-pointer transition-all duration-200 select-none',
        isActive
          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
          : 'bg-transparent text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800',
        'rounded-md',
        className,
      )}
      onClick={handleClick}
      role="tab"
      aria-selected={isActive}
      aria-label={`Switch to ${displayName} tab`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      }}
      style={{ maxWidth }}
    >
      {/* Tab Name */}
      <span
        className={cn(
          'truncate flex-1 min-w-0',
          isActive ? 'font-semibold' : 'font-normal',
        )}
        title={displayName}
      >
        {displayName}
      </span>

      {/* Close Button */}
      {canClose && (
        <div
          className="flex-shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip
            title="Close tab"
            placement="top"
          >
            <IconButton
              size="small"
              onClick={handleClose}
              onKeyDown={handleCloseKeyDown}
              className="!p-0.5 !min-w-0 hover:bg-gray-200 dark:hover:bg-gray-600"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              <Iconify
                icon="solar:close-circle-linear"
                width={14}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              />
            </IconButton>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default memo(TabItem);
