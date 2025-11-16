import { memo } from 'react';

import { PlanCard } from './plan-card';

interface PlansGridProps {
  planIds: string[];
  onPlanClick: (planId: string) => void;
}

export const PlansGrid = memo<PlansGridProps>(({ planIds, onPlanClick }: PlansGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {planIds.map((planId) => (
      <PlanCard key={planId} planId={planId} onClick={onPlanClick} />
    ))}
  </div>
));

PlansGrid.displayName = 'PlansGrid';

