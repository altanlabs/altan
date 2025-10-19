import axios from 'axios';
import { memo, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import PlanHeader from '../../components/plan/PlanHeader';
import PlanRoadmap from '../../components/plan/PlanRoadmap';
import { PlanError, PlanLoading } from '../../components/plan/PlanStates';
import { calculateProgress, sortTasksByPriority } from '../../components/plan/planUtils';
import { switchToThread } from '../../redux/slices/room';
import { fetchPlan, selectPlanById, selectPlanError, selectPlanLoading, setPlan } from '../../redux/slices/tasks';
import { useDispatch, useSelector } from '../../redux/store';

const Plan = ({ planId }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const plan = useSelector(selectPlanById(planId));
  const isLoading = useSelector(selectPlanLoading(planId));
  const error = useSelector(selectPlanError(planId));
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState(null);

  useEffect(() => {
    if (planId && !plan && !isLoading && !error) {
      dispatch(fetchPlan(planId));
    }
  }, [planId, plan, isLoading, error, dispatch]);

  const sortedTasks = useMemo(() => sortTasksByPriority(plan?.tasks), [plan?.tasks]);
  const progress = useMemo(() => calculateProgress(sortedTasks), [sortedTasks]);

  const handleOpenSubthread = (task) => {
    if (task.subthread_id) {
      dispatch(
        switchToThread({
          threadId: task.subthread_id,
          threadName: task.task_name || 'Task Thread',
        }),
      );
    }
  };

  const handleClose = () => {
    history.goBack();
  };

  const handleApprovePlan = async (approve) => {
    if (!plan) return;

    setIsApproving(true);
    setApproveError(null);

    try {
      await axios.post(`https://cagi.altan.ai/plans/${planId}/approve`, {
        approve,
      });

      const updatedPlan = {
        ...plan,
        is_approved: approve,
        status: approve ? 'approved' : plan.status,
      };

      dispatch(setPlan({ plan: updatedPlan }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to approve plan';
      setApproveError(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return <PlanLoading />;
  }

  if (error) {
    return <PlanError error={error} onClose={handleClose} />;
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="w-full h-full relative overflow-hidden pb-2 px-2">
      <div className="flex flex-col h-full overflow-auto border border-divider rounded-xl">
        <div className="max-w-5xl mx-auto w-full p-6">
          <PlanHeader
            plan={plan}
            isApproving={isApproving}
            onApprove={handleApprovePlan}
            onClose={handleClose}
          />

          {approveError && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl text-sm text-red-700 dark:text-red-300">
              {approveError}
            </div>
          )}

          <PlanRoadmap tasks={sortedTasks} progress={progress} onOpenSubthread={handleOpenSubthread} />
        </div>
      </div>
    </div>
  );
};

export default memo(Plan);
