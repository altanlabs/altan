import { memo } from 'react';

import Iconify from '@/components/iconify/Iconify';

interface PlanEmptyStateProps {
  title: string;
  description: string;
  icon?: string;
}

export const PlanEmptyState = memo<PlanEmptyStateProps>(({ 
  title, 
  description, 
  icon = 'lucide:file-text' 
}: PlanEmptyStateProps) => (
  <div className="flex items-center justify-center min-h-[400px] p-8">
    <div className="flex flex-col items-center gap-3 text-center max-w-sm">
      <div className="w-10 h-10 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        <Iconify
          icon={icon}
          className="w-5 h-5 text-neutral-500 dark:text-neutral-400"
        />
      </div>
      <div>
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
          {title}
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      </div>
    </div>
  </div>
));

PlanEmptyState.displayName = 'PlanEmptyState';

