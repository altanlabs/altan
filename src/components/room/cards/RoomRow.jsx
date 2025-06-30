import React, { memo } from 'react';

import RoomRowExpanded from './roomrow/RoomRowExpanded';
import RoomRowTooltip from './roomrow/RoomRowTooltip';
import useResponsive from '../../../hooks/useResponsive';
import { selectDrawerExpanded } from '../../../redux/slices/general';
import { useSelector } from '../../../redux/store';
import { isMobile } from '../utils';

export function getRoomMembers(room, currentUserId) {
  let roomMembers;
  if (Array.isArray(room?.members)) {
    roomMembers = room.members;
  } else if (Array.isArray(room?.members?.items)) {
    roomMembers = room.members.items;
  } else {
    roomMembers = [];
  }
  const otherMember = roomMembers.find(member => member?.member_id !== currentUserId);
  return otherMember;
}

const RoomRow = ({ roomId, onJoin }) => {
  // console.log("rerender room row", roomId);
  const isSmallScreen = useResponsive('down', 'sm');
  const drawerExpanded = useSelector(selectDrawerExpanded);
  // const { gateId: paramsGateId } = useParams();
  // const contextGateId = useGateId();
  // const gateId = contextGateId || paramsGateId;

  return !(drawerExpanded || isSmallScreen || isMobile()) ? (
    <RoomRowTooltip
      roomId={roomId}
      onClick={onJoin}
    >
      <RoomRowMinified
        roomId={roomId}
        onClick={onJoin}
      />
    </RoomRowTooltip>
  ) : (
    <RoomRowExpanded
      roomId={roomId}
      onClick={onJoin}
    />
  );
};

export default memo(RoomRow);

// <Tooltip
//   title={(
//     <RoomDetailsCard
//       room={room}
//       account={account}
//       onClick={handleJoinRoom}
//       MaxMembersChip={MaxMembersChip}
//     />
//   )}
//   enterDelay={isSmallScreen ? 1000 : 500}
//   enterNextDelay={isSmallScreen ? 1000 : 500}
//   enterTouchDelay={isSmallScreen ? 1000 : 500}
//   arrow
//   { ...!isSmallScreen ? { placement: 'right' } : {}}
//   slotProps={{
//     tooltip: {
//       sx: {
//         position: 'relative',
//         borderRadius: '5%',
//         width: isSmallScreen ? '70vw': '50vw',
//         maxWidth: '600px',
//         padding: 0,
//         ...bgBlur({ opacity: 0.2, blur: 5, color: theme.palette.mode === 'dark' ? '#000' : '#bbb' }),

//       }
//     }
//   }}
// >
//   <span>

//   </span>
// </Tooltip>

// const MaxMembersChip = (room.policy.max_members !== -1) && (
//   <Chip
//     variant='soft'
//     size='small'
//     label={`${membersArray.length} / ${room.policy.max_members}`}
//     color={
//       membersArray.length >= room.policy.max_members ? "error" :
//         membersArray.length >= room.policy.max_members * 0.75 ? "warning" :
//           "primary"
//     }
//     sx={{
//       mr: 1,
//       fontSize: '0.6rem',
//       p: 0,
//       minHeight: 0,
//       height: 18
//     }}
//   />
// );
// const RoomMinimal = ({ room, handleJoinRoom, me, children }) => {
//   const otherMember = getRoomMembers(room, me?.id)
//   const memberDetails = useMemo(() => getMemberDetails(otherMember, me), [otherMember, me]);
//   return (
//     <Box
//       onClick={handleJoinRoom}
//       sx={{
//         borderRadius: '1rem',
//         overflow: 'hidden',
//         p: 2,
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//         cursor: 'pointer',
//         transition: 'transform 0.3s',
//         ':hover': {
//           transform: 'scale(1.02)'
//         }
//       }}
//     >
//       {children}
//       <CustomAvatar
//         name={room.name}
//         src={memberDetails.src}
//         sx={{
//           width: 40,
//           height: 40,
//           mb: .5,
//           bgcolor: 'secondary.main',
//         }}
//       />
//       <Typography
//         variant="caption"
//         sx={{
//           textAlign: 'center',
//           color: 'text.primary',
//           whiteSpace: 'nowrap',
//           textOverflow: 'ellipsis',
//         }}
//       >
//         {memberDetails.name}
//       </Typography>
//     </Box>
//   )
// };

{ /* {
        !gateId && showAccount && (
          <Tooltip
            arrow
            followCursor
            title={account?.company?.name}
          >
            <CustomAvatar
              name={account?.company?.name}
              src={account?.company?.logo_url}
              className="account-avatar"
              sx={{
                position: 'absolute',
                zIndex: 100,
                top: -3,
                left: -3,
                width: 15,
                height: 15,
                opacity: 0.5,
                transition: 'all 300ms ease',
                mb: 0.5,
                bgcolor: 'secondary.main',
              }}
            />
          </Tooltip>
        )
      } */ }
