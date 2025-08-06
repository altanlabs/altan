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
    px-3
    py-2
    ml-2
    mb-1
    rounded-md
    max-w-full
    w-fit
    bg-gray-100/50
    dark:bg-gray-800/50
    border-l-4
    border-l-slate-500
    backdrop-blur-sm
  "
    >
      <MessageMinified message={message.replied} />
    </div>

  );
};

export default memo(MessageReply);
