import { AlertTriangle, TrendingDown } from 'lucide-react';
import { useHistory } from 'react-router-dom';

import { Button } from './ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

/**
 * Credit Balance Warning Dialog Component
 * Displays warnings when user runs out of credits or balance is low
 */
export default function CreditBalanceWarningDialog({
  showZeroBalanceWarning,
  showLowBalanceWarning,
  onDismissZero,
  onDismissLow,
}) {
  const history = useHistory();

  const handleViewUsage = () => {
    history.push('/usage');
    if (showZeroBalanceWarning) {
      onDismissZero();
    } else if (showLowBalanceWarning) {
      onDismissLow();
    }
  };

  const handleAddCredits = () => {
    history.push('/pricing');
    if (showZeroBalanceWarning) {
      onDismissZero();
    } else if (showLowBalanceWarning) {
      onDismissLow();
    }
  };

  const handleDismiss = () => {
    if (showZeroBalanceWarning) {
      onDismissZero();
    } else if (showLowBalanceWarning) {
      onDismissLow();
    }
  };

  // Zero Balance Warning (Higher Priority)
  if (showZeroBalanceWarning) {
    return (
      <Dialog open={true} onOpenChange={handleDismiss}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
              <DialogTitle className="text-xl">Out of Credits</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              You&apos;ve run out of credits and your cloud projects have been stopped. Add credits
              to resume your projects and continue building.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleViewUsage} className="w-full sm:w-auto">
              View Usage
            </Button>
            <Button onClick={handleAddCredits} className="w-full sm:w-auto">
              Add Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Low Balance Warning (Only for subscribed users)
  if (showLowBalanceWarning) {
    return (
      <Dialog open={true} onOpenChange={handleDismiss}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <TrendingDown className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
              </div>
              <DialogTitle className="text-xl">Low Credit Balance</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              Your credit balance is running low (less than €5). Your cloud projects will be
              stopped when your balance runs out. Consider adding more credits to avoid
              interruption.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleViewUsage} className="w-full sm:w-auto">
              View Usage
            </Button>
            <Button onClick={handleAddCredits} className="w-full sm:w-auto">
              Add Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
