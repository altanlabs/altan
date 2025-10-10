import { createSelector } from '@reduxjs/toolkit';
import { m } from 'framer-motion';
import { memo, useMemo } from 'react';

import { checkObjectsEqual } from '../../../redux/helpers/memoize';
import { selectMessagesById, selectMe, selectMembers } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store.js';
import MessageBoxWrapper from '../../messages/MessageBoxWrapper.jsx';
import MessageContent from '../../messages/MessageContent.jsx';
import MessageContainer from '../../messages/wrapper/MessageContainer.jsx';

const variants = {
  hidden: { opacity: 0.8, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.6, -0.05, 0.01, 0.99] } },
};

const makeSelectMessages = () =>
  createSelector(
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
            meta_data: m.meta_data,
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
  allMessagesById,
}) => {
  const messageSelector = useMemo(makeSelectMessages, []);
  const messagesFromStore = useSelector((state) =>
    messageSelector(state, messageId, previousMessageId),
  );

  const me = useSelector(selectMe);
  const members = useSelector(selectMembers);

  // If allMessagesById is provided (includes placeholders), use it instead
  const message = allMessagesById?.[messageId] || messagesFromStore.message;
  const previousMessage = allMessagesById?.[previousMessageId] || messagesFromStore.previousMessage;

  // Determine if this message is from the current user
  const memberMe = me?.member;
  const sender = members.byId[message?.member_id];
  const is_me = sender?.member?.id === memberMe?.id;

  if (!message || !!message.space) return null;
  return (
    <m.div
      className={`overflow-hidden items-start ${
        mode === 'mini'
          ? 'min-w-0 w-full py-0 px-1'
          : 'min-w-[200px] w-full max-w-[800px] mx-auto py-1 px-4'
      } flex-col ${is_me ? 'flex justify-end' : 'flex justify-start'}`}
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
            mode={mode}
          />
        </MessageBoxWrapper>
      </MessageContainer>
    </m.div>
  );
};

export default memo(Message);
