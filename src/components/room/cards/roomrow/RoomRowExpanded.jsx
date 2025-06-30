import { Stack, Typography, styled } from '@mui/material';
import React, { memo, useMemo, useCallback } from 'react';

import { cn } from '@lib/utils';

import RoomRowTooltip from './RoomRowTooltip.jsx';
// import { useAuthContext } from '../../../../auth/useAuthContext';
import { makeSelectRoomById, makeSelectRoomIsSelected } from '../../../../redux/slices/general';
import { useSelector } from '../../../../redux/store.tsx';
import CustomAvatar from '../../../avatars/CustomAvatar.jsx';
// import RoomCardMembers from '../../members/RoomCardMembers';
import { isMobile } from '../../utils';

// const StyledBox = styled(Box)(({ theme, isselected }) => ({
//   borderRadius: 1,
//   position: 'relative',
//   transition: 'all 300ms ease',
//   userSelect: 'none',
//   cursor: 'pointer',
//   background: isselected ? theme.palette.background.neutral : 'inherit',
//   '&:hover': {
//     transform: 'scale(1.01)',
//     background: theme.palette.background.neutral,
//     '& .account-avatar': {
//       width: 17,
//       height: 17,
//       opacity: 1,
//     },
//   },
// }));

// <div
// className={cn(
//   "account-avatar transition-all duration-300 ease-in-out opacity-0",
//   "hover:opacity-100 hover:w-4 hover:h-4"
// )}
// />
// {children}
// </div>

const AvatarImage = styled('img')({
  width: 35,
  height: 35,
  borderRadius: 6,
});

const StyledCustomAvatar = styled(CustomAvatar)({
  width: 35,
  height: 35,
  borderRadius: 6,
});

const RoomRowExpanded = ({ roomId, onClick }) => {
  const selectors = useMemo(() => ({
    room: makeSelectRoomById(),
    selected: makeSelectRoomIsSelected(),
  }), []);
  const room = useSelector((state) => selectors.room(state, roomId));
  const isSelected = useSelector((state) => selectors.selected(state, roomId));

  // const {
  //   user,
  //   guest,
  // } = useAuthContext();

  // const me = useMemo(() => user?.member || guest?.member, [user, guest]);

  // const membersWithoutMe = useMemo(() => {
  //   if (!room?.members) {
  //     return [];
  //   }
  //   const membersArray = Array.isArray(room.members) ? room.members : room.members?.items || [];
  //   return membersArray.filter((rm) => rm.member_id !== me?.id);
  // }, [room?.members, me]);

  const handleClick = useCallback(() => onClick(roomId), [onClick, roomId]);

  const titleStyle = useMemo(() => ({
    fontWeight: 500,
    maxWidth: 200,
    userSelect: 'none',
    ...(isMobile() && {
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      MozUserSelect: 'none',
    }),
  }), []);

  if (!room) {
    return null;
  }

  return (
    <div
      onClick={handleClick}
      data-room-id={roomId}
      className={cn(
        'relative rounded-sm transition-all duration-300 ease-in-out cursor-pointer select-none hover:scale-[1.01] hover:bg-gray-100 dark:hover:bg-gray-800',
        !isSelected ? '' : 'bg-gray-100 dark:bg-gray-800',
      )}
    >
      <Stack
        // alignItems="center"
        // justifyContent="center"
        paddingY={0.5}
        paddingLeft={1}
        width="100%"
      >
        <Stack
          sx={{
            flexGrow: 1,
            mx: 0.5,
            userSelect: 'none',
            overflow: 'hidden',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} width="100%">
            <RoomRowTooltip roomId={roomId} onClick={onClick}>
              {room.avatar_url ? (
                <AvatarImage alt={room.name} src={room.avatar_url} />
              ) : (
                <StyledCustomAvatar alt={room.name} name={room.name} />
              )}
            </RoomRowTooltip>
            <Typography
              variant="body1"
              noWrap
              sx={titleStyle}
            >
              {room.name}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      {/* <RoomCardMembers members={membersWithoutMe} /> */}
    </div>
  );
};

export default memo(RoomRowExpanded);
