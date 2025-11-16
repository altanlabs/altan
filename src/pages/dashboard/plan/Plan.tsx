import { memo, useEffect, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { switchToThread } from '@/redux/slices/room/thunks/threadThunks';
import {
  fetchPlan,
  selectPlanById,
  selectPlanError,
  selectPlanLoading,
  selectCompletedPlanEvent,
  clearPlanCompleted,
} from '@/redux/slices/tasks';
import { useDispatch, useSelector } from '@/redux/store';
import type { Plan as PlanType } from '@/services/types';

import { PlanErrorState } from './components/plan-error-state';
import { PlanHeader } from './components/plan-header';
import { PlanLoadingState } from './components/plan-loading-state';
import { PlanRoadmap } from './components/plan-roadmap';
import { usePlanApproval } from './hooks/use-plan-approval';
import type { TaskStatusFilter } from './types';

interface PlanProps {
  planId: string;
  altanerId: string;
}

const Plan = memo<PlanProps>(({ planId, altanerId }: PlanProps) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>(null);
  const scrollContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      // Pass the scroll container to child components via custom event or context if needed
      // For now, the child will find its scrolling parent
    }
  }, []);

  const plan = useSelector((state) => selectPlanById(state, planId));
  const isLoading = useSelector(selectPlanLoading(planId));
  const error = useSelector(selectPlanError(planId));
  const completedPlanEvent = useSelector(selectCompletedPlanEvent);

  // Only initialize approval hook when plan is available
  const hasPlan = plan !== null && plan !== undefined;
  
  // Create a fallback plan to avoid non-null assertion
  const planForHook: PlanType = plan ?? {
    id: '',
    room_id: '',
    title: '',
    description: '',
    status: 'pending',
    is_approved: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tasks: [],
  };
  
  const { isApproving, error: approveError, approvePlan } = usePlanApproval(planForHook);

  useEffect(() => {
    if (planId && !plan && !isLoading && !error) {
      void dispatch(fetchPlan(planId));
    }
  }, [planId, plan, isLoading, error, dispatch]);

  // Auto-redirect when plan is completed via websocket event
  useEffect(() => {
    if (completedPlanEvent && completedPlanEvent.planId === planId && altanerId) {
      dispatch(clearPlanCompleted());
      history.push(`/project/${altanerId}`);
    }
  }, [completedPlanEvent, planId, altanerId, history, dispatch]);

  const handleOpenSubthread = useCallback(
    (_taskId: string, threadId: string) => {
      void dispatch(
        switchToThread({
          threadId,
          threadName: 'Task Thread',
        }),
      );
    },
    [dispatch],
  );

  const handleClose = useCallback(() => {
    history.goBack();
  }, [history]);

  if (isLoading) {
    return (
      <div className="w-full h-full relative overflow-hidden pb-2 px-2">
        <div className="flex flex-col h-full overflow-auto border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-950">
          <PlanLoadingState message="Loading plan..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full relative overflow-hidden pb-2 px-2">
        <div className="flex flex-col h-full overflow-auto border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-950">
          <PlanErrorState error={error} onClose={handleClose} />
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="w-full h-full relative overflow-hidden pb-2 px-2">
      <div 
        ref={scrollContainerRef}
        className="flex flex-col h-full overflow-auto bg-neutral-50 dark:bg-neutral-950"
      >
        <div className="max-w-6xl mx-auto w-full px-4 py-4">
          <PlanHeader
            planId={planId}
            isApproving={isApproving && hasPlan}
            onApprove={(approve: boolean) => void approvePlan(approve)}
            onClose={handleClose}
          />

          {approveError && (
            <div className="mb-4 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md text-xs text-neutral-900 dark:text-neutral-100">
              {approveError}
            </div>
          )}

          <PlanRoadmap 
            planId={planId} 
            onOpenSubthread={handleOpenSubthread}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      </div>
    </div>
  );
});

Plan.displayName = 'Plan';

export default Plan;

