import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { memo } from 'react';

import {
  selectPlanDescription,
  selectPlanIsApproved,
  selectPlanTitle,
} from '@/redux/slices/tasks';
import { useSelector } from '@/redux/store';

interface PlanHeaderProps {
  planId: string;
  isApproving: boolean;
  onApprove: (approve: boolean) => void;
  onClose: () => void;
}

export const PlanHeader = memo<PlanHeaderProps>(
  ({ planId, isApproving, onApprove, onClose }: PlanHeaderProps) => {
    // Use cached selectors directly
    const title = useSelector((state) => selectPlanTitle(state, planId)) as string;
    const description = useSelector((state) => selectPlanDescription(state, planId)) as
      | string
      | undefined;
    const isApproved = useSelector((state) => selectPlanIsApproved(state, planId)) as boolean;

    return (
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md p-4 mb-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h1>
            {description && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Approve Button */}
            {!isApproved && (
              <button
                onClick={() => onApprove(true)}
                disabled={isApproving}
                className="h-8 px-3 py-2 rounded-md text-xs font-semibold transition-colors bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5 uppercase tracking-wider"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Approving</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </>
                )}
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors inline-flex items-center justify-center"
            >
              <X className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        </div>
      </div>
    );
  },
);

PlanHeader.displayName = 'PlanHeader';

