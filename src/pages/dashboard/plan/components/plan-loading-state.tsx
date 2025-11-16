import { memo } from 'react';

import Iconify from '@/components/iconify/Iconify';

interface PlanLoadingStateProps {
  message?: string;
}

export const PlanLoadingState = memo<PlanLoadingStateProps>(({ 
  message = 'Loading...' 
}: PlanLoadingStateProps) => (
  <div className="flex items-center justify-center min-h-[400px] p-8">
    <div className="flex items-center gap-2">
      <Iconify
        icon="lucide:loader-2"
        className="w-4 h-4 animate-spin text-neutral-600 dark:text-neutral-400"
      />
      <span className="text-xs text-neutral-600 dark:text-neutral-400">{message}</span>
    </div>
  </div>
));

PlanLoadingState.displayName = 'PlanLoadingState';

