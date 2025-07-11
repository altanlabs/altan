import { IconButton, Tooltip } from '@mui/material';
import { memo, useCallback, useMemo } from 'react';

import { cn } from '@lib/utils';

import ThreadToolbar from './ThreadToolbar.jsx';
import Iconify from '../../components/iconify/Iconify.jsx';
import {
  archiveMainThread,
  makeSelectSortedThreadMessageIds,
  selectCurrentThread,
  selectMessagesIds,
} from '../../redux/slices/room';
import { dispatch, useSelector } from '../../redux/store.js';

const handleRefreshConversation = (threadId) => dispatch(archiveMainThread({ threadId }));

const GeneralToolbar = ({ className }) => {
  const currentThread = useSelector(selectCurrentThread);
  const messagesIdsSelector = useMemo(makeSelectSortedThreadMessageIds, []);
  const messageIds = useSelector((state) => messagesIdsSelector(state, currentThread?.id));
  const hasMessages = messageIds && messageIds.length > 0;
  console.log('hasMessages', hasMessages);
  const enableRefresh = currentThread?.is_main && hasMessages;
  const onRefreshConversation = useCallback(
    () => handleRefreshConversation(currentThread?.id),
    [currentThread?.id],
  );
  return (
    <div
      className={cn(
        'relative left-0 right-0 z-10 top-0 flex flex-row items-center justify-start p-1.5 px-4 pb-1.5 space-x-1 transition transition-all duration-500 backdrop-blur-md bg-[#FFFFFF]/95 dark:bg-[#121212]/95',
        className,
      )}
    >
      {!!enableRefresh && (
        <Tooltip
          title="New conversation"
          placement="right"
          arrow
        >
          <IconButton
            size="small"
            onClick={onRefreshConversation}
          >
            <Iconify
              width={20}
              icon="solar:pen-new-square-linear"
            />
          </IconButton>
        </Tooltip>
      )}

      <ThreadToolbar />
      <div style={{ flexGrow: 1 }}></div>
    </div>
  );
};

export default memo(GeneralToolbar);
