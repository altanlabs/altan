/**
 * Plans Section
 * Displays plans awaiting approval within the action cockpit
 */

import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { ChevronRight, FileText } from 'lucide-react';
import { selectPlanByThread, selectPlansByRoom } from '../../../redux/slices/tasks';
import { selectRoomId } from '../../../redux/slices/room/selectors/roomSelectors';

interface PlansSectionProps {
  threadId: string;
  roomId?: string;
  onOpenPlan: (planId: string) => void;
}

const PlansSection: React.FC<PlansSectionProps> = ({ threadId, roomId, onOpenPlan }) => {
  const planByThread = useSelector((state) => selectPlanByThread(state, threadId));
  const roomIdFromState = useSelector(selectRoomId);
  const effectiveRoomId = roomId || roomIdFromState;
  const plansByRoom = useSelector((state) => 
    effectiveRoomId ? selectPlansByRoom(state, effectiveRoomId) : []
  );

  // Collect all unapproved plans
  const unapprovedPlans = plansByRoom.filter((p) => !p.is_approved);
  
  // Also include thread-specific plan if unapproved
  if (planByThread && !planByThread.is_approved && !unapprovedPlans.find(p => p.id === planByThread.id)) {
    unapprovedPlans.push(planByThread);
  }

  // Only show if there are unapproved plans
  if (unapprovedPlans.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {unapprovedPlans.map((plan) => {
        const taskCount = plan.tasks?.length || 0;
        const completedCount = plan.tasks?.filter(t => 
          t.status === 'completed' || t.status === 'done'
        ).length || 0;
        const description = plan.description;
        
        // Truncate description to first sentence or 60 chars
        let shortDesc = description;
        if (shortDesc) {
          const firstSentence = shortDesc.split(/[.!?]/)[0];
          shortDesc = firstSentence.length > 60 
            ? firstSentence.slice(0, 60) + '...' 
            : firstSentence;
        }
        
        return (
          <button
            key={plan.id}
            onClick={() => onOpenPlan(plan.id)}
            className="cockpit-shimmer w-full px-2 py-1.5 flex items-center justify-between gap-2 border border-neutral-200 dark:border-neutral-800 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-left group"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/30">
                <FileText className="cockpit-pulse h-3 w-3 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {plan.title || 'Untitled Plan'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {taskCount > 0 && (
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-500 font-mono">
                      {completedCount}/{taskCount} task{taskCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {shortDesc && (
                    <>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-600">·</span>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-500 truncate">
                        {shortDesc}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="h-3 w-3 text-neutral-400 dark:text-neutral-600 flex-shrink-0 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors" />
          </button>
        );
      })}
    </div>
  );
};

export default memo(PlansSection);
export { PlansSection };

