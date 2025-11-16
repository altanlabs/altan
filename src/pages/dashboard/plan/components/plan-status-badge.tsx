import { memo } from 'react';

import type { PlanStatus } from '@/services/types';

import { getPlanStatusColor } from '../utils/plan-status';

interface PlanStatusBadgeProps {
  status: PlanStatus;
}

export const PlanStatusBadge = memo<PlanStatusBadgeProps>(({ status }: PlanStatusBadgeProps) => {
  if (!status) return null;

  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${getPlanStatusColor(status)}`}
    >
      {status}
    </span>
  );
});

PlanStatusBadge.displayName = 'PlanStatusBadge';

