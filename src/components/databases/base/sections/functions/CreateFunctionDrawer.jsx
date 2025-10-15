import Editor from '@monaco-editor/react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  IconButton,
  CircularProgress,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Switch,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { X, Plus, ChevronDown, Clock, Webhook, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

import { createFunction } from '../../../../../redux/slices/functions';
import { dispatch } from '../../../../../redux/store';

const DEFAULT_CODE = 'x = "Hello world"';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
];

const CRON_EXAMPLES = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Daily at 9 AM', value: '0 9 * * *' },
  { label: 'Weekdays at 9 AM', value: '0 9 * * 1-5' },
  { label: 'Weekly on Monday at 9 AM', value: '0 9 * * 1' },
  { label: 'Monthly on 1st at midnight', value: '0 0 1 * *' },
];

const DEFAULT_WEBHOOK_TRIGGER = {
  type: 'webhook',
  description: 'Webhook endpoint for processing requests',
  allowed_methods: ['GET'],
  request_body_schema: {
    type: 'object',
    properties: {},
  },
  request_query_schema: null,
  request_headers_schema: null,
  request_path_params_schema: null,
  response_schema: {
    type: 'object',
    properties: {},
    example: {},
  },
};

const DEFAULT_CRON_TRIGGER = {
  type: 'cron',
  schedule: '0 0 * * *',
  timezone: 'UTC',
  enabled: true,
  function_name: 'my_function',
  trigger_id: '',
};

