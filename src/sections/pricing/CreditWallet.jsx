import {
  Box,
  Card,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  LinearProgress,
  Stack,
  Divider,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import { useState } from 'react';

// ----------------------------------------------------------------------

const BUNDLE_OPTIONS = [
  { amount: 20, euroValue: '€20', bonus: 0 },
  { amount: 50, euroValue: '€50', bonus: '€5 bonus' },
  { amount: 200, euroValue: '€200', bonus: '€30 bonus' },
];

export default function CreditWallet({
  euroBalance = 12.5, // current balance in euros
  euroAllowance = 30, // monthly allowance in euros
  burnRate = 0.45, // euros per day
  plan = 'Solo',
}) {
  const theme = useTheme();
  const [autoRecharge, setAutoRecharge] = useState(true);
  const [triggerLevel, setTriggerLevel] = useState(10); // percentage

  const balancePercentage = (euroBalance / euroAllowance) * 100;
  const daysRemaining = Math.floor(euroBalance / burnRate);

  const getBalanceColor = () => {
    if (balancePercentage > 50) return 'success';
    if (balancePercentage > 20) return 'warning';
    return 'error';
  };

  const getStatusMessage = () => {
    if (balancePercentage > 50) return 'Healthy balance';
    if (balancePercentage > 20) return 'Consider topping up soon';
    if (balancePercentage > 0) return 'Low balance - top up recommended';
    return 'Balance depleted - 24h grace period active';
  };

  return (
    <Card sx={{ p: 4, maxWidth: 480, mx: 'auto' }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 600 }}
            >
              Usage Wallet
            </Typography>
            <Chip
              label={plan}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            Monitor your usage and manage auto-recharge settings
          </Typography>
        </Box>

        {/* Balance Overview */}
        <Box>
          <Stack
            direction="row"
            alignItems="baseline"
            spacing={1}
            sx={{ mb: 1 }}
          >
            <Typography
              variant="h3"
              sx={{ fontWeight: 700 }}
            >
              €{euroBalance.toFixed(2)}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary' }}
            >
              remaining
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={balancePercentage}
            color={getBalanceColor()}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.grey[500], 0.16),
              mb: 1,
            }}
          />

          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary' }}
            >
              €0
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary' }}
            >
              €{euroAllowance} (monthly allowance)
            </Typography>
          </Stack>

          <Alert
            severity={getBalanceColor()}
            variant="outlined"
            sx={{ '& .MuiAlert-message': { width: '100%' } }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2">{getStatusMessage()}</Typography>
              <Stack alignItems="flex-end">
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600 }}
                >
                  ~{daysRemaining} days remaining
                </Typography>
                {balancePercentage < 20 && (
                  <Button
                    size="small"
                    variant="contained"
                    color={getBalanceColor()}
                    sx={{ mt: 1, minWidth: 'auto', px: 2 }}
                  >
                    Top-up €20
                  </Button>
                )}
              </Stack>
            </Stack>
          </Alert>
        </Box>

        <Divider />

        {/* Usage Stats */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Usage Statistics
          </Typography>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography variant="body2">Daily burn rate</Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600 }}
              >
                €{burnRate.toFixed(2)}/day
              </Typography>
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography variant="body2">This month's usage</Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600 }}
              >
                €{(euroAllowance - euroBalance).toFixed(2)}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography variant="body2">Projected monthly usage</Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600 }}
              >
                €{(burnRate * 30).toFixed(2)}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        {/* Auto-recharge Settings */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Auto-recharge Settings
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={autoRecharge}
                onChange={(e) => setAutoRecharge(e.target.checked)}
              />
            }
            label="Enable auto-recharge"
            sx={{ mb: 2 }}
          />

          {autoRecharge && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">
                When balance drops below {triggerLevel}% of monthly allowance (€
                {((euroAllowance * triggerLevel) / 100).toFixed(2)}), automatically top up to the
                full €{euroAllowance} allowance.
              </Typography>
            </Alert>
          )}

          <Stack
            direction="row"
            spacing={1}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={() => setTriggerLevel(10)}
              color={triggerLevel === 10 ? 'primary' : 'inherit'}
            >
              10%
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setTriggerLevel(20)}
              color={triggerLevel === 20 ? 'primary' : 'inherit'}
            >
              20%
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setTriggerLevel(30)}
              color={triggerLevel === 30 ? 'primary' : 'inherit'}
            >
              30%
            </Button>
          </Stack>
        </Box>

        <Divider />

        {/* Manual Top-up */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Manual Top-up Bundles
          </Typography>

          <Stack spacing={2}>
            {BUNDLE_OPTIONS.map((bundle) => (
              <Stack
                key={bundle.amount}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600 }}
                  >
                    {bundle.euroValue}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    {bundle.bonus && `Includes ${bundle.bonus}`}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                >
                  Buy Now
                </Button>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}