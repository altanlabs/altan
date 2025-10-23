import { m } from 'framer-motion';
import React, { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import DesktopWidgets from './components/DesktopWidgets';
import EnhancedCommandInput from './components/EnhancedCommandInput';
import LeftSidebarWidgets from './components/LeftSidebarWidgets';
import V2TopBar from './components/V2TopBar';
import VirtualDesktop from './components/VirtualDesktop';
import { OnboardingExperience } from './onboarding';
import { useAuthContext } from '../../auth/useAuthContext';
import VirtualDesktopLayout from '../../layouts/v2/VirtualDesktopLayout';
import { getAccountAttribute } from '../../redux/slices/general';
import { dispatch } from '../../redux/store';

const selectAccountId = (state) => state.general.account?.id;
const selectAltanersInitialized = (state) => state.general.accountAssetsInitialized.altaners;
const selectAltanersLoading = (state) => state.general.accountAssetsLoading.altaners;
const selectAccountAltaners = (state) => state.general.account?.altaners;

const VirtualDesktopPage = () => {
  const { isAuthenticated } = useAuthContext();
  const accountId = useSelector(selectAccountId);
  const altanersInitialized = useSelector(selectAltanersInitialized);
  const altanersLoading = useSelector(selectAltanersLoading);
  const [isVoice, setIsVoice] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // Load user's projects if authenticated
  useEffect(() => {
    if (isAuthenticated && accountId && !altanersInitialized && !altanersLoading) {
      dispatch(getAccountAttribute(accountId, ['altaners']));
    }
  }, [isAuthenticated, accountId, altanersInitialized, altanersLoading]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePageChange = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  // Calculate total pages for pagination display
  const altaners = useSelector(selectAccountAltaners);
  const projects = isAuthenticated ? (altaners || []) : [];
  const totalPages = Math.ceil(projects.length / 9);

  // Render different layouts for authenticated vs unauthenticated
  if (!isAuthenticated) {
    return <OnboardingExperience />;
  }

  return (
    <VirtualDesktopLayout title="Altan · Your Agentic Business OS">
      <div className="relative w-full h-full flex flex-col">
        {/* Top Bar with Logo and Account */}
        <V2TopBar onSearch={handleSearch} />

        {/* Left Sidebar Widgets */}
        <LeftSidebarWidgets />

        {/* Right Sidebar Widgets */}
        <DesktopWidgets />

        {/* Virtual Desktop Grid - Centered */}
        <VirtualDesktop
          searchQuery={searchQuery}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />

        {/* Bottom Section - Pagination + Command Layer */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pb-6 px-4 pointer-events-none">
          {/* Pagination Dots - Above text field */}
          {totalPages > 1 && (
            <m.div
              className="flex items-center justify-center gap-2.5 mb-4 pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index)}
                  className={`transition-all duration-200 rounded-full ${
                    index === currentPage
                      ? 'w-2 h-2 bg-foreground shadow-lg'
                      : 'w-1.5 h-1.5 bg-foreground/30 hover:bg-foreground/50'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </m.div>
          )}

          <div className="w-full max-w-3xl pointer-events-auto">
            <EnhancedCommandInput
              handleVoice={() => setIsVoice(!isVoice)}
            />
          </div>
        </div>
      </div>
    </VirtualDesktopLayout>
  );
};

export default memo(VirtualDesktopPage);
