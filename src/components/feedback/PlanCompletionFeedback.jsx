import { Icon } from '@iconify/react';
import { memo, useState } from 'react';

import FeedbackPopup from './FeedbackPopup';
import { useAuthContext } from '../../auth/useAuthContext';
import { analytics } from '../../lib/analytics';
import { hasFeedbackBeenGiven, markFeedbackGiven } from '../../lib/feedbackUtils';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import ContactOptionsDialog from '../dialogs/ContactOptionsDialog';

// ----------------------------------------------------------------------

const PlanCompletionFeedback = memo(({ planId, onClose }) => {
  const { user } = useAuthContext();
  const [step, setStep] = useState('initial'); // initial, comment, referral, contact
  const [satisfaction, setSatisfaction] = useState(null); // true/false
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  const referralUrl = user?.id ? `https://altan.ai?ref=${user.id}` : '';

  // Don't render if there's no plan ID
  if (!planId || planId === null) {
    return null;
  }

  // Check if feedback already given for this plan
  const feedbackKey = `plan_completion_${planId}`;
  if (hasFeedbackBeenGiven(feedbackKey)) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);

      analytics.track('referral_link_copied_from_feedback', {
        user_id: user?.id,
        referral_url: referralUrl,
        plan_id: planId,
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

        analytics.track('referral_link_shared_from_feedback', {
          user_id: user?.id,
          referral_url: referralUrl,
          plan_id: planId,
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

  const handleSatisfactionClick = (satisfied) => {
    setSatisfaction(satisfied);

    // Track the initial response
    analytics.track('plan_completion_feedback', {
      plan_id: planId,
      satisfied,
      step: 'initial_response',
    });

    if (satisfied) {
      // If satisfied, show referral step
      setStep('referral');
    } else {
      // If not satisfied, ask for comment
      setStep('comment');
    }
  };

  const handleSubmit = async (satisfied = satisfaction, userComment = comment) => {
    setIsSubmitting(true);

    try {
      // Track the full feedback
      analytics.track('plan_completion_feedback_submitted', {
        plan_id: planId,
        satisfied,
        has_comment: !!userComment,
        comment: userComment,
      });

      // Mark feedback as given
      markFeedbackGiven(feedbackKey, {
        satisfied,
        comment: userComment,
        timestamp: new Date().toISOString(),
      });

      // Close the feedback popup
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    analytics.track('plan_completion_feedback_dismissed', {
      plan_id: planId,
      step,
    });

    markFeedbackGiven(feedbackKey, {
      skipped: true,
      timestamp: new Date().toISOString(),
    });

    onClose();
  };

  const handleReferralDone = () => {
    // Mark feedback as given with positive satisfaction
    markFeedbackGiven(feedbackKey, {
      satisfied: true,
      referral_shown: true,
      timestamp: new Date().toISOString(),
    });

    analytics.track('plan_completion_referral_dismissed', {
      plan_id: planId,
    });

    onClose();
  };

  if (step === 'initial') {
    return (
      <FeedbackPopup
        title="All tasks completed!"
        onClose={handleSkip}
      >
        <div className="space-y-4">
          <p className="text-[#b0b0b0] text-sm leading-relaxed">
            Did this plan achieve what you wanted?
          </p>

          <div className="space-y-2">
            <Button
              variant="default"
              className="w-full bg-white text-black hover:bg-gray-100 rounded-full py-2 text-sm font-semibold"
              onClick={() => handleSatisfactionClick(true)}
            >
              Yes, it worked!
            </Button>

            <Button
              variant="outline"
              className="w-full border-[#666] text-[#b0b0b0] hover:border-[#888] hover:bg-white/5 rounded-full py-2 text-sm font-semibold"
              onClick={() => handleSatisfactionClick(false)}
            >
              Not quite
            </Button>
          </div>
        </div>
      </FeedbackPopup>
    );
  }

  if (step === 'referral') {
    return (
      <FeedbackPopup
        title="Share the love! 🎁"
        onClose={handleReferralDone}
      >
        <div className="space-y-4">
          <p className="text-[#b0b0b0] text-sm leading-relaxed">
            Help others discover Altan and earn <span className="text-white font-semibold">$10 in free credits</span> when they upgrade!
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

  if (step === 'comment') {
    return (
      <>
        <FeedbackPopup
          title="Help us improve"
          onClose={handleSkip}
        >
          <div className="space-y-4">
            <p className="text-[#b0b0b0] text-sm leading-relaxed">
              What could we have done better?
            </p>

            <Textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what went wrong..."
              autoFocus
              className="bg-white/5 border-[#444] text-white placeholder:text-[#666] rounded-xl text-sm resize-none focus-visible:border-[#888]"
            />

            {/* PMF Moment: Offer personal help when user is frustrated */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Icon 
                  icon="mdi:calendar-clock" 
                  className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold mb-1">
                    Want 10 minutes with the founder?
                  </p>
                  <p className="text-[#b0b0b0] text-xs leading-relaxed mb-3">
                    I'll personally help you build your first automation and make this work for you.
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      analytics.track('founder_call_clicked_from_negative_feedback', {
                        plan_id: planId,
                        has_comment: !!comment.trim(),
                      });
                      setShowContactDialog(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs font-semibold h-8"
                  >
                    <Icon icon="mdi:calendar" className="w-3.5 h-3.5 mr-1.5" />
                    Book a Free Call
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="default"
                onClick={() => handleSubmit()}
                disabled={isSubmitting || !comment.trim()}
                className="flex-1 bg-white text-black hover:bg-gray-100 disabled:bg-[#444] disabled:text-[#888] rounded-full text-sm font-semibold"
              >
                {isSubmitting ? 'Sending...' : 'Submit'}
              </Button>

              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="text-[#888] hover:text-[#b0b0b0] hover:bg-transparent text-sm px-4"
              >
                Skip
              </Button>
            </div>
          </div>
        </FeedbackPopup>

        {/* Contact Options Dialog */}
        <ContactOptionsDialog
          open={showContactDialog}
          onClose={() => setShowContactDialog(false)}
          title="Let's talk!"
          description="Book a call with our founder or join our community"
          callOnly={false}
          source="plan_negative_feedback"
        />
      </>
    );
  }

  return null;
});

PlanCompletionFeedback.displayName = 'PlanCompletionFeedback';

export default PlanCompletionFeedback;
