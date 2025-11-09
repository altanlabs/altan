import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Chip,
} from '@mui/material';
import UpgradeDialog from '../../dialogs/UpgradeDialog';
import Iconify from '../../iconify/Iconify';
import CustomDialog from '../../dialogs/CustomDialog';
import useLocales from '../../../locales/useLocales';
import {
  selectAccountId,
  selectAccountSubscriptions,
  selectIsAccountFree,
  selectAccountCreditBalance,
} from '../../../redux/slices/general';
import { openUrl } from '../../../utils/auth';
import { optimai, optimai_shop } from '../../../utils/axios';
import { useCreditBalancePolling } from '../../../hooks/useCreditBalancePolling';

const GROWTH_FEATURES = [
  { text: 'Higher credit limits', icon: 'material-symbols:account-balance-wallet' },
  { text: 'Priority support', icon: 'material-symbols:support-agent' },
  { text: 'Shared database pools', icon: 'material-symbols:database' },
  { text: 'Team collaboration', icon: 'material-symbols:group' },
  { text: 'Advanced analytics', icon: 'material-symbols:analytics' },
];

// Default credit package for fallback
const DEFAULT_CREDIT_PRICE_ID = 'price_1RiD6RKUsA7CGHPxquXwKTF6'; // €50

const NoCredits = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [growthPlans, setGrowthPlans] = useState([]);
  const [upgradablePlans, setUpgradablePlans] = useState([]);
  const { translate } = useLocales();

  const accountId = useSelector(selectAccountId);
  const isAccountFree = useSelector(selectIsAccountFree);
  const activeSubscriptions = useSelector(selectAccountSubscriptions);
  const accountCreditBalance = useSelector(selectAccountCreditBalance);

  // Enable polling for real-time credit balance updates
  useCreditBalancePolling(true);

  // Calculate credit balance in euros
  const creditBalanceInEuros = accountCreditBalance / 100;
  const isLowBalance = creditBalanceInEuros < 5;

  // Determine current plan
  const currentSubscription = activeSubscriptions?.[0];
  const currentPlan = currentSubscription?.billing_option?.plan;
  const currentBillingOption = currentSubscription?.billing_option;
  const isGrowthPlan = currentPlan?.name?.startsWith('Growth');
  const isProPlan = !isAccountFree && !isGrowthPlan;

  // Helper to get monthly price
  const getMonthlyPrice = (plan) => {
    const billingOption = plan?.billing_options?.items?.find(
      (option) => option.billing_frequency === 'monthly'
    );
    return billingOption ? billingOption.price / 100 : 0;
  };

  useEffect(() => {
    // Fetch Growth plans for Pro and Growth users
    if (isProPlan || isGrowthPlan) {
      const fetchGrowthPlans = async () => {
        try {
          const response = await optimai_shop.get(`/pricing`);
          const data = response.data.pricing;
          if (data && data.length > 0) {
            const plans = data[0].plans.items;
            const growth = plans
              .filter((plan) => plan.name.startsWith('Growth €'))
              .sort((a, b) => {
                const aPrice = parseInt(a.name.replace('Growth €', ''));
                const bPrice = parseInt(b.name.replace('Growth €', ''));
                return aPrice - bPrice;
              });
            setGrowthPlans(growth);

            // If user is on Growth, filter to show only higher tiers
            if (isGrowthPlan && currentBillingOption) {
              const currentPrice = currentBillingOption.price / 100;
              const higherPlans = growth.filter((plan) => {
                const billingOption = plan?.billing_options?.items?.find(
                  (option) => option.billing_frequency === 'monthly'
                );
                const planPrice = billingOption ? billingOption.price / 100 : 0;
                return planPrice > currentPrice;
              });
              setUpgradablePlans(higherPlans);
            }
          }
        } catch (error) {
          console.error('Error fetching Growth plans:', error);
        }
      };
      fetchGrowthPlans();
    }
  }, [isProPlan, isGrowthPlan, currentBillingOption]);

  const handleUpgradeToGrowth = async () => {
    setLoading(true);
    try {
      // Get the first (lowest) Growth plan
      const firstGrowthPlan = growthPlans[0];
      const billingOption = firstGrowthPlan?.billing_options?.items?.find(
        (option) => option.billing_frequency === 'monthly'
      );

      if (!billingOption) {
        console.error('No billing option found for Growth plan');
        return;
      }

      const response = await optimai_shop.get('/stripe/subscribe', {
        params: {
          account_id: accountId,
          billing_option_id: billingOption.id,
        },
      });

      await openUrl(response.data.url);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error upgrading to Growth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeGrowthTier = async () => {
    // For Growth users, upgrade to the next tier
    setLoading(true);
    try {
      const nextGrowthPlan = upgradablePlans[0];
      const billingOption = nextGrowthPlan?.billing_options?.items?.find(
        (option) => option.billing_frequency === 'monthly'
      );

      if (!billingOption) {
        console.error('No billing option found for next Growth tier');
        return;
      }

      const response = await optimai_shop.get('/stripe/subscribe', {
        params: {
          account_id: accountId,
          billing_option_id: billingOption.id,
        },
      });

      await openUrl(response.data.url);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error upgrading Growth tier:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCredits = async () => {
    // For Growth users with no upgradable tiers, buy additional credits
    setLoading(true);
    try {
      const response = await optimai_shop.get('/stripe/buy-credits', {
        params: {
          account_id: accountId,
          price_id: DEFAULT_CREDIT_PRICE_ID, // €50 package
        },
      });
      await openUrl(response.data.url);
    } catch (error) {
      console.error('Error buying credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    if (isGrowthPlan) {
      if (upgradablePlans.length > 0) {
        // Show dialog to upgrade to higher Growth tier
        setOpenDialog(true);
      } else {
        // No higher tiers, redirect to buy credits
        handleBuyCredits();
      }
    } else {
      // Show dialog for Free/Pro users
      setOpenDialog(true);
    }
  };

  const handleClose = () => setOpenDialog(false);

  // For Free users, use existing UpgradeDialog
  if (isAccountFree) {
    return (
      <Box sx={{ textAlign: 'center', maxWidth: 320, mx: 'auto', py: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Iconify
            icon="material-symbols:account-balance-wallet-outline"
            sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Out of Credits
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upgrade to Pro to get 25€ in credits and unlock all features
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          startIcon={<Iconify icon="material-symbols:crown" />}
          onClick={handleUpgrade}
          sx={{
            bgcolor: 'text.primary',
            color: 'background.paper',
            '&:hover': { bgcolor: 'text.secondary' },
            fontWeight: 600,
            py: 1.25,
          }}
        >
          Upgrade to Pro
        </Button>

        <UpgradeDialog open={openDialog} onClose={handleClose} />
      </Box>
    );
  }

  // For Pro users, show Growth upgrade dialog
  if (isProPlan) {
    return (
      <>
        <Box sx={{ textAlign: 'center', maxWidth: 320, mx: 'auto', py: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Iconify
              icon="material-symbols:account-balance-wallet-outline"
              sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Out of Credits
            </Typography>
            {isLowBalance && (
              <Chip
                label={`€${creditBalanceInEuros.toFixed(2)} remaining`}
                size="small"
                color="error"
                sx={{ mb: 1, fontWeight: 600 }}
              />
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upgrade to Growth for higher limits and priority support
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            startIcon={<Iconify icon="material-symbols:trending-up" />}
            onClick={handleUpgrade}
            sx={{
              bgcolor: 'text.primary',
              color: 'background.paper',
              '&:hover': { bgcolor: 'text.secondary' },
              fontWeight: 600,
              py: 1.25,
            }}
          >
            Upgrade to Growth
          </Button>
        </Box>

        {/* Growth Upgrade Dialog for Pro users */}
        <CustomDialog dialogOpen={openDialog} onClose={handleClose} maxWidth="sm">
          <Box sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Scale with Growth
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get higher credit limits and advanced features
              </Typography>
            </Box>

            {/* Features */}
            <Box sx={{ mb: 3 }}>
              <List sx={{ p: 0 }}>
                {GROWTH_FEATURES.map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Iconify
                        icon={feature.icon}
                        sx={{ color: 'text.secondary', fontSize: 18 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={feature.text}
                      sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Pricing Info */}
            {growthPlans.length > 0 && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Starting from
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  €{Math.round(
                    growthPlans[0]?.billing_options?.items?.find(
                      (opt) => opt.billing_frequency === 'monthly'
                    )?.price / 100 || 0
                  )}
                  <Typography component="span" variant="body1" color="text.secondary">
                    /mo
                  </Typography>
                </Typography>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                  €{growthPlans[0]?.credits / 100} in monthly credits
                </Typography>
              </Box>
            )}

            {/* Action Button */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleUpgradeToGrowth}
              disabled={loading || growthPlans.length === 0}
              size="large"
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Iconify icon="material-symbols:trending-up" />
                )
              }
              sx={{
                bgcolor: 'text.primary',
                color: 'background.paper',
                '&:hover': { bgcolor: 'text.secondary' },
                fontWeight: 600,
                py: 1.5,
              }}
            >
              {loading ? 'Processing...' : 'Upgrade to Growth'}
            </Button>

            {/* Trust indicators */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Iconify icon="material-symbols:cancel" sx={{ color: 'text.secondary', fontSize: 14 }} />
                <Typography variant="caption" color="text.secondary">
                  Cancel anytime
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                •
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Iconify icon="material-symbols:support-agent" sx={{ color: 'text.secondary', fontSize: 14 }} />
                <Typography variant="caption" color="text.secondary">
                  Priority support
                </Typography>
              </Box>
            </Box>
          </Box>
        </CustomDialog>
      </>
    );
  }

  // For Growth users with upgradable tiers
  if (isGrowthPlan && upgradablePlans.length > 0) {
    return (
      <>
        <Box sx={{ textAlign: 'center', maxWidth: 320, mx: 'auto', py: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Iconify
              icon="material-symbols:account-balance-wallet-outline"
              sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Out of Credits
            </Typography>
            {isLowBalance && (
              <Chip
                label={`€${creditBalanceInEuros.toFixed(2)} remaining`}
                size="small"
                color="error"
                sx={{ mb: 1, fontWeight: 600 }}
              />
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upgrade to a higher Growth tier for more credits
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            startIcon={<Iconify icon="material-symbols:trending-up" />}
            onClick={handleUpgrade}
            sx={{
              bgcolor: 'text.primary',
              color: 'background.paper',
              '&:hover': { bgcolor: 'text.secondary' },
              fontWeight: 600,
              py: 1.25,
            }}
          >
            Upgrade Plan
          </Button>
        </Box>

        {/* Higher Growth Tier Dialog */}
        <CustomDialog dialogOpen={openDialog} onClose={handleClose} maxWidth="sm">
          <Box sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Scale with a Higher Tier
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get more monthly credits and continue scaling
              </Typography>
            </Box>

            {/* Features */}
            <Box sx={{ mb: 3 }}>
              <List sx={{ p: 0 }}>
                {GROWTH_FEATURES.map((feature, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Iconify
                        icon={feature.icon}
                        sx={{ color: 'text.secondary', fontSize: 18 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={feature.text}
                      sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Next Tier Pricing */}
            {upgradablePlans.length > 0 && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Next tier
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  €{getMonthlyPrice(upgradablePlans[0])}
                  <Typography component="span" variant="body1" color="text.secondary">
                    /mo
                  </Typography>
                </Typography>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                  €{upgradablePlans[0]?.credits / 100} in monthly credits
                </Typography>
              </Box>
            )}

            {/* Action Button */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleUpgradeGrowthTier}
              disabled={loading}
              size="large"
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Iconify icon="material-symbols:trending-up" />
                )
              }
              sx={{
                bgcolor: 'text.primary',
                color: 'background.paper',
                '&:hover': { bgcolor: 'text.secondary' },
                fontWeight: 600,
                py: 1.5,
              }}
            >
              {loading ? 'Processing...' : 'Upgrade Tier'}
            </Button>

            {/* Trust indicators */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Iconify icon="material-symbols:cancel" sx={{ color: 'text.secondary', fontSize: 14 }} />
                <Typography variant="caption" color="text.secondary">
                  Cancel anytime
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                •
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Iconify icon="material-symbols:support-agent" sx={{ color: 'text.secondary', fontSize: 14 }} />
                <Typography variant="caption" color="text.secondary">
                  Priority support
                </Typography>
              </Box>
            </Box>
          </Box>
        </CustomDialog>
      </>
    );
  }

  // For Growth users at the highest tier, offer to buy credits
  if (isGrowthPlan) {
    return (
      <Box sx={{ textAlign: 'center', maxWidth: 320, mx: 'auto', py: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Iconify
            icon="material-symbols:account-balance-wallet-outline"
            sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Out of Credits
          </Typography>
          {isLowBalance && (
            <Chip
              label={`€${creditBalanceInEuros.toFixed(2)} remaining`}
              size="small"
              color="error"
              sx={{ mb: 1, fontWeight: 600 }}
            />
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Purchase additional credits to continue
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Iconify icon="material-symbols:add-shopping-cart" />
            )
          }
          onClick={handleBuyCredits}
          disabled={loading}
          sx={{
            bgcolor: 'text.primary',
            color: 'background.paper',
            '&:hover': { bgcolor: 'text.secondary' },
            fontWeight: 600,
            py: 1.25,
          }}
        >
          {loading ? 'Processing...' : 'Buy Credits'}
        </Button>
      </Box>
    );
  }
};

export default memo(NoCredits);