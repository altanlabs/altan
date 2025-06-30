import { LoadingButton } from '@mui/lab';
import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

export const useEditDialog = ({
  title = 'Dialog',
  description = 'description',
  fullWidth = true,
  children,
  confirmEnabled = false,
  sx = {},
}) => {
  // const isSmallScreen = useResponsive();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmTriggered, setConfirmTriggered] = useState(false);

  const openDialog = useCallback(() => setIsOpen(true), [setIsOpen]);
  const onClose = useCallback(() => setIsOpen(false), [setIsOpen]);

  const doneConfirmed = () => setConfirmTriggered(false);

  const onConfirm = useCallback(() => {
    if (!!confirmEnabled) {
      setConfirmTriggered(true);
    }
    onClose();
  }, [onClose, confirmEnabled, setConfirmTriggered]);

  const dialog = useMemo(
    () => (
      <Dialog
        fullWidth={fullWidth}
        open={isOpen}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          ...sx,
        }}
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <Typography variant="caption">{description}</Typography>
          {children}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            color="error"
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={onConfirm}
            color="inherit"
            variant="soft"
            disabled={!confirmEnabled}
          >
            Confirm
          </LoadingButton>
        </DialogActions>
      </Dialog>
    ),
    [isOpen, children],
  );

  return {
    Dialog: dialog,
    openDialog,
    confirmTriggered,
    doneConfirmed,
  };
};
