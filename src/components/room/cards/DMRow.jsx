import { Box, Stack, Typography, useTheme } from '@mui/material';
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '../../../auth/useAuthContext';
import RoomMember from '../members/RoomMember';
import { getMemberDetails } from '../utils';

export function getRoomMembers(room, me) {
  if (!me) {
    return null;
  }
  let roomMembers;
  if (Array.isArray(room?.members)) {
    roomMembers = room.members;
  } else if (Array.isArray(room?.members?.items)) {
    roomMembers = room.members.items;
  } else {
    roomMembers = [];
  }
  const otherMember = roomMembers.find(member => member?.member_id !== me.id);
  return otherMember;
}

const DMRow = ({ room, showAccount = false }) => {
  console.log('#####3 rendering dm row');
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    user,
    guest,
    accounts,
  } = useAuthContext();
  const me = user?.member || guest?.member;
  const account = !!accounts?.length && accounts.find(a => a.id === room.account_id);

  // const membersArray = (Array.isArray(room.members) ? room.members : room.members?.items || []);

  // const membersWithoutMe = useMemo(() => membersArray.filter(rm => rm.member_id !== me?.id), [membersArray, me]);

  const handleJoinRoom = () => {
    navigate(`/room/${room?.id}`);
  };

  const dmWith = getRoomMembers(room, me);
  const dmWithDetails = getMemberDetails(dmWith, me);

  return (
    <Box
      className="dm-row"
      sx={{
        transition: 'all 300ms ease',
        position: 'relative',
        borderRadius: 1,
        '&:hover': {
          transform: 'scale(1.05)',
          background: theme.palette.background.neutral,
        },
      }}
    >
      <Box
        onClick={handleJoinRoom}
        sx={{
          borderRadius: '1rem',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 300ms ease',

          p: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RoomMember
            member={dmWith}
            size={40}
            hideBadge={true}
            badgeSize={40}
            hideTooltip={true}
          />
          <Stack
            sx={{
              flexGrow: 1,
              mx: 1.5,
              paddingRight: 3,
              overflow: 'hidden',
            }}
          >
            <Stack
              alignItems="flex-start"
              justifyContent="center"
              spacing={-0.75}
            >

              <Typography
                variant="body2"
                noWrap
                sx={{
                  fontWeight: 'normal',
                }}
              >
                {dmWithDetails.name}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  fontWeight: 'normal',
                  fontSize: '0.6rem',
                }}
              >
                Last Message · <span style={{ opacity: 0.5 }}>10/02</span>
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default memo(DMRow);

// {
//   showAccount && (
//     <Tooltip
//       arrow
//       followCursor
//       title={account?.company?.name}
//     >
//       <CustomAvatar
//         name={account?.company?.name}
//         src={account?.company?.logo_url}
//         className="account-avatar"
//         sx={{
//           position: 'absolute',
//           zIndex: 100,
//           top: -1,
//           right: -1,
//           width: 10,
//           height: 10,
//           opacity: 0.5,
//           transition: 'all 300ms ease',
//           mb: 0.5,
//           bgcolor: 'secondary.main',
//         }}
//       />
//     </Tooltip>
//   )
// }
