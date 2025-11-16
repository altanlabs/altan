import { Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import CreditPurchaseSection from '../../components/pricing/CreditPurchaseSection';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import {
  selectAccountId,
  selectAccountSubscriptions,
  selectAccountCreditBalance,
} from '../../redux/slices/general/index.ts';
import { openUrl } from '../../utils/auth';
import { optimai_shop } from '../../utils/axios';

// Feature lists for different plans
const GROWTH_FEATURES = [
  { text: 'Everything in your current plan', available: true },
  { text: 'Unlimited builders', available: true },
  { text: 'Whatsapp support', available: true },
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
        const response = await optimai_shop.get('/pricing');
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

  const handleGrowthTierChange = (value) => {
    setSelectedGrowthTier(parseInt(value));
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
    window.open('https://calendar.app.google/m56phyYffHxMzX6Y7', '_blank');
  };

  const currentGrowthPlan = filteredGrowthPlans[selectedGrowthTier];
  const growthBillingOption = getBillingOption(currentGrowthPlan, 'monthly');

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left side - Upgrade Options */}
        <div className="md:col-span-8 space-y-6">
          {filteredGrowthPlans.length > 0 && (
            <Card className="p-8 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Growth Plan
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Scale your operations with more credits and advanced features.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                  Choose your credit tier:
                </label>
                <Select value={selectedGrowthTier.toString()} onValueChange={handleGrowthTierChange}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredGrowthPlans.map((plan, index) => {
                      const billingOption = getBillingOption(plan, 'monthly');
                      const price = billingOption ? formatPrice(billingOption.price, 'monthly') : 0;

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

              {/* Current Selection Details */}
              {currentGrowthPlan && growthBillingOption && (
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      €{formatPrice(growthBillingOption.price, 'monthly')}
                    </span>
                    <span className="text-lg text-gray-600 dark:text-gray-400">/mo</span>
                  </div>

                  <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-6">
                    €{currentGrowthPlan.credits / 100} in monthly credits
                  </p>

                  <ul className="space-y-3 mb-6">
                    {GROWTH_FEATURES.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={handleUpgradeGrowth}
                    size="lg"
                    className="font-semibold px-8"
                  >
                    Upgrade to Growth
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* No Growth upgrades available */}
          {filteredGrowthPlans.length === 0 && (
            <Card className="p-8 text-center bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                You're on our highest Growth plan!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consider upgrading to Enterprise for more advanced features and dedicated support.
              </p>
            </Card>
          )}

          {/* Enterprise Plan */}
          {enterprisePlan && (
            <Card className="p-8 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Enterprise
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {enterprisePlan.description}
                  </p>

                  <ul className="space-y-3">
                    {ENTERPRISE_FEATURES.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-center flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                    Custom
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Custom credit allocation
                  </p>
                  <Button
                    onClick={handleEnterpriseContact}
                    className="font-semibold px-8"
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right side - Current Plan Info & Credit Purchase */}
        <div className="md:col-span-4">
          <Card className="p-4 sticky top-5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Your Current Plan
              </h3>
              <Badge className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-600 text-white">
                {currentPlan?.name || 'Unknown Plan'}
              </Badge>
            </div>

            <Separator className="my-4" />

            {/* Subscription Credits */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Subscription credits
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {usagePercentage}%
                </span>
              </div>

              <Progress
                value={usagePercentage}
                className="h-2 mb-3"
              />

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  €{Math.round((totalCredits - remainingCredits) / 100)} used
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  €{Math.round(remainingCredits / 100)} remaining
                </span>
              </div>
            </div>

            {/* Additional Credits */}
            {creditBalance > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Additional credits
                  </span>
                  <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                    Never expire
                  </Badge>
                </div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-500">
                  €{Math.round(creditBalance / 100)} available
                </div>
              </div>
            )}

            <Separator className="my-4" />

            <CreditPurchaseSection
              title="Buy More Credits"
              compact
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
