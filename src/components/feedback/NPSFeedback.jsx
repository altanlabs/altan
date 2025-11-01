import { memo, useState } from 'react';

import FeedbackPopup from './FeedbackPopup';
import { useAuthContext } from '../../auth/useAuthContext';
import analytics from '../../lib/analytics';
import {
  getNPSCategory,
  markFeedbackDismissed,
  markFeedbackGiven,
  shouldShowNPS,
} from '../../lib/feedbackUtils';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button.tsx';
import { Textarea } from '../ui/textarea.tsx';

// ----------------------------------------------------------------------

const NPSFeedback = memo(({ onClose }) => {
  const { isAuthenticated } = useAuthContext();
  const [step, setStep] = useState('score'); // score, comment
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if we should show NPS (must be authenticated)
  if (!isAuthenticated || !shouldShowNPS()) {
    return null;
  }

  const handleScoreClick = (selectedScore) => {
    setScore(selectedScore);

    // Track the score selection
    analytics.track('nps_score_selected', {
      score: selectedScore,
      category: getNPSCategory(selectedScore),
    });

    // Move to comment step
    setStep('comment');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const category = getNPSCategory(score);

      // Track the full NPS feedback
      analytics.track('nps_feedback_submitted', {
        score,
        category,
        has_comment: !!comment,
        comment,
      });

      // Mark feedback as given
      const feedbackKey = `nps_${new Date().toISOString().split('T')[0]}`;
      markFeedbackGiven(feedbackKey, {
        isNPS: true,
        score,
        category,
        comment,
        timestamp: new Date().toISOString(),
      });

      // Close the feedback popup
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error submitting NPS feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    analytics.track('nps_feedback_dismissed', {
      step,
      score,
    });

    markFeedbackDismissed('nps');
    onClose();
  };

  const handleSkipComment = () => {
    // Submit without comment
    handleSubmit();
  };

  if (step === 'score') {
    return (
      <FeedbackPopup title="Quick question" onClose={handleDismiss}>
        <div className="space-y-6">
          <p className="text-sm text-[#b0b0b0] leading-relaxed">
            How likely are you to recommend Altan to a colleague?
          </p>

          {/* Score buttons 1-5 */}
          <div>
            <div className="flex gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  onClick={() => handleScoreClick(value)}
                  className={cn(
                    'min-w-[48px] h-12 p-0 rounded-lg border-[#444] text-[#b0b0b0] text-sm font-semibold transition-all',
                    'hover:scale-105',
                    value >= 4
                      ? 'hover:border-green-500 hover:bg-green-500/10 hover:text-green-500'
                      : value === 3
                        ? 'hover:border-orange-500 hover:bg-orange-500/10 hover:text-orange-500'
                        : 'hover:border-red-500 hover:bg-red-500/10 hover:text-red-500',
                  )}
                >
                  {value}
                </Button>
              ))}
            </div>

            <div className="flex justify-between px-1">
              <span className="text-[11px] text-[#666]">Not likely</span>
              <span className="text-[11px] text-[#666]">Very likely</span>
            </div>
          </div>
        </div>
      </FeedbackPopup>
    );
  }

  if (step === 'comment') {
    const category = getNPSCategory(score);
    const promptText =
      category === 'promoter'
        ? 'What do you love most about Altan?'
        : category === 'passive'
          ? 'What would make you more likely to recommend Altan?'
          : "What's the main reason for your score?";

    return (
      <FeedbackPopup title={`Thanks for the ${score}!`} onClose={handleDismiss}>
        <div className="space-y-4">
          <p className="text-sm text-[#b0b0b0] leading-relaxed">{promptText}</p>

          <Textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Your feedback helps us improve..."
            autoFocus
            className="bg-white/5 text-white border-[#444] rounded-xl placeholder:text-[#666] focus-visible:border-[#888] resize-none"
          />

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-white text-black font-semibold rounded-full py-2 text-sm hover:bg-[#f0f0f0] disabled:bg-[#444] disabled:text-[#888]"
            >
              {isSubmitting ? 'Sending...' : 'Submit'}
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkipComment}
              disabled={isSubmitting}
              className="text-[#888] text-sm hover:text-[#b0b0b0] hover:bg-transparent"
            >
              Skip
            </Button>
          </div>
        </div>
      </FeedbackPopup>
    );
  }

  return null;
});

NPSFeedback.displayName = 'NPSFeedback';

export default NPSFeedback;
