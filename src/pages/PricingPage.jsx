import { useSelector } from 'react-redux';

import { Separator } from '../components/ui/separator';
import Footer from '../layouts/dashboard/new/Footer';
import { selectIsAccountFree } from '../redux/slices/general';
import { NewPricing, PricingFAQ } from '../sections/pricing';
import SubscribedPricing from '../sections/pricing/SubscribedPricing';

// ----------------------------------------------------------------------

export default function PricingPage() {
  const isAccountFree = useSelector(selectIsAccountFree);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="mb-8 text-center space-y-4">
          <h1 className="text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
            {isAccountFree ? 'Pricing' : 'Manage Your Plan'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-normal max-w-3xl mx-auto">
            {isAccountFree
              ? 'Access pro features and get monthly credits to spend across AI agents, database and tasks.'
              : 'Upgrade your plan or purchase additional credits for your AI agents and workflows.'}
          </p>
        </div>

        {/* Conditionally render based on account type */}
        {isAccountFree ? <NewPricing /> : <SubscribedPricing />}

        <Separator className="my-20" />

        <PricingFAQ />

        <div className="mt-16 text-center mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Auto-recharge available • Cancel anytime • Soft-stop protection
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
