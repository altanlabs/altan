import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';

import { useAuthContext } from '../../auth/useAuthContext.ts';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { analytics } from '../../lib/analytics';
import { selectAccountId } from '../../redux/slices/general/index.ts';
import { useSelector } from '../../redux/store.ts';
import { openUrl } from '../../utils/auth';
import { optimai_shop } from '../../utils/axios';

// ----------------------------------------------------------------------

// Discount Configuration
const DISCOUNT_CONFIG = {
  // Set to true to show the Pro plan discount (€25 -> €5)
  showProDiscount: false,
  originalPrice: 25,
  discountPrice: 5,
  discountLabel: 'First month offer',
};

const PRO_FEATURES = [
  { text: '25€ in credits included', available: true },
  { text: 'Autopilot mode', available: true },
  { text: 'Private projects', available: true },
  { text: 'Custom domains', available: true },
  { text: 'Voice AI Agents', available: true },
  { text: 'Community support', available: true },
  { text: 'Remove Altan branding', available: true },
];

const GROWTH_FEATURES = [
  { text: 'Everything in Pro', available: true },
  { text: 'Unlimited builders', available: true },
  { text: 'Enhanced support', available: true },
  { text: 'Shared database pools', available: true },
  { text: 'Team collaboration tools', available: true },
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

/**
 * Track checkout event for pricing plans
 */
const trackCheckoutEvent = (plan, billingOption, planType) => {
  try {
    const value = billingOption.price / 100; // Convert cents to euros
    const currency = 'EUR';

    // Track analytics event
    analytics.checkoutInitiated(planType, billingOption, {
      source: 'pricing_page',
      plan_id: plan.id,
      plan_name: plan.name,
      credits_included: plan.credits,
    });

    // Track with GA4 (existing)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency,
        value,
        items: [
          {
            item_id: plan.id,
            item_name: plan.name,
            item_category: 'subscription',
            item_variant: planType,
            price: value,
            quantity: 1,
          },
        ],
        plan_type: planType,
        billing_frequency: billingOption.billing_frequency,
        credits_included: plan.credits,
      });
    }

    // Track with Tracklution
    if (typeof window !== 'undefined' && window.tlq) {
      window.tlq('track', 'InitiateCheckout', {
        value,
        currency,
        plan_id: plan.id,
        plan_name: plan.name,
        plan_type: planType,
        billing_frequency: billingOption.billing_frequency,
        credits_included: plan.credits,
      });
    }

    // Track with Facebook Pixel (existing)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        value,
        currency: 'EUR',
      });
    }
  } catch (error) {
    console.error('Error tracking checkout event:', error);
  }
};

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
  loading = false,
  ...other
}) {
  return (
    <Card
      className={`relative p-8 transition-all duration-200 ${
        highlighted
          ? 'bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 shadow-xl scale-105 border-2 border-gray-900 dark:border-white'
          : 'bg-white dark:bg-gray-900/50 hover:shadow-lg border border-gray-200 dark:border-gray-800'
      }`}
      {...other}
    >
      {highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900">
          Most Popular
        </Badge>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>

        <div className="mt-4">
          {typeof price === 'string' ? (
            <div className="text-4xl font-bold text-gray-900 dark:text-white">{price}</div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">€{price}</span>
              <span className="text-lg text-gray-600 dark:text-gray-400">/mo</span>
            </div>
          )}
          {priceSubtext && <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{priceSubtext}</div>}
        </div>
      </div>

      {children}

      <div className="border-t border-gray-200 dark:border-gray-800 my-6" />

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                feature.available
                  ? 'text-green-600 dark:text-green-500'
                  : 'text-gray-300 dark:text-gray-700'
              }`}
            />
            <span
              className={`text-sm ${
                feature.available
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-400 dark:text-gray-600'
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onButtonClick}
        disabled={loading}
        className="w-full h-12 font-semibold"
        variant={highlighted ? 'default' : 'outline'}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          buttonText
        )}
      </Button>
    </Card>
  );
}

