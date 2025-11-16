import { Stack, Typography } from '@mui/material';
import { useMemo, memo } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuthContext } from '../../auth/useAuthContext.ts';
import ContextMenuRoom from '../../components/contextmenu/ContextMenuRoom.jsx';
import EmojiPickerProvider from '../../providers/EmojiPickerProvider.jsx';
import { selectMe, selectRoom } from '../../redux/slices/room';
import { useSelector } from '../../redux/store.ts';

const checkMemberIsRoomMember = (room, member) => {
  if (!room?.members?.items?.length || !member?.id) {
    return false;
  }
  const memberIds = room.members.items.map((m) => m.member.id);
  const isMember = memberIds.includes(member.id);
  return isMember;
};
const checkIsRoomFull = (room) =>
  room.policy.max_members !== -1 && room.policy.max_members <= room?.members?.items?.length;

const RoomAuthGuard = ({ children }) => {
  const location = useLocation();
  const room = useSelector(selectRoom);
  const me = useSelector(selectMe);

  const { user, authenticated } = useAuthContext();

  const member = useMemo(
    () =>
      !!(authenticated.user && authenticated.member)
        ? user?.member
        : null,
    [user, authenticated.user, authenticated.member],
  );

  const accessBlockers = useMemo(() => {
    const blockers = {};
    if (!room) {
      return blockers;
    }

    const isRoomMember = checkMemberIsRoomMember(room, member);
    if (isRoomMember) {
      return blockers;
    }
    blockers.fullRoom = checkIsRoomFull(room);
    if (room.policy.privacy === 'public') {
      return blockers;
    }

    blockers.userKicked = me?.is_kicked;
    return blockers;
  }, [room, member, me?.is_kicked]);

  const accessDenied = useMemo(
    () => Object.values(accessBlockers).some((blocker) => !!blocker),
    [accessBlockers],
  );

  if (accessDenied) {
    return (
      <Stack
        width="100%"
        alignItems="center"
        justifyContent="center"
      >
        <Typography>{JSON.stringify(accessBlockers)}</Typography>
      </Stack>
    );
  }

  return (
    <EmojiPickerProvider>
      {children}
      <ContextMenuRoom />
    </EmojiPickerProvider>
  );
};

export default memo(RoomAuthGuard);
