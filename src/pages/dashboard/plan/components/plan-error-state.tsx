import { memo } from 'react';

import Iconify from '@/components/iconify/Iconify';

interface PlanErrorStateProps {
  error: string;
  onClose?: () => void;
}

export const PlanErrorState = memo<PlanErrorStateProps>(({ error, onClose }: PlanErrorStateProps) => (
  <div className="flex items-center justify-center min-h-[400px] p-8">
    <div className="flex flex-col items-center gap-3 text-center max-w-sm">
      <div className="w-10 h-10 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        <Iconify
          icon="lucide:alert-circle"
          className="w-5 h-5 text-neutral-900 dark:text-neutral-100"
        />
      </div>
      <div>
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
          Error loading plan
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
          {error}
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-2 h-8 text-xs rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  </div>
));

PlanErrorState.displayName = 'PlanErrorState';

