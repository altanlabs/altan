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
} from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { selectAccountState } from '../../redux/slices/accountTemplates';
import { clearAccountState, setAccount } from '../../redux/slices/general';
import { optimai_shop } from '../../utils/axios';

const SuperAdminAccountPanel = ({ accountId, onClose }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const accountState = useSelector(selectAccountState(accountId));
  const { account } = accountState;

  // Give Credits Dialog State
  const [giveCreditsOpen, setGiveCreditsOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [givingCredits, setGivingCredits] = useState(false);

  const handleEnterAccount = useCallback(() => {
    console.log('Entering account:', { accountId, account });
    
    // Follow the exact same pattern as NavAccount.jsx handleChangeAccount
    if (account?.id !== accountId) {
      console.log('Account ID mismatch, using accountId:', accountId);
    }
    
    // Use the account data we have, but ensure we're using the right ID
    const accountToSet = account || { id: accountId };
    
    localStorage.setItem('lastLocation', location.pathname);
    dispatch(clearAccountState());
    dispatch(setAccount(accountToSet));
    localStorage.setItem('OAIPTACC', accountId);
    
    // Use history.replace like NavAccount does
    history.replace('/');
  }, [account, accountId, dispatch, history, location.pathname]);

  const handleCopyAccountId = () => {
    navigator.clipboard.writeText(accountId);
    // TODO: Show success toast
  };

  const handleGiveCredits = () => {
    setGiveCreditsOpen(true);
  };

  const handleGiveCreditsClose = () => {
    setGiveCreditsOpen(false);
    setCreditAmount('');
  };

  const handleGiveCreditsConfirm = async () => {
    const credits = parseFloat(creditAmount);
    if (isNaN(credits) || credits <= 0) {
      alert('Please enter a valid credit amount');
      return;
    }
    
    setGivingCredits(true);
    
    try {
      // Call the give credits API endpoint
      const response = await optimai_shop.post('/credits', null, {
        params: {
          account_id: accountId,
          credits: Math.round(credits), // Ensure integer value
        },
      });
      
      console.log('Credits added successfully:', response.data);
      
      // Close dialog and reset
      handleGiveCreditsClose();
      
      // TODO: Show success toast notification
      // TODO: Refresh account data to show updated credits
      alert(`Successfully added ${Math.round(credits)} credits to the account!`);
      
    } catch (error) {
      console.error('Failed to give credits:', error);
      
      // Handle different error cases
      if (error.response?.status === 403) {
        alert('Access denied. You need superadmin privileges to give credits.');
      } else if (error.response?.status === 404) {
        alert('Account not found.');
      } else {
        alert(`Failed to give credits: ${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setGivingCredits(false);
    }
  };

  const handleCreditAmountChange = (event) => {
    const value = event.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCreditAmount(value);
    }
  };

  const handleViewActivity = () => {
    // Open analytics page with the account ID
    const analyticsUrl = `https://analytics.altan.ai/accounts/${accountId}`;
    window.open(analyticsUrl, '_blank');
  };

  const formatCurrency = (amountInCents) => {
    const amountInDollars = amountInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amountInDollars);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Use real account data when available, fallback to mock data for missing fields
  const accountData = {
    id: account?.id || accountId,
    name: account?.name || 'Unknown Account',
    email: account?.user_email || 'N/A', // This might need to be fetched separately
    plan: 'Enterprise', // TODO: Get real plan data
    planStatus: 'active', // TODO: Get real plan status
    credits: account?.credits || 0, // TODO: Get real credits data
    balance: account?.credit_balance || 0,
    currency: account?.currency || 'USD',
    joinedDate: account?.date_creation,
    logoUrl: account?.logo_url,
  };

  return (
    <>
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
          <Typography
            variant="h6"
            fontWeight="600"
          >
            Account Admin Panel
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'text.secondary' }}
          >
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, py: 3, flex: 1, overflowY: 'auto' }}>
        {/* Account ID - Copyable */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
          >
            Account ID
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              fontFamily="monospace"
              sx={{
                flex: 1,
                wordBreak: 'break-all',
                fontSize: '0.75rem',
                backgroundColor: 'action.hover',
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              {accountId}
            </Typography>
            <Tooltip title="Copy Account ID">
              <IconButton
                size="small"
                onClick={handleCopyAccountId}
                sx={{ color: 'text.secondary' }}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Account Info */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
          >
            Account Details
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Name
              </Typography>
              <Typography
                variant="body1"
                fontWeight="500"
              >
                {accountData.name}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Email
              </Typography>
              <Typography
                variant="body1"
                fontWeight="500"
              >
                {accountData.email}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Plan
              </Typography>
              <Chip
                label={accountData.plan}
                color={accountData.planStatus === 'active' ? 'success' : 'default'}
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Box>

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Joined
              </Typography>
              <Typography variant="body1">{formatDate(accountData.joinedDate)}</Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Financial Info */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
          >
            Financial Overview
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Credits
              </Typography>
              <Typography
                variant="body1"
                fontWeight="600"
                color="primary.main"
              >
                {accountData.credits.toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Balance
              </Typography>
              <Typography
                variant="body1"
                fontWeight="500"
                color={accountData.balance < 0 ? 'error.main' : 'text.primary'}
              >
                {formatCurrency(accountData.balance)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Action Buttons */}
        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
          >
            Admin Actions
          </Typography>
          <Stack spacing={2}>
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
              startIcon={<CreditCard />}
              onClick={handleGiveCredits}
              sx={{
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                },
              }}
            >
              Give Credits
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

        {/* Last Activity */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Created: {formatDate(accountData.joinedDate)}
          </Typography>
        </Box>
        </Box>
      </Box>

      {/* Give Credits Dialog */}
    <Dialog
      open={giveCreditsOpen}
      onClose={handleGiveCreditsClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          ...(theme => theme.palette.mode === 'dark' && {
            backgroundColor: 'rgba(18, 18, 18, 0.9)',
          }),
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="600">
          Give Credits
        </Typography>
        <IconButton
          size="small"
          onClick={handleGiveCreditsClose}
          sx={{ color: 'text.secondary' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add credits to account: <strong>{accountData.name}</strong>
        </Typography>

        <TextField
          autoFocus
          fullWidth
          label="Credit Amount"
          type="text"
          value={creditAmount}
          onChange={handleCreditAmountChange}
          placeholder="0.00"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CreditCard sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          helperText="Enter the number of credits to add to this account"
          sx={{ mb: 2 }}
        />

        <Box
          sx={{
            p: 2,
            backgroundColor: 'action.hover',
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Current Balance: {formatCurrency(accountData.balance)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Credits: {accountData.credits.toLocaleString()}
          </Typography>
          {creditAmount && !isNaN(parseFloat(creditAmount)) && (
            <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>
              New Credits: {(accountData.credits + parseFloat(creditAmount)).toLocaleString()}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleGiveCreditsClose}
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleGiveCreditsConfirm}
          variant="contained"
          disabled={!creditAmount || isNaN(parseFloat(creditAmount)) || parseFloat(creditAmount) <= 0 || givingCredits}
          startIcon={<CreditCard />}
        >
          {givingCredits ? 'Adding Credits...' : 'Give Credits'}
        </Button>
      </DialogActions>
      </Dialog>
    </>
  );
};

export default SuperAdminAccountPanel;
