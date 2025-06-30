import TextField from '@mui/material/TextField';
import React, { useState, useEffect } from 'react';

import { optimai } from '../utils/axios';

const TemplatePublicName = ({ value, onChange }) => {
  const [isAvailable, setIsAvailable] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [localPublicName, setLocalPublicName] = useState(value?.public_name || '');

  useEffect(() => {
    const checkNameAvailability = async () => {
      if (localPublicName.trim() === '') {
        setIsAvailable(null);
        setErrorMessage('');
        return;
      }

      try {
        await optimai.get('/templates/check-name-availability', {
          params: {
            public_name: localPublicName,
            entity_type: value.entity_type,
            entity_id: value.entity_id,
          },
        });
        setIsAvailable(true);
        setErrorMessage('');
      } catch (error) {
        // console.error('Failed to check name availability:', error);
        setIsAvailable(false);
        setErrorMessage('A template with this name already exists');
      }
    };

    const debounceTimer = setTimeout(checkNameAvailability, 500);

    return () => clearTimeout(debounceTimer);
  }, [localPublicName, value.entity_type, value.entity_id]);

  const handleInputChange = (e) => {
    const newPublicName = e.target.value.toLowerCase();
    setLocalPublicName(newPublicName);
    onChange({
      ...value,
      public_name: newPublicName,
    });
  };

  return (
    <TextField
      fullWidth
      label="Public Name"
      size="small"
      value={localPublicName}
      onChange={handleInputChange}
      error={isAvailable === false}
      helperText={errorMessage || (isAvailable ? 'This name is available' : '')}
      InputProps={{
        endAdornment: isAvailable === true && <span style={{ color: 'green' }}>✓</span>,
      }}
    />
  );
};

export default TemplatePublicName;
