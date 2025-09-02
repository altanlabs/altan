import {
  Box,
  Card,
  Button,
  Typography,
  Stack,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Iconify from '../../components/iconify';
import CreditPurchaseSection from '../../components/pricing/CreditPurchaseSection';
import {
  selectAccountId,
  selectAccountSubscriptions,
  selectAccountCreditBalance,
} from '../../redux/slices/general';
import { openUrl } from '../../utils/auth';
import { optimai, optimai_shop } from '../../utils/axios';

// Feature lists for different plans
const GROWTH_FEATURES = [
  { text: 'Everything in your current plan', available: true },
  { text: 'Unlimited builders', available: true },
  { text: 'Discord support', available: true },
  { text: 'Shared database pools', available: true },
  { text: 'Team collaboration tools', available: true },
  { text: 'Advanced analytics', available: true },
];

const ENTERPRISE_FEATURES = [
  { text: 'Everything in Growth', available: true },
  { text: 'Dedicated account manager', available: true },
  { text: 'SAML SSO integration', available: true },
  { text: 'SLA guarantees', available: true },
  { text: 'Custom integrations', available: true },
  { text: 'Dedicated database pools', available: true },
];

export default function SubscribedPricing() {
  const [selectedGrowthTier, setSelectedGrowthTier] = useState(0);
  const [growthPlans, setGrowthPlans] = useState([]);
  const [filteredGrowthPlans, setFilteredGrowthPlans] = useState([]);
  const [enterprisePlan, setEnterprisePlan] = useState(null);
  const accountId = useSelector(selectAccountId);
  const activeSubscriptions = useSelector(selectAccountSubscriptions);
  const creditBalance = useSelector(selectAccountCreditBalance);

  // Helper functions
  const getBillingOption = (plan, frequency) => {
    if (!plan || !plan.billing_options || !plan.billing_options.items) return null;
    return plan.billing_options.items.find((option) => option.billing_frequency === frequency);
  };

  const formatPrice = (priceInCents, frequency) => {
    const price = priceInCents / 100;
    return frequency === 'yearly' ? Math.round(price / 12) : Math.round(price);
  };

  // Get current subscription info
  const currentSubscription = activeSubscriptions?.[0];
  const currentPlan = currentSubscription?.billing_option?.plan;
  const currentBillingOption = currentSubscription?.billing_option;
  const currentMonthlyPrice = currentBillingOption
    ? formatPrice(currentBillingOption.price, currentBillingOption.billing_frequency)
    : 0;
  const totalCredits = currentSubscription?.meta_data?.custom_subscription
    ? Number(currentSubscription?.meta_data?.total_credits ?? 0)
    : Number(currentPlan?.credits ?? 0);
  const remainingCredits = Number(currentSubscription?.credit_balance ?? 0);
  const usedCredits = totalCredits - remainingCredits;
  const usagePercentage = totalCredits > 0 ? Math.round((usedCredits / totalCredits) * 100) : 0;

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await optimai.get(`/templates/pricing?only_main=${true}`);
        const data = response.data.pricing;

        if (data && data.length > 0) {
          const plans = data[0].plans.items;

          // Filter Growth plans and Enterprise
          const growth = plans
            .filter((plan) => plan.name.startsWith('Growth €'))
            .sort((a, b) => {
              const aPrice = parseInt(a.name.replace('Growth €', ''));
              const bPrice = parseInt(b.name.replace('Growth €', ''));
              return aPrice - bPrice;
            });
          const enterprise = plans.find((plan) => plan.name === 'Enterprise');

          setGrowthPlans(growth);
          setEnterprisePlan(enterprise);
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
      }
    };
    fetchPricing();
  }, []);

  // Filter growth plans to only show upgrades
  useEffect(() => {
    if (growthPlans.length > 0 && currentMonthlyPrice > 0) {
      const filtered = growthPlans.filter((plan) => {
        const billingOption = getBillingOption(plan, 'monthly');
        if (!billingOption) return false;
        const planPrice = formatPrice(billingOption.price, 'monthly');
        return planPrice > currentMonthlyPrice;
      });
      setFilteredGrowthPlans(filtered);
      // Reset selected tier if current selection is no longer valid
      if (selectedGrowthTier >= filtered.length) {
        setSelectedGrowthTier(0);
      }
    } else {
      setFilteredGrowthPlans(growthPlans);
    }
  }, [growthPlans, currentMonthlyPrice, selectedGrowthTier]);

  const handleGrowthTierChange = (event) => {
    setSelectedGrowthTier(event.target.value);
  };

  const handleUpgradeGrowth = async () => {
    try {
      const selectedPlan = filteredGrowthPlans[selectedGrowthTier];
      const billingOption = getBillingOption(selectedPlan, 'monthly');

      if (!billingOption) {
        console.error('No billing option found for plan:', selectedPlan.name);
        return;
      }

      const response = await optimai_shop.get('/stripe/subscribe', {
        params: {
          account_id: accountId,
          billing_option_id: billingOption.id,
        },
      });

      await openUrl(response.data.url);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    }
  };

  const handleEnterpriseContact = () => {
    window.open('https://calendly.com/david-altan/15-min-onboarding-agency-clone', '_blank');
  };

  const currentGrowthPlan = filteredGrowthPlans[selectedGrowthTier];
  const growthBillingOption = getBillingOption(currentGrowthPlan, 'monthly');

  return (
    <Box>
      <Grid
        container
        spacing={4}
      >
        {/* Left side - Upgrade Options */}
        <Grid
          item
          xs={12}
          md={8}
        >
          <Typography
            variant="h4"
            sx={{ mb: 2, fontWeight: 700 }}
          >
            Upgrade Your Plan
          </Typography>

          {/* Growth Plan */}
          {filteredGrowthPlans.length > 0 && (
            <Card sx={{ p: 4, mb: 4 }}>
              <Typography
                variant="h5"
                sx={{ mb: 3, fontWeight: 600 }}
              >
                Growth Plan
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Scale your operations with more credits and advanced features.
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  Choose your credit tier:
                </Typography>
                <FormControl
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  <Select
                    value={selectedGrowthTier}
                    onChange={handleGrowthTierChange}
                    sx={{
                      '& .MuiSelect-select': {
                        py: 1.5,
                      },
                    }}
                  >
                    {filteredGrowthPlans.map((plan, index) => {
                      const billingOption = getBillingOption(plan, 'monthly');
                      const price = billingOption ? formatPrice(billingOption.price, 'monthly') : 0;

                      return (
                        <MenuItem
                          key={plan.id}
                          value={index}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            width="100%"
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              €{plan.credits / 100} credits
                            </Typography>
                            <Typography
                              variant="body2"
                              color="success.main"
                              fontWeight={600}
                            >
                              €{price}/mo
                            </Typography>
                          </Stack>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>

              {/* Current Selection Details */}
              {currentGrowthPlan && growthBillingOption && (
                <Box sx={{ mb: 4 }}>
                  <Stack
                    direction="row"
                    alignItems="baseline"
                    spacing={0.5}
                    sx={{ mb: 2 }}
                  >
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700 }}
                    >
                      €{formatPrice(growthBillingOption.price, 'monthly')}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                    >
                      /mo
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="primary.main"
                    sx={{ mb: 3, fontWeight: 600 }}
                  >
                    €{currentGrowthPlan.credits / 100} in monthly credits
                  </Typography>

                  <List
                    disablePadding
                    sx={{ mb: 3 }}
                  >
                    {GROWTH_FEATURES.map((feature, index) => (
                      <ListItem
                        key={index}
                        disablePadding
                        sx={{ py: 0.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Iconify
                            icon="eva:checkmark-circle-2-fill"
                            sx={{ color: 'success.main', width: 20, height: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature.text}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant="contained"
                    onClick={handleUpgradeGrowth}
                    size="large"
                    sx={{ px: 4, py: 1.5, fontWeight: 600 }}
                  >
                    Upgrade to Growth
                  </Button>
                </Box>
              )}
            </Card>
          )}

          {/* No Growth upgrades available */}
          {filteredGrowthPlans.length === 0 && (
            <Card sx={{ p: 4, mb: 4, textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600 }}
              >
                You&apos;re on our highest Growth plan!
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Consider upgrading to Enterprise for more advanced features and dedicated support.
              </Typography>
            </Card>
          )}

          {/* Enterprise Plan */}
          {enterprisePlan && (
            <Card sx={{ p: 4 }}>
              <Typography
                variant="h5"
                sx={{ mb: 3, fontWeight: 600 }}
              >
                Enterprise
              </Typography>

              <Grid
                container
                spacing={4}
              >
                <Grid
                  item
                  xs={12}
                  md={8}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    {enterprisePlan.description}
                  </Typography>

                  <List disablePadding>
                    {ENTERPRISE_FEATURES.map((feature, index) => (
                      <ListItem
                        key={index}
                        disablePadding
                        sx={{ py: 0.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Iconify
                            icon="eva:checkmark-circle-2-fill"
                            sx={{ color: 'success.main', width: 20, height: 20 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature.text}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={4}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, mb: 1 }}
                    >
                      Custom
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Custom credit allocation
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleEnterpriseContact}
                      sx={{ px: 4, py: 1.5, fontWeight: 600 }}
                    >
                      Contact Sales
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          )}
        </Grid>

        {/* Right side - Current Plan Info & Credit Purchase */}
        <Grid
          item
          xs={12}
          md={4}
        >
          <Card sx={{ p: 2, position: 'sticky', top: 20 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600 }}
              >
                Your Current Plan
              </Typography>
              <Chip
                label={currentPlan?.name || 'Unknown Plan'}
                color="primary"
                variant="filled"
                sx={{ px: 2, py: 1, fontWeight: 600 }}
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Subscription Credits */}
            <Box sx={{ mb: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Subscription credits
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                >
                  {usagePercentage}%
                </Typography>
              </Stack>

              <Box
                sx={{
                  width: '100%',
                  height: 8,
                  borderRadius: 1,
                  bgcolor: 'grey.200',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${usagePercentage}%`,
                    height: '100%',
                    bgcolor: usagePercentage > 80 ? 'warning.main' : 'primary.main',
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>

              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mt: 1 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  €{Math.round((totalCredits - remainingCredits) / 100)} used
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  €{Math.round(remainingCredits / 100)} remaining
                </Typography>
              </Stack>
            </Box>

            {/* Additional Credits */}
            {creditBalance > 0 && (
              <Box sx={{ mb: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Additional credits
                  </Typography>
                  <Chip
                    label="Never expire"
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Stack>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: 'success.main' }}
                >
                  €{Math.round(creditBalance / 100)} available
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            <CreditPurchaseSection
              title="Buy More Credits"
              compact
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
