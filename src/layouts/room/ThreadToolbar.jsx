import { Stack, IconButton } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import { memo, useCallback, useState } from 'react';

// import ThreadPopoverDetails from '../components/room/thread/ThreadPopoverDetails.jsx';
import Iconify from '../../components/iconify/Iconify.jsx';
import { selectCurrentThread, selectMe, selectRoomAttribute, selectRoomId, selectMainThread, setThreadMain } from '../../redux/slices/room.js';
import { dispatch, useSelector } from '../../redux/store.js';

// Selectors

function getThreadColor(thread) {
  switch (thread?.status) {
    case 'running':
      return 'rgba(150, 150, 255, 0.9)';
    case 'blocked':
      return 'rgba(255, 200, 100, 0.5)';
    case 'dead':
      return 'rgba(50, 180, 70, 0.5)';
    default:
      return 'rgba(255, 215, 0, 0.5)';
  }
};

const selectIsViewer = createSelector(
  [selectMe],
  (me) => !!me && ['viewer', 'listener'].includes(me.role),
  {
    memoizeOptions: {
      resultEqualityCheck: (prev, next) => prev === next,
    },
  },
);

const selectRoomName = selectRoomAttribute('name');

const selectThreadName = createSelector(
  [selectCurrentThread],
  (currentThread) => (currentThread?.is_main ? 'Main' : currentThread?.name) ?? 'Unknown',
  {
    memoizeOptions: {
      resultEqualityCheck: (prev, next) => prev === next,
    },
  },
);

const ThreadToolbar = () => {
  const roomId = useSelector(selectRoomId);
  const roomName = useSelector(selectRoomName);
  const isViewer = useSelector(selectIsViewer);
  const threadName = useSelector(selectThreadName);
  const currentThread = useSelector(selectCurrentThread);
  const mainThread = useSelector(selectMainThread);
  const [threadDialogOpen, setThreadDialogOpen] = useState(null);
  const handleOpenThreadSettings = useCallback((e) => {
    if (!currentThread?.is_main) {
      setThreadDialogOpen(e.currentTarget);
    }
  }, [currentThread?.is_main]);

  const closeThreadDialog = useCallback(() => setThreadDialogOpen(null), []);

  const handleSelectThread = useCallback((threadId) => {
    dispatch(setThreadMain({ current: threadId }));
  }, []);

  const color = getThreadColor(currentThread);
  if (!roomId || !currentThread) {
    return null;
  }
  // const history = [];
  // let t = currentThread;
  // while (!!t && !t?.is_main) {
  //   if (!!t.parent) {
  //     t = threads.byId[t.parent.thread_id];
  //   } else {
  //     t = Object.values(threads.byId).find(t => t?.is_main);
  //   }
  //   if (t) {
  //     history.push(t);
  //   }
  // }
  // history.pop();

  return (
    <>
      {!currentThread?.is_main && (
        <IconButton
          variant="soft"
          onClick={() => handleSelectThread(currentThread?.parent?.thread_id || mainThread)}
        >
          <Iconify
            icon="radix-icons:arrow-up"
            rotate={3}
          />
        </IconButton>
      )}
      <Stack
        direction="row"
        spacing={0.1}
        alignItems="center"
      >
        {!currentThread?.is_main && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            onClick={!isViewer ? handleOpenThreadSettings : null}
            sx={{
              cursor: 'pointer',
              transition: 'color 200ms ease-out',
              '&:hover': {
                color: color,
              },
            }}
          >
            <Iconify icon="solar:hashtag-chat-bold" />
            <Stack
              spacing={-0.5}
              className="no-select"
            >
              <span className="text-lg tracking-wide truncate hover:opacity-80 cursor-pointer">
                {threadName}
              </span>
            </Stack>
          </Stack>
        )}
      </Stack>
      {/* <ThreadPopoverDetails
        thread={currentThread}
        anchorEl={threadDialogOpen}
        onClose={closeThreadDialog}
      /> */}
    </>
  );
};

export default memo(ThreadToolbar);
