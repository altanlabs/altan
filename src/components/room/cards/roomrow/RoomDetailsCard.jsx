import { Stack, Typography, Card, CardHeader, Chip, CardContent, List, Tooltip } from '@mui/material';
import { capitalize } from 'lodash';
import { memo, useMemo } from 'react';

import RoomMemberDetails from './RoomMemberDetails.jsx';
import { useSelector } from '../../../../redux/store.tsx';
import CustomAvatar from '../../../avatars/CustomAvatar.jsx';
import Iconify from '../../../iconify/Iconify.jsx';
import { formatDate } from '../../../utils/dateUtils';

const RoomDetailsCard = ({
  roomId,
  account = null,
  onClick = null,
  maxMembersEnabled = false,
}) => {
  const roomSelector = null;
  const room = useSelector((state) => roomSelector(state, roomId));
  const membersArray = useMemo(() => {
    if (!room?.members) {
      return null;
    }
    return (Array.isArray(room.members) ? room.members : room.members?.items || []);
  }, [room?.members]);
  const renderMaxMembers = useMemo(() => {
    if (!maxMembersEnabled || !membersArray || room?.policy?.max_members === -1) {
      return null;
    }
    return (
      <Chip
        variant="soft"
        size="small"
        label={`${membersArray.length} / ${room.policy?.max_members}`}
        color={
          membersArray.length >= room?.policy?.max_members ? 'error' :
            membersArray.length >= room?.policy?.max_members * 0.75 ? 'warning' :
              'primary'
        }
        sx={{
          mr: 1,
          fontSize: '0.6rem',
          p: 0,
          minHeight: 0,
          height: 18,
        }}
      />
    );
  }, [maxMembersEnabled, membersArray, room?.policy?.max_members]);

  if (!room) {
    return null;
  }

  return (
    <Card
      sx={{
        backgroundColor: 'transparent',
        overflowY: 'auto',
      }}
      elevation={0}
      className="p-1 h-full w-full"
    >
      <CardHeader
        style={{
          backgroundImage: `url(${room.avatar_url})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          minHeight: room.avatar_url ? 200 : 75,
        }}
        className="rounded-lg w-full"
        title={(
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            paddingY={1}
            width="100%"
            className="p-4 border-b border-gray-400 border-opacity-20 rounded-xl"
          >
            <Stack
              spacing={0.5}
              width="100%"
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                width="100%"
              >
                {!!account?.company?.logo_url && <CustomAvatar variant="circular" sx={{ width: 20, height: 20 }} src={account.company.logo_url} name={account.company.name} />}
                <Typography variant="h6">{room.name}</Typography>
                <Chip onClick={() => onClick(room.id)} size="small" label={<b>{capitalize(room?.status || 'open')}</b>} />
                {renderMaxMembers}
              </Stack>
              <Typography variant="caption">{room.description || '...'}</Typography>
              {room?.date_creation &&
                <Typography variant="caption" sx={{ fontSize: '0.5rem' }}>Since: {formatDate(room?.date_creation)}</Typography>}
              <Stack
                direction="row"
                spacing={0.5}
                width="100%"
                sx={{
                  overflow: 'auto',
                  maxWidth: '100%',
                  flexWrap: 'wrap',
                }}
              >
                {
                  Object.entries(room.policy).map(([key, value]) => !['id', 'date_creation', 'meta_data'].includes(key) && (
                    <Chip
                      key={key}
                      sx={{
                        fontSize: '0.6rem',
                        height: 15,
                      }}
                      size="small"
                      label={
                        <Stack
                          direction="row"
                          alignItems="center"
                        >
                          <b>{capitalize(key.replace('_', ' '))}</b>: {
                            typeof value === 'object' ? (
                              <Tooltip
                                arrow
                                title={JSON.stringify(value)}
                              >
                                <Iconify icon="mdi:info" width={10} />
                              </Tooltip>
                            ) : capitalize(value)
                          }
                        </Stack>
                      }
                    />
                  ))
                }
              </Stack>
            </Stack>
            {/**
             * Additions:
             ** Data:
             *** - next events
             *** - total threads (running, blocked, closed)
             *** - last active thread w/ message
             *** - number of interactions (all / you) in last 24 hours
             *** - owner
             *** - active threads in last 24 hours
             *** - room members sorted desc by number interactions
             *** - policy details
             ** Actions:
             *** - invite
             *** - close room
             *** - change policy
             */}
          </Stack>
        )}
      >
      </CardHeader>
      <CardContent>
        <Typography variant="subtitle2">Members ({membersArray.length}):</Typography>
        <List>
          {
            !!membersArray?.length && membersArray.map((member) => (
              <RoomMemberDetails
                key={member.id}
                member={member}
              />
            ))
          }
        </List>

      </CardContent>

    </Card>
  );
};

export default memo(RoomDetailsCard);
