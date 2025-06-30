import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';

ShareDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  agentId: PropTypes.string.isRequired,
};

export default function ShareDialog({ open, onClose, title, agentId }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/agent/${agentId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            value={shareUrl}
            InputProps={{
              readOnly: true,
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={handleCopy}
          color="primary"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
