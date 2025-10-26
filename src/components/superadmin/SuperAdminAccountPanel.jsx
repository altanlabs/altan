import {
  Login,
  CreditCard,
  ContentCopy,
  Analytics,
  Close,
} from '@mui/icons-material';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
} from '@mui/material';
import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import Iconify from '../iconify';
import { useSnackbar } from '../snackbar';
import { updateEntry } from '../../redux/slices/superadmin';
import { clearAccountState, setAccount } from '../../redux/slices/general';
import { optimai } from '../../utils/axios';

const SuperAdminAccountPanel = ({ accountId, onClose }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  
  // Local state to store the fetched account data
  const [account, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for editing
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [editingAccountCredit, setEditingAccountCredit] = useState(false);
  const [tempValues, setTempValues] = useState({});

  // Fetch the specific account's data
  useEffect(() => {
    const fetchAccountData = async () => {
      if (!accountId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch full account data with subscriptions
        const response = await optimai.post(`/account/${accountId}/gq`, {
          '@fields': '@all',
          user: {
            '@fields': ['id', 'email', 'first_name', 'last_name', 'avatar_url'],
          },
          organisation: {
            '@fields': ['@base', 'name'],
          },
          subscriptions: {
            '@fields': '@all',
            billing_option: {
              '@fields': ['price', 'currency', 'billing_frequency', 'billing_cycle'],
              plan: {
                '@fields': '@all',
              },
            },
            '@filter': { status: { _in: ['active', 'trialing', 'paused', 'inactive', 'cancelled'] } },
          },
        });
        
        const accountData = response.data;
        setAccountData({
          id: accountData.id,
          name: accountData.name,
          credit_balance: accountData.credit_balance,
          stripe_id: accountData.stripe_id,
          organisation_id: accountData.organisation?.id,
          organisation: accountData.organisation,
          meta_data: accountData.meta_data || {},
          owner: accountData.user,
          subscriptions: accountData.subscriptions || [],
        });
      } catch (err) {
        console.error('Failed to fetch account data:', err);
        setError('Failed to load account data');
        enqueueSnackbar('Failed to load account data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [accountId, enqueueSnackbar]);

  // Extract data for easier access
  const activeSubscriptions = account?.subscriptions || [];
  const accountCreditBalance = account?.credit_balance || 0;

  // Function to refresh account data after updates
  const refreshAccountData = useCallback(async () => {
    if (!accountId) return;
    
    try {
      const response = await optimai.post(`/account/${accountId}/gq`, {
        '@fields': '@all',
        user: {
          '@fields': ['id', 'email', 'first_name', 'last_name', 'avatar_url'],
        },
        organisation: {
          '@fields': ['@base', 'name'],
        },
        subscriptions: {
          '@fields': '@all',
          billing_option: {
            '@fields': ['price', 'currency', 'billing_frequency', 'billing_cycle'],
            plan: {
              '@fields': '@all',
            },
          },
          '@filter': { status: { _in: ['active', 'trialing', 'paused', 'inactive', 'cancelled'] } },
        },
      });
      
      const accountData = response.data;
      setAccountData({
        id: accountData.id,
        name: accountData.name,
        credit_balance: accountData.credit_balance,
        stripe_id: accountData.stripe_id,
        organisation_id: accountData.organisation?.id,
        organisation: accountData.organisation,
        meta_data: accountData.meta_data || {},
        owner: accountData.user,
        subscriptions: accountData.subscriptions || [],
      });
    } catch (err) {
      console.error('Failed to refresh account data:', err);
    }
  }, [accountId]);

  const handleUpdateSubscriptionStatus = async (subscriptionId, newStatus) => {
    try {
      await dispatch(updateEntry('Subscription', subscriptionId, { status: newStatus }));
      enqueueSnackbar('Subscription status updated successfully', { variant: 'success' });
      setEditingSubscription(null);
      // Refresh account data to show updated values
      await refreshAccountData();
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
      // Refresh account data to show updated values
      await refreshAccountData();
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
      // Refresh account data to show updated values
      await refreshAccountData();
    } catch (error) {
      enqueueSnackbar(`Failed to update account credit: ${error}`, { variant: 'error' });
    }
  };

  const handleEnterAccount = useCallback(() => {
    console.log('Entering account:', { accountId, account });
    
    const accountToSet = account || { id: accountId };
    
    localStorage.setItem('lastLocation', location.pathname);
    dispatch(clearAccountState());
    dispatch(setAccount(accountToSet));
    localStorage.setItem('OAIPTACC', accountId);
    
    history.replace('/');
  }, [account, accountId, dispatch, history, location.pathname]);

  const handleCopyAccountId = () => {
    navigator.clipboard.writeText(accountId);
    enqueueSnackbar('Account ID copied to clipboard', { variant: 'success' });
  };

  const handleViewActivity = () => {
    const analyticsUrl = `https://analytics.altan.ai/accounts/${accountId}`;
    window.open(analyticsUrl, '_blank');
  };

  // Show loading state
  if (loading) {
  return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            p: 3,
            pb: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" fontWeight="600">
            🔐 SuperAdmin Account Panel
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'text.secondary' }}
          >
            <Close />
          </IconButton>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading account data...
            </Typography>
          </Stack>
        </Box>
      </Box>
    );
  }

  // Show error state
  if (error || !account) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            p: 3,
            pb: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" fontWeight="600">
            🔐 SuperAdmin Account Panel
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'text.secondary' }}
          >
            <Close />
          </IconButton>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Iconify icon="mdi:alert-circle" width={48} color="error.main" />
            <Typography variant="body1" color="error.main">
              {error || 'Failed to load account data'}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" fontWeight="600">
          🔐 SuperAdmin Account Panel
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'text.secondary' }}
          >
            <Close />
          </IconButton>
        </Box>

      {/* Content */}
      <Box
        sx={{
          p: 2,
          flex: 1,
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
        {/* Account Information */}
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', mt: 1, display: 'block' }}>
          Account
        </Typography>
        <Box className="detail-row">
          <Typography className="detail-label">Account ID</Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" flex={1} justifyContent="flex-end">
            <Typography className="detail-value" sx={{ fontFamily: 'monospace' }}>
              {account?.id || accountId}
          </Typography>
            <IconButton size="small" onClick={handleCopyAccountId} sx={{ p: 0.5 }}>
              <ContentCopy sx={{ fontSize: 14 }} />
            </IconButton>
          </Stack>
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

        <Divider sx={{ my: 3 }} />

        {/* Admin Actions */}
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', display: 'block', mb: 1 }}>
            Admin Actions
          </Typography>
        <Stack spacing={1.5}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Login />}
              onClick={handleEnterAccount}
              sx={{
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Enter Account
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Analytics />}
              onClick={handleViewActivity}
              sx={{
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                },
              }}
            >
              View Activity
            </Button>
          </Stack>
        </Box>
        </Box>
  );
};

export default SuperAdminAccountPanel;
