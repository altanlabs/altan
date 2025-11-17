import React, { memo } from 'react';
import { ListChecks, BadgeCheck, Maximize2, CheckCircle2, Loader2, X } from 'lucide-react';
import { Plan } from './types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';

interface PlanHeaderProps {
  plan: Plan;
  isApproving: boolean;
  approveError: string | null;
  onViewFullPlan: () => void;
  onApprovePlan: (approve: boolean) => void;
  onDiscard?: () => void;
}

const PlanHeader: React.FC<PlanHeaderProps> = ({
  plan,
  isApproving,
  approveError,
  onViewFullPlan,
  onApprovePlan,
  onDiscard,
}) => {
  return (
    <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <ListChecks className="h-4 w-4 text-neutral-900 dark:text-neutral-100 flex-shrink-0" />
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {plan.title || 'Untitled Plan'}
            </h3>
          </div>
          {plan.description && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
              {plan.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {plan.is_approved ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md">
                    <BadgeCheck className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                    <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Approved</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Plan has been approved
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              {/* Discard Button - Only show if not approved */}
              {onDiscard && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onDiscard}
                        disabled={isApproving}
                        className="h-8 px-2 py-2 rounded-md text-xs font-medium transition-colors text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Discard plan"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Discard plan
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {/* Approve Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onApprovePlan(true)}
                      disabled={isApproving}
                      className="h-8 px-3 py-2 rounded-md text-xs font-medium transition-colors bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApproving ? (
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Approving...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Approve</span>
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Approve this plan
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          
          {/* View Full Plan Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onViewFullPlan}
                  className="h-8 px-3 py-2 rounded-md text-xs font-medium transition-colors bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="h-4 w-4" />
                    <span>Expand</span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                View full plan details
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Show error if approve fails */}
      {approveError && (
        <div className="mt-2 px-2 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs text-neutral-900 dark:text-neutral-100">
          {approveError}
        </div>
      )}
    </div>
  );
};

export default memo(PlanHeader);

