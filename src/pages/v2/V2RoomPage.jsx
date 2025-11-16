import React, { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import DesktopWidgets from './components/DesktopWidgets';
import LeftSidebarWidgets from './components/LeftSidebarWidgets';
import V2TopBar from './components/V2TopBar';
import ChatDrawer from '../../layouts/dashboard/header/ChatDrawer';
import RoomPage from '../RoomPage';
import { useAuthContext } from '../../auth/useAuthContext.ts';
import VirtualDesktopLayout from '../../layouts/v2/VirtualDesktopLayout';
import { getAccountAttribute } from '../../redux/slices/general/index.ts';
import { dispatch } from '../../redux/store.ts';

const selectAccountId = (state) => state.general.account?.id;
const selectAltanersInitialized = (state) => state.general.accountAssetsInitialized.altaners;
const selectAltanersLoading = (state) => state.general.accountAssetsLoading.altaners;

const V2RoomPage = () => {
  const { roomId } = useParams();
  const { isAuthenticated, user } = useAuthContext();
  const accountId = useSelector(selectAccountId);
  const altanersInitialized = useSelector(selectAltanersInitialized);
  const altanersLoading = useSelector(selectAltanersLoading);
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
    <VirtualDesktopLayout title="Altan · Chat">
      <div className="relative w-full h-full flex flex-col">
        {/* Top Bar with Logo and Account */}
        <V2TopBar onSearch={handleSearch} />

        {/* Left Sidebar Widgets */}
        <LeftSidebarWidgets />

        {/* Right Sidebar Widgets */}
        <DesktopWidgets />

        {/* Chat Drawer on Left */}
        {user && (
          <ChatDrawer
            open={true}
            onClose={() => {}}
            persistent={true}
            v2Mode={true}
          />
        )}
        
        {/* Room Content - Takes full space with drawer offset */}
        <div className="fixed left-[calc(275px+1.5rem+1.5rem)] top-24 right-6 bottom-6 z-20">
          <RoomPage />
        </div>
      </div>
    </VirtualDesktopLayout>
  );
};

export default memo(V2RoomPage);

