import { memo, useCallback } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import analytics from '../../lib/analytics';
import { createNewThread } from '../../redux/slices/room/thunks/threadThunks';
import { dispatch } from '../../redux/store.ts';

interface NewTabButtonProps {
  disabled?: boolean;
  onNewTab?: () => void;
}

const NewTabButton = ({ disabled = false, onNewTab }: NewTabButtonProps) => {
  const handleNewTab = useCallback(async () => {
    if (disabled) return;

    try {
      if (onNewTab) {
        onNewTab();
      } else {
        await dispatch(createNewThread());
      }

      // Track chat creation
      analytics.track('created_chat');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating new tab:', error);
    }
  }, [disabled, onNewTab]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewTab}
          disabled={disabled}
          className="h-8 w-8"
          aria-label="New Chat"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>New Chat</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default memo(NewTabButton);

