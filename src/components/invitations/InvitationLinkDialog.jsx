import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import React from 'react';

export const InvitationLinkDialog = ({ open, onClose, invitationUrl }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Invitation Link Created</DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mb: 2 }}
        >
          Share this link with others to invite them to join:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            fullWidth
            value={invitationUrl}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            size="small"
          />
          <IconButton
            onClick={handleCopy}
            color={copied ? 'success' : 'primary'}
            sx={{ flexShrink: 0 }}
          >
            {copied ? <DoneIcon /> : <ContentCopyIcon />}
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
