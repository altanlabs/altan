import { memo } from 'react';

import MessageMinified from '../../room/thread/MessageMinified.jsx';

const MessageReply = ({ message }) => {
  if (!message?.replied) {
    return null;
  }
  return (
    <div
      id={`reply-message-minified-${message.replied.id}`}
      className="
    flex
    relative
    items-start
    cursor-pointer
    justify-start
    px-1
    ml-5
    -mb-1.5
    rounded-lg
    w-min
    border
    border-gray-500/40
    dark:border-gray-500/40
  "
    >
      <MessageMinified message={message.replied} />
    </div>

  );
};

export default memo(MessageReply);
