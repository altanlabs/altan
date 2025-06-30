import { IconButton, Stack, Tooltip } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import { memo, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import { cn } from '@lib/utils';

import ThreadToolbar from './ThreadToolbar.jsx';
import SettingsDialog from '../../components/dialogs/SettingsDialog.jsx';
import Iconify from '../../components/iconify/Iconify.jsx';
import { getMemberDetails } from '../../components/room/utils';
import { checkObjectsEqual } from '../../redux/helpers/memoize.js';
// import UserPopover from '../../components/UserPopover.jsx';
// import { selectDrawerExpanded, selectGeneralRoomId } from '../../redux/slices/general';
import {
  archiveMainThread,
  selectCurrentThread,
  selectMe,
  selectMembers,
  selectRoom,
  selectRoomState,
  setDrawerOpen,
} from '../../redux/slices/room';
import { dispatch, useSelector } from '../../redux/store.js';
// import GateDrawerToggle from '../sections/circle/GateDrawerToggle.jsx';

// Selectors

const selectOtherMember = createSelector(
  [selectRoom, selectMembers, selectMe],
  (room, members, me) => {
    if (room?.is_dm && me) {
      return findOtherMember(members, me.id);
    }
    return null;
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

const selectMemberDetails = createSelector(
  [selectOtherMember, selectMe],
  (otherMember, me) => {
    if (!otherMember) return null;
    return getMemberDetails(otherMember, me);
  },
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

const selectName = createSelector(
  [selectRoom],
  (room) => room?.name || 'Room',
);

const roomSelector = createSelector(
  [selectRoomState],
  (roomState) => ({
    drawerOpen: roomState.drawerOpen,
  }),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

// Logo component has been removed as per requirements

function findOtherMember(members, memberId) {
  const otherId = members.allIds.find((id) => id !== memberId);
  return members.byId[otherId];
}

const handleRefreshConversation = (threadId) => dispatch(archiveMainThread({ threadId }));
const onOpenDrawer = () => dispatch(setDrawerOpen(true));

const GeneralToolbar = ({ className, children, header = false }) => {
  const location = useLocation();
  
  // Parse search params manually for React Router v5
  const searchParams = new URLSearchParams(location.search);
  const headerParam = searchParams.get('header');
  const headerShown = headerParam || header;
  const { drawerOpen } = useSelector(roomSelector);

  // const drawerExpanded = useSelector(selectDrawerExpanded);
  // const generalRoomId = useSelector(selectGeneralRoomId);
  // const isSmallScreen = useResponsive('down', 'sm');
  // const name = useSelector(selectName);
  const currentThread = useSelector(selectCurrentThread);
  // const otherMember = useSelector(selectMemberDetails);
  const enableRefresh = currentThread?.is_main;
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
      {!drawerOpen && (
        <Tooltip title="Open drawer">
          <IconButton
            size="small"
            onClick={onOpenDrawer}
          >
            <Iconify
              width={24}
              icon="cuida:sidebar-collapse-outline"
            />
          </IconButton>
        </Tooltip>
      )}
      {!drawerOpen && !!enableRefresh && (
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

      {/* {!drawerExpanded && !!generalRoomId && (
        <GateDrawerToggle
          expanded={mobile}
          mobile={mobile}
        />
      )} */}
      {/* {headerShown && !!currentThread && currentThread?.is_main && (
        <Stack
          direction="row"
          width="100%"
          alignItems="center"
          maxWidth="50vw"
        >
          <div className="flex flex-col w-full -space-y-1">
            <SettingsDialog otherMember={otherMember}>
              <span className="text-lg tracking-wide truncate hover:opacity-80 cursor-pointer">
                {name}
              </span>
            </SettingsDialog>
          </div>
          {children}
        </Stack>
      )} */}
      <ThreadToolbar />
      <div style={{ flexGrow: 1 }}></div>
    </div>
  );
};

export default memo(GeneralToolbar);
