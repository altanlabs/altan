import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { updateAccountCreditBalance, selectAccountId } from '../redux/slices/general';
import { optimai } from '../utils/axios';

/**
 * Custom hook to poll the credit balance every 30 seconds
 * @param {boolean} enabled - Whether to enable polling (default: true)
 * @returns {void}
 */
export const useCreditBalancePolling = (enabled = true) => {
  const dispatch = useDispatch();
  const accountId = useSelector(selectAccountId);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled || !accountId) {
      return;
    }

    const fetchCreditBalance = async () => {
      try {
        const response = await optimai.get(`/account/${accountId}/credit-balance`);
        if (response.data?.credit_balance !== undefined) {
          dispatch(updateAccountCreditBalance(response.data.credit_balance));
        }
      } catch (error) {
        console.error('Error fetching credit balance:', error);
      }
    };

    // Fetch immediately on mount
    fetchCreditBalance();

    // Set up polling every 30 seconds
    intervalRef.current = setInterval(fetchCreditBalance, 30000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, accountId, dispatch]);
};
