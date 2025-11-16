import { memo } from 'react';

import type { Progress } from '../utils/plan-calculations';

interface PlanProgressBarProps {
  progress: Progress;
  showLabel?: boolean;
}

export const PlanProgressBar = memo<PlanProgressBarProps>(({ progress, showLabel = true }: PlanProgressBarProps) => (
  <div className="space-y-1">
    {showLabel && (
      <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
        <span>Progress</span>
        <span className="font-mono">
          {progress.completed}/{progress.total}
        </span>
      </div>
    )}
    <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-sm h-1 overflow-hidden">
      <div
        className="h-full bg-neutral-900 dark:bg-neutral-100 transition-all duration-300"
        style={{ width: `${progress.percentage}%` }}
      />
    </div>
  </div>
));

PlanProgressBar.displayName = 'PlanProgressBar';

