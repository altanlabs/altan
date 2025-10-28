import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { AlertCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import SwaggerUI from 'swagger-ui-dist/swagger-ui-es-bundle';
import 'swagger-ui-dist/swagger-ui.css';

function ApiDocsViewer({ cloudUrl }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spec, setSpec] = useState(null);
  const containerRef = useRef(null);
  const swaggerUIRef = useRef(null);

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
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading OpenAPI spec:', err);
        setError(err.message || 'Failed to load API documentation');
        setLoading(false);
      });
  }, [cloudUrl]);

  // Initialize Swagger UI once we have both the spec and the DOM element
  useEffect(() => {
    if (!spec || !containerRef.current || swaggerUIRef.current || !cloudUrl) {
      return;
    }

    console.log('Initializing Swagger UI...');
    
    // Override the spec to include the correct server URL
    const specWithServer = {
      ...spec,
      servers: [
        {
          url: `${cloudUrl}/services`,
          description: 'Production server',
        },
      ],
    };
    
    swaggerUIRef.current = SwaggerUI({
      spec: specWithServer,
      domNode: containerRef.current,
      deepLinking: true,
      presets: [
        SwaggerUI.presets.apis,
      ],
      layout: 'BaseLayout',
    });
  }, [spec, cloudUrl]);

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
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress />
          <Typography
            variant="body2"
            color="text.secondary"
          >
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
        <Stack
          spacing={2}
          alignItems="center"
        >
          <AlertCircle
            size={48}
            color="#ef4444"
          />
          <Typography
            variant="h6"
            color="error"
          >
            Unable to load API documentation
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ maxWidth: 400 }}
          >
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
        m: 0,
        p: 0,
        '& .swagger-ui': {
          fontFamily: 'inherit',
        },
        '& .swagger-ui .topbar': {
          display: 'none',
        },
        '& .swagger-ui .information-container': {
          display: 'none',
        },
        '& .swagger-ui .info': {
          display: 'none',
        },
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
}

export default ApiDocsViewer;
