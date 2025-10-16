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
  Chip,
  TextField,
  Select,
  FormControl,
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
import { useHermesWebSocket } from '../../../providers/websocket/HermesWebSocketProvider.jsx';
import { useWebSocket } from '../../../providers/websocket/WebSocketProvider.jsx';
import { selectAccount, selectAccountCreditBalance, selectAccountSubscriptions } from '../../../redux/slices/general';
import { updateEntry } from '../../../redux/slices/superadmin';
import { useDispatch, useSelector } from '../../../redux/store';
import NavAccount from '../nav/NavAccount.jsx';

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { resolvedThemeMode, onToggleMode } = useSettingsContext();
  const ws = useWebSocket();
  const hermesWs = useHermesWebSocket();
  const { user, logout } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [openPopover, setOpenPopover] = useState(null);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const { currentLang, onChangeLang, allLangs } = useLocales();
  const languageRef = useRef(null);
  const [openLanguage, setOpenLanguage] = useState(null);
  const [superAdminExpanded, setSuperAdminExpanded] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [editingAccountCredit, setEditingAccountCredit] = useState(false);
  const [tempValues, setTempValues] = useState({});

  const activeSubscriptions = useSelector(selectAccountSubscriptions);
  const accountCreditBalance = useSelector(selectAccountCreditBalance);
  const account = useSelector(selectAccount);

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

  const handleUpdateSubscriptionStatus = async (subscriptionId, newStatus) => {
    try {
      await dispatch(updateEntry('Subscription', subscriptionId, { status: newStatus }));
      enqueueSnackbar('Subscription status updated successfully', { variant: 'success' });
      setEditingSubscription(null);
      // Refresh page to get updated data
    } catch (error) {
      enqueueSnackbar(`Failed to update subscription: ${error}`, { variant: 'error' });
    }
  };

  const handleUpdateSubscriptionCredits = async (subscriptionId, newCredits) => {
    try {
      const creditsInCents = Math.round(parseFloat(newCredits) * 100);
      await dispatch(updateEntry('Subscription', subscriptionId, { credit_balance: creditsInCents }));
      enqueueSnackbar('Subscription credits updated successfully', { variant: 'success' });
      setEditingSubscription(null);
      setTempValues({});
      // Refresh page to get updated data
    } catch (error) {
      enqueueSnackbar(`Failed to update credits: ${error}`, { variant: 'error' });
    }
  };

  const handleUpdateAccountCredit = async (accountId, newCredits) => {
    try {
      const creditsInCents = Math.round(parseFloat(newCredits) * 100);
      await dispatch(updateEntry('Account', accountId, { credit_balance: creditsInCents }));
      enqueueSnackbar('Account credit balance updated successfully', { variant: 'success' });
      setEditingAccountCredit(false);
      setTempValues({});
      // Refresh page to get updated data
    } catch (error) {
      enqueueSnackbar(`Failed to update account credit: ${error}`, { variant: 'error' });
    }
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
        {!!(user?.xsup && (ws?.activeSubscriptions?.length || hermesWs?.activeSubscriptions?.length)) && (
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
                  {/* Regular WebSocket Subscriptions */}
                  {ws?.activeSubscriptions?.length > 0 && (
                    <>
                      <Typography variant="h6" sx={{ mt: 1, mb: 0.5 }}>
                        WebSocket subscriptions ({ws.activeSubscriptions.length}):
                      </Typography>
                      {ws.activeSubscriptions.map((as) => (
                        <Typography
                          key={`ws-${as}`}
                          variant="caption"
                          sx={{ pl: 1, color: 'primary.main' }}
                        >
                          📡 {as}
                        </Typography>
                      ))}
                    </>
                  )}

                  {/* Hermes WebSocket Subscriptions */}
                  {hermesWs?.activeSubscriptions?.length > 0 && (
                    <>
                      <Typography variant="h6" sx={{ mt: 2, mb: 0.5 }}>
                        Hermes WebSocket subscriptions ({hermesWs.activeSubscriptions.length}):
                      </Typography>
                      {hermesWs.activeSubscriptions.map((as) => (
                        <Typography
                          key={`hermes-${as}`}
                          variant="caption"
                          sx={{ pl: 1, color: 'secondary.main' }}
                        >
                          🚀 {as}
                        </Typography>
                      ))}
                    </>
                  )}

                  {/* Show message if no subscriptions */}
                  {!ws?.activeSubscriptions?.length && !hermesWs?.activeSubscriptions?.length && (
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      No active subscriptions
                    </Typography>
                  )}
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
        sx={{ width: superAdminExpanded && user?.xsup ? 'auto' : 280, p: 0 }}
      >
        <Stack
          direction="row"
          spacing={0}
        >
          {/* SuperAdmin Panel (Left Side) */}
          {user?.xsup && superAdminExpanded && (
            <Box
              sx={{
                width: 350,
                borderRight: '1px solid',
                borderColor: 'divider',
                p: 2,
                maxHeight: '600px',
                overflowY: 'auto',
                '& .detail-row': {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  py: 0.5,
                  gap: 1,
                },
                '& .detail-label': {
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  minWidth: '110px',
                },
                '& .detail-value': {
                  fontSize: '0.75rem',
                  color: 'text.primary',
                  wordBreak: 'break-all',
                  textAlign: 'right',
                  flex: 1,
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                🔐 SuperAdmin Details
              </Typography>

              {/* Account Information */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', mt: 1, display: 'block' }}>
                Account
              </Typography>
              <Box className="detail-row">
                <Typography className="detail-label">Account ID</Typography>
                <Typography className="detail-value" sx={{ fontFamily: 'monospace' }}>
                  {account?.id || 'N/A'}
                </Typography>
              </Box>
              <Box className="detail-row">
                <Typography className="detail-label">Account Name</Typography>
                <Typography className="detail-value">{account?.name || 'N/A'}</Typography>
              </Box>
              <Box className="detail-row">
                <Typography className="detail-label">Stripe ID</Typography>
                {account?.stripe_id ? (
                  <Typography
                    className="detail-value"
                    component="a"
                    href={`https://dashboard.stripe.com/customers/${account.stripe_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontFamily: 'monospace',
                      color: 'primary.main',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {account.stripe_id} ↗
                  </Typography>
                ) : (
                  <Typography className="detail-value" sx={{ fontFamily: 'monospace' }}>
                    N/A
                  </Typography>
                )}
              </Box>
              <Box className="detail-row">
                <Typography className="detail-label">Credit Balance</Typography>
                {editingAccountCredit ? (
                  <Stack direction="row" spacing={0.5} alignItems="center" flex={1} justifyContent="flex-end">
                    <TextField
                      size="small"
                      type="number"
                      value={tempValues.accountCredit ?? ((accountCreditBalance ?? 0) / 100).toFixed(2)}
                      onChange={(e) => setTempValues({ ...tempValues, accountCredit: e.target.value })}
                      sx={{ width: 100 }}
                      inputProps={{ step: '0.01', style: { fontSize: '0.75rem', padding: '4px 8px' } }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleUpdateAccountCredit(account?.id, tempValues.accountCredit)}
                      sx={{ p: 0.5 }}
                    >
                      <Iconify icon="mdi:check" width={16} color="success.main" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingAccountCredit(false);
                        setTempValues({ ...tempValues, accountCredit: undefined });
                      }}
                      sx={{ p: 0.5 }}
                    >
                      <Iconify icon="mdi:close" width={16} color="error.main" />
                    </IconButton>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={0.5} alignItems="center" flex={1} justifyContent="flex-end">
                    <Typography className="detail-value">
                      €{((accountCreditBalance ?? 0) / 100).toFixed(2)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setEditingAccountCredit(true)}
                      sx={{ p: 0.5 }}
                    >
                      <Iconify icon="mdi:pencil" width={14} />
                    </IconButton>
                  </Stack>
                )}
              </Box>
              <Box className="detail-row">
                <Typography className="detail-label">Organisation ID</Typography>
                <Typography className="detail-value" sx={{ fontFamily: 'monospace' }}>
                  {account?.organisation_id || 'N/A'}
                </Typography>
              </Box>
              <Box className="detail-row">
                <Typography className="detail-label">Organisation</Typography>
                <Typography className="detail-value">
                  {account?.organisation?.name || 'N/A'}
                </Typography>
              </Box>

              {/* User Information */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', mt: 2, display: 'block' }}>
                User (Account Owner)
              </Typography>
              <Box className="detail-row">
                <Typography className="detail-label">User ID</Typography>
                <Typography className="detail-value" sx={{ fontFamily: 'monospace' }}>
                  {account?.owner?.id || 'N/A'}
                </Typography>
              </Box>
              <Box className="detail-row">
                <Typography className="detail-label">Email</Typography>
                <Typography className="detail-value">{account?.owner?.email || 'N/A'}</Typography>
              </Box>
              <Box className="detail-row">
                <Typography className="detail-label">Name</Typography>
                <Typography className="detail-value">
                  {account?.owner?.first_name} {account?.owner?.last_name}
                </Typography>
              </Box>

              {/* Subscriptions */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', mt: 2, display: 'block' }}>
                Subscriptions ({activeSubscriptions?.length || 0})
              </Typography>
              {activeSubscriptions && activeSubscriptions.length > 0 ? (
                [...activeSubscriptions]
                  .sort((a, b) => new Date(b.date_creation || 0) - new Date(a.date_creation || 0))
                  .map((sub, idx) => (
                    <Box
                      key={sub.id || idx}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 1,
                        mt: 1,
                        backgroundColor: 'background.neutral',
                      }}
                    >
                      <Box className="detail-row">
                        <Typography className="detail-label">Sub ID</Typography>
                        <Typography className="detail-value" sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>
                          {sub.id}
                        </Typography>
                      </Box>
                      <Box className="detail-row">
                        <Typography className="detail-label">Status</Typography>
                        {editingSubscription === sub.id ? (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                              <Select
                                value={tempValues[`${sub.id}_status`] ?? sub.status}
                                onChange={(e) => setTempValues({ ...tempValues, [`${sub.id}_status`]: e.target.value })}
                                sx={{ height: 28, fontSize: '0.65rem' }}
                              >
                                <MenuItem value="active">active</MenuItem>
                                <MenuItem value="inactive">inactive</MenuItem>
                                <MenuItem value="trialing">trialing</MenuItem>
                                <MenuItem value="paused">paused</MenuItem>
                                <MenuItem value="cancelled">cancelled</MenuItem>
                              </Select>
                            </FormControl>
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateSubscriptionStatus(sub.id, tempValues[`${sub.id}_status`] ?? sub.status)}
                              sx={{ p: 0.5 }}
                            >
                              <Iconify icon="mdi:check" width={14} color="success.main" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingSubscription(null);
                                setTempValues({ ...tempValues, [`${sub.id}_status`]: undefined });
                              }}
                              sx={{ p: 0.5 }}
                            >
                              <Iconify icon="mdi:close" width={14} color="error.main" />
                            </IconButton>
                          </Stack>
                        ) : (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Chip
                              label={sub.status}
                              size="small"
                              color={
                                sub.status === 'active' ? 'success' :
                                  sub.status === 'trialing' ? 'info' :
                                    'default'
                              }
                              sx={{ height: 20, fontSize: '0.65rem' }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => setEditingSubscription(sub.id)}
                              sx={{ p: 0.5 }}
                            >
                              <Iconify icon="mdi:pencil" width={12} />
                            </IconButton>
                          </Stack>
                        )}
                      </Box>
                      <Box className="detail-row">
                        <Typography className="detail-label">Plan</Typography>
                        <Typography className="detail-value">
                          {sub.meta_data?.custom_subscription
                            ? (sub.meta_data?.plan_name || 'Custom')
                            : (sub.billing_option?.plan?.name || 'Unknown')}
                        </Typography>
                      </Box>
                      <Box className="detail-row">
                        <Typography className="detail-label">Credits (Rem)</Typography>
                        {editingSubscription === sub.id ? (
                          <Stack direction="row" spacing={0.5} alignItems="center" flex={1} justifyContent="flex-end">
                            <TextField
                              size="small"
                              type="number"
                              value={tempValues[`${sub.id}_credits`] ?? Number(sub.credit_balance / 100 || 0).toFixed(2)}
                              onChange={(e) => setTempValues({ ...tempValues, [`${sub.id}_credits`]: e.target.value })}
                              sx={{ width: 80 }}
                              inputProps={{ step: '0.01', style: { fontSize: '0.65rem', padding: '4px 6px' } }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateSubscriptionCredits(sub.id, tempValues[`${sub.id}_credits`])}
                              sx={{ p: 0.5 }}
                            >
                              <Iconify icon="mdi:check" width={14} color="success.main" />
                            </IconButton>
                          </Stack>
                        ) : (
                          <Typography className="detail-value">
                            {Number(sub.credit_balance / 100 || 0).toFixed(2)} / {sub.meta_data?.custom_subscription
                              ? Number(sub.meta_data?.total_credits / 100 || 0).toFixed(2)
                              : Number(sub.billing_option?.plan?.credits / 100 || 0).toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                      <Box className="detail-row">
                        <Typography className="detail-label">Price</Typography>
                        <Typography className="detail-value">
                          {sub.billing_option?.currency || '€'}{Number(sub.billing_option?.price / 100 || 0).toFixed(2)} / {sub.billing_option?.billing_frequency || 'N/A'}
                        </Typography>
                      </Box>
                      <Box className="detail-row">
                        <Typography className="detail-label">Created</Typography>
                        <Typography className="detail-value">
                          {sub.date_creation ? new Date(sub.date_creation).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                      {sub.current_period_end && (
                        <Box className="detail-row">
                          <Typography className="detail-label">Period End</Typography>
                          <Typography className="detail-value">
                            {new Date(sub.current_period_end).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                      {sub.trial_end && (
                        <Box className="detail-row">
                          <Typography className="detail-label">Trial End</Typography>
                          <Typography className="detail-value">
                            {new Date(sub.trial_end).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))
              ) : (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', display: 'block', mt: 1 }}>
                  No active subscriptions
                </Typography>
              )}

              {/* Additional Account Metadata */}
              {account?.meta_data && Object.keys(account.meta_data).length > 0 && (
                <>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', mt: 2, display: 'block' }}>
                    Metadata
                  </Typography>
                  {Object.entries(account.meta_data).map(([key, value]) => (
                    <Box className="detail-row" key={key}>
                      <Typography className="detail-label">{key}</Typography>
                      <Typography className="detail-value">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </Typography>
                    </Box>
                  ))}
                </>
              )}
            </Box>
          )}

          {/* Main Popover Content (Right Side) */}
          <Box sx={{ width: 280 }}>
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
                    {user?.email}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ px: 1.5, pb: 1.5 }}>
              <UpgradeButton
                prominent
                superAdminExpanded={superAdminExpanded}
                onToggleSuperAdmin={() => setSuperAdminExpanded(!superAdminExpanded)}
              />
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
                    onClick={onToggleMode}
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
                        resolvedThemeMode === 'light'
                          ? 'solar:sun-2-bold-duotone'
                          : 'iconamoon:mode-dark-light'
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
          </Box>
        </Stack>
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
