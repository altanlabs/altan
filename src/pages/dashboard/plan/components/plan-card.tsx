import { Calendar, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { memo } from 'react';

import {
  selectPlanCreatedAt,
  selectPlanDescription,
  selectPlanProgress,
  selectPlanStats,
  selectPlanStatus,
  selectPlanTitle,
} from '@/redux/slices/tasks';
import { useSelector } from '@/redux/store';

import { PlanStatusBadge } from './plan-status-badge';
import { formatDate } from '../utils/plan-calculations';

interface PlanCardProps {
  planId: string;
  onClick: (planId: string) => void;
}

interface Progress {
  completed: number;
  total: number;
  percentage: number;
}

interface Stats {
  inProgress: number;
  pending: number;
  estimatedTime: string | null;
}

export const PlanCard = memo<PlanCardProps>(({ planId, onClick }: PlanCardProps) => {
  // Use cached selectors directly
  const title = useSelector((state) => selectPlanTitle(state, planId)) as string;
  const description = useSelector((state) => selectPlanDescription(state, planId)) as
    | string
    | undefined;
  const status = useSelector((state) => selectPlanStatus(state, planId)) as string;
  const progress = useSelector((state) => selectPlanProgress(state, planId)) as Progress;
  const stats = useSelector((state) => selectPlanStats(state, planId)) as Stats;
  const createdAt = useSelector((state) => selectPlanCreatedAt(state, planId)) as string | undefined;

  const { inProgress, pending } = stats;

  return (
    <button
      onClick={() => onClick(planId)}
      className="group w-full text-left bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-sm hover:shadow-md"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-900">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 line-clamp-1 flex-1">
            {title}
          </h3>
          <PlanStatusBadge status={status} />
        </div>

        {description && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="px-4 py-3 grid grid-cols-3 gap-3 border-b border-neutral-100 dark:border-neutral-900">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Done</span>
          </div>
          <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
            {progress.completed}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">
            <Loader2 className="w-3 h-3" />
            <span>Active</span>
          </div>
          <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
            {inProgress}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">
            <Circle className="w-3 h-3" />
            <span>Todo</span>
          </div>
          <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
            {pending}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400 mb-1.5 font-mono">
          <span>COMPLETION</span>
          <span className="font-semibold">{progress.percentage}%</span>
        </div>
        <div className="h-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-neutral-900 dark:bg-neutral-100 transition-all duration-500 rounded-full"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 dark:text-neutral-400 font-mono">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(createdAt)}</span>
        </div>
        <div className="text-[10px] font-semibold text-neutral-900 dark:text-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
          View Details →
        </div>
      </div>
    </button>
  );
});

PlanCard.displayName = 'PlanCard';

