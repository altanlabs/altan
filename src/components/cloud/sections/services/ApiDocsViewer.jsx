import { AlertCircle, Loader2 } from 'lucide-react';
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
        setSpec(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load API documentation');
        setLoading(false);
      });
  }, [cloudUrl]);

  // Initialize Swagger UI once we have both the spec and the DOM element
  useEffect(() => {
    if (!spec || !containerRef.current || swaggerUIRef.current || !cloudUrl) {
      return;
    }

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
      presets: [SwaggerUI.presets.apis],
      layout: 'BaseLayout',
    });
  }, [spec, cloudUrl]);

  if (loading) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h3 className="text-base font-semibold text-foreground">Unable to load API documentation</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-auto"
      style={{
        height: 'calc(100vh - 220px)',
        minHeight: '500px',
      }}
    >
      <style>
        {`
          .swagger-ui .topbar { display: none; }
          .swagger-ui .information-container { display: none; }
          .swagger-ui .info { display: none; }
        `}
      </style>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export default ApiDocsViewer;

