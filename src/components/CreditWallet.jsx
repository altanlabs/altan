import { Button, Tooltip } from '@mui/material';
import { useState, memo } from 'react';
import { useSelector } from 'react-redux';

import UpgradeDialog from './dialogs/UpgradeDialog';
import Iconify from './iconify';
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

  return (
    <>
      <div className="flex items-center justify-between mx-4 py-1 mt-[-10px] backdrop-blur-sm border-b border-gray-200/30 dark:border-gray-700/30">
        <Tooltip title={getCreditTooltip()} arrow>
          <div className="flex items-center gap-2 cursor-help">
            <CreditPieChart creditPercentage={creditPercentage} isLowCredits={isLowCredits} />
            <span className={`text-sm font-bold ${getTextColor()}`}>
              {creditBalance.toFixed(0)} credits left
            </span>
          </div>
        </Tooltip>
        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="material-symbols:crown" />}
          onClick={handleUpgrade}
        >
          Upgrade
        </Button>
      </div>

      <UpgradeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default CreditWallet;
