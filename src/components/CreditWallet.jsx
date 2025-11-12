import { useState, memo } from 'react';
import { useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import UpgradeDialog from './dialogs/UpgradeDialog';
import { selectAccountCreditBalance, selectAccountSubscriptions } from '../redux/slices/general';
import { useCreditBalancePolling } from '../hooks/useCreditBalancePolling';

// Mini pie chart component for credit usage
const CreditPieChart = memo(({ creditPercentage, isLowCredits }) => {
  const size = 20;
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;

  // Cap the visual progress at 100% for the chart display
  const displayPercentage = Math.min(creditPercentage, 100);
  const strokeDashoffset = circumference - (displayPercentage / 100) * circumference;

  const getProgressColor = () => {
    if (isLowCredits) return 'text-red-500 dark:text-red-400';
    if (creditPercentage >= 75) return 'text-orange-500 dark:text-orange-400';
    return 'text-blue-500 dark:text-blue-400';
  };

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-gray-300 dark:text-gray-600"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className={getProgressColor()}
      />
    </svg>
  );
});
CreditPieChart.displayName = 'CreditPieChart';

const CreditWallet = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const accountCreditBalance = useSelector(selectAccountCreditBalance);
  const activeSubscriptions = useSelector(selectAccountSubscriptions);

  // Enable real-time credit balance polling
  useCreditBalancePolling(true);

  const handleUpgrade = () => {
    setDialogOpen(true);
  };

  // Calculate credit balance in credits
  const creditBalance = accountCreditBalance ?? 0;
  
  // Get subscription info for pie chart
  const subscription = activeSubscriptions?.[0];
  const totalCredits = subscription?.billing_option?.plan?.credits ?? 500; // Free tier default
  const remainingCredits = subscription?.credit_balance ?? creditBalance;
  const usedCredits = Math.max(0, totalCredits - remainingCredits);
  const isLowCredits = creditBalance < 500;
  
  // Calculate percentage of credits used
  const creditPercentage = totalCredits > 0 ? Math.round((usedCredits / totalCredits) * 100) : 0;

  const getTextColor = () => {
    if (isLowCredits) return 'text-red-600 dark:text-red-400';
    if (creditPercentage >= 75) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-700 dark:text-gray-300';
  };

  // Format credit count for display
  const formatCredits = (credits) => {
    if (credits >= 1000000) {
      return `${(credits / 1000000).toFixed(1)}M`;
    } else if (credits >= 1000) {
      return `${(credits / 1000).toFixed(1)}K`;
    }
    return credits.toString();
  };

  const getCreditTooltip = () => {
    const formattedTotal = formatCredits(totalCredits);
    const formattedRemaining = formatCredits(creditBalance);
    const formattedUsed = formatCredits(usedCredits);

    if (isLowCredits) {
      return `${formattedRemaining} of ${formattedTotal} credits remaining (${formattedUsed} used). Running low - consider upgrading.`;
    }
    if (creditPercentage >= 75) {
      return `${formattedRemaining} of ${formattedTotal} credits remaining (${formattedUsed} used). ${creditPercentage}% used.`;
    }
    return `${formattedRemaining} of ${formattedTotal} credits remaining`;
  };

  // Only render if credits are below 500
  if (creditBalance >= 500) {
    return null;
  }

  return (
    <>
      <TooltipProvider delayDuration={100}>
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200/20 dark:border-gray-700/20">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <CreditPieChart creditPercentage={creditPercentage} isLowCredits={isLowCredits} />
                <span className={`text-xs font-semibold ${getTextColor()}`}>
                  {formatCredits(creditBalance)} credits left
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{getCreditTooltip()}</p>
            </TooltipContent>
          </Tooltip>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleUpgrade}
            className="h-7 px-2 text-xs gap-1 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
            </svg>
            Upgrade
          </Button>
        </div>
      </TooltipProvider>

      <UpgradeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default CreditWallet;
