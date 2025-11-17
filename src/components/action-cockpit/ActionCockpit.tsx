/**
 * Action Cockpit Component
 * Unified control center for all pending actions: Authorization, Plans, Tasks, Questions
 */

import React, { memo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { CockpitHeader } from './components/CockpitHeader';
import { SectionDivider } from './components/SectionDivider';
import { AuthorizationSection } from './sections/AuthorizationSection';
import { PlansSection } from './sections/PlansSection';
import { TasksSection } from './sections/TasksSection';
import { QuestionsSection } from './sections/QuestionsSection';
import { useCockpitState } from './hooks/useCockpitState';
import { useActiveSections } from './hooks/useActiveSections';
import { useVisibilityOptimization } from '../authorization-requests/hooks/useVisibilityOptimization';
import { selectAccountId } from '../../redux/slices/general/index';
import { fetchPlansByRoomId, fetchTasks } from '../../redux/slices/tasks';
import type { ActionCockpitProps } from './types';

import './styles.css';

const ActionCockpit: React.FC<ActionCockpitProps> = ({ threadId, roomId }) => {
  const accountId = useSelector(selectAccountId);
  const history = useHistory();
  const dispatch = useDispatch();
  
  // Pause animations when not visible for performance
  const containerRef = useVisibilityOptimization();

  // Fetch room plans and tasks on mount
  useEffect(() => {
    if (roomId) {
      dispatch(fetchPlansByRoomId(roomId));
    }
    if (threadId) {
      dispatch(fetchTasks(threadId));
    }
  }, [roomId, threadId, dispatch]);

  const { isExpanded, toggleExpanded } = useCockpitState(true);
  const { activeSections, totalItemCount, hasAnyItems } = useActiveSections({ threadId, roomId });

  // Don't render if no pending items
  if (!hasAnyItems) {
    return null;
  }

  const handleOpenPlan = (planId: string) => {
    // Navigate to plan view (opens PlanWidget in full view)
    const currentPath = history.location.pathname;
    const match = currentPath.match(/\/project\/([^/]+)/);
    const altanerId = match ? match[1] : null;

    if (altanerId && planId) {
      history.push({
        pathname: `/project/${altanerId}/plans/${planId}`,
        search: '',
      });
    }
  };

  const sectionsByType = activeSections.reduce((acc, section) => {
    acc[section.type] = true;
    return acc;
  }, {} as Record<string, boolean>);

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-[95%] sm:w-[95%] md:w-[96%] max-w-[520px] mx-auto mb-2"
    >
      {/* Unified Header */}
      <CockpitHeader
        isExpanded={isExpanded}
        onToggleExpand={toggleExpanded}
        activeSections={activeSections}
      />

      {/* Expandable Sections Container */}
      {isExpanded && (
        <div className="mt-1 max-h-[400px] overflow-y-auto space-y-1 pr-0.5">
          {/* Priority 1: Authorization Requests */}
          {sectionsByType.authorization && (
            <>
              <AuthorizationSection accountId={accountId} />
              {(sectionsByType.plans || sectionsByType.tasks || sectionsByType.questions) && (
                <SectionDivider />
              )}
            </>
          )}

          {/* Priority 2: Plans awaiting approval */}
          {sectionsByType.plans && (
            <>
              <PlansSection threadId={threadId} roomId={roomId} onOpenPlan={handleOpenPlan} />
              {(sectionsByType.tasks || sectionsByType.questions) && <SectionDivider />}
            </>
          )}

          {/* Priority 3: Standalone Tasks */}
          {sectionsByType.tasks && (
            <>
              <TasksSection threadId={threadId} />
              {sectionsByType.questions && <SectionDivider />}
            </>
          )}

          {/* Priority 4: Clarifying Questions */}
          {sectionsByType.questions && (
            <QuestionsSection threadId={threadId} />
          )}
        </div>
      )}
    </div>
  );
};

export default memo(ActionCockpit);
export { ActionCockpit };

