import axios, { type AxiosError } from 'axios';
import { useState, useCallback } from 'react';

import { setPlan } from '@/redux/slices/tasks';
import { useDispatch } from '@/redux/store';
import type { Plan } from '@/services/types';

interface UsePlanApprovalReturn {
  isApproving: boolean;
  error: string | null;
  approvePlan: (approve: boolean) => Promise<void>;
}

interface ErrorResponse {
  message?: string;
}

export const usePlanApproval = (plan: Plan): UsePlanApprovalReturn => {
  const dispatch = useDispatch();
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approvePlan = useCallback(
    async (approve: boolean) => {
      setIsApproving(true);
      setError(null);

      try {
        await axios.post(`https://cagi.altan.ai/plans/${plan.id}/approve`, {
          approve,
        });

        const updatedPlan: Plan = {
          ...plan,
          is_approved: approve,
        };

        dispatch(setPlan({ plan: updatedPlan }));

        // Track approval event if analytics is available
        if (typeof window !== 'undefined' && 'analytics' in window) {
          const analytics = (window as { analytics?: { track: (event: string, properties: Record<string, unknown>) => void } }).analytics;
          analytics?.track('approved_plan', {
            plan_id: plan.id,
            approved: approve,
            task_count: plan.tasks?.length ?? 0,
          });
        }
      } catch (err) {
        const axiosError = err as AxiosError<ErrorResponse>;
        const errorMessage = 
          axiosError.response?.data?.message ?? 
          axiosError.message ?? 
          'Failed to approve plan';
        setError(errorMessage);
      } finally {
        setIsApproving(false);
      }
    },
    [plan, dispatch]
  );

  return { isApproving, error, approvePlan };
};

