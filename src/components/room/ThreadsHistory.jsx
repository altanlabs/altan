import { Stack } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import React, { memo, useRef } from 'react';

import Thread from './thread/Thread.jsx';
import { checkArraysEqualsProperties } from '../../redux/helpers/memoize';
import {
  selectMainThread,
  selectRoomThreadMain,
  selectThreadsById,
  selectTemporaryThread,
} from '../../redux/slices/room';
import { useSelector } from '../../redux/store.js';
import Iconify from '../iconify/Iconify.jsx';

const selectRoomHistory = createSelector(
  [selectRoomThreadMain, selectThreadsById],
  (main, threads) => {
    const history = [];
    let t = !!main.current && threads[main.current];
    if (!!t) {
      history.push(t.id);
    }
    while (!!t && !t?.is_main) {
      if (!!t.parent) {
        t = threads[t.parent.thread_id];
      } else {
        t = Object.values(threads).find((t) => t.is_main);
      }
      if (t) {
        history.push(t.id);
      }
    }
    return history.reverse();
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkArraysEqualsProperties(),
    },
  },
);

const ThreadsHistory = ({
  hideInput = false,
  title = null,
  description = null,
  suggestions = [],
  renderCredits = false,
  renderFeedback = false,
  show_mode_selector = false,
  ephemeral_mode = false,
}) => {
  const containerRef = useRef(null);
  const mainThread = useSelector(selectMainThread);
  const fullHistory = useSelector(selectRoomHistory);
  const main = useSelector(selectRoomThreadMain);
  const temporaryThread = useSelector(selectTemporaryThread);

  // Get the current thread ID
  // In ephemeral mode: ONLY use temporary thread or promoted thread, NEVER mainThread
  const currentThreadId = ephemeral_mode 
    ? (temporaryThread?.id || main.current)
    : (main.current || mainThread);

  console.log('🔍 ThreadsHistory state:', {
    ephemeral_mode,
    temporaryThreadId: temporaryThread?.id,
    mainCurrent: main.current,
    mainThread,
    currentThreadId,
    hasThread: !!currentThreadId,
  });

  // In ephemeral mode, show thread ONLY if we have a valid thread ID
  // Do NOT show main thread in ephemeral mode
  const shouldShowThread = ephemeral_mode
    ? !!currentThreadId
    : fullHistory?.length > 0;

  console.log('🔍 Will show thread?', shouldShowThread, 'currentThreadId:', currentThreadId);

  return (
    <div className="relative h-full w-full">
      {!shouldShowThread ? (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <Iconify
            icon="svg-spinners:gooey-balls-2"
            width={32}
          />
        </Stack>
      ) : (
        <div
          className="w-full h-full bg-[#fff] dark:bg-[#121212]"
          ref={containerRef}
        >
          <Thread
            tId={currentThreadId}
            key={`thread-${currentThreadId}-main`}
            containerRef={containerRef}
            hideInput={hideInput}
            title={title}
            description={description}
            suggestions={suggestions}
            renderCredits={renderCredits}
            renderFeedback={renderFeedback}
            show_mode_selector={show_mode_selector}
            ephemeral_mode={ephemeral_mode}
          />
        </div>
      )}
    </div>
  );
};

export default memo(ThreadsHistory);
