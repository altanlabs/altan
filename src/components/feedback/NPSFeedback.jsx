import { Icon } from '@iconify/react';
import { memo, useState } from 'react';

import FeedbackPopup from './FeedbackPopup';
import { useAuthContext } from '../../auth/useAuthContext.ts';
import analytics from '../../lib/analytics';
import {
  getNPSCategory,
  markFeedbackDismissed,
  markFeedbackGiven,
  shouldShowNPS,
} from '../../lib/feedbackUtils';
import { cn } from '../../lib/utils';
import { useSelector } from '../../redux/store.ts';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

// ----------------------------------------------------------------------

// Redux selector
const selectAccountAltaners = (state) => state.general.account?.altaners;

const NPSFeedback = memo(({ onClose }) => {
  const { isAuthenticated, user } = useAuthContext();
  const altaners = useSelector(selectAccountAltaners);
  const [step, setStep] = useState('score'); // score, comment, referral
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralUrl = user?.id ? `https://altan.ai?ref=${user.id}` : '';

  // Check if we should show NPS (must be authenticated and have at least one altaner)
  const hasAltaners = altaners && altaners.length > 0;

  if (!isAuthenticated || !shouldShowNPS() || !hasAltaners) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);

      analytics.track('referral_link_copied_from_nps', {
        user_id: user?.id,
        referral_url: referralUrl,
        nps_score: score,
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Altan AI',
          text: 'Check out Altan AI - Build AI agents and workflows!',
          url: referralUrl,
        });

        analytics.track('referral_link_shared_from_nps', {
          user_id: user?.id,
          referral_url: referralUrl,
          nps_score: score,
          method: 'native_share',
        });
      } catch (err) {
        // Only log if user didn't cancel the share
        if (err.name !== 'AbortError') {
          // eslint-disable-next-line no-console
          console.error('Failed to share: ', err);
        }
      }
    }
  };

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

  const handleSubmit = async (skipReferral = false) => {
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

      // If score is 4 or 5 (promoter) and not skipping referral, show referral step
      if ((score === 4 || score === 5) && !skipReferral) {
        setIsSubmitting(false);
        setStep('referral');
        return;
      }

      // Close the feedback popup
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      // eslint-disable-next-line no-console
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
    // Submit without comment, but still show referral if high score
    handleSubmit();
  };

  const handleReferralDone = () => {
    analytics.track('nps_referral_dismissed', {
      nps_score: score,
    });

    onClose();
  };

  if (step === 'score') {
    return (
      <FeedbackPopup
        title="Quick question"
        onClose={handleDismiss}
      >
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
      <FeedbackPopup
        title={`Thanks for the ${score}!`}
        onClose={handleDismiss}
      >
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
              onClick={() => handleSubmit()}
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

  if (step === 'referral') {
    return (
      <FeedbackPopup
        title="Spread the love! 🎁"
        onClose={handleReferralDone}
      >
        <div className="space-y-4">
          <p className="text-[#b0b0b0] text-sm leading-relaxed">
            Since you love Altan, help others discover it! You&apos;ll earn{' '}
            <span className="text-white font-semibold">$10 in free credits</span> when they upgrade.
          </p>

          <div className="relative">
            <Input
              readOnly
              value={referralUrl}
              className="pr-12 bg-white/5 border-[#444] text-white text-sm rounded-xl"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopy}
              className={cn(
                'absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7',
                copied ? 'text-green-500' : 'text-[#888] hover:text-white',
              )}
            >
              {copied ? (
                <Icon
                  icon="mdi:check"
                  className="w-4 h-4"
                />
              ) : (
                <Icon
                  icon="mdi:content-copy"
                  className="w-4 h-4"
                />
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1 bg-white text-black hover:bg-gray-100 rounded-full text-sm font-semibold"
              onClick={handleCopy}
            >
              <Icon
                icon="mdi:content-copy"
                className="mr-2 w-4 h-4"
              />
              Copy link
            </Button>
            {navigator.share && (
              <Button
                className="flex-1 border-[#666] text-[#b0b0b0] hover:border-[#888] hover:bg-white/5 rounded-full text-sm font-semibold"
                variant="outline"
                onClick={handleShare}
              >
                <Icon
                  icon="mdi:share-variant"
                  className="mr-2 w-4 h-4"
                />
                Share
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            className="w-full text-[#888] hover:text-[#b0b0b0] hover:bg-transparent text-sm"
            onClick={handleReferralDone}
          >
            Maybe later
          </Button>
        </div>
      </FeedbackPopup>
    );
  }

  return null;
});

NPSFeedback.displayName = 'NPSFeedback';

export default NPSFeedback;
