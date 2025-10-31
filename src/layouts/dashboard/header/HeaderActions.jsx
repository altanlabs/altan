import { memo } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';

import AccountPopover from './AccountPopover.jsx';
import NotificationsPopover from './NotificationsPopover.jsx';
import HeaderIconButton from '../../../components/HeaderIconButton';
import Iconify from '../../../components/iconify';
import InvitationMenuPopover from '../../../components/invitations/InvitationMenuPopover.jsx';
import { useBoolean } from '../../../hooks/useBoolean';
import { PATH_DASHBOARD } from '../../../routes/paths';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const HeaderActions = ({ user, isDesktop }) => {
  const drawerBoolean = useBoolean();
  const history = useHistory();

  if (!user) {
    return (
      <div className="flex-grow flex flex-row items-center justify-end gap-2">
        <button
          onClick={() => history.push('/auth/login')}
          className="inline-flex items-center justify-center text-sm font-medium backdrop-blur-md bg-white/80 dark:bg-[#1c1c1c] text-gray-900 dark:text-white py-2 px-4 border border-gray-200/50 dark:border-gray-700/50 rounded-full hover:bg-white/70 dark:hover:bg-gray-900/70 transition-all"
        >
          Login
        </button>
        <button
          onClick={() => history.push('/auth/register')}
          className="inline-flex items-center justify-center text-sm font-medium backdrop-blur-md bg-blue-600 text-white py-2 px-4 border border-blue-600 rounded-full hover:bg-blue-700 transition-all"
        >
          Register
        </button>
      </div>
    );
  }

  return (
    <>
      <NotificationsPopover drawerBoolean={drawerBoolean} />

      <div className="flex-grow flex flex-row items-center justify-end gap-2">
        {isDesktop && (
          <>
            {user?.xsup && (
              <HeaderIconButton
                component={RouterLink}
                to={PATH_DASHBOARD.super.root}
              >
                <Iconify icon="ic:twotone-admin-panel-settings" width={18} height={18} />
              </HeaderIconButton>
            )}

            <InvitationMenuPopover isDashboard={true} />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HeaderIconButton onClick={() => history.push(PATH_DASHBOARD.referrals)}>
                    <Iconify icon="mdi:gift-outline" width={18} height={18} />
                  </HeaderIconButton>
                </TooltipTrigger>
                <TooltipContent><p>Get free credits</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              size="sm"
              onClick={() => history.push('/pricing')}
            >
              <Iconify icon="material-symbols:crown" width={14} />
              Upgrade
            </Button>
          </>
        )}
        <AccountPopover />
      </div>
    </>
  );
};

export default memo(HeaderActions);
