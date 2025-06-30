import { Box, FormControlLabel, Switch } from '@mui/material';
import { memo } from 'react';

const UserConfig = ({ config, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...config,
      user_options: {
        ...config.user_options,
        [field]: value,
      },
    });
  };

  return (
    <Box className="space-y-4">
      <FormControlLabel
        control={
          <Switch
            checked={config.user_options?.allow_multiple || false}
            onChange={(e) => handleChange('allow_multiple', e.target.checked)}
          />
        }
        label="Allow adding multiple users"
      />

      <FormControlLabel
        control={
          <Switch
            checked={config.user_options?.notify_users || false}
            onChange={(e) => handleChange('notify_users', e.target.checked)}
          />
        }
        label="Notify users with base access when they're added"
      />
    </Box>
  );
};

export default memo(UserConfig);
