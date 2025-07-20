import { Stack, Typography } from '@mui/material';
import { useMemo, memo } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuthContext } from '../../auth/useAuthContext';
import ContextMenuRoom from '../../components/contextmenu/ContextMenuRoom.jsx';
import EmojiPickerProvider from '../../providers/EmojiPickerProvider.jsx';
import { selectMe, selectRoom } from '../../redux/slices/room';
import { useSelector } from '../../redux/store.js';

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

  const { user, guest, authenticated } = useAuthContext();
  
  // Check if this is guest access via URL parameter
  const searchParams = new URLSearchParams(location.search);
  const guestId = searchParams.get('guest_id');
  const isGuestAccess = !!guestId;
  
  const member = useMemo(
    () =>
      !!((authenticated.user || authenticated.guest) && authenticated.member)
        ? user?.member || guest?.member
        : null,
    [user, guest, authenticated.user, authenticated.guest, authenticated.member],
  );

  const accessBlockers = useMemo(() => {
    const blockers = {};
    if (!room) {
      return blockers;
    }
    
    // Special handling for guest DM rooms
    if (isGuestAccess && room.is_dm) {
      // For guest access to DM rooms, allow access without member checks
      // The backend has already validated the guest has access to this room
      return blockers; // No blockers for valid guest DM access
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
  }, [room, member, me?.is_kicked, isGuestAccess]);

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
