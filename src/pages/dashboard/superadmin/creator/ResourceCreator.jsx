import { Paper, Typography, TextField, Button } from '@mui/material';
import React, { memo, useCallback } from 'react';

import AceWrapper from '@components/json/AceWrapper.jsx';

const ResourceCreator = ({ resource, onResourceChange, onSave }) => {
  const handleFieldChange = useCallback(
    (field, value) => {
      const updatedR = { ...resource, [field]: value };
      onResourceChange(updatedR);
    },
    [resource, onResourceChange],
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

  const jsonFields = ['details'];

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
        value={resource?.name || 'unnamed resource'}
        onChange={(e) => handleFieldChange('name', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        size="small"
        label="Description"
        variant="outlined"
        multiline
        fullWidth
        value={resource?.description || ''}
        onChange={(e) => handleFieldChange('description', e.target.value)}
        sx={{ mb: 2 }}
      />

      {jsonFields.map((field) => (
        <React.Fragment key={field}>
          <Typography variant="subtitle2">{field.replace('_', ' ').toUpperCase()}</Typography>
          <AceWrapper
            value={JSON.stringify(resource[field] || {}, null, 2)}
            onChange={(newValue) => handleJsonChange(field, newValue)}
            name={`${field}Editor`}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
            }}
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

export default memo(ResourceCreator);
