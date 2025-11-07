import { AlertCircle, Loader2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

function ApiDocsViewer({ cloudUrl }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spec, setSpec] = useState(null);
  const [swaggerLoaded, setSwaggerLoaded] = useState(false);
  const containerRef = useRef(null);
  const swaggerUIRef = useRef(null);

  // Load Swagger UI from CDN
  useEffect(() => {
    // Check if already loaded
    if (window.SwaggerUIBundle) {
      setSwaggerLoaded(true);
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js';
    script.onload = () => setSwaggerLoaded(true);
    script.onerror = () => {
      setError('Failed to load Swagger UI library');
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (link.parentNode) link.parentNode.removeChild(link);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

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
    if (!spec || !containerRef.current || swaggerUIRef.current || !cloudUrl || !swaggerLoaded || !window.SwaggerUIBundle) {
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

    swaggerUIRef.current = window.SwaggerUIBundle({
      spec: specWithServer,
      domNode: containerRef.current,
      deepLinking: true,
      presets: [window.SwaggerUIBundle.presets.apis],
      layout: 'BaseLayout',
    });
  }, [spec, cloudUrl, swaggerLoaded]);

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
          /* Hide Swagger UI header elements */
          .swagger-ui .topbar { display: none; }
          .swagger-ui .information-container { display: none; }
          .swagger-ui .info { display: none; }
          .swagger-ui .servers { display: none; }
          .swagger-ui .scheme-container { display: none; }
          
          /* Base dark theme */
          .swagger-ui {
            background: transparent;
            color: hsl(var(--foreground));
          }
          
          /* Wrapper */
          .swagger-ui .wrapper {
            padding: 0;
          }
          
          /* Section headings */
          .swagger-ui .opblock-tag {
            background: hsl(var(--muted));
            border: 1px solid hsl(var(--border));
            color: hsl(var(--foreground));
            border-radius: 0.5rem;
            margin-bottom: 1rem;
          }
          
          /* Operation blocks */
          .swagger-ui .opblock {
            background: hsl(var(--card));
            border: 1px solid hsl(var(--border));
            border-radius: 0.5rem;
            margin-bottom: 1rem;
          }
          
          .swagger-ui .opblock .opblock-summary {
            border-color: hsl(var(--border));
          }
          
          /* HTTP method colors */
          .swagger-ui .opblock.opblock-get {
            background: hsl(var(--card));
            border-color: rgb(97, 175, 254);
          }
          .swagger-ui .opblock.opblock-get .opblock-summary {
            background: rgba(97, 175, 254, 0.1);
            border-color: rgba(97, 175, 254, 0.3);
          }
          .swagger-ui .opblock.opblock-get .opblock-summary-method {
            background: rgb(97, 175, 254);
          }
          
          .swagger-ui .opblock.opblock-post {
            background: hsl(var(--card));
            border-color: rgb(73, 204, 144);
          }
          .swagger-ui .opblock.opblock-post .opblock-summary {
            background: rgba(73, 204, 144, 0.1);
            border-color: rgba(73, 204, 144, 0.3);
          }
          .swagger-ui .opblock.opblock-post .opblock-summary-method {
            background: rgb(73, 204, 144);
          }
          
          .swagger-ui .opblock.opblock-put {
            background: hsl(var(--card));
            border-color: rgb(252, 161, 48);
          }
          .swagger-ui .opblock.opblock-put .opblock-summary {
            background: rgba(252, 161, 48, 0.1);
            border-color: rgba(252, 161, 48, 0.3);
          }
          .swagger-ui .opblock.opblock-put .opblock-summary-method {
            background: rgb(252, 161, 48);
          }
          
          .swagger-ui .opblock.opblock-delete {
            background: hsl(var(--card));
            border-color: rgb(249, 62, 62);
          }
          .swagger-ui .opblock.opblock-delete .opblock-summary {
            background: rgba(249, 62, 62, 0.1);
            border-color: rgba(249, 62, 62, 0.3);
          }
          .swagger-ui .opblock.opblock-delete .opblock-summary-method {
            background: rgb(249, 62, 62);
          }
          
          /* Text colors */
          .swagger-ui .opblock-summary-path {
            color: hsl(var(--foreground)) !important;
            font-weight: 600;
          }
          .swagger-ui .opblock-summary-path a {
            color: hsl(var(--foreground)) !important;
          }
          .swagger-ui .opblock-summary-description {
            color: hsl(var(--muted-foreground));
          }
          
          /* Code blocks */
          .swagger-ui .opblock-body pre,
          .swagger-ui .microlight {
            background: hsl(var(--muted)) !important;
            border: 1px solid hsl(var(--border));
            color: hsl(var(--foreground));
          }
          
          /* Tables */
          .swagger-ui table {
            background: transparent;
          }
          .swagger-ui table thead tr td,
          .swagger-ui table thead tr th {
            background: hsl(var(--muted));
            border-color: hsl(var(--border));
            color: hsl(var(--foreground));
            font-weight: 600;
          }
          .swagger-ui table tbody tr td {
            border-color: hsl(var(--border));
            color: hsl(var(--muted-foreground));
          }
          
          /* Buttons */
          .swagger-ui .btn {
            background: hsl(var(--primary));
            border: none;
            color: hsl(var(--primary-foreground));
            border-radius: 0.375rem;
            font-weight: 500;
          }
          .swagger-ui .btn:hover {
            background: hsl(var(--primary) / 0.9);
          }
          .swagger-ui .btn.cancel {
            background: hsl(var(--secondary));
            color: hsl(var(--secondary-foreground));
          }
          
          /* Inputs */
          .swagger-ui input[type=text],
          .swagger-ui input[type=email],
          .swagger-ui input[type=password],
          .swagger-ui textarea,
          .swagger-ui select {
            background: hsl(var(--background));
            border: 1px solid hsl(var(--border));
            color: hsl(var(--foreground));
            border-radius: 0.375rem;
          }
          
          /* Models/Schemas */
          .swagger-ui .model-box,
          .swagger-ui .model {
            background: hsl(var(--muted));
            border-color: hsl(var(--border));
            color: hsl(var(--foreground));
          }
          .swagger-ui .model-title {
            color: hsl(var(--foreground));
          }
          .swagger-ui section.models {
            background: transparent;
            border-color: hsl(var(--border));
          }
          .swagger-ui section.models h4 {
            color: hsl(var(--foreground));
          }
          
          /* Parameters */
          .swagger-ui .parameters-col_description {
            color: hsl(var(--muted-foreground));
          }
          .swagger-ui .parameter__name {
            color: hsl(var(--foreground));
          }
          .swagger-ui .parameter__type {
            color: hsl(var(--muted-foreground));
          }
          .swagger-ui .opblock-section-header {
            background: hsl(var(--muted)) !important;
            border-color: hsl(var(--border)) !important;
          }
          .swagger-ui .opblock-section-header h4 {
            color: hsl(var(--foreground));
          }
          
          /* Responses */
          .swagger-ui .response-col_status {
            color: hsl(var(--foreground));
          }
          .swagger-ui .response-col_description {
            color: hsl(var(--muted-foreground));
          }
          .swagger-ui .responses-inner {
            background: hsl(var(--card)) !important;
          }
          
          /* Tab buttons */
          .swagger-ui .tab li {
            color: hsl(var(--muted-foreground));
          }
          .swagger-ui .tab li.active {
            color: hsl(var(--foreground));
          }
          
          /* Links */
          .swagger-ui a {
            color: hsl(var(--primary));
          }
          .swagger-ui a:hover {
            color: hsl(var(--primary) / 0.8);
          }
          
          /* Markdown */
          .swagger-ui .markdown p,
          .swagger-ui .markdown code {
            color: hsl(var(--muted-foreground));
          }
          
          /* Try it out section */
          .swagger-ui .opblock-body {
            background: hsl(var(--card));
          }
          
          /* Response wrapper */
          .swagger-ui .responses-wrapper {
            background: transparent;
          }
        `}
      </style>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export default ApiDocsViewer;

