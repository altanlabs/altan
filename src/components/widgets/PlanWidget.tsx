import React, { memo, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from '../../redux/store';
import {
  fetchPlan,
  selectPlanById,
  selectPlanLoading,
  selectPlanError,
} from '../../redux/slices/tasks';
import { PlanWidgetProps } from './plan/types';
import { sortTasksByPriority } from './plan/taskUtils';
import { usePlanActions } from './plan/usePlanActions';
import PlanHeader from './plan/PlanHeader';
import TaskRow from './plan/TaskRow';
import Shimmer from './plan/Shimmer';
import { LoadingState, ErrorState } from './plan/PlanStates';

const PlanWidget: React.FC<PlanWidgetProps> = ({ planId, onDiscard }) => {
  const dispatch = useDispatch();
  const plan = useSelector((state) => selectPlanById(state, planId));
  const isLoading = useSelector(selectPlanLoading(planId));
  const error = useSelector(selectPlanError(planId));

  const {
    isApproving,
    approveError,
    handleOpenSubthread,
    handleViewFullPlan,
    handleApprovePlan,
    handleDiscard,
  } = usePlanActions({ plan, planId, onDiscard });

  useEffect(() => {
    if (planId && !plan && !isLoading && !error) {
      dispatch(fetchPlan(planId));
    }
  }, [planId, plan, isLoading, error, dispatch]);

  const sortedTasks = useMemo(
    () => sortTasksByPriority(plan?.tasks || []),
    [plan?.tasks]
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  if (!plan) {
    return null;
  }

  const isUnapproved = !plan.is_approved;

  return (
    <div className="w-full max-w-[700px] mx-auto my-4">
      <div className="relative bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-sm overflow-hidden">
        {/* Shimmer effect for unapproved plans */}
        {isUnapproved && <Shimmer />}
        
        <PlanHeader
          plan={plan}
          isApproving={isApproving}
          approveError={approveError}
          onViewFullPlan={handleViewFullPlan}
          onApprovePlan={handleApprovePlan}
          onDiscard={handleDiscard}
        />

        {sortedTasks.length > 0 && (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {sortedTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onOpenThread={handleOpenSubthread}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(PlanWidget);

