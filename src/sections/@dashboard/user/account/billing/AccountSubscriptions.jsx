import {
  Box,
  Grid,
  Button,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { format, differenceInDays } from 'date-fns';
import PropTypes from 'prop-types';
import { memo, useCallback, useMemo, useState } from 'react';

import DialogUpgradeSub from './DialogUpgradeSub';
import Iconify from '../../../../../components/iconify';
import useFeedbackDispatch from '../../../../../hooks/useFeedbackDispatch';
import NavAccountSelector from '../../../../../layouts/dashboard/nav/NavAccountSelector';
import {
  transferSubscription,
  cancelSubscription,
  reactivateSubscription,
} from '../../../../../redux/slices/money';
import { useSelector } from '../../../../../redux/store';

// Add this new component for the skeleton loading state
const SubscriptionCardSkeleton = ({ minified }) => (
  <Stack
    padding={1}
    height="100%"
  >
    <Stack spacing={2}>
      {minified ? (
        <Stack spacing={1}>
          <Skeleton
            variant="text"
            width="40%"
          />
          <Skeleton
            variant="text"
            height={40}
          />
          <Skeleton
            variant="rounded"
            height={8}
          />
        </Stack>
      ) : (
        <>
          <Skeleton
            variant="text"
            width="60%"
            height={32}
          />
          <Skeleton
            variant="rounded"
            width={80}
            height={24}
          />
        </>
      )}
      {!minified && (
        <>
          <Skeleton
            variant="text"
            width="70%"
          />
          <Skeleton
            variant="text"
            width="40%"
          />
          <Skeleton
            variant="text"
            width="50%"
          />
          <Stack
            direction="row"
            spacing={1}
            mt={2}
          >
            <Skeleton
              variant="rounded"
              width={100}
              height={36}
            />
            <Skeleton
              variant="rounded"
              width={100}
              height={36}
            />
          </Stack>
        </>
      )}
    </Stack>
  </Stack>
);

// Add this new component for the empty state
export const NoSubscriptionsView = () => (
  <div className="flex flex-col items-center justify-center p-2 text-center">
    <div className="mb-6">
      <Iconify
        icon="eva:star-outline"
        width={64}
        height={64}
        className="text-gray-400"
      />
    </div>

    <h3 className="text-2xl font-semibold mb-3">Start Your Journey Today</h3>

    <p className="text-gray-600 mb-6 max-w-md">
      Try our services risk-free. Cancel anytime during the trial period - no commitment required.
    </p>

    <Button
      variant="contained"
      size="large"
      className="bg-primary-600 hover:bg-primary-700 transform transition hover:scale-105"
      startIcon={<Iconify icon="eva:flash-fill" />}
      href="/pricing"
    >
      Start Free Trial
    </Button>

    <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
      <div className="flex items-center">
        <Iconify
          icon="eva:checkmark-circle-2-fill"
          className="mr-1"
        />
        14-day free trial
      </div>
      <div className="flex items-center">
        <Iconify
          icon="eva:close-circle-fill"
          className="mr-1"
        />
        Cancel anytime
      </div>
    </div>
  </div>
);

function AccountSubscriptions({ subscriptionsSelector, minified = false }) {
  const t = useTheme();
  const themeMode = t.palette.mode;
  const subscriptionPlans = useSelector(subscriptionsSelector);
  const isLoading = useSelector((state) => state.general.accountAssetsLoading.subscriptions);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const [selectedDestinationAccount, setSelectedDestinationAccount] = useState(null);

  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);

  const handleOpenDialog = (subscription, type) => {
    setSelectedSubscription(subscription);
    setActionType(type);
    setOpenDialog(true);
  };

  const handleOpenUpgradeDialog = (plan) => {
    setSelectedSubscription(plan);
    setOpenUpgradeDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubscription(null);
    setActionType('');
  };

  const handleCloseUpgradeDialog = () => {
    setOpenUpgradeDialog(false);
  };

  const handleConfirmAction = useCallback(async () => {
    if (actionType === 'transfer' && selectedSubscription && selectedDestinationAccount) {
      await dispatchWithFeedback(
        transferSubscription(selectedSubscription.id, selectedDestinationAccount.id),
        {
          successMessage: 'Subscription transferred successfully',
          errorMessage: 'Error transferring subscription',
          useSnackbar: true,
        },
      ).then(handleCloseDialog());
    } else if (actionType === 'cancel' && selectedSubscription) {
      await dispatchWithFeedback(cancelSubscription(selectedSubscription.id), {
        successMessage: 'Subscription cancelled successfully',
        errorMessage: 'Error cancelling subscription',
        useSnackbar: true,
      }).then(handleCloseDialog());
    }
  }, [actionType, dispatchWithFeedback, selectedDestinationAccount, selectedSubscription]);

  return (
    <Box sx={{ p: 1 }}>
      {!minified && (
        <Typography
          variant="h4"
          gutterBottom
        >
          Your Subscriptions
        </Typography>
      )}

      {isLoading ? (
        <Grid
          container
          spacing={1}
        >
          {[...Array(3)].map((_, index) => (
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              key={`skeleton-${index}`}
            >
              <SubscriptionCardSkeleton minified={minified} />
            </Grid>
          ))}
        </Grid>
      ) : Array.isArray(subscriptionPlans) && subscriptionPlans.length > 0 ? (
        <Grid
          container
          spacing={1}
        >
          {subscriptionPlans.map((plan) => (
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              key={plan?.id || Math.random()}
            >
              <SubscriptionCard
                plan={plan}
                onAction={handleOpenDialog}
                onUpgrade={handleOpenUpgradeDialog}
                minified={minified}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <NoSubscriptionsView />
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {actionType
            ? `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Subscription`
            : 'Subscription Action'}
        </DialogTitle>
        <DialogContent dividers>
          {actionType === 'transfer' ? (
            <>
              <Typography gutterBottom>
                Select the destination account for the subscription transfer:
              </Typography>
              <NavAccountSelector
                selected={selectedDestinationAccount}
                setSelected={setSelectedDestinationAccount}
              />
            </>
          ) : (
            <Typography>
              {actionType && selectedSubscription
                ? `Are you sure you want to ${actionType} the subscription ${selectedSubscription.billing_option?.plan?.group?.name || 'Unknown'}?`
                : 'Are you sure you want to perform this action?'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button
            variant="contained"
            onClick={handleConfirmAction}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <DialogUpgradeSub
        open={openUpgradeDialog}
        onClose={handleCloseUpgradeDialog}
        subscription={selectedSubscription}
      />
    </Box>
  );
}

export default memo(AccountSubscriptions);

AccountSubscriptions.propTypes = {
  subscriptionPlans: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      status: PropTypes.string,
      billing_option: PropTypes.shape({
        price: PropTypes.number,
        currency: PropTypes.string,
        plan: PropTypes.shape({
          name: PropTypes.string,
          meta_data: PropTypes.shape({
            features: PropTypes.arrayOf(PropTypes.string),
          }),
        }),
      }),
      credit_balance: PropTypes.number,
      expiration_date: PropTypes.string,
      credit_type: PropTypes.string,
    }),
  ),
};

const SubscriptionCard = memo(({ plan, onAction, onUpgrade, minified }) => {
  const theme = useTheme();
  const themeMode = theme.palette.mode;
  const [dispatchWithFeedback] = useFeedbackDispatch();

  const handleCopyId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(plan?.id || '');
  };

  const statusConfig = {
    trialing: {
      color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      icon: 'eva:clock-outline',
    },
    active: {
      color: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      icon: 'eva:checkmark-circle-2-outline',
    },
    paused: {
      color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
      icon: 'eva:pause-circle-outline',
    },
    cancelled: {
      color: 'text-red-500 bg-red-100 dark:bg-red-900/30',
      icon: 'eva:close-circle-outline',
    },
  };

  // Calculate days left in trial
  const daysLeft = useMemo(() => {
    if (plan?.status === 'trialing' && plan?.expiration_date) {
      const diff = differenceInDays(new Date(plan.expiration_date), new Date());
      return Math.max(0, diff);
    }
    return null;
  }, [plan?.status, plan?.expiration_date]);

  const handleReactivate = async (e) => {
    e.stopPropagation();
    await dispatchWithFeedback(reactivateSubscription(plan.id), {
      successMessage: 'Subscription reactivated successfully',
      errorMessage: 'Error reactivating subscription',
      useSnackbar: true,
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  const ActionButtons = () => {
    // If status is paused, only show reactivate button
    if (plan?.status === 'paused') {
      return (
        <Button
          fullWidth
          variant="soft"
          color="primary"
          startIcon={<Iconify icon="eva:play-circle-outline" />}
          onClick={handleReactivate}
        >
          Reactivate
        </Button>
      );
    }

    // Otherwise show regular buttons based on minified state
    return minified ? (
      <div className="flex gap-1">
        <Tooltip title="Upgrade Plan">
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-up-outline" />}
            onClick={() => onUpgrade(plan)}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
            size="small"
          >
            Upgrade
          </Button>
        </Tooltip>
      </div>
    ) : (
      <div className="flex gap-2">
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:arrow-up-outline" />}
          onClick={() => onUpgrade(plan)}
          className="flex-1 bg-blue-500 hover:bg-blue-600"
        >
          Upgrade
        </Button>
        <IconButton
          onClick={() => onAction(plan, 'transfer')}
          className="text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Tooltip title="Transfer">
            <Iconify
              icon="eva:swap-outline"
              width={20}
            />
          </Tooltip>
        </IconButton>
        <IconButton
          onClick={() => onAction(plan, 'cancel')}
          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
        >
          <Tooltip title="Cancel">
            <Iconify
              icon="eva:close-circle-outline"
              width={20}
            />
          </Tooltip>
        </IconButton>
      </div>
    );
  };

  return (
    <div
      className={`
      relative rounded-lg overflow-hidden
      ${themeMode === 'dark' ? 'bg-gray-800/50' : 'bg-white'}
      shadow-sm hover:shadow-md transition-all duration-300
      border ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}
      ${minified ? 'p-3' : 'p-5'}
    `}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3
              className={`${minified ? 'text-base' : 'text-lg'} font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              {plan?.billing_option?.plan?.group?.name}
            </h3>
            {!minified && (
              <Tooltip title="Copy Subscription ID">
                <IconButton
                  onClick={handleCopyId}
                  size="small"
                  className="text-gray-400 hover:text-gray-300"
                >
                  <Iconify
                    icon="eva:copy-outline"
                    width={16}
                  />
                </IconButton>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`
              px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5
              ${statusConfig[plan?.status]?.color || 'text-gray-500 bg-gray-100 dark:bg-gray-800'}
            `}
            >
              <Iconify
                icon={statusConfig[plan?.status]?.icon}
                width={14}
              />
              {plan?.status}
              {/* ({daysLeft+1}d) */}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-right">
            <div className={`${minified ? 'text-base' : 'text-xl'} font-bold`}>
              {(plan?.billing_option?.price / 100).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">per month</div>
          </div>
        </div>
      </div>

      {/* Credits Usage */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1.5 text-sm">
          <span className="text-gray-500">Credits</span>
          <span className="font-medium">
            {formatNumber(plan?.credit_balance)} /{' '}
            {formatNumber(plan?.billing_option?.plan?.credits)}
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{
              width: `${Math.min((plan?.credit_balance / plan?.billing_option?.plan?.credits) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {!minified && (
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-4">
          <Iconify
            icon="eva:calendar-outline"
            width={16}
          />
          Next payment: {format(new Date(plan?.expiration_date), 'MMM d, yyyy')}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4">
        <ActionButtons />
      </div>
    </div>
  );
});

SubscriptionCard.propTypes = {
  plan: PropTypes.shape({
    id: PropTypes.string,
    status: PropTypes.string,
    billing_option: PropTypes.shape({
      price: PropTypes.number,
      currency: PropTypes.string,
      plan: PropTypes.shape({
        name: PropTypes.string,
        group: PropTypes.shape({
          id: PropTypes.string,
          name: PropTypes.string,
        }),
        credits: PropTypes.number,
        credit_type: PropTypes.string,
      }),
    }),
    credit_balance: PropTypes.number,
    expiration_date: PropTypes.string,
  }),
  onAction: PropTypes.func.isRequired,
  onUpgrade: PropTypes.func.isRequired,
  minified: PropTypes.bool,
};
