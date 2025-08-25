import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Stack,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Switch,
  Typography,
  Button,
  IconButton,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useState, useCallback, memo, useEffect } from 'react';

import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { updateTableById } from '../../../redux/slices/bases';
import CustomDialog from '../../dialogs/CustomDialog.jsx';

// RLS operation enum to match backend
const RLS_OPERATIONS = {
  SELECT: 'SELECT',
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  ALL: 'ALL',
};

// Initial policy for new policies
const DEFAULT_POLICY = {
  name: '',
  operation: 'SELECT',
  using_expression: '',
  with_check_expression: '',
  permissive: true,
};

const RLSSettingsDialog = ({ baseId, table, open, onClose }) => {
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  // State for RLS settings
  const [rlsEnabled, setRlsEnabled] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Load existing RLS settings from table metadata
  useEffect(() => {
    if (table && table.meta_data && table.meta_data.rls) {
      setRlsEnabled(table.meta_data.rls.enabled ?? true);
      setPolicies(table.meta_data.rls.policies ?? []);
    } else {
      setRlsEnabled(true);
      setPolicies([]);
    }
    setEditingPolicy(null);
    setValidationErrors({});
  }, [table]);

  // Validate policy before saving
  const validatePolicy = (policy) => {
    const errors = {};

    if (!policy.name) {
      errors.name = 'Name is required';
    }

    if (policy.operation === RLS_OPERATIONS.INSERT) {
      if (!policy.with_check_expression) {
        errors.with_check_expression = 'WITH CHECK expression is required for INSERT operations';
      }
    } else {
      if (!policy.using_expression) {
        errors.using_expression = `USING expression is required for ${policy.operation} operations`;
      }
    }

    return errors;
  };

  // Add or update policy
  const handleSavePolicy = () => {
    const errors = validatePolicy(editingPolicy);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    if (editingPolicy.id) {
      // Update existing policy
      setPolicies(policies.map((p) => (p.id === editingPolicy.id ? editingPolicy : p)));
    } else {
      // Add new policy with unique ID
      setPolicies([...policies, { ...editingPolicy, id: Date.now().toString() }]);
    }

    setEditingPolicy(null);
  };

  // Delete policy
  const handleDeletePolicy = (policyId) => {
    setPolicies(policies.filter((p) => p.id !== policyId));
  };

  // Edit policy
  const handleEditPolicy = (policy) => {
    setEditingPolicy({ ...policy });
    setValidationErrors({});
  };

  // Add new policy
  const handleAddPolicy = () => {
    setEditingPolicy({ ...DEFAULT_POLICY });
    setValidationErrors({});
  };

  // Cancel policy editing
  const handleCancelEdit = () => {
    setEditingPolicy(null);
    setValidationErrors({});
  };

  // Handle input changes for policy editing
  const handlePolicyChange = (field, value) => {
    setEditingPolicy((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Save all RLS settings
  const handleSave = useCallback(async () => {
    // Format RLS settings within meta_data structure
    const tableUpdate = {
      rls_enabled: rlsEnabled,
      rls_policies: policies,
    };
    dispatchWithFeedback(updateTableById(baseId, table.id, tableUpdate), {
      useSnackbar: true,
      successMessage: 'RLS settings updated successfully',
      errorMessage: 'Could not update RLS settings',
    }).then(() => onClose());
  }, [baseId, table, rlsEnabled, policies, onClose, dispatchWithFeedback]);

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
    >
      <DialogContent sx={{ p: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">RLS Settings</Typography>
        </Stack>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={rlsEnabled}
              onChange={(e) => setRlsEnabled(e.target.checked)}
            />
          }
          label="Enable RLS"
          labelPlacement="start"
        />

        {rlsEnabled && (
          <>
            {/* Policies List */}
            {policies.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {policies.map((policy) => (
                  <Box
                    key={policy.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      p: 1,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="subtitle2">{policy.name}</Typography>
                      <Box>
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{ mr: 1 }}
                        >
                          {policy.operation}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color={policy.permissive ? 'success.main' : 'error.main'}
                        >
                          {policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleEditPolicy(policy)}
                          sx={{ ml: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePolicy(policy.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Stack>
                    {(policy.using_expression || policy.with_check_expression) && (
                      <Box sx={{ mt: 1, fontSize: '0.75rem' }}>
                        {policy.using_expression && (
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{
                              fontFamily: 'monospace',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            USING: {policy.using_expression}
                          </Typography>
                        )}
                        {policy.with_check_expression && (
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{
                              fontFamily: 'monospace',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            CHECK: {policy.with_check_expression}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
            {/* Policy Editor */}
            {editingPolicy ? (
              <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="subtitle2">
                      {editingPolicy.id ? 'Edit Policy' : 'New Policy'}
                    </Typography>
                  </Box>

                  <TextField
                    size="small"
                    label="Policy Name"
                    value={editingPolicy.name}
                    onChange={(e) => handlePolicyChange('name', e.target.value)}
                    fullWidth
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                  />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl
                      size="small"
                      fullWidth
                    >
                      <InputLabel>Operation</InputLabel>
                      <Select
                        label="Operation"
                        value={editingPolicy.operation}
                        onChange={(e) => handlePolicyChange('operation', e.target.value)}
                      >
                        {Object.entries(RLS_OPERATIONS).map(([key, value]) => (
                          <MenuItem
                            key={key}
                            value={value}
                          >
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl
                      size="small"
                      fullWidth
                    >
                      <InputLabel>Type</InputLabel>
                      <Select
                        label="Type"
                        value={editingPolicy.permissive}
                        onChange={(e) => handlePolicyChange('permissive', e.target.value)}
                      >
                        <MenuItem value={true}>PERMISSIVE</MenuItem>
                        <MenuItem value={false}>RESTRICTIVE</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <TextField
                    size="small"
                    label="USING Expression"
                    value={editingPolicy.using_expression || ''}
                    onChange={(e) => handlePolicyChange('using_expression', e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                    placeholder="SQL expression that returns boolean"
                    error={!!validationErrors.using_expression}
                    helperText={validationErrors.using_expression}
                    disabled={editingPolicy.operation === RLS_OPERATIONS.INSERT}
                  />
                  <TextField
                    size="small"
                    label="WITH CHECK Expression"
                    value={editingPolicy.with_check_expression || ''}
                    onChange={(e) => handlePolicyChange('with_check_expression', e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                    placeholder="SQL expression that returns boolean"
                    error={!!validationErrors.with_check_expression}
                    helperText={validationErrors.with_check_expression}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleSavePolicy}
                    >
                      Save
                    </Button>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  variant="outlined"
                  onClick={handleAddPolicy}
                  fullWidth
                >
                  Add Policy
                </Button>
              </Box>
            )}
            {policies.length === 0 && !editingPolicy && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mt: 2 }}
              >
                No policies defined. Add a policy to control row access.
              </Typography>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button
          size="small"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleSave}
          disabled={isSubmitting}
        >
          Save Settings
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default memo(RLSSettingsDialog);
