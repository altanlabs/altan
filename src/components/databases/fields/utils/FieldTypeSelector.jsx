// src/components/databases/fields/FieldTypeSelector.jsx
import { List, ListItem, ListItemIcon, ListItemText, TextField } from '@mui/material';
import { memo, useState } from 'react';

import { FIELD_TYPES } from './fieldTypes';

const FieldTypeSelector = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTypes = FIELD_TYPES.filter((type) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && filteredTypes.length === 1) {
      onSelect(filteredTypes[0].id);
    }
  };

  return (
    <>
      <TextField
        autoFocus
        placeholder="Search..."
        variant="standard"
        size="small"
        fullWidth
        margin="dense"
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <List dense>
        {filteredTypes.map((type) => (
          <ListItem
            key={type.id}
            button
            onClick={() => onSelect(type.id)}
            sx={{
              borderRadius: 1,
              padding: '4px 8px',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>{<type.icon />}</ListItemIcon>
            <ListItemText primary={type.name} />
            {type.badge && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {type.badge}
              </span>
            )}
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default memo(FieldTypeSelector);
