import { Button, Stack, Typography } from '@mui/material';
import { memo, useState } from 'react';

import analytics from '../../lib/analytics';
import { hasFeedbackBeenGiven, markFeedbackGiven } from '../../lib/feedbackUtils';
import Iconify from '../iconify/Iconify';
import FeedbackPopup from './FeedbackPopup';

// ----------------------------------------------------------------------

/**
 * QuickFeedback - Simple thumbs up/down feedback for features
 *
 * Usage:
 * <QuickFeedback
 *   feedbackKey="agent_creation_first"
 *   title="How was creating your first agent?"
 *   onSubmit={(satisfied) => console.log(satisfied)}
 * />
 */
const QuickFeedback = memo(({ feedbackKey, title, description, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if feedback already given
  if (hasFeedbackBeenGiven(feedbackKey)) {
    return null;
  }

  const handleFeedback = async (satisfied) => {
    setIsSubmitting(true);

    try {
      // Track the feedback
      analytics.track('quick_feedback', {
        feedback_key: feedbackKey,
        satisfied,
      });

      // Mark feedback as given
      markFeedbackGiven(feedbackKey, {
        satisfied,
        timestamp: new Date().toISOString(),
      });

      // Close after a short delay
      setTimeout(() => {
        onClose?.();
      }, 500);
    } catch (error) {
      console.error('Error submitting quick feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    analytics.track('quick_feedback_dismissed', {
      feedback_key: feedbackKey,
    });

    markFeedbackGiven(feedbackKey, {
      skipped: true,
      timestamp: new Date().toISOString(),
    });

    onClose?.();
  };

  return (
    <FeedbackPopup
      title={title}
      onClose={handleDismiss}
    >
      <Stack spacing={2.5}>
        {description && (
          <Typography
            variant="body2"
            sx={{
              color: '#b0b0b0',
              lineHeight: 1.5,
              fontSize: '14px',
            }}
          >
            {description}
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={2}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleFeedback(true)}
            disabled={isSubmitting}
            sx={{
              backgroundColor: '#4caf50',
              color: 'white',
              fontWeight: 600,
              borderRadius: '12px',
              py: 2,
              fontSize: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              '&:hover': {
                backgroundColor: '#45a049',
              },
              '&:disabled': {
                backgroundColor: '#444',
                color: '#888',
              },
            }}
          >
            <Iconify
              icon="eva:thumbs-up-fill"
              width={28}
              height={28}
            />
            <Typography
              variant="caption"
              sx={{ fontSize: '12px' }}
            >
              Great!
            </Typography>
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleFeedback(false)}
            disabled={isSubmitting}
            sx={{
              borderColor: '#666',
              color: '#b0b0b0',
              fontWeight: 600,
              borderRadius: '12px',
              py: 2,
              fontSize: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              '&:hover': {
                borderColor: '#888',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
              '&:disabled': {
                borderColor: '#444',
                color: '#888',
              },
            }}
          >
            <Iconify
              icon="eva:thumbs-down-fill"
              width={28}
              height={28}
            />
            <Typography
              variant="caption"
              sx={{ fontSize: '12px' }}
            >
              Could be better
            </Typography>
          </Button>
        </Stack>
      </Stack>
    </FeedbackPopup>
  );
});

QuickFeedback.displayName = 'QuickFeedback';

export default QuickFeedback;

