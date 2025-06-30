import { Button, Tabs, Tab, Typography, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, CircularProgress, TextField } from '@mui/material';
import React, { useState } from 'react';

// @ts-ignore - CustomDialog is a JSX file without types
import { FormField } from './FormField';
import { KeyValueEditor } from './KeyValueEditor';
import CustomDialog from '../../../dialogs/CustomDialog';
import Iconify from '../../../iconify';
import AceWrapper from '../../../json/AceWrapper';
import { Webhook } from '../../../types';
import { useWebhookTester } from '../hooks/useWebhookTester';

interface TestWebhookDialogProps {
  open: boolean;
  onClose: () => void;
  webhook: Webhook;
}

export const TestWebhookDialog: React.FC<TestWebhookDialogProps> = ({
  open,
  onClose,
  webhook,
}) => {
  const [activeTab, setActiveTab] = useState('body');
  const {
    isSending,
    formData,
    request,
    schema,
    bodySchema,
    querySchema,
    methods,
    requiredFields,
    handleFormChange,
    sendRequest,
    updateRequest,
    updateHeader,
    addHeader,
    removeHeader,
    updateQueryParam,
    addQueryParam,
    removeQueryParam,
  } = useWebhookTester(webhook);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleSend = async () => {
    try {
      const response = await sendRequest();
      console.log('Webhook response:', response);
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }
  };

  const renderBodyContent = () => {
    if (!bodySchema?.properties) {
      return (
        <AceWrapper
          value={typeof formData === 'string' ? formData : JSON.stringify(formData, null, 2)}
          onChange={(value: string) => {
            try {
              const parsed = JSON.parse(value);
              updateRequest({ body: parsed });
            } catch (e) {
              // If invalid JSON, just update as string
              updateRequest({ body: value });
            }
          }}
          fieldType="object"
          name="request-body-editor"
          style={{
            flex: 1,
            minHeight: '300px',
            borderRadius: '4px',
            border: '1px solid rgba(0, 0, 0, 0.23)',
          }}
        />
      );
    }

    return (
      <div className="space-y-4 mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Fill in the form below to generate the request body
        </p>

        <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4">
          {Object.entries(bodySchema.properties).map(([key, prop]) => (
            <div key={key} className="space-y-1">
              <FormField
                name={key}
                property={prop}
                value={formData[key]}
                onChange={(value) => handleFormChange(key, value)}
                required={requiredFields.includes(key)}
              />
            </div>
          ))}
        </div>

        <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Raw JSON
          </h3>
          <AceWrapper
            value={JSON.stringify(formData, null, 2)}
            onChange={(value: string) => {
              try {
                const parsed = JSON.parse(value);
                Object.entries(parsed).forEach(([key, val]) => {
                  handleFormChange(key, val);
                });
              } catch (e) {
                // Ignore invalid JSON
              }
            }}
            fieldType="object"
            name="request-body-json"
            style={{
              minHeight: '200px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 0, 0, 0.23)',
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
      className="w-full max-w-4xl h-[90vh] flex flex-col"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Iconify icon="mdi:webhook" width={24} />
          <h2 className="text-lg font-medium">Test Webhook: {webhook.name}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <FormControl className="w-full sm:w-32" size="small">
            <InputLabel>Method</InputLabel>
            <Select
              value={request.method}
              onChange={(e: SelectChangeEvent) =>
                updateRequest({ method: e.target.value })
              }
              label="Method"
            >
              {methods.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="flex-1">
            <Typography variant="subtitle2" gutterBottom>
              Request URL
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={request.url}
              onChange={(e) => updateRequest({ url: e.target.value })}
              placeholder="https://api.altan.ai/galaxia/hook/..."
            />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          className="mb-4"
          classes={{
            indicator: 'bg-blue-500',
          }}
        >
          <Tab label="Body" value="body" />
          <Tab label="Headers" value="headers" />
          <Tab label="Query Params" value="params" />
        </Tabs>

        <div className="mt-2 flex-1 flex flex-col min-h-0">
          {activeTab === 'body' && renderBodyContent()}

          {activeTab === 'headers' && (
            <KeyValueEditor
              items={request.headers}
              onChange={(headers) => updateRequest({ headers })}
              title="Request Headers"
              keyPlaceholder="Header Name"
              valuePlaceholder="Header Value"
              addButtonText="Add Header"
            />
          )}

          {activeTab === 'params' && (
            <KeyValueEditor
              items={request.queryParams}
              onChange={(params) => updateRequest({ queryParams: params })}
              title="Query Parameters"
              keyPlaceholder="Parameter Name"
              valuePlaceholder="Parameter Value"
              keyDisabled={(key) => !!querySchema?.properties?.[key]}
              keyReadOnly={(key) => !!querySchema?.properties?.[key]}
              keyHelperText={(key) => querySchema?.properties?.[key]?.description}
              addButtonText="Add Parameter"
            />
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
        <Button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          disabled={isSending}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded disabled:opacity-50 flex items-center space-x-2"
        >
          {isSending && <CircularProgress size={16} className="text-white" />}
          <span>{isSending ? 'Sending...' : 'Send Request'}</span>
        </Button>
      </div>
    </CustomDialog>
  );
};
