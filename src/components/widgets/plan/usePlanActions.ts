import { useState, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from '../../../redux/store';
import { switchToThread } from '../../../redux/slices/room/thunks/threadThunks';
import { setPlan } from '../../../redux/slices/tasks';
import analytics from '../../../lib/analytics';
import { Plan, ApiTask } from './types';

interface UsePlanActionsProps {
  plan: Plan | null;
  planId: string;
  onDiscard?: (planId: string) => void;
}

export const usePlanActions = ({ plan, planId, onDiscard }: UsePlanActionsProps) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  const handleOpenSubthread = useCallback((task: ApiTask) => {
    const threadId = task.subthread_id || task.thread_id;
    const taskName = task.task_name || task.title || 'Task Thread';
    
    if (threadId) {
      dispatch(
        switchToThread({
          threadId,
          threadName: taskName,
        }),
      );
    }
  }, [dispatch]);

  const handleViewFullPlan = useCallback(() => {
    const match = location.pathname.match(/\/project\/([^/]+)/);
    const altanerId = match ? match[1] : null;

    if (!altanerId || !planId) {
      return;
    }

    history.push({
      pathname: `/project/${altanerId}/plans/${planId}`,
      search: '',
    });
  }, [location.pathname, planId, history]);

  const handleApprovePlan = useCallback(async (approve: boolean) => {
    if (!plan) return;

    setIsApproving(true);
    setApproveError(null);

    try {
      await axios.post(`https://cagi.altan.ai/plans/${planId}/approve`, {
        approve,
      });

      const updatedPlan: Plan = {
        ...plan,
        is_approved: approve,
        status: approve ? 'in_progress' : plan.status,
      };

      dispatch(setPlan({ plan: updatedPlan }));

      analytics.track('approved_plan', {
        plan_id: planId,
        approved: approve,
        task_count: plan.tasks?.length || 0,
      });

      if (approve) {
        handleViewFullPlan();
      }
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'Failed to approve plan';
      setApproveError(errorMessage);
    } finally {
      setIsApproving(false);
    }
  }, [plan, planId, dispatch, handleViewFullPlan]);

  const handleDiscard = useCallback(() => {
    if (onDiscard && planId) {
      analytics.track('discarded_plan', {
        plan_id: planId,
      });
      onDiscard(planId);
    }
  }, [planId, onDiscard]);

  return {
    isApproving,
    approveError,
    handleOpenSubthread,
    handleViewFullPlan,
    handleApprovePlan,
    handleDiscard,
  };
};

