import { Paper, Typography, TextField, Autocomplete, Button } from '@mui/material';
import React, { memo, useCallback } from 'react';

import AceWrapper from '@components/json/AceWrapper.jsx';

const ActionCreator = ({ action, onActionChange, onSave }) => {
  const handleFieldChange = useCallback(
    (field, value) => {
      const updatedAction = { ...action, [field]: value };
      onActionChange(updatedAction);
    },
    [action, onActionChange],
  );

  const handleJsonChange = useCallback(
    (field, newValue) => {
      if (!newValue.trim()) {
        handleFieldChange(field, {});
        return;
      }
      try {
        const jsonValue = JSON.parse(newValue);
        handleFieldChange(field, jsonValue);
      } catch (error) {
        console.error('Invalid JSON', error);
      }
    },
    [handleFieldChange],
  );

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const jsonFields = ['headers', 'body', 'path_params', 'query_params', 'output'];

  return (
    <Paper
      elevation={3}
      sx={{ padding: '16px', marginBottom: '8px' }}
    >
      <TextField
        size="small"
        label="Name"
        variant="outlined"
        fullWidth
        value={action.name}
        onChange={(e) => handleFieldChange('name', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        size="small"
        label="Description"
        variant="outlined"
        multiline
        fullWidth
        value={action.description}
        onChange={(e) => handleFieldChange('description', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        size="small"
        label="URL"
        variant="outlined"
        fullWidth
        value={action.url}
        onChange={(e) => handleFieldChange('url', e.target.value)}
        sx={{ mb: 2 }}
      />
      <Autocomplete
        value={action.method}
        onChange={(event, newValue) => handleFieldChange('method', newValue)}
        options={httpMethods}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Method"
            size="small"
          />
        )}
        fullWidth
        sx={{ mb: 2 }}
      />

      {jsonFields.map((field) => (
        <React.Fragment key={field}>
          <Typography variant="subtitle2">{field.replace('_', ' ').toUpperCase()}</Typography>
          <AceWrapper
            value={JSON.stringify(action[field] || {}, null, 2)}
            onChange={(newValue) => handleJsonChange(field, newValue)}
            name={`${field}Editor`}
            height="100px"
            width="100%"
          />
        </React.Fragment>
      ))}
      <Button
        fullWidth
        onClick={onSave}
        color="primary"
        variant="soft"
        sx={{ mt: 2 }}
      >
        Push
      </Button>
    </Paper>
  );
};

export default memo(ActionCreator);
