// src/components/databases/fields/FieldConfig.jsx
import { Box } from '@mui/material';
import { memo } from 'react';

import CheckboxConfig from './CheckboxConfig';
import DateConfig from './DateConfig';
import MultiSelectConfig from './MultiSelectConfig';
import NumberConfig from './NumberConfig';
import RatingConfig from './RatingConfig';
import ReferenceConfig from './ReferenceConfig';
import UserConfig from './UserConfig';

// Import other configs...

const FieldConfig = ({ type, config, onChange, tableId, baseId }) => {
  const handleChange = (newConfig) => {
    onChange({
      ...config,
      ...newConfig,
    });
  };

  const renderConfig = () => {
    switch (type) {
      case 'multiSelect':
      case 'singleSelect':
      case 'select':
        return (
          <MultiSelectConfig
            config={config}
            onChange={handleChange}
          />
        );

      case 'number':
        return (
          <NumberConfig
            config={config}
            onChange={handleChange}
          />
        );

      case 'date':
      case 'dateTime':
        return (
          <DateConfig
            config={config}
            onChange={handleChange}
          />
        );

      case 'reference':
        return (
          <ReferenceConfig
            config={config}
            onChange={handleChange}
            table={tableId}
            baseId={baseId}
          />
        );
      case 'checkbox':
        return (
          <CheckboxConfig
            config={config}
            onChange={handleChange}
          />
        );
      case 'rating':
        return (
          <RatingConfig
            config={config}
            onChange={handleChange}
          />
        );
      case 'user':
        return (
          <UserConfig
            config={config}
            onChange={handleChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box className="space-y-4">
      {renderConfig()}
      {/* <FormControlLabel
        control={
          <Switch
            checked={config.required || false}
            onChange={(e) => handleChange({ required: e.target.checked })}
          />
        }
        label="Required field"
      /> */}
    </Box>
  );
};

export default memo(FieldConfig);
