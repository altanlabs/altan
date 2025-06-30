import { Stack } from '@mui/material';
import { memo, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { makeSelectSortedAndFilteredThreads } from '../../../hooks/useSortedThreads.js';
import { selectRoomStateInitialized } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store.js';
import ThreadMinifiedPlaceholder from '../skeletons/ThreadMinifiedPlaceholder.jsx';
import ThreadMinified from '../thread/ThreadMinified.jsx';

const selectAllThreadsInitialized = (state) => selectRoomStateInitialized('allThreads')(state);

const DrawerThreads = ({ status, searchTerm = '' }) => {
  const initialized = useSelector(selectAllThreadsInitialized);
  /**
   * TODO: implement search of nested threads
   */
  const filteredThreadsSelector = useMemo(makeSelectSortedAndFilteredThreads, []);
  const filteredThreads = useSelector((state) => filteredThreadsSelector(state, status, searchTerm));

  if (!filteredThreads && !!initialized) {
    return null;
  }

  return (
    <>
      {
        !!filteredThreads?.length && (
          <Virtuoso
            className="w-full no-scrollbar"
            data={filteredThreads}
            defaultItemHeight={50}
            itemContent={(index, threadId) => (
              <ThreadMinified
                threadId={threadId}
              // key={`mini-thread-${index}-${threadId}`}
              />
            )}
            overscan={10}
          />
        )
      }
      {
        !initialized && !filteredThreads?.length && !searchTerm.length && (
          <Stack
            spacing={1}
          >
            {
              [...Array(5)].map((_, index) => <ThreadMinifiedPlaceholder key={`thread_mini_ph_${index}`} />)
            }
          </Stack>
        )
      }
    </>
  );
};

export default memo(DrawerThreads);
