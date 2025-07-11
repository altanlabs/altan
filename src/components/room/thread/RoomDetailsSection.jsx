import { Box, Tab, Tabs, Typography, Stack } from '@mui/material';
import { useState, memo, useEffect } from 'react';
import { useSelector } from 'react-redux';

import ThreadMinified from './ThreadMinified.jsx';
import {
  selectMembers,
  selectMe,
  selectRoomStateInitialized,
  selectRoomStateLoading,
  selectThreadsById,
  selectRoomThreadsIds,
  fetchRoomAllThreads } from '../../../redux/slices/room';
import { dispatch } from '../../../redux/store';
import CustomAvatar from '../../custom-avatar/CustomAvatar.jsx';
import Iconify from '../../iconify/Iconify.jsx';
import MemberInviteDialog from '../drawer/MemberInviteDialog.jsx';
import { getMemberDetails } from '../utils';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`room-tabpanel-${index}`}
    aria-labelledby={`room-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const MembersList = () => {
  const members = useSelector(selectMembers);
  const me = useSelector(selectMe);

  const membersList = Object.values(members?.byId || {}).filter(
    (member) => member && (!member.is_kicked || me?.role === 'admin'),
  );

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontSize: '1rem', fontWeight: 600 }}
        >
          Members ({membersList.length})
        </Typography>
        <MemberInviteDialog />
      </Box>

      <Stack spacing={1.5}>
        {membersList.map((member) => {
          const memberDetails = getMemberDetails(member, me);

          return (
            <Box
              key={member.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <CustomAvatar
                src={memberDetails.src}
                alt={memberDetails.name}
                sx={{ width: 40, height: 40 }}
              >
                {memberDetails.name?.charAt(0)?.toUpperCase()}
              </CustomAvatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  noWrap
                >
                  {memberDetails.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: memberDetails.status === 'online' ? 'success.main' : 'grey.400',
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {memberDetails.status || 'offline'} • {memberDetails.role || 'member'}
                  </Typography>
                </Box>
              </Box>

              {memberDetails.type === 'agent' && (
                <Box
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    AI
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
};

const ConversationsList = () => {
  const allThreadsInitialized = useSelector(selectRoomStateInitialized('allThreads'));
  const allThreadsLoading = useSelector(selectRoomStateLoading('allThreads'));
  const threadsById = useSelector(selectThreadsById);
  const threadIds = useSelector(selectRoomThreadsIds);

  useEffect(() => {
    if (!allThreadsInitialized && !allThreadsLoading) {
      dispatch(fetchRoomAllThreads());
    }
  }, [allThreadsInitialized, allThreadsLoading]);

  if (!allThreadsInitialized && allThreadsLoading) {
    return (
      <Stack spacing={2}>
        <Typography
          variant="h6"
          sx={{ fontSize: '1rem', fontWeight: 600, mb: 2 }}
        >
          Recent Conversations
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', py: 2 }}
        >
          Loading conversations...
        </Typography>
      </Stack>
    );
  }

  // Filter threads that are not main threads and have messages
  const conversationThreads = threadIds
    .filter((threadId) => {
      const thread = threadsById[threadId];
      return thread && !thread.is_main && thread.status !== 'dead';
    })
    .slice(0, 10); // Limit to recent 10 conversations

  return (
    <Stack spacing={2}>
      <Typography
        variant="h6"
        sx={{ fontSize: '1rem', fontWeight: 600, mb: 2 }}
      >
        Recent Conversations ({conversationThreads.length})
      </Typography>
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {conversationThreads.length > 0 ? (
          <Stack spacing={1}>
            {conversationThreads.map((threadId) => (
              <ThreadMinified
                key={threadId}
                threadId={threadId}
                disableConnector
              />
            ))}
          </Stack>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 4 }}
          >
            No recent conversations yet.
            <br />
            Start a conversation to see it here!
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

const RoomDetailsSection = ({ room }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', mx: 'auto', mt: 4 }}>
      {/* Room Description */}
      {room?.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 3, maxWidth: 400, mx: 'auto' }}
        >
          {room.description}
        </Typography>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minWidth: 120,
            },
          }}
        >
          <Tab
            label="Members"
            icon={
              <Iconify
                icon="mdi:account-group"
                width={20}
              />
            }
            iconPosition="start"
          />
          <Tab
            label="Conversations"
            icon={
              <Iconify
                icon="mdi:chat-outline"
                width={20}
              />
            }
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel
        value={tabValue}
        index={0}
      >
        <div style={{ minHeight: '400px' }}>
          <MembersList />
        </div>
      </TabPanel>

      <TabPanel
        value={tabValue}
        index={1}
      >
        <div style={{ minHeight: '400px' }}>
          <ConversationsList />
        </div>
      </TabPanel>
    </Box>
  );
};

export default memo(RoomDetailsSection);
