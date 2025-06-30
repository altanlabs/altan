import { GitHub as GitHubIcon } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { memo, useState } from 'react';

import { optimai } from '../../../../utils/axios';

function AddCollaboratorDialog({ open, onClose, interfaceId, repoOwner, repoName }) {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) return;

    setIsSubmitting(true);
    try {
      await optimai.post(`/interfaces/${interfaceId}/collaborators`, {
        username: username.trim(),
        permission: 'push',
      });
      setUsername('');
      onClose();
    } catch (error) {
      console.error('Failed to add collaborator:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: 'rounded-xl',
      }}
    >
      <DialogTitle className="flex items-center gap-2 pb-2">
        <GitHubIcon className="text-[22px]" />
        Add github collaborator
      </DialogTitle>
      <DialogContent className="pb-6">
        <div className="space-y-4">
          <TextField
            autoFocusa
            fullWidth
            label="GitHub Username"
            variant="filled"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
            className="mt-2"
            InputProps={{
              className: 'rounded-lg',
            }}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          className="text-gray-600"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!username.trim() || isSubmitting}
          className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          {isSubmitting ? 'Adding...' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(AddCollaboratorDialog);
