import { Box, Stack, Tooltip, Typography, LinearProgress, Button, Chip } from '@mui/material';
import { PieChart } from '@mui/x-charts';
import { memo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import Iconify from './iconify';
import StyledChip from './StyledChip';
import { selectAccountSubscriptions } from '../redux/slices/general';
import { useSelector } from '../redux/store';

function formatCredits(credits) {
  if (credits >= 1000000) {
    return (credits / 1000000).toFixed(1) + 'M';
  } else if (credits >= 1000) {
    return (credits / 1000).toFixed(1) + 'k';
  }
  return credits.toString();
}

const UpgradeButton = ({ large = false, prominent = false }) => {
  const history = useHistory();
  const activeSubscriptions = useSelector(selectAccountSubscriptions);
  const getCreditsInfo = useCallback(() => {
    if (!activeSubscriptions?.[0]) {
      return { used: 0, total: 0, remaining: 0, isLowCredits: false };
    }

    const subscription = activeSubscriptions[0];
    const totalCredits = subscription?.meta_data?.custom_subscription
      ? Number(subscription?.meta_data?.total_credits ?? 0)
      : Number(subscription?.billing_option?.plan?.credits ?? 0);
    const remainingCredits = Number(subscription?.credit_balance ?? 0);
    const isLowCredits =
      totalCredits > 0 && (remainingCredits === 0 || remainingCredits / totalCredits <= 0.15);

    return {
      total: Math.round(totalCredits / 100),
      remaining: Math.round(remainingCredits / 100),
      used: Math.round((totalCredits - remainingCredits) / 100),
      isLowCredits,
    };
  }, [activeSubscriptions]);

  const renderPieChart = useCallback(
    ({ used, remaining, isLowCredits }) => (
      <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center' }}>
        <PieChart
          series={[
            {
              data: [
                {
                  value: used,
                  color: isLowCredits ? 'rgba(239, 68, 68, 0.3)' : 'rgba(148, 163, 184, 0.3)',
                },
                {
                  value: remaining,
                  color: isLowCredits ? 'rgba(239, 68, 68, 0.9)' : 'rgba(148, 163, 184, 0.9)',
                },
              ],
              innerRadius: 6,
              outerRadius: 10,
              arcLabel: () => '',
              arcLabelMinAngle: 0,
              highlightScope: { faded: 'none', highlighted: 'none' },
            },
          ]}
          width={20}
          height={20}
          margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
          slotProps={{
            legend: { hidden: true },
          }}
          tooltip={{ hidden: true }}
          sx={{
            '& .MuiChartsLegend-root': { display: 'none' },
            '& .MuiChartsAxis-root': { display: 'none' },
          }}
        />
      </Box>
    ),
    [],
  );

  const getPlanName = useCallback(() => {
    if (!activeSubscriptions?.[0]) return 'Free';

    const subscription = activeSubscriptions[0];
    return subscription?.meta_data?.custom_subscription
      ? subscription?.meta_data?.plan_name || 'Custom'
      : subscription?.billing_option?.plan?.name || 'Free';
  }, [activeSubscriptions]);

  const creditInfo = getCreditsInfo();
  const planName = getPlanName();
  const usagePercentage = creditInfo.total > 0 ? (creditInfo.used / creditInfo.total) * 100 : 0;

  // Prominent version for top of popover
  if (prominent) {
    return (
      <Box sx={{ width: '100%' }}>
        <Stack spacing={2}>
          {/* Main credit display */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box>
              <Typography
                variant="h5"
                color="text.primary"
                sx={{ fontWeight: 600, lineHeight: 1.1 }}
              >
                €{formatCredits(creditInfo.remaining)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25 }}
              >
                credit balance
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={1}
            >
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="material-symbols:crown" />}
                onClick={() => history.push('/pricing')}
                sx={{
                  minWidth: 70,
                  height: 32,
                  fontSize: '0.8rem',
                  backgroundColor: creditInfo.isLowCredits ? 'error.main' : 'text.primary',
                  color: creditInfo.isLowCredits ? 'error.contrastText' : 'background.paper',
                  '&:hover': {
                    backgroundColor: creditInfo.isLowCredits ? 'error.dark' : 'text.secondary',
                  },
                }}
              >
                Upgrade
              </Button>
            </Stack>
          </Stack>

          {/* Progress indicator */}
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                onClick={() => history.push('/usage')}
                sx={{ fontSize: '0.75rem', cursor: 'pointer' }}
              >
                {usagePercentage.toFixed(0)}% used. <span className="underline">View usage</span>
              </Typography>

              <Chip
                size="small"
                label={planName}
              />
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(usagePercentage, 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: creditInfo.isLowCredits ? 'error.main' : 'text.primary',
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        </Stack>
      </Box>
    );
  }

  if (large) {
    return (
      <Tooltip
        arrow
        followCursor
        title={`${formatCredits(creditInfo.remaining)} / ${formatCredits(creditInfo.total)} credits remaining`}
      >
        <Box sx={{ width: '100%' }}>
          <StyledChip
            icon={renderPieChart(creditInfo)}
            label={
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                width="100%"
              >
                <Typography variant="body2">{planName}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  •
                </Typography>
                <Typography variant="body2">Upgrade</Typography>
              </Stack>
            }
            variant="upgrade"
            isLowCredits={creditInfo.isLowCredits}
            onClick={() => history.push('/pricing')}
            sx={{ width: '100%', justifyContent: 'flex-start', '& .MuiChip-label': { flex: 1 } }}
          />
        </Box>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      arrow
      followCursor
      title={`${formatCredits(creditInfo.remaining)} / ${formatCredits(creditInfo.total)} credits remaining`}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StyledChip
          icon={renderPieChart(creditInfo)}
          label="Upgrade"
          variant="upgrade"
          isLowCredits={creditInfo.isLowCredits}
          onClick={() => history.push('/pricing')}
        />
      </Box>
    </Tooltip>
  );
};

export default memo(UpgradeButton);
