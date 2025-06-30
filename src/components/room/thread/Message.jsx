import { createSelector } from '@reduxjs/toolkit';
import { m } from 'framer-motion';
import { memo, useMemo } from 'react';

import { checkObjectsEqual } from '../../../redux/helpers/memoize';
import { selectMessagesById } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store.js';
import MessageBoxWrapper from '../../messages/MessageBoxWrapper.jsx';
import MessageContent from '../../messages/MessageContent.jsx';
import MessageContainer from '../../messages/wrapper/MessageContainer.jsx';

const variants = {
  hidden: { opacity: 0.8, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.6, -0.05, 0.01, 0.99] } },
};

const makeSelectMessages = () => createSelector(
  [
    selectMessagesById,
    (state, messageId) => messageId,
    (state, messageId, previousMessageId) => previousMessageId ?? null,
  ],
  (messagesById, messageId, previousMessageId) => {
    const messages = {};
    if (!!messageId) {
      const m = messagesById[messageId];
      if (m) {
        messages.message = {
          id: m.id,
          date_creation: m.date_creation,
          member_id: m.member_id,
          thread_id: m.thread_id,
          error: m.error,
          replied: m.replied,
        };
      }
    }
    if (!!previousMessageId) {
      const prev = messagesById[previousMessageId];
      if (prev) {
        messages.previousMessage = {
          id: prev.id,
          date_creation: prev.date_creation,
          member_id: prev.member_id,
        };
      }
    }
    return messages;
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

const Message = ({
  messageId,
  mode,
  previousMessageId,
  disableEndButtons,
  scrollToMessage,
  threadId,
}) => {
  const messageSelector = useMemo(makeSelectMessages, []);
  const {
    message,
    previousMessage,
  } = useSelector((state) => messageSelector(state, messageId, previousMessageId));

  if (!message || !!message.space) return null;
  return (
    <m.div
      className="overflow-hidden items-start min-w-[200px] mx-auto w-full ml-0 mr-8 xl:mr-10 lg:mr-7 md:mr-7 sm:mr-4 flex-col pb-3 pt-3 px-4 max-w-[850px]"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <MessageContainer
        message={message}
        threadId={threadId}
        disableEndButtons={disableEndButtons}
      >
        <MessageBoxWrapper
          message={message}
          threadId={threadId}
          mode={mode}
          disableEndButtons={disableEndButtons}
          previousMessage={previousMessage}
          scrollToMessage={scrollToMessage}
        >
          <MessageContent
            message={message}
            threadId={threadId}
          />
        </MessageBoxWrapper>
      </MessageContainer>
    </m.div>
  );
};

export default memo(Message);
