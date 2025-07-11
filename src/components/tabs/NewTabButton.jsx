import { IconButton, Tooltip } from '@mui/material';
import { memo, useCallback } from 'react';

import { cn } from '@lib/utils';

import { createNewThread } from '../../redux/slices/room';
import { dispatch } from '../../redux/store.js';
import Iconify from '../iconify/Iconify.jsx';

const NewTabButton = ({
  onNewTab,
  disabled = false,
  size = 'small',
  variant = 'outlined',
}) => {
  const handleNewTab = useCallback(async () => {
    if (disabled) return;

    try {
      if (onNewTab) {
        await onNewTab();
      } else {
        // Create a new thread without affecting existing ones
        await dispatch(createNewThread());
      }
    } catch (error) {
      console.error('Error creating new tab:', error);
    }
  }, [disabled, onNewTab]);

  return (
    <Tooltip
      title="New thread"
      placement="bottom"
    >
      <IconButton
        size={size}
        onClick={handleNewTab}
        disabled={disabled}
      >
        <Iconify
          icon="solar:pen-new-square-linear"
          width={18}
        />
      </IconButton>
    </Tooltip>
  );
};

export default memo(NewTabButton);
