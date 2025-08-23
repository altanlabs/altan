import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  FormControl,
  FormLabel,
} from '@mui/material';
import { useState, useCallback } from 'react';
import { LoadingButton } from '@mui/lab';

import CustomDialog from './CustomDialog';
import { useSnackbar } from '../snackbar';

const FEEDBACK_OPTIONS = [
  { value: 'design_off', label: 'Design is off' },
  { value: 'unrelated_changes', label: 'Unrelated changes made' },
  { value: 'functionality_broken', label: 'Functionality is broken' },
  { value: 'other', label: 'Other' },
];

const FeedbackDialog = ({
  open,
  onClose,
  onSubmit,
  messageId,
  threadId,
  altanerId,
  messageContent,
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleReasonChange = useCallback((event) => {
    setSelectedReason(event.target.value);
  }, []);

  const handleFeedbackChange = useCallback((event) => {
    setAdditionalFeedback(event.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedReason) {
      enqueueSnackbar('Please select a reason for your feedback', { variant: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        reason: selectedReason,
        additionalFeedback,
        messageId,
        threadId,
        altanerId,
        messageContent,
      });

      enqueueSnackbar('Thank you for your feedback!', { variant: 'success' });
      handleClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      enqueueSnackbar('Failed to submit feedback. Please try again.', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedReason,
    additionalFeedback,
    onSubmit,
    messageId,
    threadId,
    altanerId,
    messageContent,
    enqueueSnackbar,
  ]);

  const handleClose = useCallback(() => {
    setSelectedReason('');
    setAdditionalFeedback('');
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={handleClose}
      className="max-w-md"
    >
      <DialogTitle>
        <Typography
          variant="h6"
          component="div"
          className="font-semibold"
        >
          Help us improve
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          className="mt-1"
        >
          Please tell us why this response wasn't helpful to you.
        </Typography>
      </DialogTitle>

      <DialogContent className="space-y-4">
        <FormControl
          component="fieldset"
          fullWidth
        >
          <RadioGroup
            value={selectedReason}
            onChange={handleReasonChange}
            className="space-y-2"
          >
            {FEEDBACK_OPTIONS.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio size="small" />}
                label={
                  <Typography
                    variant="body2"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    {option.label}
                  </Typography>
                }
                className="mx-0 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                sx={{
                  margin: 0,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                  '.MuiFormControlLabel-label': {
                    flex: 1,
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Box className="mt-4">
          <FormLabel
            component="legend"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Additional Feedback
          </FormLabel>
          <TextField
            multiline
            rows={3}
            fullWidth
            placeholder="This was not helpful because..."
            value={additionalFeedback}
            onChange={handleFeedbackChange}
            variant="outlined"
            size="small"
            className="mt-2"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'transparent',
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions className="px-6 pb-6 pt-2">
        <Button
          onClick={handleClose}
          color="inherit"
          variant="outlined"
          className="mr-2"
        >
          Cancel
        </Button>
        <LoadingButton
          onClick={handleSubmit}
          loading={isSubmitting}
          variant="contained"
          color="primary"
          disabled={!selectedReason}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
};

export default FeedbackDialog;
