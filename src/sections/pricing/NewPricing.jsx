import {
  Box,
  Card,
  Button,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material';
import { useEffect, useState } from 'react';

import Iconify from '../../components/iconify';
import { SkeletonPricingCard } from '../../components/skeleton';
import { selectAccountId } from '../../redux/slices/general';
import { useSelector } from '../../redux/store';
import { optimai, optimai_shop } from '../../utils/axios';

// ----------------------------------------------------------------------

const PRO_FEATURES = [
  { text: 'Private projects', available: true },
  { text: 'Custom domains', available: true },
  { text: 'Voice AI Agents', available: true },
  { text: 'Workflow Builder', available: true },
  { text: '1 builder', available: true },
  { text: 'Community support', available: true },
  { text: 'Remove Altan branding', available: true },
];

const GROWTH_FEATURES = [
  { text: 'Everything in Pro', available: true },
  { text: 'Unlimited builders', available: true },
  { text: 'Discord support', available: true },
  { text: 'Shared database pools', available: true },
  { text: 'Team collaboration tools', available: true },
  { text: 'Advanced analytics', available: true },
  { text: 'SLA guarantees', available: false },
  { text: 'Custom integrations', available: false },
];

const ENTERPRISE_FEATURES = [
  { text: 'Dedicated account manager', available: true },
  { text: 'Commit-to-spend blocks', available: true },
  { text: 'SAML SSO integration', available: true },
  { text: 'SLA guarantees', available: true },
  { text: 'Custom integrations', available: true },
  { text: 'Dedicated database pools', available: true },
];

// ----------------------------------------------------------------------

function PricingCard({
  title,
  price,
  priceSubtext,
  description,
  features,
  buttonText,
  highlighted = false,
  children,
  onButtonClick,
  sx,
  ...other
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 4,
        position: 'relative',
        ...(highlighted && {
          transform: 'scale(1.05)',
          zIndex: 1,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.02)})`,
            borderRadius: 'inherit',
            zIndex: -1,
          },
        }),
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ mb: 1, fontWeight: 600 }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', mb: 2 }}
        >
          {description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          {typeof price === 'string' ? (
            <Typography
              variant="h3"
              sx={{ fontWeight: 700 }}
            >
              {price}
            </Typography>
          ) : (
            <Stack
              direction="row"
              alignItems="baseline"
              spacing={0.5}
            >
              <Typography
                variant="h3"
                sx={{ fontWeight: 700 }}
              >
                €{price}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'text.secondary' }}
              >
                /mo
              </Typography>
            </Stack>
          )}
          {priceSubtext && (
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block' }}
            >
              {priceSubtext}
            </Typography>
          )}
        </Box>
      </Box>

      {children}

      <Divider sx={{ my: 3 }} />

      <List
        disablePadding
        sx={{ mb: 3 }}
      >
        {features.map((feature, index) => (
          <ListItem
            key={index}
            disablePadding
            sx={{ py: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Iconify
                icon={feature.available ? 'eva:checkmark-circle-2-fill' : 'eva:close-circle-fill'}
                sx={{
                  color: feature.available ? 'success.main' : 'text.disabled',
                  width: 20,
                  height: 20,
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={feature.text}
              primaryTypographyProps={{
                variant: 'body2',
                sx: {
                  color: feature.available ? 'text.primary' : 'text.disabled',
                },
              }}
            />
          </ListItem>
        ))}
      </List>

      <Button
        fullWidth
        size="large"
        variant="soft"
        color="inherit"
        onClick={onButtonClick}
        sx={{ py: 1.5, fontWeight: 600 }}
      >
        {buttonText}
      </Button>
    </Card>
  );
}

export default function NewPricing() {
  const [selectedGrowthTier, setSelectedGrowthTier] = useState(0);
  const [proPlan, setProPlan] = useState(null);
  const [growthPlans, setGrowthPlans] = useState([]);
  const [enterprisePlan, setEnterprisePlan] = useState(null);
  const accountId = useSelector(selectAccountId);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await optimai.get(`/templates/pricing?only_main=${true}`);
        const data = response.data.pricing;

        if (data && data.length > 0) {
          const plans = data[0].plans.items;

          // Filter and organize plans
          const pro = plans.find((plan) => plan.name === 'Pro');
          const growth = plans
            .filter((plan) => plan.name.startsWith('Growth €'))
            .sort((a, b) => {
              const aPrice = parseInt(a.name.replace('Growth €', ''));
              const bPrice = parseInt(b.name.replace('Growth €', ''));
              return aPrice - bPrice;
            });
          const enterprise = plans.find((plan) => plan.name === 'Enterprise');

          setProPlan(pro);
          setGrowthPlans(growth);
          setEnterprisePlan(enterprise);
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
      }
    };
    fetchPricing();
  }, []);

  const handleGrowthTierChange = (event) => {
    setSelectedGrowthTier(event.target.value);
  };

  const getBillingOption = (plan, frequency) => {
    if (!plan || !plan.billing_options || !plan.billing_options.items) return null;
    return plan.billing_options.items.find((option) => option.billing_frequency === frequency);
  };

  const formatPrice = (priceInCents, frequency) => {
    const price = priceInCents / 100;
    // For yearly billing, show monthly equivalent
    return frequency === 'yearly' ? Math.round(price / 12) : Math.round(price);
  };

  const handleCheckout = async (billingOptionId) => {
    try {
      const response = await optimai_shop.get('/stripe/subscribe', {
        params: {
          account_id: accountId,
          billing_option_id: billingOptionId,
        },
        paramsSerializer: (params) => {
          return Object.entries(params)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return value.map((v) => `${key}=${v}`).join('&');
              }
              return `${key}=${value}`;
            })
            .join('&');
        },
      });

      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error initiating checkout:', error);
    }
  };

  const handleProClick = () => {
    const billingOption = getBillingOption(proPlan, 'monthly');
    if (billingOption) {
      handleCheckout(billingOption.id);
    }
  };

  const handleGrowthClick = () => {
    const selectedPlan = growthPlans[selectedGrowthTier];
    const billingOption = getBillingOption(selectedPlan, 'monthly');
    if (billingOption) {
      handleCheckout(billingOption.id);
    }
  };

  const handleEnterpriseClick = () => {
    window.open('https://calendly.com/david-altan/15-min-onboarding-agency-clone', '_blank');
  };

  const currentGrowthPlan = growthPlans[selectedGrowthTier];
  const proBillingOption = getBillingOption(proPlan, 'monthly');
  const growthBillingOption = getBillingOption(currentGrowthPlan, 'monthly');

  if (!proPlan || growthPlans.length === 0 || !enterprisePlan) {
    return (
      <Box sx={{ pt: 4 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            alignItems: 'start',
          }}
        >
          <SkeletonPricingCard />
          <SkeletonPricingCard
            highlighted
            sx={{ mt: { md: -2 } }}
          />
          <SkeletonPricingCard />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 4 }}>
      {/* Pricing Cards */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, 1fr)',
          },
          alignItems: 'start',
        }}
      >
        {/* Pro Plan */}
        <PricingCard
          title="Pro"
          price={proBillingOption ? formatPrice(proBillingOption.price, 'monthly') : 0}
          description={proPlan.description}
          priceSubtext={`€${proPlan.credits / 100} in monthly credits`}
          features={PRO_FEATURES}
          buttonText="Choose Plan"
          onButtonClick={handleProClick}
        />

        {/* Growth Plan */}
        <PricingCard
          title="Growth"
          price={growthBillingOption ? formatPrice(growthBillingOption.price, 'monthly') : 0}
          description={currentGrowthPlan?.description}
          priceSubtext={
            currentGrowthPlan ? `€${currentGrowthPlan.credits / 100} in monthly credits` : ''
          }
          features={GROWTH_FEATURES}
          buttonText="Choose Plan"
          highlighted
          onButtonClick={handleGrowthClick}
          sx={{ mt: { md: -2 } }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, fontWeight: 600 }}
            >
              Choose your credit tier:
            </Typography>
            <FormControl fullWidth>
              <Select
                value={selectedGrowthTier}
                onChange={handleGrowthTierChange}
                sx={{
                  '& .MuiSelect-select': {
                    py: 1.5,
                  },
                }}
              >
                {growthPlans.map((plan, index) => {
                  const billingOption = getBillingOption(plan, 'monthly');
                  const price = billingOption
                    ? formatPrice(billingOption.price, 'monthly')
                    : 0;

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
                          €{price}/mo
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          €{plan.credits / 100} credits
                        </Typography>
                      </Stack>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </PricingCard>

        {/* Enterprise Plan */}
        <PricingCard
          title="Enterprise"
          price="Custom"
          description={enterprisePlan.description}
          priceSubtext="Custom credit allocation"
          features={ENTERPRISE_FEATURES}
          buttonText="Book a Call"
          onButtonClick={handleEnterpriseClick}
        />
      </Box>
    </Box>
  );
}
