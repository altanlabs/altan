import { Tooltip } from '@mui/material';
import { memo, useCallback } from 'react';

import { createNewThread } from '../../redux/slices/room';
import { dispatch } from '../../redux/store.js';

const NewTabButton = ({ onNewTab, disabled = false }) => {
  const handleNewTab = useCallback(async () => {
    if (disabled) return;

    try {
      await dispatch(createNewThread());
    } catch (error) {
      console.error('Error creating new tab:', error);
    }
  }, [disabled, onNewTab]);

  return (
    <Tooltip
      title="New Chat"
      placement="bottom"
    >
      <div
        className="flex items-center justify-center px-3 py-1.5 text-sm cursor-pointer transition-all duration-200 select-none rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={handleNewTab}
        role="button"
        aria-label="New Chat"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNewTab();
          }
        }}
        style={{
          minWidth: 'auto',
          width: 32,
          height: 32,
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'inherit',
        }}
      >
        +
      </div>
    </Tooltip>
  );
};

export default memo(NewTabButton);
