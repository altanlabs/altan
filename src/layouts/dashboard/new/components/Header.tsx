import { Tooltip } from '@mui/material';
import { m } from 'framer-motion';
import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';

import { UserDropdown } from '../../../../components/elevenlabs/user-dropdown';
import HeaderIconButton from '../../../../components/HeaderIconButton';
import Iconify from '../../../../components/iconify';
import InvitationMenuPopover from '../../../../components/invitations/InvitationMenuPopover';
import Logo from '../../../../components/logo/Logo';
import { CompactPromptInput } from '../../../../components/ui/CompactPromptInput';
import {
  ThemeToggleButton,
  useThemeTransition,
} from '../../../../components/ui/shadcn-io/theme-toggle-button';
import WorkspaceIndicator from '../../../../pages/v2/components/WorkspaceIndicator';
import { HeaderProps } from '../types';

/**
 * Header Component - Sticky header with scroll detection
 * Following Single Responsibility Principle
 */
const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  user,
  userData,
  isScrolled,
  showCompactPrompt,
  onAuthClick,
  onDemoClick,
  onUserAction,
  onThemeToggle,
  onCompactPromptClick,
  resolvedThemeMode,
}) => {
  const history = useHistory();
  const { startTransition } = useThemeTransition();

  const handleThemeToggle = () => {
    startTransition(() => {
      onThemeToggle();
    });
  };

  return (
    <m.header
      key="header"
      initial={false}
      animate={{
        backgroundColor: isScrolled
          ? resolvedThemeMode === 'dark'
            ? 'rgba(13, 13, 13, 0.95)'
            : 'rgba(255, 255, 255, 0.95)'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(12px)' : 'blur(0px)',
        boxShadow: isScrolled
          ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          : '0 0 0 0 rgba(0, 0, 0, 0)',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6"
    >
      <div className="flex items-center justify-between h-16">
        {/* Left Side - Logo and Workspace */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <m.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer group flex items-center justify-center h-10 transition-transform flex-shrink-0"
            onClick={() => history.push('/')}
            type="button"
          >
            <Logo minimal />
          </m.button>

          {isAuthenticated && <WorkspaceIndicator />}
        </div>

        {/* Center - Compact Prompt (when scrolled) */}
        {isAuthenticated && (
          <CompactPromptInput
            onClick={onCompactPromptClick}
            isVisible={showCompactPrompt}
            placeholder="What would you like to build?"
          />
        )}

        {/* Right Side - Actions */}
        <div className="flex items-center justify-end flex-1 gap-2">
          {!isAuthenticated ? (
            <>
              <ThemeToggleButton
                theme={resolvedThemeMode}
                onClick={handleThemeToggle}
                variant="circle"
                start="top-right"
              />
              <m.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onDemoClick}
                className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                type="button"
              >
                Enter demo
              </m.button>
              <m.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAuthClick}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                type="button"
              >
                Access
              </m.button>
            </>
          ) : (
            <>
              <ThemeToggleButton
                theme={resolvedThemeMode}
                onClick={handleThemeToggle}
                variant="circle"
                start="top-right"
              />

              <Tooltip arrow followCursor title="Get free credits">
                <HeaderIconButton onClick={() => history.push('/referrals')}>
                  <Iconify icon="mdi:gift-outline" width={20} height={20} />
                </HeaderIconButton>
              </Tooltip>

              <InvitationMenuPopover isDashboard={true} />

              <UserDropdown
                user={userData}
                onAction={onUserAction}
                selectedStatus="online"
              />
            </>
          )}
        </div>
      </div>
    </m.header>
  );
};

export default memo(Header);

