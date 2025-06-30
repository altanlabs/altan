// src/components/databases/fields/configs/DateConfig.jsx
import { Box, Switch, FormControlLabel, TextField, MenuItem } from '@mui/material';
import { memo } from 'react';

const DateConfig = ({ config, onChange }) => {
  const handleChange = (field, value) => {
    const newConfig = {
      ...config,
      datetime_options: {
        ...config.datetime_options,
        [field]: value,
      },
    };
    onChange(newConfig);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Date Format */}
      <TextField
        select
        fullWidth
        size="small"
        label="Date format"
        value={config.datetime_options?.date_format || 'Local'}
        onChange={(e) => handleChange('date_format', e.target.value)}
      >
        <MenuItem value="Local">Local (12/18/2024)</MenuItem>
        <MenuItem value="Friendly">Friendly (December 18, 2024)</MenuItem>
        <MenuItem value="US">US (12/18/2024)</MenuItem>
        <MenuItem value="European">European (18/12/2024)</MenuItem>
        <MenuItem value="ISO">ISO (2024-12-18)</MenuItem>
      </TextField>

      {/* Include Time Switch */}
      <FormControlLabel
        control={
          <Switch
            checked={config.datetime_options?.include_time || false}
            onChange={(e) => handleChange('include_time', e.target.checked)}
            color="primary"
          />
        }
        label="Include time"
      />

      {/* Time Format - Only show if include_time is true */}
      {config.datetime_options?.include_time && (
        <>
          <TextField
            select
            fullWidth
            size="small"
            label="Time format"
            value={config.datetime_options?.time_format || '12 hour'}
            onChange={(e) => handleChange('time_format', e.target.value)}
          >
            <MenuItem value="12 hour">12 hour (7:12pm)</MenuItem>
            <MenuItem value="24 hour">24 hour (19:12)</MenuItem>
          </TextField>

          {/* Display Time Zone Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={config.datetime_options?.display_time_zone || false}
                onChange={(e) => handleChange('display_time_zone', e.target.checked)}
                color="primary"
              />
            }
            label="Display time zone"
          />
        </>
      )}

      {/* Time Zone - Only show if display_time_zone is true */}
      {config.datetime_options?.display_time_zone && (
        <TextField
          select
          fullWidth
          size="small"
          label="Time zone"
          value={config.datetime_options?.time_zone || 'GMT/UTC'}
          onChange={(e) => handleChange('time_zone', e.target.value)}
        >
          <MenuItem value="GMT/UTC">GMT/UTC</MenuItem>
          <MenuItem value="local">Local time zone</MenuItem>
        </TextField>
      )}

      {/* Required Field Switch */}
      <FormControlLabel
        control={
          <Switch
            checked={config.required || false}
            onChange={(e) => onChange({ ...config, required: e.target.checked })}
            color="primary"
          />
        }
        label="Required field"
      />
    </Box>
  );
};

export default memo(DateConfig);
