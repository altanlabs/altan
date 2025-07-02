import { memo } from 'react';

import Iconify from '../iconify/Iconify.jsx';
import { Button } from '../ui/Button.jsx';

const SendButton = ({ onSendMessage, isDisabled }) => {
  const handleClick = () => {
    if (!isDisabled && onSendMessage) {
      onSendMessage();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      size="icon"
      variant="default"
      className="rounded-full"
      aria-label="Send message"
    >
      <Iconify icon="mdi:arrow-up" className="h-4 w-4" />
    </Button>
  );
};

export default memo(SendButton);
