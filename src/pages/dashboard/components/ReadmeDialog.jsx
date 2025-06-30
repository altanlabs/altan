import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import ReactMarkdown from 'react-markdown';

const ReadmeDialog = ({ open, onClose, appName, description }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{appName} - Documentation</DialogTitle>
      <DialogContent>
        <ReactMarkdown>{description || ''}</ReactMarkdown>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReadmeDialog;
