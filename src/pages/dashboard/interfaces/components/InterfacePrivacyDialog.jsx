import { Shield as ShieldIcon } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import { memo, useState } from 'react';

import { updateInterfaceById } from '../../../../redux/slices/general/index.ts';
import { dispatch } from '../../../../redux/store.ts';

function InterfacePrivacyDialog({ open, onClose, interfaceId, isPublic: initialIsPublic }) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isClonable, setIsClonable] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(
        updateInterfaceById(interfaceId, {
          is_public: isPublic,
          is_clonable: isClonable,
          dev_mode: isDevMode,
        }),
      );
      onClose();
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
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
        <ShieldIcon className="text-[22px]" />
        Privacy Settings
      </DialogTitle>
      <DialogContent className="pb-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                }
                label={
                  <div className="space-y-1">
                    <Typography variant="subtitle2">Public Access</Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-500"
                    >
                      Anyone can view this interface
                    </Typography>
                  </div>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={isClonable}
                    onChange={(e) => setIsClonable(e.target.checked)}
                  />
                }
                label={
                  <div className="space-y-1">
                    <Typography variant="subtitle2">Allow Cloning</Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-500"
                    >
                      Others can create a copy of this interface
                    </Typography>
                  </div>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={isDevMode}
                    onChange={(e) => setIsDevMode(e.target.checked)}
                  />
                }
                label={
                  <div className="space-y-1">
                    <Typography variant="subtitle2">Developer Mode</Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-500"
                    >
                      Enable developer features and debugging tools
                    </Typography>
                  </div>
                }
              />
            </FormGroup>
          </div>

          <div className="px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Typography className="text-blue-800 dark:text-blue-200 text-sm">
              These settings control who can view and clone your interface. Private interfaces are
              only visible to you and your collaborators.
            </Typography>
          </div>
        </div>
      </DialogContent>
      <DialogActions className="p-3 border-t">
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
          disabled={isSubmitting}
          className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(InterfacePrivacyDialog);
