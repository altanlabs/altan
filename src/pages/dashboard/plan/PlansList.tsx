import { FileText } from 'lucide-react';
import { memo } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { PlanEmptyState } from './components/plan-empty-state';
import { PlanErrorState } from './components/plan-error-state';
import { PlanLoadingState } from './components/plan-loading-state';
import { PlansGrid } from './components/plans-grid';
import { usePlansData } from './hooks/use-plan-data';

interface PlansListProps {
  roomId: string;
}

const PlansList = memo<PlansListProps>(({ roomId }) => {
  const history = useHistory();
  const { altanerId } = useParams<{ altanerId: string }>();

  const { planIds, isLoading, error } = usePlansData(roomId);

  const handlePlanClick = (planId: string): void => {
    history.push(`/project/${altanerId}/plans/${planId}`);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full relative overflow-hidden pb-2 px-2">
        <div className="flex flex-col h-full overflow-auto border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-950">
          <PlanLoadingState message="Loading plans..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full relative overflow-hidden pb-2 px-2">
        <div className="flex flex-col h-full overflow-auto border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-950">
          <PlanErrorState error={error} />
        </div>
      </div>
    );
  }

  if (!planIds || planIds.length === 0) {
    return (
      <div className="w-full h-full relative overflow-hidden pb-2 px-2">
        <div className="flex flex-col h-full overflow-auto border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-950">
          <PlanEmptyState
            icon="lucide:file-text"
            title="No Plans Yet"
            description="Start a conversation in the chat to create your first plan"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden pb-2 px-2">
      <div className="flex flex-col h-full overflow-auto bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto w-full px-4 py-4">
          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-md bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-neutral-100 dark:text-neutral-900" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Plans
                </h1>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  View and manage all plans for this project
                </p>
              </div>
            </div>
          </div>

          {/* Plans Grid */}
          <PlansGrid planIds={planIds} onPlanClick={handlePlanClick} />
        </div>
      </div>
    </div>
  );
});

PlansList.displayName = 'PlansList';

export default PlansList;

