import { FormControlLabel, Typography, Switch, Tooltip } from '@mui/material';
import React, { useCallback } from 'react';

// Subcomponent for boolean scenario
function BooleanSwitchSubcomponent({ value, onChange, title }) {
  // Stabilize the onChange callback
  const handleSwitchChange = useCallback((e) => onChange(e.target.checked), [onChange]);

  return (
    <FormControlLabel
      control={
        <Tooltip
          arrow
          followCursor
          title={`${value ? 'Deactivate' : 'Activate'} ${title}`}
        >
          <Switch
            checked={!!value}
            onChange={handleSwitchChange}
          />
        </Tooltip>
      }
      label={
        <Typography variant="caption">
          {title} is {value ? 'active' : 'inactive'}
        </Typography>
      }
    />
  );
}

export default React.memo(BooleanSwitchSubcomponent);
