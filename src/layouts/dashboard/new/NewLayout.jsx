import React, { memo, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { useAuthContext } from '../../../auth/useAuthContext';
import Logo from '../../../components/logo/Logo';
import { useSettingsContext } from '../../../components/settings';
import {
  ThemeToggleButton,
  useThemeTransition,
} from '../../../components/ui/shadcn-io/theme-toggle-button';
import { UserDropdown } from '../../../components/elevenlabs/user-dropdown';
import AuthDialog from '../../../sections/auth/AuthDialog';
import V2CompactFooter from '../../../pages/v2/components/V2CompactFooter';
import WorkspaceIndicator from '../../../pages/v2/components/WorkspaceIndicator';
import AgentMessagingWidget from '../../../pages/dashboard/NewDashboardPage/AgentMessagingWidget';
import Footer from '../../main/Footer';
import InvitationMenuPopover from '../../../components/invitations/InvitationMenuPopover.jsx';

const NewLayout = ({ children, onRequestAuth }) => {
  const history = useHistory();
  const location = useLocation();
  const { resolvedThemeMode, onToggleMode } = useSettingsContext();
  const { isAuthenticated, user, logout } = useAuthContext();
  const { startTransition } = useThemeTransition();
  const [showAccessDialog, setShowAccessDialog] = useState(false);

  // Expose auth dialog opener through callback
  React.useEffect(() => {
    if (onRequestAuth) {
      onRequestAuth(() => setShowAccessDialog(true));
    }
  }, [onRequestAuth]);

  const handleThemeToggle = () => {
    startTransition(() => {
      onToggleMode();
    });
  };

  // Prepare user data for dropdown
  const userData = useMemo(
    () => ({
      name: user ? `${user.first_name} ${user.last_name}` : 'Guest',
      username: user?.email || '',
      avatar: user?.avatar_url || '',
      initials: user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}` : 'G',
      status: 'online',
    }),
    [user],
  );

  // Handle dropdown actions
  const handleUserAction = (action) => {
    switch (action) {
      case 'profile':
        history.push('/me');
        break;
      case 'settings':
        history.push('/account/settings');
        break;
      case 'appearance':
        onToggleMode();
        break;
      case 'notifications':
        // TODO: Open notifications
        break;
      case 'upgrade':
        history.push('/pricing');
        break;
      case 'referrals':
        history.push('/referrals');
        break;
      case 'logout':
        logout();
        history.replace('/');
        break;
      default:
        // eslint-disable-next-line no-console
        console.log('Action not implemented:', action);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full bg-background dark:bg-[#0D0D0D] overflow-x-hidden">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-2 flex items-center justify-between bg-background/80 dark:bg-[#0D0D0D]/80 backdrop-blur-sm">
          {/* Logo and Workspace Switcher */}
          <div className="flex items-center gap-3 flex-1">
            <button
              className="cursor-pointer group flex items-center justify-center h-10 transition-transform hover:scale-105"
              onClick={() => history.push('/')}
            >
              <Logo minimal />
            </button>

            {/* Workspace Indicator - Show current workspace */}
            {isAuthenticated && <WorkspaceIndicator />}
          </div>

          {/* Right Side - Buttons, Theme Toggle & User Dropdown */}
          <div className="flex items-center justify-end flex-1">
            {!isAuthenticated && (
              <>
                <ThemeToggleButton
                  theme={resolvedThemeMode}
                  onClick={handleThemeToggle}
                  variant="circle"
                  start="top-right"
                />
                <button
                  onClick={() => history.push('/demo')}
                  className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                >
                  Enter demo
                </button>
                <button
                  onClick={() => setShowAccessDialog(true)}
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Access
                </button>
              </>
            )}

            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <ThemeToggleButton
                  theme={resolvedThemeMode}
                  onClick={handleThemeToggle}
                  variant="circle"
                  start="top-right"
                />

                <InvitationMenuPopover isDashboard={true} />

                <UserDropdown
                  user={userData}
                  onAction={handleUserAction}
                  selectedStatus="online"
                />
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full overflow-x-hidden">{children}</div>

        {/* Footer - Show V2CompactFooter when authenticated, regular Footer on homepage when not */}
        {isAuthenticated ? <V2CompactFooter /> : location.pathname === '/' && <Footer />}

        {/* Access Dialog */}
        <AuthDialog
          open={showAccessDialog}
          onOpenChange={setShowAccessDialog}
        />
      </div>

      {/* Floating Agent Messaging Widget - Outside main container for proper fixed positioning */}
      {isAuthenticated && <AgentMessagingWidget />}
    </>
  );
};

export default memo(NewLayout);
