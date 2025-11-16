import { LoadingButton } from '@mui/lab';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { memo, useState } from 'react';

import CustomDialog from '../../../../components/dialogs/CustomDialog.jsx';
import { getRoomPort } from '../../../../di/index.ts';

function EditMemoryDialog({ open, onClose, roomId }) {
  const [instruction, setInstruction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const roomPort = getRoomPort();
      await roomPort.updateRoomMemory(roomId, instruction);
      onClose();
    } catch (error) {
      console.error('Failed to update memory:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Edit AI Memory</DialogTitle>
      <DialogContent>
        <Alert
          severity="info"
          sx={{
            mb: 3,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            Important Note:
          </Typography>
          <Typography variant="body2">
            • After updating, you&apos;ll need to reload the page to see the new memory
          </Typography>
          <Typography variant="body2">
            • The AI may take a few seconds to process and integrate your instructions
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            The memory is edited through AI instructions. Write your instructions below and the AI
            will update the memory accordingly.
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            For example: "Add that this interface is used for processing images" or "Remove any
            mentions of previous testing".
          </Typography>
        </Box>
        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth
          label="AI Instructions"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Enter your instructions for updating the memory..."
        />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={isSubmitting}
          variant="contained"
          onClick={handleSubmit}
          disabled={!instruction.trim()}
        >
          Update Memory
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}

export default memo(EditMemoryDialog);
