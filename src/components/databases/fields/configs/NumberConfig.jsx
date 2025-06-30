// src/components/databases/fields/configs/NumberConfig.jsx
import { Box, Switch, TextField, FormControlLabel } from '@mui/material';
import { memo } from 'react';

const NumberConfig = ({ config, onChange }) => {
  return (
    <Box className="space-y-4">
      <FormControlLabel
        control={
          <Switch
            checked={config.allowNegative}
            onChange={(e) => onChange({ allowNegative: e.target.checked })}
          />
        }
        label="Allow negative numbers"
      />
      <TextField
        type="number"
        label="Decimal places"
        value={config.decimals || 0}
        onChange={(e) => onChange({ decimals: parseInt(e.target.value) })}
        inputProps={{ min: 0, max: 10 }}
      />
    </Box>
  );
};

export default memo(NumberConfig);
