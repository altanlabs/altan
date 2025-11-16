import React, { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import VirtualDesktop from './components/VirtualDesktop';
import DesktopWidgets from './components/DesktopWidgets';
import LeftSidebarWidgets from './components/LeftSidebarWidgets';
import V2TopBar from './components/V2TopBar';
import CreateAnything from '../dashboard/components/CreateAnything';
import ChatDrawer from '../../layouts/dashboard/header/ChatDrawer';
import { useAuthContext } from '../../auth/useAuthContext.ts';
import VirtualDesktopLayout from '../../layouts/v2/VirtualDesktopLayout';
import { getAccountAttribute } from '../../redux/slices/general/index.ts';
import { dispatch } from '../../redux/store.ts';

const selectAccountId = (state) => state.general.account?.id;
const selectAltanersInitialized = (state) => state.general.accountAssetsInitialized.altaners;
const selectAltanersLoading = (state) => state.general.accountAssetsLoading.altaners;

const V2RoomsPage = () => {
  const { isAuthenticated, user } = useAuthContext();
  const accountId = useSelector(selectAccountId);
  const altanersInitialized = useSelector(selectAltanersInitialized);
  const altanersLoading = useSelector(selectAltanersLoading);
  const [isVoice, setIsVoice] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load user's projects if authenticated
  useEffect(() => {
    if (isAuthenticated && accountId && !altanersInitialized && !altanersLoading) {
      dispatch(getAccountAttribute(accountId, ['altaners']));
    }
  }, [isAuthenticated, accountId, altanersInitialized, altanersLoading]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <VirtualDesktopLayout title="Altan · Chat Rooms">
      <div className="relative w-full h-full flex flex-col">
        {/* Top Bar with Logo and Account */}
        <V2TopBar onSearch={handleSearch} />

        {/* Left Sidebar Widgets */}
        <LeftSidebarWidgets />

        {/* Right Sidebar Widgets */}
        <DesktopWidgets />

        {/* Virtual Desktop Grid - Centered */}
        <VirtualDesktop searchQuery={searchQuery} />

        {/* Bottom Command Input - Using CreateAnything */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-center pb-6 px-4">
          <CreateAnything handleVoice={() => setIsVoice(!isVoice)} />
        </div>

        {/* Chat Drawer - Always open on rooms page */}
        {user && (
          <ChatDrawer
            open={true}
            onClose={() => {}}
            persistent={true}
            v2Mode={true}
          />
        )}
      </div>
    </VirtualDesktopLayout>
  );
};

export default memo(V2RoomsPage);

