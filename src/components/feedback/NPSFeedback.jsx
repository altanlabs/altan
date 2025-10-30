import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { memo, useState } from 'react';

import analytics from '../../lib/analytics';
import {
  getNPSCategory,
  markFeedbackDismissed,
  markFeedbackGiven,
  shouldShowNPS,
} from '../../lib/feedbackUtils';
import FeedbackPopup from './FeedbackPopup';

// ----------------------------------------------------------------------

const NPSFeedback = memo(({ onClose }) => {
  const [step, setStep] = useState('score'); // score, comment
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if we should show NPS
  if (!shouldShowNPS()) {
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
      <FeedbackPopup
        title="Quick question"
        onClose={handleDismiss}
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
            How likely are you to recommend Altan to a colleague?
          </Typography>

          {/* Score buttons 0-10 */}
          <Box>
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ mb: 1 }}
            >
              {[...Array(11)].map((_, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => handleScoreClick(index)}
                  sx={{
                    minWidth: '32px',
                    width: '32px',
                    height: '32px',
                    padding: 0,
                    borderRadius: '8px',
                    borderColor: '#444',
                    color: '#b0b0b0',
                    fontSize: '13px',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor:
                        index >= 9 ? '#4caf50' : index >= 7 ? '#ff9800' : '#f44336',
                      backgroundColor:
                        index >= 9
                          ? 'rgba(76, 175, 80, 0.1)'
                          : index >= 7
                            ? 'rgba(255, 152, 0, 0.1)'
                            : 'rgba(244, 67, 54, 0.1)',
                      color: index >= 9 ? '#4caf50' : index >= 7 ? '#ff9800' : '#f44336',
                    },
                  }}
                >
                  {index}
                </Button>
              ))}
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ px: 0.5 }}
            >
              <Typography
                variant="caption"
                sx={{ color: '#666', fontSize: '11px' }}
              >
                Not likely
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#666', fontSize: '11px' }}
              >
                Very likely
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </FeedbackPopup>
    );
  }

  if (step === 'comment') {
    const category = getNPSCategory(score);
    const promptText =
      category === 'promoter'
        ? "What do you love most about Altan?"
        : category === 'passive'
          ? "What would make you more likely to recommend Altan?"
          : "What's the main reason for your score?";

    return (
      <FeedbackPopup
        title={`Thanks for the ${score}!`}
        onClose={handleDismiss}
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
            {promptText}
          </Typography>

          <TextField
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Your feedback helps us improve..."
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
              onClick={handleSubmit}
              disabled={isSubmitting}
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
              onClick={handleSkipComment}
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

NPSFeedback.displayName = 'NPSFeedback';

export default NPSFeedback;

