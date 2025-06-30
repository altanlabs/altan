import {
  Card, CardMedia,
  Box, Stack, Grid, Typography, useTheme, Chip, useMediaQuery,
  CircularProgress,
} from '@mui/material';
import React, { memo, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { bgBlur } from '@utils/styleUtils';

import RoomMember from '.././members/RoomMember';
import { useAuthContext } from '../../../auth/useAuthContext';
// import { m } from 'framer-motion';
import { useGateId } from '../../../routes/DomainRedirectHandler';
import CustomAvatar from '../../avatars/CustomAvatar';
import { getMemberDetails } from '../utils';

const variants = {
  hidden: { opacity: 0.1, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] } },
};

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

const RoomMinimal = memo(({ room, handleJoinRoom, me }) => {
  const otherMember = getRoomMembers(room, me?.id);
  const memberDetails = useMemo(() => getMemberDetails(otherMember, me), [otherMember, me]);
  return (
    <Grid
      item
      xs={6}
      sm={3}
      md={2}
      lg={1}
    >
      <Box
        onClick={handleJoinRoom}
        sx={{
          borderRadius: '1rem',
          overflow: 'hidden',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'transform 0.3s',
          ':hover': {
            transform: 'scale(1.02)',
          },
        }}
      >
        <CustomAvatar
          name={room.name}
          src={memberDetails.src}
          sx={{
            width: 40,
            height: 40,
            mb: .5,
            bgcolor: 'secondary.main',
          }}
        />
        <Typography
          variant="caption"
          sx={{
            textAlign: 'center',
            color: 'text.primary',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {memberDetails.name}
        </Typography>
      </Box>
    </Grid>
  );
});

const RoomCard = ({ room }) => {
  const {
    user,
    guest,
  } = useAuthContext();

  const me = user?.member || guest?.member;
  const { gateId: paramsGateId } = useParams();
  const contextGateId = useGateId();
  const gateId = contextGateId || paramsGateId;
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const MAX_VISIBLE_MEMBERS = isMobile ? 4 : 6;
  const [showAllMembers, setShowAllMembers] = useState(false);

  const membersArray = useMemo(() => {
    if (!room) {
      return [];
    }
    return Array.isArray(room.members) ? room.members : room.members?.items ?? [];
  }, []);

  const handleShowAllMembers = useCallback(() => {
    setShowAllMembers(prev => !prev);
  }, []);

  const handleJoinRoom = useCallback(() => {
    if (!room) {
      return;
    }
    if (gateId) {
      navigate(contextGateId ? `/r/${room._byName}` : `/gate/${gateId}/r/${room._byName}`, { replace: false });
    } else {
      navigate(`/room/${room.id}`);
    }
  }, [gateId, contextGateId, room]);

  if (!room) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        width="100%"
        height="100%"
      >
        <CircularProgress />
      </Stack>
    );
  };

  if (!!room.is_dm) {
    return (
      <RoomMinimal
        room={room}
        theme={theme}
        handleJoinRoom={handleJoinRoom}
        me={me}
      />
    );
  };

  return (
    <Grid
      item
      xs={12}
      md={6}
    >
      <Card
        onClick={handleJoinRoom}
        sx={{
          borderRadius: '1rem',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
          p: 0,
          zIndex: 8,
          '& .join-room-chip': {
            width: 55,
            position: 'absolute',
            opacity: 0,
            top: 15,
            right: 15,
            transition: 'opacity 0.5s ease',
          },
          '&:hover': {
            ...!isMobile && {
              opacity: .8,

            },
          },
        }}
      >
        {room.avatar_url && <CardMedia component="img" alt={room.name} image={room.avatar_url} />}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            ...bgBlur({ opacity: 0.5, blur: 10, color: theme.palette.mode === 'dark' ? '#000' : '#fff' }),
          }}
        >
          <Stack sx={{ flexGrow: 1, mx: 1.5, overflow: 'hidden' }}>

            <Typography variant="h6" noWrap>
              {room.name}
            </Typography>
            <Typography variant="caption" noWrap>
              {room.description || '...'}
            </Typography>
          </Stack>
          {
            (room.policy.max_members !== -1) && (
              <Chip
                variant="soft"
                label={`${membersArray.length} / ${room.policy.max_members}`}
                color={
                  membersArray.length >= room.policy.max_members ? 'error' :
                    membersArray.length >= room.policy.max_members * 0.75 ? 'warning' :
                      'primary'
                }
                sx={{ mr: 1 }}
              />
            )
          }

          {/* <Chip
              { ...!isMobile ? { className: "join-room-chip" } : {} }
              label="Join"
              variant="contained"
              color="info"
              onClick={handleJoinRoom}
            /> */}
        </Box>
        {
          room.members && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', px: 2, py: 1 }}>
              {membersArray.slice(0, showAllMembers ? membersArray.length : MAX_VISIBLE_MEMBERS).map((member, index) => (
                <RoomMember key={index} member={member} me={me} />
              ))}
              {membersArray.length > MAX_VISIBLE_MEMBERS && (
                <Chip
                  label={showAllMembers ? '-Less' : `+${membersArray.length - MAX_VISIBLE_MEMBERS}`}
                  onClick={handleShowAllMembers}
                  sx={{ alignSelf: 'center' }}
                />
              )}
            </Box>
          )
        }
      </Card>
    </Grid>
  );
};

export default memo(RoomCard);
