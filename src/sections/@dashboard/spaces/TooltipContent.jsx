import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import React, { useState, memo } from 'react';

const TooltipContent = ({ variables, onVariableClick }) => {
  const [filter, setFilter] = useState('');
  const theme = useTheme();

  const filteredVariables = variables.filter((variable) =>
    variable.toLowerCase().includes(filter.toLowerCase()),
  );
  console.log('rendering...');

  return (
    <div>
      <TextField
        size="small"
        variant="outlined"
        placeholder="Search..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{
          width: '100%',
          marginBottom: theme.spacing(1),
        }}
      />
      <List dense>
        {filteredVariables.length > 0 ? (
          filteredVariables.map((variable) => (
            <ListItem
              key={variable}
              button
              onClick={() => onVariableClick(variable)}
              sx={{ cursor: 'pointer', padding: theme.spacing(0.5) }}
            >
              {variable}
            </ListItem>
          ))
        ) : (
          <ListItem sx={{ padding: theme.spacing(0.5) }}>No results found.</ListItem>
        )}
      </List>
    </div>
  );
};

export default memo(TooltipContent);
