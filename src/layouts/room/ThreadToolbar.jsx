import { Stack, IconButton } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import { memo, useCallback } from 'react';

// import ThreadPopoverDetails from '../components/room/thread/ThreadPopoverDetails.jsx';
import Iconify from '../../components/iconify/Iconify.jsx';
import {
  selectCurrentThread,
  selectMe,
  selectRoomId,
  selectMainThread,
  setThreadMain,
} from '../../redux/slices/room.js';
import { dispatch, useSelector } from '../../redux/store.js';

const ThreadToolbar = () => {
  const roomId = useSelector(selectRoomId);
  const currentThread = useSelector(selectCurrentThread);
  const mainThread = useSelector(selectMainThread);
  const handleSelectThread = useCallback((threadId) => {
    dispatch(setThreadMain({ current: threadId }));
  }, []);

  if (!roomId || !currentThread) {
    return null;
  }

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
        <span className="text-lg tracking-wide truncate hover:opacity-80 cursor-pointer">
          {currentThread?.name}
        </span>
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
