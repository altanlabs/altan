import { useSnackbar } from 'notistack';
import { useState, useCallback, useEffect } from 'react';

import { Webhook, RequestState } from '../types';
import { generateDefaultValues } from '../utils/schemaUtils';

export const useWebhookTester = (webhook: Webhook) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('body');
  const [formData, setFormData] = useState<Record<string, any>>({});

  const schema = webhook?.details?.schema;
  const methods = schema?.methods || ['POST'];
  const bodySchema = schema?.body;
  const querySchema = schema?.query_params;
  const requiredFields = bodySchema?.required || [];

  // Initialize form data when webhook or schema changes
  useEffect(() => {
    if (bodySchema) {
      const defaults = generateDefaultValues(bodySchema);
      setFormData(defaults);
    }
  }, [bodySchema]);

  // Initialize request state
  const [request, setRequest] = useState<RequestState>({
    method: methods[0] || 'POST',
    url: webhook?.url ? `https://api.altan.ai/galaxia/hook/${webhook.url}` : '',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    queryParams: querySchema?.properties
      ? Object.entries(querySchema.properties).map(([key]) => ({ key, value: '' }))
      : [{ key: '', value: '' }],
    body: '{}',
  });

  // Handle form field changes
  const handleFormChange = useCallback((key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Handle sending the request
  const sendRequest = useCallback(async () => {
    if (!request.url) {
      enqueueSnackbar('Please enter a valid URL', { variant: 'error' });
      return null;
    }

    try {
      setIsSending(true);

      // Prepare headers
      const headers = request.headers.reduce((acc: Record<string, string>, { key, value }) => {
        if (key) acc[key] = value;
        return acc;
      }, {});

      // Prepare query parameters
      const queryParams = new URLSearchParams();
      request.queryParams.forEach(({ key, value }) => {
        if (key) queryParams.append(key, value);
      });

      const urlWithParams = queryParams.toString()
        ? `${request.url}?${queryParams.toString()}`
        : request.url;

      // Prepare request body
      let body: Record<string, any> | undefined;

      if (activeTab === 'body' && bodySchema) {
        body = Object.entries(formData).reduce((acc, [key, value]) => {
          const isRequired = bodySchema.required?.includes(key) ?? false;
          const property = bodySchema.properties?.[key];

          // Falsy-but-valid values that we want to keep
          const isFalsyButValid =
            value === 0 ||
            value === false ||
            (Array.isArray(value) && value.length === 0);

          const isStringField = property?.type === 'string';
          const isEmptyString = value === '';

          // 1) Required fields: always include, even if empty string
          if (isRequired) {
            acc[key] = value;
          }
          // 2) Optional strings that are empty → explicitly set undefined
          else if (isStringField && isEmptyString) {
            acc[key] = undefined;
          }
          // 3) Everything else: include if not null/undefined OR if it's a falsy-but-valid
          else if (
            value !== null &&
            value !== undefined ||
            isFalsyButValid
          ) {
            acc[key] = value;
          }

          return acc;
        }, {} as Record<string, any>);
      }
      else if (activeTab === 'body' && request.body) {
        try {
          const bodyString = typeof request.body === 'string'
            ? request.body
            : JSON.stringify(request.body, null, 2);

          if (bodyString.trim()) {
            body = JSON.parse(bodyString);
          }
        } catch (e: any) {
          throw new Error(`Invalid JSON in request body: ${e.message}`);
        }
      }

      // Now `body` will have optional string fields set to `undefined` when empty,
      // required strings left as `''`, and other falsy-but-valid values preserved.

      const fetchOptions = {
        method: request.method,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        ...(body && { body: JSON.stringify(body) })
      };

      // Make the request
      const response = await fetch(urlWithParams, fetchOptions);
      const responseData = await response.json().catch(() => ({
        status: response.status,
        statusText: response.statusText,
        message: 'No response body',
      }));

      enqueueSnackbar(`Request sent successfully! Status: ${response.status}`, {
        variant: response.ok ? 'success' : 'warning'
      });

      return responseData;
    } catch (error: any) {
      console.error('Request failed:', error);
      enqueueSnackbar(`Error: ${error.message || 'Failed to send request'}`, {
        variant: 'error',
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [request, formData, activeTab, enqueueSnackbar]);

  // Update request state
  const updateRequest = useCallback((updates: Partial<RequestState>) => {
    setRequest(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Update headers
  const updateHeader = useCallback((index: number, field: keyof typeof request.headers[0], value: string) => {
    const newHeaders = [...request.headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    updateRequest({ headers: newHeaders });
  }, [request.headers, updateRequest]);

  // Add a new header
  const addHeader = useCallback(() => {
    updateRequest({
      headers: [...request.headers, { key: '', value: '' }]
    });
  }, [request.headers, updateRequest]);

  // Remove a header
  const removeHeader = useCallback((index: number) => {
    const newHeaders = request.headers.filter((_, i) => i !== index);
    updateRequest({ headers: newHeaders });
  }, [request.headers, updateRequest]);

  // Update query parameters
  const updateQueryParam = useCallback((index: number, field: 'key' | 'value', value: string) => {
    const newParams = [...request.queryParams];
    newParams[index] = { ...newParams[index], [field]: value };
    updateRequest({ queryParams: newParams });
  }, [request.queryParams, updateRequest]);

  // Add a new query parameter
  const addQueryParam = useCallback(() => {
    updateRequest({
      queryParams: [...request.queryParams, { key: '', value: '' }]
    });
  }, [request.queryParams, updateRequest]);

  // Remove a query parameter
  const removeQueryParam = useCallback((index: number) => {
    const newParams = request.queryParams.filter((_, i) => i !== index);
    updateRequest({ queryParams: newParams });
  }, [request.queryParams, updateRequest]);

  return {
    // State
    isSending,
    activeTab,
    formData,
    request,
    schema,
    bodySchema,
    querySchema,
    methods,
    requiredFields,

    // Actions
    setActiveTab,
    setFormData,
    updateRequest,
    handleFormChange,
    sendRequest,
    updateHeader,
    addHeader,
    removeHeader,
    updateQueryParam,
    addQueryParam,
    removeQueryParam,
  };
};
