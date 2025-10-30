// Feedback tracking utilities
const FEEDBACK_STATE_KEY = 'altan-feedback-state';

/**
 * Get the current feedback state from localStorage
 */
export const getFeedbackState = () => {
  try {
    const state = localStorage.getItem(FEEDBACK_STATE_KEY);
    return state
      ? JSON.parse(state)
      : {
          lastNPSShown: null,
          npsDismissCount: 0,
          feedbackGiven: {},
          lastFeedbackDate: null,
          totalFeedbackGiven: 0,
          npsScore: null,
          lastNPSScore: null,
        };
  } catch (error) {
    console.error('Error reading feedback state:', error);
    return {
      lastNPSShown: null,
      npsDismissCount: 0,
      feedbackGiven: {},
      lastFeedbackDate: null,
      totalFeedbackGiven: 0,
      npsScore: null,
      lastNPSScore: null,
    };
  }
};

/**
 * Save feedback state to localStorage
 */
export const saveFeedbackState = (state) => {
  try {
    localStorage.setItem(FEEDBACK_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving feedback state:', error);
  }
};

/**
 * Check if we should show NPS survey
 */
export const shouldShowNPS = () => {
  const state = getFeedbackState();

  // Don't show if dismissed too many times
  if (state.npsDismissCount >= 3) {
    return false;
  }

  // Don't show if shown recently (7 days)
  if (state.lastNPSShown) {
    const daysSinceLastNPS = Math.floor(
      (Date.now() - new Date(state.lastNPSShown).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceLastNPS < 7) {
      return false;
    }
  }

  // Don't show too frequently (14 days minimum for any feedback)
  if (state.lastFeedbackDate) {
    const daysSinceLastFeedback = Math.floor(
      (Date.now() - new Date(state.lastFeedbackDate).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceLastFeedback < 14) {
      return false;
    }
  }

  return true;
};

/**
 * Check if feedback has been given for a specific item
 */
export const hasFeedbackBeenGiven = (feedbackKey) => {
  const state = getFeedbackState();
  return state.feedbackGiven[feedbackKey] === true;
};

/**
 * Mark feedback as given for a specific item
 */
export const markFeedbackGiven = (feedbackKey, metadata = {}) => {
  const state = getFeedbackState();
  state.feedbackGiven[feedbackKey] = true;
  state.lastFeedbackDate = new Date().toISOString();
  state.totalFeedbackGiven += 1;

  // Store additional metadata if provided
  if (metadata.isNPS) {
    state.lastNPSShown = new Date().toISOString();
    state.npsDismissCount = 0; // Reset dismiss count when feedback is given
    if (metadata.score !== undefined) {
      state.lastNPSScore = metadata.score;
    }
  }

  saveFeedbackState(state);
};

/**
 * Mark feedback as dismissed
 */
export const markFeedbackDismissed = (feedbackType) => {
  const state = getFeedbackState();
  state.lastFeedbackDate = new Date().toISOString();

  if (feedbackType === 'nps') {
    state.lastNPSShown = new Date().toISOString();
    state.npsDismissCount += 1;
  }

  saveFeedbackState(state);
};

/**
 * Get days since user registration (if available)
 */
export const getDaysSinceRegistration = (userCreatedAt) => {
  if (!userCreatedAt) return null;
  return Math.floor((Date.now() - new Date(userCreatedAt).getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Check if user is "active" (has used the app in last 7 days)
 */
export const isActiveUser = () => {
  const lastActivityKey = 'altan-last-activity';
  const lastActivity = localStorage.getItem(lastActivityKey);

  if (!lastActivity) return true; // Assume active if no data

  const daysSinceActivity = Math.floor(
    (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24),
  );

  return daysSinceActivity <= 7;
};

/**
 * Update last activity timestamp
 */
export const updateLastActivity = () => {
  try {
    localStorage.setItem('altan-last-activity', new Date().toISOString());
  } catch (error) {
    console.error('Error updating last activity:', error);
  }
};

/**
 * Calculate NPS category from score
 */
export const getNPSCategory = (score) => {
  if (score >= 9) return 'promoter';
  if (score >= 7) return 'passive';
  return 'detractor';
};

