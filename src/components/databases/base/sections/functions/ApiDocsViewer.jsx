import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { AlertCircle, ChevronDown, ChevronRight, Copy, Play } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const MethodBadge = ({ method }) => {
  const colors = {
    GET: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
    POST: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' },
    PUT: { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308', border: 'rgba(234, 179, 8, 0.2)' },
    DELETE: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
    PATCH: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.2)' },
  };

  const color = colors[method.toUpperCase()] || { bg: 'rgba(156, 163, 175, 0.1)', text: '#9ca3af', border: 'rgba(156, 163, 175, 0.2)' };

  return (
    <span
      style={{
        padding: '4px 8px',
        fontSize: '11px',
        fontWeight: 600,
        borderRadius: '4px',
        border: `1px solid ${color.border}`,
        backgroundColor: color.bg,
        color: color.text,
      }}
    >
      {method.toUpperCase()}
    </span>
  );
};

const EndpointItem = ({ path, method, summary, description, cloudUrl, parameters, requestBody }) => {
  const [expanded, setExpanded] = useState(false);
  const [testing, setTesting] = useState(false);
  const [response, setResponse] = useState(null);
  const [requestData, setRequestData] = useState('{}');

  const hasBody = ['post', 'put', 'patch'].includes(method.toLowerCase());

  const handleTest = async () => {
    setTesting(true);
    try {
      const options = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (hasBody && requestData) {
        try {
          options.body = JSON.stringify(JSON.parse(requestData));
        } catch (e) {
          setResponse({ error: 'Invalid JSON in request body' });
          setTesting(false);
          return;
        }
      }

      const res = await fetch(`${cloudUrl}/services${path}`, options);
      const data = await res.json();
      setResponse({ status: res.status, data });
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box
      sx={{
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        mb: 2,
        overflow: 'hidden',
        bgcolor: 'rgba(255, 255, 255, 0.02)',
      }}
    >
      <Box
        component="button"
        onClick={() => setExpanded(!expanded)}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          cursor: 'pointer',
          border: 'none',
          bgcolor: 'transparent',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.05)',
          },
          transition: 'background-color 0.2s',
          textAlign: 'left',
        }}
      >
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <MethodBadge method={method} />
        <Typography component="span" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', flex: 1, color: 'white' }}>
          {path}
        </Typography>
        {summary && (
          <Typography component="span" sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            {summary}
          </Typography>
        )}
      </Box>

      {expanded && (
        <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
          {description && (
            <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
              {description}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Endpoint:</Typography>
            <Box
              component="code"
              sx={{
                fontSize: '0.75rem',
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                px: 1,
                py: 0.5,
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                flex: 1,
              }}
            >
              {cloudUrl}/services{path}
            </Box>
            <Box
              component="button"
              onClick={() => copyToClipboard(`${cloudUrl}/services${path}`)}
              sx={{
                p: 0.5,
                cursor: 'pointer',
                border: 'none',
                bgcolor: 'transparent',
                borderRadius: '4px',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <Copy size={16} />
            </Box>
          </Box>

          {hasBody && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Request Body (JSON):</Typography>
                <Box
                  component="button"
                  onClick={() => setRequestData('{}')}
                  sx={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    border: 'none',
                    bgcolor: 'transparent',
                    '&:hover': {
                      color: 'white',
                    },
                  }}
                >
                  Clear
                </Box>
              </Box>
              <Box
                component="textarea"
                value={requestData}
                onChange={(e) => setRequestData(e.target.value)}
                sx={{
                  width: '100%',
                  height: '128px',
                  fontSize: '0.75rem',
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  p: 1.5,
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  color: 'white',
                  '&:focus': {
                    outline: 'none',
                    borderColor: '#3b82f6',
                  },
                }}
                placeholder='{"key": "value"}'
                spellCheck={false}
              />
              {requestBody?.schema && (
                <Box component="details" sx={{ fontSize: '0.75rem', mt: 1 }}>
                  <Box
                    component="summary"
                    sx={{
                      cursor: 'pointer',
                      color: 'rgba(255, 255, 255, 0.6)',
                      '&:hover': {
                        color: 'white',
                      },
                    }}
                  >
                    Show schema
                  </Box>
                  <Box
                    component="pre"
                    sx={{
                      mt: 1,
                      fontSize: '0.75rem',
                      bgcolor: 'rgba(0, 0, 0, 0.3)',
                      p: 1,
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      overflow: 'auto',
                    }}
                  >
                    {JSON.stringify(requestBody.schema, null, 2)}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          <Box
            component="button"
            onClick={handleTest}
            disabled={testing}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              bgcolor: '#3b82f6',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: testing ? 'not-allowed' : 'pointer',
              opacity: testing ? 0.5 : 1,
              '&:hover': {
                bgcolor: testing ? '#3b82f6' : '#2563eb',
              },
            }}
          >
            <Play size={16} />
            {testing ? 'Testing...' : 'Test Endpoint'}
          </Box>

          {response && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 1 }}>Response:</Typography>
              <Box
                component="pre"
                sx={{
                  fontSize: '0.75rem',
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  p: 1.5,
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  overflow: 'auto',
                  maxHeight: '256px',
                }}
              >
                {JSON.stringify(response, null, 2)}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

function ApiDocsViewer({ cloudUrl }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spec, setSpec] = useState(null);
  const [endpoints, setEndpoints] = useState([]);

  // Fetch the OpenAPI spec
  useEffect(() => {
    if (!cloudUrl) {
      setError('Cloud URL not available');
      setLoading(false);
      return;
    }

    const openapiUrl = `${cloudUrl}/services/openapi.json`;

    fetch(openapiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('OpenAPI spec loaded successfully:', data);
        setSpec(data);

        // Parse endpoints
        const parsedEndpoints = [];
        Object.entries(data.paths || {}).forEach(([path, methods]) => {
          Object.entries(methods).forEach(([method, details]) => {
            if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
              const requestBody = details.requestBody?.content?.['application/json'];
              parsedEndpoints.push({
                path,
                method,
                summary: details.summary || '',
                description: details.description || '',
                parameters: details.parameters || [],
                requestBody: requestBody || null,
              });
            }
          });
        });

        setEndpoints(parsedEndpoints);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading OpenAPI spec:', err);
        setError(err.message || 'Failed to load API documentation');
        setLoading(false);
      });
  }, [cloudUrl]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading API documentation...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <AlertCircle size={48} color="#ef4444" />
          <Typography variant="h6" color="error">
            Unable to load API documentation
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
            {error}
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 'calc(100vh - 250px)',
        width: '100%',
        overflow: 'auto',
        p: 3,
      }}
    >

      {endpoints.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">No endpoints found</Typography>
        </Box>
      ) : (
        <Box>
          {endpoints.map((endpoint, index) => (
            <EndpointItem key={`${endpoint.method}-${endpoint.path}-${index}`} {...endpoint} cloudUrl={cloudUrl} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default ApiDocsViewer;
