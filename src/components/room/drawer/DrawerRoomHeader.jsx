import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import React, { memo, useCallback } from 'react';

import useResponsive from '../../../hooks/useResponsive';
import {
  archiveMainThread,
  selectCurrentDrawerThreadName,
  selectCurrentThread,
  selectDisplayThreadsDrawer,
  selectMe,
  selectRoomAttribute,
  selectThreadDrawerDetails,
  setDrawerOpen,
  setThreadDrawer,
} from '../../../redux/slices/room';
import { dispatch, useSelector } from '../../../redux/store.js';
import Iconify from '../../iconify/Iconify.jsx';
import Logo from '../../logo/Logo.jsx';

const handleCloseThread = () => dispatch(setDrawerOpen(false));
const handleMiniMaxiThread = (display) => dispatch(setThreadDrawer({ display }));

const selectRoomId = selectRoomAttribute('id');
const handleRefreshConversation = (threadId) => dispatch(archiveMainThread({ threadId }));

const DrawerRoomHeader = () => {
  const me = useSelector(selectMe);
  const roomId = useSelector(selectRoomId);
  const currentDrawerThreadName = useSelector(selectCurrentDrawerThreadName);
  const currentThread = useSelector(selectCurrentThread);

  const displayThreads = useSelector(selectDisplayThreadsDrawer);
  const drawer = useSelector(selectThreadDrawerDetails);
  const isSmallScreen = useResponsive('down', 'sm');
  const enableRefresh = currentThread?.is_main && !drawer.isCreation && !drawer.current;

  const onRefreshConversation = useCallback(
    () => handleRefreshConversation(currentThread?.id),
    [currentThread?.id],
  );

  if (!me || !roomId) {
    return null;
  }
  return (
    <div className="relative w-full flex flex-row justify-between items-center space-x-2 px-2 py-3">
      {!!displayThreads && !!drawer.isCreation && (
        <IconButton
          color="success"
          sx={{
            opacity: 0.8,
            contain: 'content',
          }}
        >
          <Iconify
            width={!isSmallScreen ? 30 : 20}
            icon={!drawer.messageId ? 'ri:chat-thread-fill' : 'solar:hashtag-chat-bold'}
          />
        </IconButton>
      )}
      {displayThreads ? (
        <Stack
          direction="row"
          width="100%"
        >
          <Typography sx={{ textTransform: 'capitalize' }}>{currentDrawerThreadName}</Typography>
        </Stack>
      ) : (
        <>
          <Logo
            disabledLink
            minimal
          />
        </>
      )}
      <div className="flex items-center ml-auto">
        {(!!drawer.current || !!drawer.isCreation) && (
          <Stack
            direction="row"
            alignItems="center"
            padding={1}
          >
            {!drawer.isCreation && !drawer.messageId && (
              <IconButton
                size="small"
                onClick={() => handleMiniMaxiThread(!drawer.display)}
                color={displayThreads && drawer.isCreation ? 'error' : 'inherit'}
              >
                <Iconify
                  width={20}
                  sx={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                  icon={displayThreads ? 'ic:round-minimize' : 'solar:hashtag-chat-bold'}
                />
              </IconButton>
            )}
          </Stack>
        )}
        <Tooltip title="Close drawer">
          <IconButton
            size="small"
            onClick={handleCloseThread}
            sx={{ mr: 1 }}
          >
            <Iconify
              width={24}
              icon="cuida:sidebar-collapse-outline"
            />
          </IconButton>
        </Tooltip>
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
      </div>
    </div>
  );
};

export default memo(DrawerRoomHeader);
