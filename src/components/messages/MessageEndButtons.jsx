import { ButtonGroup } from '@mui/material';
import React, { memo, useCallback, useMemo } from 'react';

import { cn } from '@lib/utils';

// import { useEmojiPicker } from '../../providers/EmojiPickerProvider';
import { selectMe } from '../../redux/slices/room/selectors/memberSelectors';
import { selectThreadDrawerDetails } from '../../redux/slices/room/selectors/threadSelectors';
import { setThreadDrawer, setThreadRespond } from '../../redux/slices/room/slices/threadsSlice';
import { dispatch, useSelector } from '../../redux/store.ts';
import Iconify from '../iconify/Iconify.jsx';

// const handleEmojiSelect = (messageId, emoji) => !!emoji && dispatch(reactToMessage({ messageId, reactionType: 'emoji', emoji: emoji.native }));
const handleCreateThread = (message) => dispatch(setThreadDrawer({ messageId: message.id, current: message.thread_id, display: true, isCreation: true }));
const handleReplyTo = (messageId, threadId) => dispatch(setThreadRespond({ messageId, threadId }));

const useEnableThreadOnlyActions = (threadId, messageThreadId) => {
  const me = useSelector(selectMe);
  const drawer = useSelector(selectThreadDrawerDetails);

  const isViewer = useMemo(() => !!me && ['viewer', 'listener'].includes(me.role), [me]);
  return useMemo(() => !isViewer && messageThreadId === threadId && (drawer.current !== threadId || !drawer.messageId), [drawer, isViewer, messageThreadId, threadId]);
};
const MessageEndButtons = ({
  message,
  threadId,
  shouldShowMember,
  ...other
}) => {
  const enableThreadOnlyActions = useEnableThreadOnlyActions(threadId, message.thread_id);

  // const { handleOpen } = useEmojiPicker();

  // const selectEmoji = useCallback((emoji) => {
  //   if (!!message?.id && !!emoji) {
  //     handleEmojiSelect(message.id, emoji);
  //   }
  // }, [message?.id]);

  const handleReply = useCallback(() => {
    handleReplyTo(message.id, threadId);
  }, [message?.id, threadId]);

  const handleCreate = useCallback(() => {
    handleCreateThread(message);
  }, [message]);

  return (
    <ButtonGroup
      variant="soft"
      className={cn(
        'hidden-child invisible absolute flex flex-row items-center right-2',
        shouldShowMember ? 'top-2' : 'top-0',
      )}
      {...other}
    >
      {enableThreadOnlyActions && (
        <>
          {/* <button
            onClick={(e) => handleOpen(e, selectEmoji)}
            className="text-gray-400 bg-transparent p-0 transition-all duration-300 ease-in-out hover:text-white hover:bg-transparent hover:scale-150 hover:mx-1 hover:pt-px focus:border-none focus:outline-none"
          >
            <Iconify className='child-emoji' icon="fluent:emoji-add-16-filled" width={14} />
          </button> */}
          <button
            onClick={handleReply}
            className="text-gray-400 bg-transparent p-0 transition-all duration-300 ease-in-out hover:text-white hover:bg-transparent hover:scale-150 hover:mx-1 hover:pt-px focus:border-none focus:outline-none"
          >
            <Iconify className="child-emoji" icon="mdi-reply" width={14} />
          </button>
          {message.text && (
            <button
              onClick={handleCreate}
              className="text-gray-400 bg-transparent p-0 transition-all duration-300 ease-in-out hover:text-white hover:bg-transparent hover:scale-150 hover:mx-1 hover:pt-px focus:border-none focus:outline-none"
            >
              <Iconify className="child-emoji" icon="solar:hashtag-chat-bold" width={14} />
            </button>
          )}
        </>
      )}
    </ButtonGroup>
  );
};

export default memo(MessageEndButtons);
