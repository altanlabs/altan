import LoadingButton from '@mui/lab/LoadingButton';
import { TextField, Button, InputAdornment } from '@mui/material';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import CustomDialog from '../../../../components/dialogs/CustomDialog';
import { optimai } from '../../../../utils/axios';
// import { selectAccountSubscriptions } from '../../../../redux/slices/general';

function PublishDialog({ open, onClose, interfaceId, name, deploymentUrl }) {
  const history = useHistory();;
  // const activeSubscriptions = useSelector(selectAccountSubscriptions);

  // Check if user has any active paid subscription
  // const hasActivePaidSubscription = useMemo(() => {
  //   return activeSubscriptions?.some(
  //     (sub) => sub.status === 'active' && sub.billing_option?.plan?.name.toLowerCase() !== 'free',
  //   );
  // }, [activeSubscriptions]);

  const hasActivePaidSubscription = true;

  const [message, setMessage] = useState('New version');
  const [subdomain, setSubdomain] = useState(name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [secretCode, setSecretCode] = useState('');

  const validateSubdomain = (value) => {
    // Only allow lowercase letters, numbers, and hyphens
    const subdomainRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (!value.trim()) {
      return 'Subdomain is required';
    }
    if (value.length < 3) {
      return 'Subdomain must be at least 3 characters long';
    }
    if (value.length > 63) {
      return 'Subdomain must be less than 63 characters';
    }
    if (!subdomainRegex.test(value)) {
      return 'Subdomain can only contain lowercase letters, numbers, and hyphens. Hyphens cannot be at the start or end.';
    }
    return null;
  };

  const handleSubdomainChange = (e) => {
    // Remove spaces and convert to lowercase
    const sanitizedValue = e.target.value.toLowerCase().replace(/\s+/g, '-');
    setSubdomain(sanitizedValue);
    setValidationError(validateSubdomain(sanitizedValue));
  };

  const handleSecretCodeSubmit = () => {
    if (secretCode === 'ALTAN4EVER') {
      setShowCodeInput(false);
      // Clear the code and continue with publish flow
      setSecretCode('');
    } else {
      setError('Invalid code');
    }
  };

  const handlePublish = async () => {
    const validationError = validateSubdomain(subdomain);
    if (validationError) {
      setValidationError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setValidationError(null);

      await optimai.get(`/interfaces/${interfaceId}/publish`, {
        params: {
          message,
          subdomain: subdomain.trim(),
        },
      });

      onClose();
    } catch (err) {
      if (err.response?.status === 400) {
        setError('This subdomain name is not available');
      } else {
        setError(err.response?.data?.detail || 'Failed to publish interface');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
      className="w-full max-w-md"
    >
      <div className="px-6 py-4">
        <h2 className="text-xl font-semibold mb-4">Push to Production</h2>

        {!hasActivePaidSubscription && secretCode !== 'ALTAN4EVER' ? (
          <div className="space-y-4">
            {showCodeInput ? (
              <div className="space-y-4">
                <TextField
                  fullWidth
                  variant="filled"
                  label="Enter Code"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  type="password"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => setShowCodeInput(false)}
                    className="text-gray-600 dark:text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSecretCodeSubmit}
                    variant="contained"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                  You need a paid subscription to publish interfaces.
                </div>
                <div className="flex justify-between items-center">
                  <Button
                    onClick={() => setShowCodeInput(true)}
                    className="text-gray-400 hover:text-gray-500 text-xs"
                  >
                    •
                  </Button>
                  <Button
                    onClick={() => {
                      onClose();
                      history.push('/pricing');
                    }}
                    variant="contained"
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {!deploymentUrl && (
                <TextField
                  autoFocus
                  fullWidth
                  variant="filled"
                  label="Subdomain Name"
                  value={subdomain}
                  onChange={handleSubdomainChange}
                  disabled={isSubmitting}
                  placeholder="your-interface"
                  error={!!validationError}
                  helperText={validationError || 'Choose a unique name for your interface'}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">.altanlabs.com</InputAdornment>,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '0.5rem',
                    },
                  }}
                />
              )}

              <TextField
                fullWidth
                variant="filled"
                label="Commit Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '0.5rem',
                  },
                }}
              />
            </div>

            <div className="flex justify-between items-center mt-6">
              <div className="text-xs text-gray-500 dark:text-gray-400">Let's make it real!</div>
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <LoadingButton
                  onClick={handlePublish}
                  loading={isSubmitting}
                  loadingPosition="center"
                  variant="contained"
                  disabled={!subdomain.trim()}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Publish
                </LoadingButton>
              </div>
            </div>
          </>
        )}
      </div>
    </CustomDialog>
  );
}

export default PublishDialog;
