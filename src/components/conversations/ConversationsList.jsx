import { Stack, Typography, Box } from '@mui/material';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import {
  fetchRoomAllThreads,
  selectRoomStateInitialized,
  selectRoomStateLoading,
  selectThreadsById,
  selectRoomThreadsIds,
} from '../../redux/slices/room';
import { dispatch } from '../../redux/store.js';
import ThreadMinified from '../room/thread/ThreadMinified.jsx';

const ConversationsList = ({
  maxHeight = 400,
  limit = 20,
  onThreadSelect = null,
  emptyMessage = 'No recent conversations yet.\nStart a conversation to see it here!',
  loadingMessage = 'Loading conversations...',
}) => {
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
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          {loadingMessage}
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
    .slice(0, limit);

  return (
    <Stack>
      <Box sx={{ maxHeight, overflow: 'auto' }}>
        {conversationThreads.length > 0 ? (
          <Stack>
            {conversationThreads.map((threadId) => (
              <ThreadMinified
                key={threadId}
                threadId={threadId}
                disableConnector
                onSelect={onThreadSelect}
              />
            ))}
          </Stack>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              whiteSpace: 'pre-line',
            }}
          >
            {emptyMessage}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

export default ConversationsList;