function SkeletonPricingCard({ highlighted = false }) {
  return (
    <Card className={`p-8 ${highlighted ? 'scale-105' : ''}`}>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-full mb-6" />
      <Skeleton className="h-12 w-24 mb-6" />
      <div className="space-y-3 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
      <Skeleton className="h-12 w-full" />
    </Card>
  );
}

export default function NewPricing() {
  const [selectedGrowthTier, setSelectedGrowthTier] = useState(0);
  const [proPlan, setProPlan] = useState(null);
  const [growthPlans, setGrowthPlans] = useState([]);
  const [enterprisePlan, setEnterprisePlan] = useState(null);
  const [isYearlyBilling, setIsYearlyBilling] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    pro: false,
    growth: false,
    enterprise: false,
  });
  const accountId = useSelector(selectAccountId);
  const { isAuthenticated } = useAuthContext();
  const history = useHistory();

  // Track pricing page view
  useEffect(() => {
    analytics.pageView('pricing_page', {
      is_authenticated: isAuthenticated,
      account_id: accountId,
    });
  }, [isAuthenticated, accountId]);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await optimai_shop.get(`/pricing`);
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

  const handleGrowthTierChange = (value) => {
    setSelectedGrowthTier(parseInt(value));
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
    // Check if user is authenticated
    if (!isAuthenticated || !accountId) {
      // Redirect to register page if not authenticated
      history.push('/auth/register');
      return;
    }

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

      // Open URL using platform-aware utility
      await openUrl(response.data.url);
    } catch (error) {
      console.error('Error initiating checkout:', error);
    }
  };

  const handleProClick = async () => {
    setLoadingStates((prev) => ({ ...prev, pro: true }));

    try {
      const billingFrequency = isYearlyBilling ? 'yearly' : 'monthly';
      const billingOption = getBillingOption(proPlan, billingFrequency);
      if (billingOption) {
        // Track checkout event
        trackCheckoutEvent(proPlan, billingOption, 'pro');
        await handleCheckout(billingOption.id);
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, pro: false }));
    }
  };

  const handleGrowthClick = async () => {
    setLoadingStates((prev) => ({ ...prev, growth: true }));

    try {
      const selectedPlan = growthPlans[selectedGrowthTier];
      const billingFrequency = isYearlyBilling ? 'yearly' : 'monthly';
      const billingOption = getBillingOption(selectedPlan, billingFrequency);
      if (billingOption) {
        // Track checkout event
        trackCheckoutEvent(selectedPlan, billingOption, 'growth');
        await handleCheckout(billingOption.id);
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, growth: false }));
    }
  };

  const handleEnterpriseClick = () => {
    setLoadingStates((prev) => ({ ...prev, enterprise: true }));

    try {
      // Track lead generation for enterprise plan
      analytics.generateLead('enterprise', {
        source: 'pricing_page',
        action: 'book_call',
        account_id: accountId,
        is_authenticated: isAuthenticated,
      });

      // Track with Tracklution
      if (typeof window !== 'undefined' && window.tlq) {
        window.tlq('track', 'Lead', {
          plan_type: 'enterprise',
          lead_source: 'pricing_page',
          action: 'book_call',
          account_id: accountId,
        });
      }

      // Track lead generation with GA4 (existing)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'generate_lead', {
          currency: 'EUR',
          value: 0, // No immediate value for lead generation
          plan_type: 'enterprise',
          lead_source: 'pricing_page',
          action: 'book_call',
        });
      }

      // Track with Facebook Pixel
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Lead', {
          content_name: 'enterprise_plan',
          content_category: 'pricing',
        });
      }

      window.open('https://calendar.app.google/UUVqnW9zmS8kzHvZA', '_blank');
    } catch (error) {
      console.error('Error tracking lead generation:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, enterprise: false }));
    }
  };

  const currentGrowthPlan = growthPlans[selectedGrowthTier];
  const billingFrequency = isYearlyBilling ? 'yearly' : 'monthly';
  const proBillingOption = getBillingOption(proPlan, billingFrequency);
  const growthBillingOption = getBillingOption(currentGrowthPlan, billingFrequency);

  if (!proPlan || growthPlans.length === 0 || !enterprisePlan) {
    return (
      <div className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          <SkeletonPricingCard />
          <SkeletonPricingCard highlighted />
          <SkeletonPricingCard />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Billing Toggle */}
      <div className="flex justify-center items-center gap-4 mb-8">
        <span className={`text-sm font-medium ${!isYearlyBilling ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
          Monthly
        </span>
        <Switch
          checked={isYearlyBilling}
          onCheckedChange={setIsYearlyBilling}
        />
        <span className={`text-sm font-medium ${isYearlyBilling ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
          Yearly
        </span>
        {isYearlyBilling && (
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
            Save ~17%
          </Badge>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {/* Pro Plan */}
        <PricingCard
          title="Pro"
          price={
            isAuthenticated && proBillingOption && isYearlyBilling
              ? formatPrice(proBillingOption.price, billingFrequency)
              : DISCOUNT_CONFIG.showProDiscount
                ? DISCOUNT_CONFIG.discountPrice
                : DISCOUNT_CONFIG.originalPrice
          }
          description={proPlan?.description}
          priceSubtext={
            isAuthenticated && proBillingOption && isYearlyBilling ? (
              <span>€{Math.round(proBillingOption.price / 100 / 12)}/mo billed yearly</span>
            ) : DISCOUNT_CONFIG.showProDiscount ? (
              <div className="flex items-center gap-2">
                <span className="line-through text-gray-400">€{DISCOUNT_CONFIG.originalPrice}/mo</span>
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                  {DISCOUNT_CONFIG.discountLabel}
                </Badge>
              </div>
            ) : null
          }
          features={PRO_FEATURES}
          buttonText="Choose Plan"
          loading={loadingStates.pro}
          onButtonClick={handleProClick}
        />

        {/* Growth Plan */}
        <PricingCard
          title="Growth"
          price={
            growthBillingOption
              ? formatPrice(growthBillingOption.price, billingFrequency)
              : 'Contact us'
          }
          description={currentGrowthPlan?.description}
          priceSubtext={
            growthBillingOption ? (
              <span className="text-green-600 dark:text-green-500 font-semibold">
                + €
                {Math.round(
                  currentGrowthPlan.credits / 100 -
                    formatPrice(growthBillingOption.price, billingFrequency),
                )}{' '}
                free credits
              </span>
            ) : null
          }
          features={GROWTH_FEATURES}
          buttonText="Choose Plan"
          highlighted={true}
          loading={loadingStates.growth}
          onButtonClick={handleGrowthClick}
        >
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">
              Choose your credit tier:
            </label>
            <Select value={selectedGrowthTier.toString()} onValueChange={handleGrowthTierChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {growthPlans.map((plan, index) => {
                  const billingOption = getBillingOption(plan, billingFrequency);
                  const price = billingOption
                    ? formatPrice(billingOption.price, billingFrequency)
                    : 0;

                  return (
                    <SelectItem key={plan.id} value={index.toString()}>
                      <div className="flex justify-between items-center w-full gap-8">
                        <span className="font-semibold">€{plan.credits / 100} credits</span>
                        <span className="text-green-600 dark:text-green-500 font-semibold">€{price}/mo</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </PricingCard>

        {/* Enterprise Plan */}
        <PricingCard
          title="Enterprise"
          price="Custom"
          description={enterprisePlan?.description}
          priceSubtext="Custom credit allocation"
          features={ENTERPRISE_FEATURES}
          buttonText="Book a Call"
          loading={loadingStates.enterprise}
          onButtonClick={handleEnterpriseClick}
        />
      </div>
    </div>
  );
}
