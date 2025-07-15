import { Stack, IconButton, Menu, MenuItem, Button } from '@mui/material';
import { memo, useCallback, useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';

import AccountPopover from './AccountPopover.jsx';
import NotificationsPopover from './NotificationsPopover.jsx';
import HeaderIconButton from '../../../components/HeaderIconButton';
import HireAnExpert from '../../../components/HireAnExpert.jsx';
import Iconify from '../../../components/iconify';
import InvitationMenuPopover from '../../../components/invitations/InvitationMenuPopover.jsx';
import { useSettingsContext } from '../../../components/settings';
import { useBoolean } from '../../../hooks/useBoolean';
import { PATH_DASHBOARD } from '../../../routes/paths';

const HeaderActions = ({ user, isDesktop }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [masterRoomOpen, setMasterRoomOpen] = useState(false);
  const drawerBoolean = useBoolean();
  const [openHireExpert, setOpenHireExpert] = useState(false);
  const history = useHistory();
  const { themeMode, onChangeMode } = useSettingsContext();

  const handleMenuOpen = useCallback((event) => setAnchorEl(event.currentTarget), []);
  const handleMenuClose = useCallback(() => setAnchorEl(null), []);

  const handleThemeToggle = useCallback(() => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    onChangeMode(newMode);
  }, [themeMode, onChangeMode]);

  const onOpenRoom = useCallback(() => {
    setMasterRoomOpen(true);
    setAnchorEl(null);
  }, []);

  const renderDesktopActions = useCallback(
    () => (
      <>
        {!!user?.xsup && (
          <HeaderIconButton
            component={RouterLink}
            to={PATH_DASHBOARD.super.root}
          >
            <Iconify
              icon="ic:twotone-admin-panel-settings"
              width={18}
              height={18}
            />
          </HeaderIconButton>
        )}
        <HireAnExpert
          open={openHireExpert}
          setOpen={setOpenHireExpert}
        />

        <InvitationMenuPopover isDashboard={true} />

        {/* <Tooltip
          arrow
          followCursor
          title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
        >
          <HeaderIconButton onClick={handleThemeToggle}>
            <Iconify
              icon={
                themeMode === 'light' ? 'iconamoon:mode-dark-light' : 'solar:sun-2-bold-duotone'
              }
              width={18}
              height={18}
            />
          </HeaderIconButton>
        </Tooltip> */}

        <Button
          size="small"
          color="primary"
          variant="contained"
          startIcon={<Iconify icon="material-symbols:crown" />}
          onClick={() => history.push('/pricing')}
        >
          Upgrade
        </Button>

        {/* <Tooltip
          arrow
          followCursor
          title={`${totalUnreadNotifications} new notifications`}
        >
          <HeaderIconButton onClick={drawerBoolean.onTrue}>
            <Badge
              badgeContent={totalUnreadNotifications}
              color="error"
            >
              <Iconify
                icon="ion:notifications-outline"
                width={18}
                height={18}
              />
            </Badge>
          </HeaderIconButton>
        </Tooltip> */}
      </>
    ),
    [user?.xsup, openHireExpert, themeMode, handleThemeToggle],
  );

  if (!user) {
    return (
      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={isDesktop ? { xs: 0.5, sm: 1 } : 0}
      >
        <button
          onClick={() => history.push('/auth/login')}
          className="relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-ring disabled:pointer-events-auto disabled:opacity-50 group backdrop-blur-md bg-white/80 dark:bg-[#1c1c1c] text-gray-900 dark:text-white py-2 px-4 h-auto border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-full hover:bg-white/70 dark:hover:bg-gray-900/70 active:bg-white/70 dark:active:bg-gray-900/70 transition-all duration-300"
        >
          Login
        </button>
        <button
          onClick={() => history.push('/auth/register')}
          className="relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-ring disabled:pointer-events-auto disabled:opacity-50 group backdrop-blur-md bg-blue-600 dark:bg-blue-600 text-white py-2 px-4 h-auto border border-blue-600 dark:border-blue-600 shadow-lg rounded-full hover:bg-blue-700 dark:hover:bg-blue-700 active:bg-blue-700 dark:active:bg-blue-700 transition-all duration-300"
        >
          Register
        </button>
      </Stack>
    );
  }

  return (
    <>
      <NotificationsPopover drawerBoolean={drawerBoolean} />

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={isDesktop ? { xs: 0.5, sm: 1 } : 0}
      >
        {isDesktop ? (
          renderDesktopActions()
        ) : (
          <>
            <HireAnExpert
              open={openHireExpert}
              setOpen={setOpenHireExpert}
              iconOnly={true}
            />
            <IconButton
              size="small"
              onClick={handleMenuOpen}
            >
              <Iconify
                icon="eva:more-vertical-fill"
                width={28}
              />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {!!user?.xsup && (
                <MenuItem
                  component={RouterLink}
                  to={PATH_DASHBOARD.super.root}
                  onClick={handleMenuClose}
                >
                  <Iconify
                    icon="ic:twotone-admin-panel-settings"
                    width={20}
                    style={{ marginRight: 8 }}
                  />
                  Superadmin Panel
                </MenuItem>
              )}

              <MenuItem onClick={handleThemeToggle}>
                <Iconify
                  icon={themeMode === 'light' ? 'iconamoon:mode-dark-light' : 'solar:sun-2-bold-duotone'}
                  width={20}
                  style={{ marginRight: 8 }}
                />
                {themeMode === 'light' ? 'Dark' : 'Light'} Mode
              </MenuItem>

              <MenuItem
                component="a"
                href="https://docs.altan.ai/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleMenuClose}
              >
                <Iconify
                  icon="ion:help-circle-outline"
                  width={20}
                  style={{ marginRight: 8 }}
                />
                Docs & Guides
              </MenuItem>
              {/* <MenuItem onClick={handleClickNotification}>
                <Badge
                  badgeContent={totalUnreadNotifications}
                  color="error"
                  style={{ marginRight: 8 }}
                >
                  <Iconify
                    icon="ion:notifications-outline"
                    width={20}
                  />
                </Badge>
                Notifications
              </MenuItem> */}
              <MenuItem onClick={onOpenRoom}>
                <Iconify
                  icon={masterRoomOpen ? 'ci:chat-circle-close' : 'fluent:chat-multiple-28-regular'}
                  width={20}
                  style={{ marginRight: 8 }}
                />
                Account Room
              </MenuItem>
            </Menu>
          </>
        )}
        <AccountPopover />
      </Stack>
    </>
  );
};

export default memo(HeaderActions);
