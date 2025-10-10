import { Stack, Typography, Box, Divider } from '@mui/material';
import { memo, useMemo, useRef, useState, useCallback } from 'react';

import { cn } from '@lib/utils';

import MemberDetailsPopover from './MemberDetailsPopover.jsx';
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
      return member.agent?.avatar_url || null;
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
  showMessageReply = false,
}) => {
  const me = useSelector(selectMe);
  const members = useSelector(selectMembers);
  const drawerMessageId = useSelector(selectDrawerMessageId);
  const avatarRef = useRef(null);
  const connectorRef = useRef(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);

  const { shouldShowMember, shouldShowDateSeparator, renderMessageThreads } = useMessageThreads({
    message,
    threadId,
    mode,
    previousMessage,
    avatarRef,
    connectorRef,
  });

  // Override shouldShowMember for mini mode - always show member info
  const finalShouldShowMember = mode === 'mini' ? true : shouldShowMember;

  const handlePopoverClose = useCallback(() => {
    setPopoverOpen(false);
    setPopoverAnchorEl(null);
  }, []);

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

  const handleAvatarClick = useCallback((event) => {
    event.stopPropagation();
    // Only show popover for real members, not system messages
    if (sender.member && sender.member.member_type !== 'system') {
      setPopoverAnchorEl(event.currentTarget);
      setPopoverOpen(true);
    }
  }, [sender.member?.member_type]);

  const is_me = sender.member?.id === memberMe?.id;
  const senderName = !is_me && getMemberName(sender);
  const picture = getPicture(sender.member);
  const isMessagePotentialParent = message.id === drawerMessageId;

  const renderAvatar = useMemo(
    () =>
      !!finalShouldShowMember && (
        <CustomAvatar
          alt={sender?.id}
          sx={{
            width: mode === 'mini' ? 16 : 24,
            height: mode === 'mini' ? 16 : 24,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
          src={picture}
          ref={avatarRef}
          name={sender?.member?.guest?.nickname || 'Member'}
          onClick={handleAvatarClick}
        />
      ),
    [finalShouldShowMember, sender?.id, sender?.member?.guest?.nickname, picture, handleAvatarClick, mode],
  );

  return (
    <>
      {!!shouldShowDateSeparator && (
        <Divider
          sx={{
            width: '100%',
          }}
        >
          <div className="text-xs text-center my-1 px-3 min-w-[100px] max-w-[120px] rounded-lg">
            {formatDate(message.date_creation)}
          </div>
        </Divider>
      )}
      <div
        className={`relative flex flex-col w-full space-y-2 ${is_me ? 'items-end' : 'items-start'}`}
      >
        {showMessageReply && <MessageReply message={message} />}
        <div className={`${is_me ? 'ml-auto max-w-[80%]' : 'w-full'} min-w-0`}>
          <MessageBox
            isMe={is_me}
            timestamp={message.date_creation}
            // type={message.type}
            className={cn(
              'p-[2px]', // Standardized padding for all messages
              isMessagePotentialParent && !disableEndButtons
                ? 'shadow-md rounded-lg p-[10px] shadow-light dark:shadow-dark'
                : '',
            )}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              // paddingBottom={0.5}
            >
              {!is_me && renderAvatar}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ width: '100%' }}
              >
                {!!finalShouldShowMember && !is_me && (
                  <div className="group relative inline-flex items-baseline gap-2">
                    <Typography className={`${mode === 'mini' ? 'text-xs' : 'text-sm'} font-medium text-slate-700 dark:text-slate-300`}>
                      {senderName}
                    </Typography>
                    {mode !== 'mini' && (
                      <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#555] dark:text-[#99aab5]">
                        {formatTime(message.date_creation)} {!finalShouldShowMember ? '' : '· From Earth'}
                      </span>
                    )}
                  </div>
                )}
                {!disableEndButtons && (
                  <MessageEndButtons
                    message={message}
                    threadId={threadId}
                    shouldShowMember={shouldShowMember}
                  />
                )}
              </Stack>
            </Stack>
            {!shouldShowMember && (
              <Box
                className="group"
                sx={{
                  position: 'absolute',
                  left: is_me ? 'auto' : 8,
                  right: is_me ? 8 : 'auto',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  opacity: 0,
                  '&:hover': {
                    opacity: 1,
                  },
                  transition: 'opacity 200ms ease-out',
                  backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#e5e7eb' : '#555'),
                  borderRadius: 1,
                  px: 0.5,
                  '& span': {
                    fontSize: '0.75rem',
                    color: (theme) => (theme.palette.mode === 'light' ? '#555' : '#fff'),
                  },
                }}
              >
                <span>
                  {formatTime(message.date_creation)} {!shouldShowMember ? '' : '· From Earth'}
                </span>
              </Box>
            )}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              paddingRight={0}
              paddingBottom={0}
              paddingTop={0.2}
              paddingLeft={!is_me ? 3 : 0}
            >
              {children}
            </Stack>
            {renderMessageThreads}
          </MessageBox>
          <Reactions messageId={message.id} />
        </div>
        <svg
          ref={connectorRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>

      {/* Member Details Popover */}
      <MemberDetailsPopover
        isOpen={popoverOpen}
        anchorEl={popoverAnchorEl}
        onClose={handlePopoverClose}
        roomMember={sender}
        memberName={is_me ? 'You' : senderName}
        picture={picture}
      />
    </>
  );
};

export default memo(MessageBoxWrapper);
