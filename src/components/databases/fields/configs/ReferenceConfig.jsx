import { Box, Autocomplete, TextField, MenuItem } from '@mui/material';
import { memo } from 'react';

import { selectTablesByBaseId } from '../../../../redux/slices/bases';
import { useSelector } from '../../../../redux/store';

// Types of cascade options between tables
const ON_DELETE_MODE = {
  CASCADE: 'CASCADE', // Automatically delete/update child rows
  RESTRICT: 'RESTRICT', // Prevent delete/update if related rows exist
  SET_NULL: 'SET NULL', // Set the foreign key to NULL on delete/update
  NO_ACTION: 'NO ACTION', // Similar to RESTRICT, but differs in timing
  SET_DEFAULT: 'SET DEFAULT', // Set the foreign key to its default value
};

const ReferenceConfig = ({ config, onChange, tableId, baseId }) => {
  const tables = useSelector((state) => selectTablesByBaseId(state, baseId)).filter(
    (t) => t.id !== tableId,
  ); // Exclude current table

  const handleChange = (field, value) => {
    const newConfig = {
      ...config,
      reference_options: {
        ...config.reference_options,
        [field]: value,
      },
    };
    onChange(newConfig);
  };

  // Fix: Look for the table by db_name instead of id
  const selectedTable =
    tables.find((t) => t.db_name === config.reference_options?.foreign_table) || null;

  return (
    <Box className="space-y-4">
      <Autocomplete
        options={tables}
        getOptionLabel={(option) => option.name}
        value={selectedTable}
        onChange={(_, newValue) => handleChange('foreign_table', newValue?.db_name || '')}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Link to table"
            variant="filled"
            size="small"
          />
        )}
        // Add these props to ensure proper controlled behavior
        isOptionEqualToValue={(option, value) => option.db_name === value?.db_name}
        disableClearable={false}
      />

      <TextField
        select
        fullWidth
        size="small"
        variant="filled"
        label="On Delete Mode"
        value={config.reference_options?.on_delete_mode || ON_DELETE_MODE.RESTRICT}
        onChange={(e) => handleChange('on_delete_mode', e.target.value)}
      >
        {Object.entries(ON_DELETE_MODE).map(([, value]) => (
          <MenuItem
            key={value}
            value={value}
          >
            {value}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default memo(ReferenceConfig);
