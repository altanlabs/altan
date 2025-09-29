import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  FormControl,
  FormLabel,
  Checkbox,
  FormControlLabel,
  Stack,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { selectAccountId } from '../../redux/slices/general';
import { optimai_shop } from '../../utils/axios';
import CustomDialog from '../dialogs/CustomDialog';

export default function PayAsYouGoDialog({ open, onClose, onSave, currentSettings }) {
  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(false);
  const [thresholdAmount, setThresholdAmount] = useState('5');
  const [rechargeAmount, setRechargeAmount] = useState('50');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const accountId = useSelector(selectAccountId);

  // Initialize form with current settings when dialog opens
  useEffect(() => {
    if (open && currentSettings) {
      setAutoRechargeEnabled(currentSettings.enabled);
      setThresholdAmount(currentSettings.threshold.toString());
      setRechargeAmount(currentSettings.rechargeAmount.toString());
      setMonthlyLimit(currentSettings.monthlyLimit ? currentSettings.monthlyLimit.toString() : '');
    }
  }, [open, currentSettings]);

  const handleThresholdChange = (event) => {
    const value = event.target.value;
    if (value === '' || (parseInt(value) >= 5 && parseInt(value) <= 199995)) {
      setThresholdAmount(value);
    }
  };

  const handleRechargeAmountChange = (event) => {
    const value = event.target.value;
    if (value === '' || (parseInt(value) >= 10 && parseInt(value) <= 200000)) {
      setRechargeAmount(value);
    }
  };

  const handleMonthlyLimitChange = (event) => {
    const value = event.target.value;
    if (value === '' || (parseInt(value) >= 50 && parseInt(value) <= 200000)) {
      setMonthlyLimit(value);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);

      const newSettings = {
        enabled: autoRechargeEnabled,
        threshold: parseInt(thresholdAmount),
        rechargeAmount: parseInt(rechargeAmount),
        monthlyLimit: monthlyLimit ? parseInt(monthlyLimit) : null,
      };

      await optimai_shop.post('/auto-recharge/settings', {
        account_id: accountId,
        ...newSettings,
      });

      onSave(newSettings);
    } catch (error) {
      console.error('Error saving auto-recharge settings:', error);
      // Handle error - could show toast notification
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current settings
    if (currentSettings) {
      setAutoRechargeEnabled(currentSettings.enabled);
      setThresholdAmount(currentSettings.threshold.toString());
      setRechargeAmount(currentSettings.rechargeAmount.toString());
      setMonthlyLimit(currentSettings.monthlyLimit ? currentSettings.monthlyLimit.toString() : '');
    }
    onClose();
  };

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={handleCancel}
      fullWidth
      blur={false}
      className="bg-white dark:bg-gray-900"
    >
      <Box sx={{ p: 2.5 }}>
        {/* Header */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Pay as you go
        </Typography>

        <Typography
          variant="body1"
          sx={{ mb: 2, color: 'text.secondary' }}
        >
          Would you like to set up automatic recharge?
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={autoRechargeEnabled}
              onChange={(e) => setAutoRechargeEnabled(e.target.checked)}
            />
          }
          label="Yes, automatically recharge my card when my credit balance falls below a threshold"
          sx={{ mb: 3, alignItems: 'center' }}
        />

        {autoRechargeEnabled && (
          <Stack spacing={2.5} sx={{ mb: 3 }}>
            {/* Threshold Amount */}
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 0.5, fontWeight: 500, color: 'text.primary' }}>
                When credit balance goes below
              </FormLabel>
              <TextField
                value={thresholdAmount}
                onChange={handleThresholdChange}
                type="number"
                inputProps={{
                  min: 5,
                  max: 199995,
                  style: { fontSize: '1.1rem' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontWeight: 500 }}>€</Typography>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Enter an amount between €5 and €199995
              </Typography>
            </FormControl>

            {/* Recharge Amount */}
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 0.5, fontWeight: 500, color: 'text.primary' }}>
                Bring credit balance back up to
              </FormLabel>
              <TextField
                value={rechargeAmount}
                onChange={handleRechargeAmountChange}
                type="number"
                inputProps={{
                  min: 10,
                  max: 200000,
                  style: { fontSize: '1.1rem' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontWeight: 500 }}>€</Typography>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Enter an amount between €10 and €200000
              </Typography>
            </FormControl>

            {/* Monthly Limit */}
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 0.5, fontWeight: 500, color: 'text.primary' }}>
                Limit the amount of automatic recharge per month
              </FormLabel>
              <TextField
                value={monthlyLimit}
                onChange={handleMonthlyLimitChange}
                placeholder="Leave empty for no limit"
                type="number"
                inputProps={{
                  min: 50,
                  max: 200000,
                  style: { fontSize: '1.1rem' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontWeight: 500 }}>€</Typography>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Enter an amount between €50 and €200000. Leave this field empty for no recharge
                limit.
              </Typography>
            </FormControl>
          </Stack>
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={loading}
            sx={{
              minWidth: 100,
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            disabled={loading}
            sx={{
              minWidth: 120,
              fontWeight: 600,
              flex: 1,
              py: 1.5,
            }}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </Stack>
      </Box>
    </CustomDialog>
  );
}
