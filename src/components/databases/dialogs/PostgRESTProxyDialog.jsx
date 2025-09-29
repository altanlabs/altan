import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Alert,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState } from 'react';

import { optimai_database } from '../../../utils/axios';
import Iconify from '../../iconify';

const HTTP_METHODS = [
  { value: 'GET', color: 'success', description: 'Retrieve data' },
  { value: 'POST', color: 'primary', description: 'Create new data' },
  { value: 'PATCH', color: 'warning', description: 'Update existing data' },
  { value: 'PUT', color: 'warning', description: 'Replace data' },
  { value: 'DELETE', color: 'error', description: 'Delete data' },
  { value: 'HEAD', color: 'info', description: 'Get headers only' },
  { value: 'OPTIONS', color: 'default', description: 'Get allowed methods' },
];

function PostgRESTProxyDialog({ open, onClose, baseId }) {
  const theme = useTheme();
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('{}');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = `https://database.altan.ai/admin/${baseId}`;

  const handleReset = () => {
    setMethod('GET');
    setEndpoint('');
    setHeaders('{}');
    setBody('{}');
    setResponse(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validateJSON = (jsonString) => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Validate JSON inputs
      if (!validateJSON(headers)) {
        throw new Error('Invalid JSON format in headers');
      }

      if (['POST', 'PATCH', 'PUT'].includes(method) && body && !validateJSON(body)) {
        throw new Error('Invalid JSON format in body');
      }

      // Construct the full URL using the working admin records pattern
      // If the endpoint looks like a table name (no query params), use /admin/records pattern
      // Otherwise, use the direct admin pattern for other PostgREST endpoints
      let fullUrl;
      if (endpoint.includes('?') || endpoint.includes('/')) {
        // Complex endpoint with query params or paths - try to extract table name
        const tableName = endpoint.split('?')[0].replace(/^\/+/, '');
        const queryString = endpoint.includes('?') ? endpoint.split('?')[1] : '';
        fullUrl = `/admin/records/${baseId}/${tableName}${queryString ? `?${queryString}` : ''}`;
      } else {
        // Simple table name - use records pattern
        fullUrl = `/admin/records/${baseId}/${endpoint.replace(/^\/+/, '')}`;
      }

      // Parse headers
      const parsedHeaders = JSON.parse(headers || '{}');

      // Configure request
      const config = {
        method: method.toLowerCase(),
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders,
        },
      };

      // Add body for methods that support it
      if (['POST', 'PATCH', 'PUT'].includes(method) && body) {
        config.data = JSON.parse(body);
      }

      // Make the request
      const result = await optimai_database.request({
        url: fullUrl,
        ...config,
      });

      setResponse({
        status: result.status,
        statusText: result.statusText,
        headers: result.headers,
        data: result.data,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PostgREST Proxy Request Error:', err);
      setError({
        message: err.message || 'Request failed',
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
          backdropFilter: 'blur(20px)',
          border:
            theme.palette.mode === 'light'
              ? `1px solid ${alpha(theme.palette.divider, 0.12)}`
              : 'none',
        },
      }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
            }}
          >
            <Iconify
              icon="mdi:api"
              sx={{ width: 24, height: 24 }}
            />
          </Box>
          <Box>
            <Typography
              variant="h6"
              component="div"
            >
              PostgREST Admin Proxy
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1}>
          {/* Request Configuration */}
          <Paper
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.neutral, 0.5),
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            }}
          >
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Request Configuration
            </Typography>

            <Stack spacing={2}>
              {/* Method and Endpoint */}
              <Stack
                direction="row"
                spacing={2}
              >
                <FormControl
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <InputLabel>Method</InputLabel>
                  <Select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    label="Method"
                  >
                    {HTTP_METHODS.map((m) => (
                      <MenuItem
                        key={m.value}
                        value={m.value}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                        >
                          <Chip
                            label={m.value}
                            size="small"
                            color={m.color}
                            sx={{ minWidth: 60, fontWeight: 600 }}
                          />
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Endpoint"
                  placeholder="events?event_name=eq.credit_transaction&limit=10"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1, whiteSpace: 'nowrap' }}
                      >
                        {baseUrl}/records/
                      </Typography>
                    ),
                  }}
                />
              </Stack>

              {/* Headers */}
              <TextField
                label="Headers (JSON)"
                placeholder='{"Prefer": "return=representation"}'
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                multiline
                rows={2}
                size="small"
                fullWidth
                error={headers && !validateJSON(headers)}
                helperText={
                  headers && !validateJSON(headers)
                    ? 'Invalid JSON format'
                    : 'Additional headers to include with the request'
                }
              />

              {/* Body (for POST/PATCH/PUT) */}
              {['POST', 'PATCH', 'PUT'].includes(method) && (
                <TextField
                  label="Request Body (JSON)"
                  placeholder='{"column": "value"}'
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  multiline
                  rows={4}
                  size="small"
                  fullWidth
                  error={body && !validateJSON(body)}
                  helperText={
                    body && !validateJSON(body)
                      ? 'Invalid JSON format'
                      : 'JSON data to send in the request body'
                  }
                />
              )}
            </Stack>
          </Paper>

          {/* Response Section */}
          {(response || error) && (
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.neutral, 0.5),
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600 }}
                >
                  Response
                </Typography>
                {response && (
                  <Chip
                    label={`${response.status} ${response.statusText}`}
                    size="small"
                    color={response.status < 300 ? 'success' : 'error'}
                    sx={{ fontWeight: 600 }}
                  />
                )}
                {error && (
                  <Chip
                    label={error.status ? `${error.status} ${error.statusText}` : 'Error'}
                    size="small"
                    color="error"
                    sx={{ fontWeight: 600 }}
                  />
                )}
                <Box sx={{ flex: 1 }} />
                <Tooltip title="Copy response">
                  <IconButton
                    size="small"
                    onClick={() => {
                      const text = JSON.stringify(response || error, null, 2);
                      navigator.clipboard.writeText(text);
                    }}
                  >
                    <Iconify
                      icon="mdi:content-copy"
                      sx={{ width: 16, height: 16 }}
                    />
                  </IconButton>
                </Tooltip>
              </Stack>

              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 2, borderRadius: 2 }}
                >
                  <Typography variant="body2">
                    <strong>Error:</strong> {error.message}
                  </Typography>
                </Alert>
              )}

              <TextField
                multiline
                rows={10}
                fullWidth
                value={JSON.stringify(response?.data || error?.data || error, null, 2)}
                InputProps={{
                  readOnly: true,
                  sx: {
                    fontFamily: 'Monaco, Consolas, "Lucida Console", monospace',
                    fontSize: '0.875rem',
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  },
                }}
              />
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleReset}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Reset
        </Button>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !endpoint.trim()}
          startIcon={
            loading ? (
              <CircularProgress size={16} />
            ) : (
              <Iconify
                icon="mdi:send"
                sx={{ width: 16, height: 16 }}
              />
            )
          }
          sx={{
            borderRadius: 2,
            minWidth: 100,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.24)}`,
            },
          }}
        >
          {loading ? 'Sending...' : 'Send Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

PostgRESTProxyDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  baseId: PropTypes.string.isRequired,
  database: PropTypes.object,
};

export default PostgRESTProxyDialog;
