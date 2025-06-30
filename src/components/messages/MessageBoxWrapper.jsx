import { Stack, Typography, Box, Divider } from '@mui/material';
import { memo, useMemo, useRef } from 'react';

import { cn } from '@lib/utils';

import MessageEndButtons from './MessageEndButtons.jsx';
import CustomAvatar from '../custom-avatar/CustomAvatar.jsx';
import MessageBox from './wrapper/MessageBox.tsx';
import MessageReply from './wrapper/MessageReply.jsx';
import useMessageThreads from './wrapper/useMessageThreads.jsx';
import { selectMe, selectMembers, selectThreadDrawerDetails } from '../../redux/slices/room';
import { useSelector } from '../../redux/store.js';
import { formatDate, formatTime } from '../../utils/dateUtils.js';
import Reactions from '../room/thread/message/Reactions.jsx';
import { getMemberName } from '../room/utils';

const getPicture = (member) => {
  if (!member) {
    return null;
  }
  switch (member.member_type) {
    case 'agent':
      return member.agent?.avatar_url ?? 'https://storage.googleapis.com/logos-chatbot-optimai/Subtract.png';
    case 'user':
      return member.user?.avatar_url || null;
    case 'guest':
      return member.guest?.avatar_url || null;
    default:
      return null;
  }
};

const selectDrawerMessageId = (state) => selectThreadDrawerDetails(state)?.messageId;

const MessageBoxWrapper = ({
  message,
  previousMessage,
  disableEndButtons,
  threadId,
  mode,
  // scrollToMessage,
  children,
}) => {
  const me = useSelector(selectMe);
  const members = useSelector(selectMembers);
  const drawerMessageId = useSelector(selectDrawerMessageId);
  const avatarRef = useRef(null);
  const connectorRef = useRef(null);
  const {
    shouldShowMember,
    shouldShowDateSeparator,
    renderMessageThreads,
  } = useMessageThreads({
    message,
    threadId,
    mode,
    previousMessage,
    avatarRef,
    connectorRef,
  });

  const memberMe = me?.member;
  const sender = members.byId[message.member_id] || {
    id: 'system',
    member: {
      id: 'system',
      member_type: 'system',
      // For system messages, we provide guest details as a fallback.
      guest: { nickname: 'System', avatar_url: null },
      // Additional keys in case they are referenced.
      agent: { avatar_url: null },
      user: { avatar_url: null },
    },
  };
  const is_me = sender.member?.id === memberMe?.id;
  const senderName = !is_me && getMemberName(sender);
  const picture = getPicture(sender.member);
  const isMessagePotentialParent = message.id === drawerMessageId;

  const renderAvatar = useMemo(() => !!shouldShowMember && (
    <CustomAvatar
      alt={sender?.id}
      sx={{ width: 28, height: 28 }}
      src={picture}
      ref={avatarRef}
      name={sender?.member?.guest?.nickname || 'Member'}
    />
  ), [shouldShowMember, sender?.id, sender?.member?.guest?.nickname, picture]);

  return (
    <>
      {
        !!shouldShowDateSeparator && (
          <Divider
            sx={{
              width: '100%',
            }}
          >
            <div className="text-xs text-center my-1 px-3 min-w-[100px] max-w-[120px] rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {formatDate(message.date_creation)}
            </div>
          </Divider>
        )
      }
      <div className="relative flex flex-col w-full space-y-2" >
        <MessageReply message={message} />
        <MessageBox
          isMe={is_me}
          timestamp={message.date_creation}
          // type={message.type}
          className={cn(
            shouldShowMember ? 'p-[10px_4px]' : 'p-[2px_4px]',
            isMessagePotentialParent && !disableEndButtons ? 'shadow-md rounded-lg p-[15px] shadow-light dark:shadow-dark' : '',
          )}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            {renderAvatar}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              {
                !!shouldShowMember && (
                  <div className="group relative inline-flex items-baseline gap-2">
                    <Typography className="text-sm font-medium">
                      {is_me ? 'You' : senderName}
                    </Typography>
                    <span className="text-[10px] text-[#555] dark:text-[#99aab5] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {formatTime(message.date_creation)} {!shouldShowMember ? '' : '· From Earth'}
                    </span>
                  </div>
                )
              }
              {
                !disableEndButtons && (
                  <MessageEndButtons
                    message={message}
                    threadId={threadId}
                    shouldShowMember={shouldShowMember}
                  />
                )
              }
            </Stack>
          </Stack>
          {
            !shouldShowMember && (
              <Box
                className="group"
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  opacity: 0,
                  '&:hover': {
                    opacity: 1,
                  },
                  transition: 'opacity 200ms ease-out',
                  backgroundColor: (theme) => theme.palette.mode === 'light' ? '#e5e7eb' : '#555',
                  borderRadius: 1,
                  px: 0.5,
                  '& span': {
                    fontSize: '0.75rem',
                    color: (theme) => theme.palette.mode === 'light' ? '#555' : '#fff',
                  },
                }}
              >
                <span>
                  {formatTime(message.date_creation)} {!shouldShowMember ? '' : '· From Earth'}
                </span>
              </Box>
            )
          }
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            paddingLeft={4.5}
          >
            {children}
          </Stack>
          <Reactions messageId={message.id} />
          {renderMessageThreads}
        </MessageBox>
        <svg ref={connectorRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
      </div>
    </>
  );
};

export default memo(MessageBoxWrapper);
