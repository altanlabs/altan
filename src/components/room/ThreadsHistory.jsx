import { Stack } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import React, { memo, useRef } from 'react';

import Thread from './thread/Thread.jsx';
import { checkArraysEqualsProperties } from '../../redux/helpers/memoize';
import {
  selectMainThread,
  selectRoomThreadMain,
  selectThreadsById,
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

const ThreadsHistory = () => {
  const containerRef = useRef(null);
  const mainThread = useSelector(selectMainThread);
  const fullHistory = useSelector(selectRoomHistory);
  const main = useSelector(selectRoomThreadMain);

  // Get the current thread ID
  const currentThreadId = main.current || mainThread;

  return (
    <div className="relative h-full w-full">
      {!fullHistory?.length ? (
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
          />
        </div>
      )}
    </div>
  );
};

export default memo(ThreadsHistory);
