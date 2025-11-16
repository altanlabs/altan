import { memo, useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

import NPSFeedback from './NPSFeedback';
import PlanCompletionFeedback from './PlanCompletionFeedback';
import { updateLastActivity } from '../../lib/feedbackUtils';
import { selectCompletedPlanEvent } from '../../redux/slices/tasks/index.ts';

// ----------------------------------------------------------------------

/**
 * FeedbackManager - Orchestrates when to show different types of feedback
 *
 * Priority order:
 * 1. Plan completion feedback (highest priority)
 * 2. NPS feedback (periodic)
 */
const FeedbackManager = memo(() => {
  const [activeFeedback, setActiveFeedback] = useState(null);
  const completedPlanEvent = useSelector(selectCompletedPlanEvent);

  // Update last activity on mount and periodically
  useEffect(() => {
    updateLastActivity();

    const interval = setInterval(() => {
      updateLastActivity();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Handle plan completion feedback
  useEffect(() => {
    if (completedPlanEvent && !activeFeedback) {
      // Show plan completion feedback
      setActiveFeedback({
        type: 'plan_completion',
        planId: completedPlanEvent.planId,
      });
    }
  }, [completedPlanEvent, activeFeedback]);

  // Handle periodic NPS feedback
  useEffect(() => {
    // Only show NPS if no other feedback is active
    if (activeFeedback) return;

    // Wait a bit before showing NPS (30 seconds after page load)
    const npsTimer = setTimeout(() => {
      // Random chance to show NPS (20% chance when conditions are met)
      if (Math.random() < 0.2) {
        setActiveFeedback({
          type: 'nps',
        });
      }
    }, 30000);

    return () => clearTimeout(npsTimer);
  }, [activeFeedback]);

  const handleCloseFeedback = useCallback(() => {
    setActiveFeedback(null);
  }, []);

  // Render active feedback
  if (!activeFeedback) return null;

  if (activeFeedback.type === 'plan_completion') {
    return (
      <PlanCompletionFeedback
        planId={activeFeedback.planId}
        onClose={handleCloseFeedback}
      />
    );
  }

  if (activeFeedback.type === 'nps') {
    return <NPSFeedback onClose={handleCloseFeedback} />;
  }

  return null;
});

FeedbackManager.displayName = 'FeedbackManager';

export default FeedbackManager;
