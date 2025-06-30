import {
  TextField,
  IconButton,
  Stack,
  Box,
  Button,
  Divider,
} from '@mui/material';
import React from 'react';

import Iconify from '../../../iconify';
import { KeyValue } from '../types';

interface KeyValueEditorProps {
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
  title: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  keyDisabled?: (key: string) => boolean;
  keyReadOnly?: (key: string) => boolean;
  keyHelperText?: (key: string) => string | undefined;
  showDivider?: boolean;
  addButtonText?: string;
}

export const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  items,
  onChange,
  title,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  keyDisabled = () => false,
  keyReadOnly = () => false,
  keyHelperText = () => undefined,
  showDivider = true,
  addButtonText = 'Add Item',
}) => {
  const handleKeyChange = (index: number, key: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], key };
    onChange(newItems);
  };

  const handleValueChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], value };
    onChange(newItems);
  };

  const handleAdd = () => {
    onChange([...items, { key: '', value: '' }]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Stack spacing={2}>
        {items.map((item, index) => (
          <Stack key={index} direction="row" spacing={1} alignItems="flex-start">
            <Box flex={1}>
              <TextField
                fullWidth
                size="small"
                label={index === 0 ? keyPlaceholder : undefined}
                value={item.key}
                onChange={(e) => handleKeyChange(index, e.target.value)}
                disabled={keyDisabled(item.key)}
                InputProps={{
                  readOnly: keyReadOnly(item.key),
                }}
                helperText={keyHelperText(item.key)}
              />
            </Box>
            <Box flex={2}>
              <TextField
                fullWidth
                size="small"
                label={index === 0 ? valuePlaceholder : undefined}
                value={item.value}
                onChange={(e) => handleValueChange(index, e.target.value)}
              />
            </Box>
            <Box>
              <IconButton
                size="small"
                onClick={() => handleRemove(index)}
                disabled={items.length <= 1 || keyReadOnly(item.key)}
                sx={{ mt: index === 0 ? 2.5 : 0 }}
              >
                <Iconify icon="mdi:delete-outline" width={20} />
              </IconButton>
            </Box>
          </Stack>
        ))}
      </Stack>

      <Button
        startIcon={<Iconify icon="mdi:plus" width={20} />}
        onClick={handleAdd}
        size="small"
        sx={{ mt: 1 }}
      >
        {addButtonText}
      </Button>

      {showDivider && <Divider sx={{ my: 3 }} />}
    </Box>
  );
};
