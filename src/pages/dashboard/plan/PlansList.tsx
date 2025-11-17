import { FileText } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { selectPlanById } from '@/redux/slices/tasks';
import { useSelector } from '@/redux/store';
import type { Plan } from '@/services/types';

import { PlanEmptyState } from './components/plan-empty-state';
import { PlanErrorState } from './components/plan-error-state';
import { PlanLoadingState } from './components/plan-loading-state';
import { PlanSearchBar } from './components/plan-search-bar';
import { PlanStatsSection } from './components/plan-stats-section';
import { PlansGrid } from './components/plans-grid';
import { usePlansData } from './hooks/use-plan-data';

interface PlansListProps {
  roomId: string;
}

const PlansList = memo<PlansListProps>(({ roomId }) => {
  const history = useHistory<{ from?: string }>();
  const { altanerId } = useParams<{ altanerId: string }>();
  const [searchQuery, setSearchQuery] = useState('');

  const { planIds, isLoading, error } = usePlansData(roomId);

  // Get all plans for filtering
  const plans = useSelector((state) => {
    return planIds
      .map((id) => selectPlanById(state, id))
      .filter((p): p is Plan => p !== null);
  });

  // Filter plans based on search query
  const filteredPlanIds = useMemo(() => {
    if (!searchQuery.trim()) {
      return planIds;
    }

    const query = searchQuery.toLowerCase();
    return plans
      .filter((plan) => {
        const titleMatch = plan.title?.toLowerCase().includes(query);
        const descriptionMatch = plan.description?.toLowerCase().includes(query);
        return titleMatch || descriptionMatch;
      })
      .map((plan) => plan.id);
  }, [planIds, plans, searchQuery]);

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

  const hasFilteredResults = filteredPlanIds.length > 0;
  const isFiltering = searchQuery.trim().length > 0;

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

          {/* Statistics Section */}
          <PlanStatsSection roomId={roomId} />

          {/* Search Bar */}
          <div className="mb-5">
            <PlanSearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Plans Grid or Empty State */}
          {hasFilteredResults ? (
            <PlansGrid planIds={filteredPlanIds} onPlanClick={handlePlanClick} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-12 h-12 rounded-md bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
              </div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                {isFiltering ? 'No plans found' : 'No Plans Yet'}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center max-w-sm">
                {isFiltering
                  ? `No plans match "${searchQuery}". Try a different search term.`
                  : 'Start a conversation in the chat to create your first plan'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

PlansList.displayName = 'PlansList';

export default PlansList;

