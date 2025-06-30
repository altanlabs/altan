import { Box, Skeleton, Stack } from '@mui/material';
import { useState, useMemo, memo } from 'react';
import { useSelector } from 'react-redux';

import RoomMember from './RoomMember.jsx';
// import { useCall } from '../../../providers/LiveCallProvider';
import { selectMe, selectMembers } from '../../../redux/slices/room';
import CustomAvatar from '../../custom-avatar/CustomAvatar.jsx';

const calculateIsUserInCall = (member, me, inCall, activeCallMembers) => {
  if (!member || !me || !activeCallMembers) return false;
  return member?.id === me?.id ? inCall : activeCallMembers.has(member?.caller_id);
};

const sortMembers = (members, me, inCall, activeCallMembers) => {
  return members.map(member => {
    return {
      ...member,
      isUserInCall: calculateIsUserInCall(member, me, inCall, activeCallMembers),
    };
  }).sort((a, b) => {
    // Sort logic remains the same
    if (a.isUserInCall !== b.isUserInCall) {
      return a.isUserInCall ? -1 : 1;
    }
    if (a.status === 'online' && b.status !== 'online') {
      return -1;
    } else if (a.status !== 'online' && b.status === 'online') {
      return 1;
    }
    return a.is_kicked === b.is_kicked ? 0 : a.is_kicked ? 1 : -1;
  });
};

const userVolumes = [];
const activeCallMembers = [];

const RoomMembers = () => {
  const liveCallEnabled = false;
  const inCall = false;
  const members = useSelector(selectMembers);
  const me = useSelector(selectMe);
  const [showAll, setShowAll] = useState(false);
  // const { enabled: liveCallEnabled, inCall, userVolumes, activeCallMembers } = useCall();

  const memoizedAvatars = useMemo(() => {
    if (!members) {
      return (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0 }}>
          {[...Array(7)].map((_, index) => <Box key={`roommember-ph-${index}`} sx={{ width: 20, height: 20, marginRight: -1 }}><Skeleton variant="circular" style={{ width: 40, height: 40 }} /></Box>)}
        </Stack>
      );
    }
    const enhancedMembers = Object.values(members.byId).filter(m => !!m && (!m.is_kicked || me?.role === 'admin'));
    const sortedMembers = !liveCallEnabled ? enhancedMembers : sortMembers(enhancedMembers, me, inCall, activeCallMembers);
    const numUsers = sortedMembers.length || 0;
    const maxAvatars = showAll ? numUsers : 7;
    const numExtraUsers = numUsers - maxAvatars;
    return sortedMembers.slice(0, maxAvatars).map(member => {
      const userVolume = !!userVolumes ? userVolumes[member?.caller_id] || 0 : 0;
      return (
        <RoomMember
          key={member?.id}
          member={member}
          userVolume={userVolume}
          badgeSize={35}
          style={{
            marginRight: -1,
          }}
        />
      );
    }).filter(Boolean).concat((numExtraUsers > 0 || !!showAll) ? [(
      <CustomAvatar
        key="extra-users"
        sx={{ width: '20px', height: '20px', cursor: 'pointer', mr: -1 }}
        onClick={() => setShowAll(!showAll)}
      >
        {!showAll ? `+${numExtraUsers}` : '-'}
      </CustomAvatar>
    )]
      : [],
    );
  }, [members, showAll, inCall, me, liveCallEnabled]);

  return <div>{memoizedAvatars}</div>;
};

export default memo(RoomMembers);
