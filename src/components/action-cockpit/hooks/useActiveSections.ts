/**
 * useActiveSections Hook
 * Determines which sections should be displayed based on available data
 */

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectAuthorizationRequests, selectRoomId } from '../../../redux/slices/room/selectors/roomSelectors';
import { selectTasksByThread, selectPlanByThread, selectPlansByRoom } from '../../../redux/slices/tasks';
import type { SectionInfo } from '../types';

interface UseActiveSectionsProps {
  threadId: string;
  roomId?: string;
}

export const useActiveSections = ({ threadId, roomId }: UseActiveSectionsProps) => {
  const authorizations = useSelector(selectAuthorizationRequests);
  const tasks = useSelector((state) => selectTasksByThread(state, threadId));
  const planByThread = useSelector((state) => selectPlanByThread(state, threadId));
  const roomIdFromState = useSelector(selectRoomId);
  const effectiveRoomId = roomId || roomIdFromState;
  const plansByRoom = useSelector((state) => 
    effectiveRoomId ? selectPlansByRoom(state, effectiveRoomId) : []
  );
  
  const activeSections = useMemo(() => {
    const sections: SectionInfo[] = [];

    // Priority 1: Authorization Requests
    if (authorizations && authorizations.length > 0) {
      sections.push({
        type: 'authorization',
        count: authorizations.length,
        hasUrgent: true,
      });
    }

    // Priority 2: Plans awaiting approval
    // Check both thread-specific plans and room-wide plans
    const unapprovedPlans = plansByRoom.filter((p) => !p.is_approved);
    const hasUnapprovedThreadPlan = planByThread && !planByThread.is_approved;
    
    if (unapprovedPlans.length > 0 || hasUnapprovedThreadPlan) {
      const planCount = unapprovedPlans.length || (hasUnapprovedThreadPlan ? 1 : 0);
      sections.push({
        type: 'plans',
        count: planCount,
        hasUrgent: false,
      });
    }

    // Priority 3: Standalone Tasks
    if (tasks && tasks.length > 0) {
      sections.push({
        type: 'tasks',
        count: tasks.length,
        hasUrgent: false,
      });
    }

    // Priority 4: Clarifying Questions (will be implemented later)
    // TODO: Add clarifying questions detection

    return sections;
  }, [authorizations, tasks, planByThread, plansByRoom]);

  const totalItemCount = useMemo(() => {
    return activeSections.reduce((sum, section) => sum + section.count, 0);
  }, [activeSections]);

  const hasAnyItems = activeSections.length > 0;
  const hasUrgentItems = activeSections.some((s) => s.hasUrgent);

  return {
    activeSections,
    totalItemCount,
    hasAnyItems,
    hasUrgentItems,
  };
};

