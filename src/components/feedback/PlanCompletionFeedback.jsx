import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { memo, useState } from 'react';

import analytics from '../../lib/analytics';
import { hasFeedbackBeenGiven, markFeedbackGiven } from '../../lib/feedbackUtils';
import Iconify from '../iconify/Iconify';
import FeedbackPopup from './FeedbackPopup';

// ----------------------------------------------------------------------

const PlanCompletionFeedback = memo(({ planId, onClose }) => {
  const [step, setStep] = useState('initial'); // initial, comment
  const [satisfaction, setSatisfaction] = useState(null); // true/false
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if feedback already given for this plan
  const feedbackKey = `plan_completion_${planId}`;
  if (hasFeedbackBeenGiven(feedbackKey)) {
    return null;
  }

  const handleSatisfactionClick = (satisfied) => {
    setSatisfaction(satisfied);

    // Track the initial response
    analytics.track('plan_completion_feedback', {
      plan_id: planId,
      satisfied,
      step: 'initial_response',
    });

    if (satisfied) {
      // If satisfied, we can submit immediately
      handleSubmit(satisfied, '');
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

  if (step === 'initial') {
    return (
      <FeedbackPopup
        title="🎉 Plan completed!"
        onClose={handleSkip}
      >
        <Stack spacing={2.5}>
          <Typography
            variant="body2"
            sx={{
              color: '#b0b0b0',
              lineHeight: 1.5,
              fontSize: '14px',
            }}
          >
            Did this plan achieve what you wanted?
          </Typography>

          <Stack
            direction="row"
            spacing={2}
          >
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleSatisfactionClick(true)}
              sx={{
                backgroundColor: '#4caf50',
                color: 'white',
                fontWeight: 600,
                borderRadius: '12px',
                py: 1.5,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  backgroundColor: '#45a049',
                },
              }}
            >
              <Iconify
                icon="eva:checkmark-circle-2-fill"
                width={20}
                height={20}
              />
              Yes, it worked!
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleSatisfactionClick(false)}
              sx={{
                borderColor: '#666',
                color: '#b0b0b0',
                fontWeight: 600,
                borderRadius: '12px',
                py: 1.5,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  borderColor: '#888',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <Iconify
                icon="eva:close-circle-fill"
                width={20}
                height={20}
              />
              Not quite
            </Button>
          </Stack>
        </Stack>
      </FeedbackPopup>
    );
  }

  if (step === 'comment') {
    return (
      <FeedbackPopup
        title="Help us improve"
        onClose={handleSkip}
      >
        <Stack spacing={2}>
          <Typography
            variant="body2"
            sx={{
              color: '#b0b0b0',
              lineHeight: 1.5,
              fontSize: '14px',
            }}
          >
            What could we have done better?
          </Typography>

          <TextField
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what went wrong or what you expected..."
            variant="outlined"
            fullWidth
            autoFocus
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: '#444',
                },
                '&:hover fieldset': {
                  borderColor: '#666',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#888',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#666',
                opacity: 1,
              },
            }}
          />

          <Stack
            direction="row"
            spacing={1.5}
          >
            <Button
              variant="contained"
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !comment.trim()}
              fullWidth
              sx={{
                backgroundColor: 'white',
                color: 'black',
                fontWeight: 600,
                borderRadius: '50px',
                py: 1,
                fontSize: '14px',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                },
                '&:disabled': {
                  backgroundColor: '#444',
                  color: '#888',
                },
              }}
            >
              {isSubmitting ? 'Sending...' : 'Submit'}
            </Button>

            <Button
              variant="text"
              onClick={handleSkip}
              disabled={isSubmitting}
              sx={{
                color: '#888',
                fontSize: '14px',
                '&:hover': {
                  color: '#b0b0b0',
                },
              }}
            >
              Skip
            </Button>
          </Stack>
        </Stack>
      </FeedbackPopup>
    );
  }

  return null;
});

PlanCompletionFeedback.displayName = 'PlanCompletionFeedback';

export default PlanCompletionFeedback;

