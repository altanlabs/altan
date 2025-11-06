import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage credit balance warning state
 * Tracks which warnings should be shown and handles dismissal via sessionStorage
 *
 * @param {number} creditBalance - Current credit balance in cents
 * @param {boolean} isAccountFree - Whether the account is on a free plan
 * @param {string} accountId - Account ID for sessionStorage keys
 * @returns {object} Warning state and dismiss handlers
 */
export const useCreditWarnings = (creditBalance, isAccountFree, accountId) => {
  const [showZeroBalanceWarning, setShowZeroBalanceWarning] = useState(false);
  const [showLowBalanceWarning, setShowLowBalanceWarning] = useState(false);

  // SessionStorage keys
  const zeroWarningKey = `credit-warning-dismissed-zero-${accountId}`;
  const lowWarningKey = `credit-warning-dismissed-low-${accountId}`;

  // Check if warning was dismissed in this session
  const isZeroWarningDismissed = useCallback(() => {
    if (typeof window === 'undefined' || !accountId) return false;
    return sessionStorage.getItem(zeroWarningKey) === 'true';
  }, [zeroWarningKey, accountId]);

  const isLowWarningDismissed = useCallback(() => {
    if (typeof window === 'undefined' || !accountId) return false;
    return sessionStorage.getItem(lowWarningKey) === 'true';
  }, [lowWarningKey, accountId]);

  // Update warning states based on credit balance
  useEffect(() => {
    if (!accountId || creditBalance === null || creditBalance === undefined) {
      setShowZeroBalanceWarning(false);
      setShowLowBalanceWarning(false);
      return;
    }

    // Zero balance warning (highest priority)
    if (creditBalance <= 0 && !isZeroWarningDismissed()) {
      setShowZeroBalanceWarning(true);
      setShowLowBalanceWarning(false);
      return;
    }

    // Low balance warning (only for subscribed users, not free accounts)
    if (creditBalance < 500 && !isAccountFree && !isLowWarningDismissed()) {
      setShowZeroBalanceWarning(false);
      setShowLowBalanceWarning(true);
      return;
    }

    // No warnings needed
    setShowZeroBalanceWarning(false);
    setShowLowBalanceWarning(false);
  }, [creditBalance, isAccountFree, accountId, isZeroWarningDismissed, isLowWarningDismissed]);

  // Dismiss zero balance warning
  const dismissZeroWarning = useCallback(() => {
    if (typeof window !== 'undefined' && accountId) {
      sessionStorage.setItem(zeroWarningKey, 'true');
      setShowZeroBalanceWarning(false);
    }
  }, [zeroWarningKey, accountId]);

  // Dismiss low balance warning
  const dismissLowWarning = useCallback(() => {
    if (typeof window !== 'undefined' && accountId) {
      sessionStorage.setItem(lowWarningKey, 'true');
      setShowLowBalanceWarning(false);
    }
  }, [lowWarningKey, accountId]);

  return {
    showZeroBalanceWarning,
    showLowBalanceWarning,
    dismissZeroWarning,
    dismissLowWarning,
  };
};

