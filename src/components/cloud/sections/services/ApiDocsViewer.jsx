import { AlertCircle, ChevronDown, ChevronRight, Copy, Loader2, Play } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const MethodBadge = ({ method }) => {
  const colors = {
    GET: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    POST: 'bg-green-500/10 text-green-500 border-green-500/20',
    PUT: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    DELETE: 'bg-red-500/10 text-red-500 border-red-500/20',
    PATCH: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded border ${colors[method.toUpperCase()] || 'bg-gray-500/10 text-gray-500'}`}>
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
    <div className="border border-border rounded-lg mb-3 overflow-hidden bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <MethodBadge method={method} />
        <span className="font-mono text-sm flex-1">{path}</span>
        {summary && <span className="text-sm text-muted-foreground">{summary}</span>}
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4 bg-muted/20">
          {description && <p className="text-sm text-muted-foreground">{description}</p>}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Endpoint:</span>
              <code className="text-xs bg-background px-2 py-1 rounded border border-border flex-1">
                {cloudUrl}/services{path}
              </code>
              <button
                onClick={() => copyToClipboard(`${cloudUrl}/services${path}`)}
                className="p-1 hover:bg-background rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {hasBody && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Request Body (JSON):</span>
                  <button
                    onClick={() => setRequestData('{}')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
                <textarea
                  value={requestData}
                  onChange={(e) => setRequestData(e.target.value)}
                  className="w-full h-32 text-xs bg-background p-3 rounded border border-border font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder='{"key": "value"}'
                  spellCheck={false}
                />
                {requestBody?.schema && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Show schema
                    </summary>
                    <pre className="mt-2 text-xs bg-background p-2 rounded border border-border overflow-auto">
                      {JSON.stringify(requestBody.schema, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <button
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {testing ? 'Testing...' : 'Test Endpoint'}
            </button>

            {response && (
              <div className="mt-4">
                <div className="text-xs font-semibold mb-2 text-foreground">Response:</div>
                <pre className="text-xs bg-background p-3 rounded border border-border overflow-auto max-h-64">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
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
        setError(err.message || 'Failed to load API documentation');
        setLoading(false);
      });
  }, [cloudUrl]);

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
    <div className="w-full h-full overflow-auto p-6 space-y-4" style={{ height: 'calc(100vh - 220px)' }}>
      {endpoints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No endpoints found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {endpoints.map((endpoint, index) => (
            <EndpointItem
              key={`${endpoint.method}-${endpoint.path}-${index}`}
              {...endpoint}
              cloudUrl={cloudUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ApiDocsViewer;

