import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
} from '@mui/material';
import { useState } from 'react';

import { optimai_pods } from '../../../../utils/axios';

export default function CommitDialog({ open, onClose, interfaceId }) {
  const [commitMessage, setCommitMessage] = useState('New commit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCommit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await optimai_pods.post(`/interfaces/dev/${interfaceId}/repo/commit`, {
        message: commitMessage,
      });

      onClose(response.data);
    } catch (error) {
      console.error('Failed to commit changes:', error);
      setError(error.response?.data?.message || 'Failed to commit changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(null)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Commit Changes</DialogTitle>
      <DialogContent>
        <Stack
          spacing={2}
          sx={{ mt: 1 }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Enter a message describing the changes you've made.
          </Typography>

          <TextField
            autoFocus
            label="Commit Message"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
          />

          {error && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'error.light',
                color: 'error.dark',
              }}
            >
              {error}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(null)}>Cancel</Button>
        <Button
          onClick={handleCommit}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Committing...' : 'Commit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
