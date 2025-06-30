import { Button, DialogTitle, DialogActions, DialogContent } from '@mui/material';
import PropTypes from 'prop-types';

// @mui
import { memo } from 'react';

import CustomDialog from '../dialogs/CustomDialog.jsx';

// ----------------------------------------------------------------------

ConfirmDialog.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.node,
  action: PropTypes.node,
  content: PropTypes.node,
  onClose: PropTypes.func,
};

function ConfirmDialog({ title, content, action, open, onClose, ...other }) {
  return (
    <CustomDialog
      className="max-w-xs"
      dialogOpen={open}
      onClose={onClose}
      {...other}
    >
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      {content && <DialogContent sx={{ typography: 'body2' }}> {content} </DialogContent>}

      <DialogActions>
        {action}

        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
        >
          Cancel
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

export default memo(ConfirmDialog);
