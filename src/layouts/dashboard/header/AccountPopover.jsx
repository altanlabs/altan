import {
  Box,
  Divider,
  Typography,
  Stack,
  MenuItem,
  IconButton,
  Tooltip,
  Card,
  Dialog,
  Menu,
} from '@mui/material';
import { useCallback, useMemo, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';

// @mui
// auth
import { useAuthContext } from '../../../auth/useAuthContext';
// components
import { CustomAvatar } from '../../../components/custom-avatar';
import Iconify from '../../../components/iconify';
import InvitationMenuPopover from '../../../components/invitations/InvitationMenuPopover.jsx';
import MenuPopover from '../../../components/menu-popover';
import { useSettingsContext } from '../../../components/settings';
import { useSnackbar } from '../../../components/snackbar';
import UpgradeButton from '../../../components/UpgradeButton.jsx';
import { useLocales } from '../../../locales';
import { useWebSocket } from '../../../providers/websocket/WebSocketProvider.jsx';
import NavAccount from '../nav/NavAccount.jsx';

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const history = useHistory();
  const { themeMode, onChangeMode } = useSettingsContext();
  const ws = useWebSocket();
  const { user, logout } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [openPopover, setOpenPopover] = useState(null);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const { currentLang, onChangeLang, allLangs } = useLocales();
  const languageRef = useRef(null);
  const [openLanguage, setOpenLanguage] = useState(null);

  const handleOpenPopover = useCallback((event) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      logout();
      history.replace('/');
      handleClosePopover();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  }, [enqueueSnackbar, handleClosePopover, logout, history]);

  const handleCloseProfileDialog = () => {
    setOpenProfileDialog(false);
  };

  const handleProfile = () => {
    history.push('/me');
    handleClosePopover();
  };

  const handleSettings = () => {
    history.push('/account/settings');
    handleClosePopover();
  };

  const handleIntegration = () => {
    history.push('/integration');
    handleClosePopover();
  };

  const personProfile = useMemo(
    () => ({
      avatar: {
        url: user?.avatar_url,
        alt: user?.user_name,
      },
      name: user?.first_name + ' ' + user?.last_name,
      email: user?.email,
    }),
    [user?.avatar_url, user?.email, user?.first_name, user?.last_name, user?.user_name],
  );

  return (
    <div>
      <IconButton
        size="small"
        onClick={handleOpenPopover}
        sx={{
          paddingY: 0.5,
          borderRadius: '10px',
          '&:hover': {
            '& .user-avatar-picture': {
              transform: 'scale(1.1)',
            },
          },
        }}
      >
        <CustomAvatar
          className="user-avatar-picture"
          src={personProfile.avatar.url}
          alt={personProfile.avatar.alt}
          name={personProfile.name}
          variant="rounded"
          sx={{
            transition: 'transform 300ms ease',
            height: 30,
            width: 30,
          }}
        />
        {!!(user?.xsup && ws?.activeSubscriptions?.length) && (
          <Tooltip
            arrow
            placement="bottom-start"
            slotProps={{
              tooltip: {
                sx: {
                  padding: 0,
                },
              },
            }}
            title={
              <Card
                sx={{
                  width: 400,
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  height: 600,
                  padding: 2,
                }}
              >
                <Stack
                  width="100%"
                  height="100%"
                  sx={{
                    overflowY: 'auto',
                  }}
                >
                  <Typography variant="h4">SuperAdmin Stats</Typography>
                  <Typography variant="h6">
                    Active subscriptions ({ws.activeSubscriptions.length}):
                  </Typography>
                  {ws.activeSubscriptions.map((as) => (
                    <Typography
                      key={as}
                      variant="caption"
                    >
                      {as}
                    </Typography>
                  ))}
                </Stack>
              </Card>
            }
          >
            <Iconify
              icon="mdi:info"
              sx={{
                position: 'absolute',
                bottom: -2,
                left: -2,
              }}
              width={10}
            />
          </Tooltip>
        )}
      </IconButton>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        sx={{ width: 280, p: 0 }}
      >
        <Box sx={{ p: 1.5 }}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <CustomAvatar
              src={personProfile.avatar.url}
              alt={personProfile.avatar.alt}
              name={personProfile.name}
              sx={{ width: 36, height: 36 }}
            />
            <Box>
              <Typography variant="subtitle2">
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {user?.email || 'albert@altan-ai'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <UpgradeButton prominent />
        </Box>

        <Stack
          spacing={0.25}
          paddingX={1}
        >
          <MenuItem onClick={handleProfile}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
            >
              <Iconify
                icon="mdi:account-circle-outline"
                width={20}
              />
              <Typography variant="body2">Profile</Typography>
            </Stack>
          </MenuItem>

          <MenuItem
            onClick={handleSettings}
            sx={{ px: 1.5, py: 1 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
            >
              <Iconify
                icon="mdi:cog-outline"
                width={20}
              />
              <Typography variant="body2">Settings</Typography>
            </Stack>
          </MenuItem>

          <MenuItem
            onClick={handleIntegration}
            sx={{ px: 1.5, py: 1 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
            >
              <Iconify
                icon="fluent:window-dev-tools-16-filled"
                width={20}
              />
              <Typography variant="body2">Integration</Typography>
            </Stack>
          </MenuItem>

          <MenuItem
            onClick={handleLogout}
            sx={{
              px: 1.5,
              py: 1,
              mb: 2,
              color: 'error.main',
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
            >
              <Iconify
                icon="mdi:logout"
                width={20}
                sx={{ color: 'error.main' }}
              />
              <Typography variant="body2">Sign Out</Typography>
            </Stack>
          </MenuItem>
        </Stack>

        <Divider />

        <Box sx={{ p: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1 }}
          >
            Preferences
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            alignItems="end"
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{ mb: 0.5, display: 'block' }}
              >
                Theme
              </Typography>
              <IconButton
                size="small"
                onClick={() => onChangeMode(themeMode === 'light' ? 'dark' : 'light')}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  width: '100%',
                  height: 40,
                  py: 0.5,
                }}
              >
                <Iconify
                  icon={
                    themeMode === 'light' ? 'solar:sun-2-bold-duotone' : 'iconamoon:mode-dark-light'
                  }
                  width={18}
                />
              </IconButton>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{ mb: 0.5, display: 'block' }}
              >
                Language
              </Typography>
              <Menu
                anchorEl={languageRef.current}
                open={!!openLanguage}
                onClose={() => setOpenLanguage(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {allLangs.map((option) => (
                  <MenuItem
                    key={option.value}
                    selected={option.value === currentLang.value}
                    onClick={() => {
                      onChangeLang(option.value);
                      setOpenLanguage(null);
                    }}
                    sx={{
                      py: 1,
                      px: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Iconify
                      icon={option.icon}
                      sx={{ borderRadius: 0.65, width: 28 }}
                    />
                    <Typography variant="body2">{option.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>

              <MenuItem
                ref={languageRef}
                onClick={(event) => setOpenLanguage(event.currentTarget)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  justifyContent: 'space-between',
                  height: 40,
                  py: 0.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify
                    icon={currentLang.icon}
                    sx={{ borderRadius: 0.65, width: 28 }}
                  />
                  <Typography variant="body2">{currentLang.label}</Typography>
                </Box>
                <Iconify
                  icon="mdi:chevron-down"
                  width={16}
                />
              </MenuItem>
            </Box>
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            marginBottom={1}
          >
            <Typography variant="subtitle2">Workspace</Typography>
            <InvitationMenuPopover />
          </Stack>
          <NavAccount />
        </Box>
      </MenuPopover>

      <Dialog
        open={openProfileDialog}
        onClose={handleCloseProfileDialog}
        fullWidth
        maxWidth="md"
      >
        <Box
          sx={{
            height: '80vh',
            overflow: 'auto',
          }}
        >
          <iframe
            src="https://app.altan.ai/me"
            title="Profile"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        </Box>
      </Dialog>
    </div>
  );
}
