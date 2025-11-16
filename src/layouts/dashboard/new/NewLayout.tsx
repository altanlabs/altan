import React, { memo, useMemo, useState, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import Header from './components/Header';
import { ScrollableContent } from './components/ScrollableContent';
import Footer from './Footer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePromptExpansion } from './hooks/usePromptExpansion';
import { useScrollDetection } from './hooks/useScrollDetection';
import { NewLayoutProps, UserData, UserAction } from './types';
import { useAuthContext } from '../../../auth/useAuthContext';
import { useSettingsContext } from '../../../components/settings';
import { useCreditBalancePolling } from '../../../hooks/useCreditBalancePolling';
import AgentMessagingWidget from '../../../pages/dashboard/agentsmenu/AgentMessagingWidget';
import V2CompactFooter from '../../../pages/v2/components/V2CompactFooter';
import AuthDialog from '../../../sections/auth/AuthDialog';

/**
 * NewLayout - Main layout component for the dashboard
 * 
 * Features:
 * - Sticky header with scroll detection
 * - Compact prompt input in header when scrolled
 * - Expandable prompt on click
 * - Framer Motion animations
 * - TypeScript with SOLID principles
 * 
 * @param children - Page content
 * @param onRequestAuth - Callback to open auth dialog
 */
const NewLayout: React.FC<NewLayoutProps> = ({ children, onRequestAuth }) => {
  const history = useHistory();
  const location = useLocation();
  const { resolvedThemeMode, onToggleMode } = useSettingsContext();
  const { isAuthenticated, user, logout } = useAuthContext();

  // Auth dialog state
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [authDialogDefaultToSignup, setAuthDialogDefaultToSignup] = useState(false);

  // Ref to the scrollable content container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll detection hook (monitors internal scroll container)
  const { isScrolled, showCompactPrompt } = useScrollDetection(scrollContainerRef, 300);

  // Prompt expansion hook (scrolls within the container)
  const { expandPrompt } = usePromptExpansion(scrollContainerRef);

  // Keyboard shortcuts (Cmd+K / Ctrl+K)
  useKeyboardShortcuts(expandPrompt);

  // Poll credit balance every 30 seconds
  useCreditBalancePolling(isAuthenticated);

  /**
   * Expose auth dialog opener through callback
   * Following Dependency Inversion Principle
   */
  useEffect(() => {
    if (onRequestAuth) {
      onRequestAuth((defaultToSignup = true) => {
        setAuthDialogDefaultToSignup(defaultToSignup);
        setShowAccessDialog(true);
      });
    }
  }, [onRequestAuth]);

  /**
   * Prepare user data for dropdown
   * Following Single Responsibility Principle
   */
  const userData: UserData = useMemo(
    () => ({
      name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Guest',
      username: user?.email || '',
      avatar: user?.avatar_url || '',
      initials: user
        ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`
        : 'G',
      status: 'online' as const,
    }),
    [user]
  );

  /**
   * Handle user dropdown actions
   * Following Open/Closed Principle
   */
  const handleUserAction = (action: string) => {
    const actionMap: Record<UserAction, () => void> = {
      profile: () => history.push('/me'),
      settings: () => history.push('/account/settings'),
      appearance: () => onToggleMode(),
      upgrade: () => history.push('/pricing'),
      referrals: () => history.push('/referrals'),
      logout: () => {
        logout();
        history.replace('/');
      },
    };

    const handler = actionMap[action as UserAction];
    if (handler) {
      handler();
    } else {
      console.warn('Unhandled user action:', action);
    }
  };

  /**
   * Handle auth button click
   */
  const handleAuthClick = () => {
    setAuthDialogDefaultToSignup(false);
    setShowAccessDialog(true);
  };

  /**
   * Handle demo button click
   */
  const handleDemoClick = () => {
    history.push('/demo');
  };

  /**
   * Determine which footer to show
   */
  const shouldShowFooter = !isAuthenticated && location.pathname === '/';

  return (
    <>
      {/* Main Container - Fixed viewport with scrollable content */}
      <div className="fixed inset-0 flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <Header
          isAuthenticated={isAuthenticated}
          user={user}
          userData={userData}
          isScrolled={isScrolled}
          showCompactPrompt={showCompactPrompt}
          onAuthClick={handleAuthClick}
          onDemoClick={handleDemoClick}
          onUserAction={handleUserAction}
          onThemeToggle={onToggleMode}
          onCompactPromptClick={expandPrompt}
          resolvedThemeMode={resolvedThemeMode}
        />

        {/* Scrollable Content Area */}
        <ScrollableContent ref={scrollContainerRef} className="bg-background dark:bg-[#0D0D0D]">
          {/* Content */}
          <div className="w-full">{children}</div>

          {/* Footer */}
          {isAuthenticated ? (
            <V2CompactFooter />
          ) : (
            shouldShowFooter && <Footer />
          )}
        </ScrollableContent>

        {/* Auth Dialog */}
        <AuthDialog
          open={showAccessDialog}
          onOpenChange={setShowAccessDialog}
          defaultToSignup={authDialogDefaultToSignup}
        />
      </div>

      {/* Floating Agent Messaging Widget - Outside main container for proper fixed positioning */}
      {isAuthenticated && <AgentMessagingWidget />}
    </>
  );
};

export default memo(NewLayout);