function CreateFunctionDrawer({ open, onClose, baseId, onSuccess, onError }) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: 'my_function',
    description: '',
    code: DEFAULT_CODE,
    requirements: [],
    output_variables: ['x'],
    trigger: { ...DEFAULT_WEBHOOK_TRIGGER },
  });
  const [newRequirement, setNewRequirement] = useState('');
  const [newOutputVariable, setNewOutputVariable] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);

  // Sync function name with cron trigger
  useEffect(() => {
    if (formData.trigger.type === 'cron' && formData.name) {
      setFormData((prev) => ({
        ...prev,
        trigger: {
          ...prev.trigger,
          function_name: prev.name,
        },
      }));
    }
  }, [formData.name, formData.trigger.type]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTriggerChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      trigger: { ...prev.trigger, [field]: value },
    }));
  };

  const handleTriggerTypeChange = (event, newType) => {
    if (newType === null) return; // Prevent deselecting

    if (newType === 'webhook') {
      setFormData((prev) => ({
        ...prev,
        trigger: { ...DEFAULT_WEBHOOK_TRIGGER },
      }));
      setAdvancedMode(false);
    } else if (newType === 'cron') {
      setFormData((prev) => ({
        ...prev,
        trigger: {
          ...DEFAULT_CRON_TRIGGER,
          function_name: prev.name || '',
        },
      }));
    }
  };

  const handleMethodToggle = (method) => {
    const currentMethods = formData.trigger.allowed_methods || [];
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter((m) => m !== method)
      : [...currentMethods, method];

    // Check if new methods include body-accepting methods
    const bodyMethods = ['POST', 'PUT', 'PATCH'];
    const hasBodyMethod = newMethods.some((m) => bodyMethods.includes(m));

    // Update the trigger with new methods and appropriate request_body_schema
    setFormData((prev) => ({
      ...prev,
      trigger: {
        ...prev.trigger,
        allowed_methods: newMethods,
        request_body_schema: hasBodyMethod
          ? prev.trigger.request_body_schema || { type: 'object', properties: {} }
          : null,
      },
    }));
  };

  const handleSchemaChange = (schemaField, value) => {
    try {
      const parsed = value ? JSON.parse(value) : null;
      handleTriggerChange(schemaField, parsed);
    } catch (error) {
      // Invalid JSON, don't update
      console.error('Invalid JSON schema:', error);
    }
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (req) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((r) => r !== req),
    }));
  };

  const handleAddOutputVariable = () => {
    if (newOutputVariable.trim() && !formData.output_variables.includes(newOutputVariable.trim())) {
      setFormData((prev) => ({
        ...prev,
        output_variables: [...prev.output_variables, newOutputVariable.trim()],
      }));
      setNewOutputVariable('');
    }
  };

  const handleRemoveOutputVariable = (variable) => {
    setFormData((prev) => ({
      ...prev,
      output_variables: prev.output_variables.filter((v) => v !== variable),
    }));
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        name: 'my_function',
        description: '',
        code: DEFAULT_CODE,
        requirements: [],
        output_variables: ['x'],
        trigger: { ...DEFAULT_WEBHOOK_TRIGGER },
      });
      setNewRequirement('');
      setNewOutputVariable('');
      setAdvancedMode(false);
      onClose();
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      onError('Function name is required');
      return;
    }

    if (!formData.code.trim()) {
      onError('Function code is required');
      return;
    }

    // Trigger validation
    if (formData.trigger.type === 'webhook') {
      if (!formData.trigger.allowed_methods?.length) {
        onError('At least one HTTP method must be selected');
        return;
      }
    } else if (formData.trigger.type === 'cron') {
      if (!formData.trigger.schedule?.trim()) {
        onError('Cron schedule is required');
        return;
      }

      // Basic cron validation (5 fields)
      const cronParts = formData.trigger.schedule.trim().split(/\s+/);
      if (cronParts.length !== 5) {
        onError('Cron schedule must have 5 fields: minute hour day month weekday');
        return;
      }
    }

    setSubmitting(true);
    try {
      // eslint-disable-next-line no-console
      console.log('Creating function with data:', formData);
      await dispatch(createFunction(baseId, formData));
      onSuccess('Function created successfully');
      handleClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Function creation error:', error);

      // Extract error message from various possible error structures
      let errorMessage = 'Failed to create function';

      if (error.response?.data?.detail) {
        // Backend returned { detail: "error message" }
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        // Backend returned { message: "error message" }
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // Standard error object
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        // Error is a string
        errorMessage = error;
      }

      onError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: '80%', md: '60%', lg: '50%' } },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">Create Function</Typography>
          <IconButton onClick={handleClose} disabled={submitting}>
            <X size={20} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Stack spacing={1.5}>
            {/* Name */}
            <TextField
              label="Function Name"
              placeholder="my_function"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              fullWidth
              required
              disabled={submitting}
              helperText="Use lowercase letters, numbers, and underscores"
              size="small"
            />

            {/* Description */}
            <TextField
              label="Description"
              placeholder="What does this function do?"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              fullWidth
              disabled={submitting}
              size="small"
            />

            {/* Trigger Configuration */}
            <Box>
              <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                Function Trigger *
                <Tooltip title="Functions must have a trigger to execute. Choose webhook for HTTP requests or cron for scheduled execution.">
                  <Info size={14} style={{ cursor: 'help' }} />
                </Tooltip>
              </Typography>

              {/* Trigger Type Selector */}
              <ToggleButtonGroup
                value={formData.trigger.type}
                exclusive
                onChange={handleTriggerTypeChange}
                fullWidth
                disabled={submitting}
                size="small"
                sx={{ mb: 1.5 }}
              >
                <ToggleButton value="webhook">
                  <Webhook size={14} style={{ marginRight: 6 }} />
                  <Typography variant="body2">Webhook</Typography>
                </ToggleButton>
                <ToggleButton value="cron">
                  <Clock size={14} style={{ marginRight: 6 }} />
                  <Typography variant="body2">Cron Schedule</Typography>
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Webhook Configuration */}
              {formData.trigger.type === 'webhook' && (
                <Stack spacing={1.5}>

                  {/* HTTP Methods */}
                  <Box>
                    <Typography variant="caption" gutterBottom display="block" sx={{ fontWeight: 500 }}>
                      Allowed HTTP Methods *
                    </Typography>
                    <FormGroup row>
                      {HTTP_METHODS.map((method) => (
                        <FormControlLabel
                          key={method}
                          control={
                            <Checkbox
                              checked={formData.trigger.allowed_methods?.includes(method)}
                              onChange={() => handleMethodToggle(method)}
                              disabled={submitting}
                              size="small"
                            />
                          }
                          label={<Typography variant="body2">{method}</Typography>}
                        />
                      ))}
                    </FormGroup>
                  </Box>

                  {/* Advanced Mode Toggle */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={advancedMode}
                        onChange={(e) => setAdvancedMode(e.target.checked)}
                        disabled={submitting}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">Advanced: Configure Request/Response Schemas</Typography>}
                  />

                  {/* Advanced Schema Configuration */}
                  {advancedMode && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ChevronDown size={16} />}>
                        <Typography variant="body2">Schema Configuration</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1.5}>
                          <Alert severity="info" sx={{ py: 0.5, fontSize: '0.75rem' }}>
                            Define JSON schemas to specify the structure of requests and responses.
                          </Alert>

                          {/* Request Body Schema */}
                          <Box>
                            <Typography variant="caption" gutterBottom display="block" sx={{ fontWeight: 500 }}>
                              Request Body Schema
                            </Typography>
                            <TextField
                              placeholder='{"type": "object", "properties": {...}}'
                              value={formData.trigger.request_body_schema ? JSON.stringify(formData.trigger.request_body_schema, null, 2) : ''}
                              onChange={(e) => handleSchemaChange('request_body_schema', e.target.value)}
                              fullWidth
                              multiline
                              rows={3}
                              disabled={submitting}
                              size="small"
                              sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                            />
                          </Box>

                          {/* Request Query Schema */}
                          <Box>
                            <Typography variant="caption" gutterBottom display="block" sx={{ fontWeight: 500 }}>
                              Request Query Parameters Schema
                            </Typography>
                            <TextField
                              placeholder='{"type": "object", "properties": {...}}'
                              value={formData.trigger.request_query_schema ? JSON.stringify(formData.trigger.request_query_schema, null, 2) : ''}
                              onChange={(e) => handleSchemaChange('request_query_schema', e.target.value)}
                              fullWidth
                              multiline
                              rows={3}
                              disabled={submitting}
                              size="small"
                              sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                            />
                          </Box>

                          {/* Request Headers Schema */}
                          <Box>
                            <Typography variant="caption" gutterBottom display="block" sx={{ fontWeight: 500 }}>
                              Request Headers Schema
                            </Typography>
                            <TextField
                              placeholder='{"type": "object", "properties": {"Authorization": {...}}}'
                              value={formData.trigger.request_headers_schema ? JSON.stringify(formData.trigger.request_headers_schema, null, 2) : ''}
                              onChange={(e) => handleSchemaChange('request_headers_schema', e.target.value)}
                              fullWidth
                              multiline
                              rows={3}
                              disabled={submitting}
                              size="small"
                              sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                            />
                          </Box>

                          {/* Request Path Params Schema */}
                          <Box>
                            <Typography variant="caption" gutterBottom display="block" sx={{ fontWeight: 500 }}>
                              Request Path Parameters Schema
                            </Typography>
                            <TextField
                              placeholder='{"type": "object", "properties": {"user_id": {...}}}'
                              value={formData.trigger.request_path_params_schema ? JSON.stringify(formData.trigger.request_path_params_schema, null, 2) : ''}
                              onChange={(e) => handleSchemaChange('request_path_params_schema', e.target.value)}
                              fullWidth
                              multiline
                              rows={3}
                              disabled={submitting}
                              size="small"
                              sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                            />
                          </Box>

                          {/* Response Schema */}
                          <Box>
                            <Typography variant="caption" gutterBottom display="block" sx={{ fontWeight: 500 }}>
                              Response Schema *
                            </Typography>
                            <TextField
                              placeholder='{"type": "object", "properties": {...}, "example": {...}}'
                              value={formData.trigger.response_schema ? JSON.stringify(formData.trigger.response_schema, null, 2) : ''}
                              onChange={(e) => handleSchemaChange('response_schema', e.target.value)}
                              fullWidth
                              multiline
                              rows={3}
                              disabled={submitting}
                              size="small"
                              sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                            />
                          </Box>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Stack>
              )}

              {/* Cron Configuration */}
              {formData.trigger.type === 'cron' && (
                <Stack spacing={1.5}>
                  {/* Cron Schedule */}
                  <Box>
                    <Autocomplete
                      freeSolo
                      options={CRON_EXAMPLES}
                      getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                      value={formData.trigger.schedule}
                      onChange={(e, newValue) => {
                        const schedule = typeof newValue === 'string' ? newValue : newValue?.value || '';
                        handleTriggerChange('schedule', schedule);
                      }}
                      onInputChange={(e, newValue) => {
                        handleTriggerChange('schedule', newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Cron Schedule"
                          placeholder="0 0 * * *"
                          required
                          disabled={submitting}
                          size="small"
                          helperText="minute hour day month weekday"
                        />
                      )}
                      disabled={submitting}
                      size="small"
                    />
                  </Box>

                  {/* Timezone */}
                  <Autocomplete
                    options={COMMON_TIMEZONES}
                    value={formData.trigger.timezone}
                    onChange={(e, newValue) => handleTriggerChange('timezone', newValue || 'UTC')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Timezone"
                        required
                        disabled={submitting}
                        size="small"
                      />
                    )}
                    disabled={submitting}
                    size="small"
                  />

                  {/* Enabled Toggle */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.trigger.enabled}
                        onChange={(e) => handleTriggerChange('enabled', e.target.checked)}
                        disabled={submitting}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">Enabled</Typography>}
                  />

                  {/* Trigger ID (Optional) */}
                  <TextField
                    label="Trigger ID (Optional)"
                    placeholder="auto-generated if not provided"
                    value={formData.trigger.trigger_id}
                    onChange={(e) => handleTriggerChange('trigger_id', e.target.value)}
                    fullWidth
                    disabled={submitting}
                    size="small"
                    helperText="Leave empty to auto-generate"
                  />
                </Stack>
              )}
            </Box>

            {/* Requirements */}
            <Box>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                Requirements
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                {formData.requirements.map((req) => (
                  <Chip
                    key={req}
                    label={req}
                    onDelete={() => handleRemoveRequirement(req)}
                    disabled={submitting}
                    size="small"
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="package-name"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRequirement();
                    }
                  }}
                  disabled={submitting}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Plus size={14} />}
                  onClick={handleAddRequirement}
                  disabled={submitting || !newRequirement.trim()}
                >
                  Add
                </Button>
              </Stack>
            </Box>

            {/* Output Variables */}
            <Box>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                Output Variables
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                {formData.output_variables.map((variable) => (
                  <Chip
                    key={variable}
                    label={variable}
                    onDelete={() => handleRemoveOutputVariable(variable)}
                    disabled={submitting}
                    size="small"
                    color="primary"
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="variable_name"
                  value={newOutputVariable}
                  onChange={(e) => setNewOutputVariable(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOutputVariable();
                    }
                  }}
                  disabled={submitting}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Plus size={14} />}
                  onClick={handleAddOutputVariable}
                  disabled={submitting || !newOutputVariable.trim()}
                >
                  Add
                </Button>
              </Stack>
            </Box>

            {/* Code Editor */}
            <Box>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                Python Code *
              </Typography>
              <Box
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  height: 400,
                }}
              >
                <Editor
                  height="400px"
                  defaultLanguage="python"
                  value={formData.code}
                  onChange={(value) => handleChange('code', value || '')}
                  theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    readOnly: submitting,
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !formData.name.trim() || !formData.code.trim()}
            startIcon={submitting && <CircularProgress size={16} />}
          >
            {submitting ? 'Creating...' : 'Create Function'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

export default CreateFunctionDrawer;
