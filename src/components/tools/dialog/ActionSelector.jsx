import { InputAdornment, Stack, TextField } from '@mui/material';
import { memo, useMemo, useState } from 'react';

import Iconify from '../../iconify';
import ActionTypeSelectorCard from '../ActionTypeSelectorCard';

const ActionSelector = ({ actions, onSelectActionType }) => {
  const [actionFilter, setActionFilter] = useState('');

  const filteredActions = useMemo(
    () =>
      actions.filter((action) => action.name.toLowerCase().includes(actionFilter.toLowerCase())),
    [actions, actionFilter],
  );

  return (
    <Stack
      height="100%"
      sx={{ overflowY: 'hidden' }}
    >
      <TextField
        fullWidth
        placeholder="Search action..."
        // value={actionFilter}
        onChange={(e) => setActionFilter(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="mdi:search" />
            </InputAdornment>
          ),
        }}
      />
      <Stack
        spacing={0.5}
        sx={{ py: 2, overflowY: 'scroll', height: '100%' }}
      >
        {filteredActions.map((action) => (
          <ActionTypeSelectorCard
            key={action.id}
            action={action}
            onSelect={() => onSelectActionType(action)}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default memo(ActionSelector);
