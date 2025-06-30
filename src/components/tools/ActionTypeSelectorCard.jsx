import { Card, Stack, Typography, Chip, Button, Tooltip } from '@mui/material';
import { truncate } from 'lodash';
import React, { memo } from 'react';

const METHOD_COLORS = {
  GET: 'success',
  POST: 'info',
  PUT: 'warning',
  PATCH: 'warning',
  DELETE: 'error',
};

const ActionTypeSelectorCard = ({ action, onSelect }) => (
  <Card
    sx={{
      px: 1,
      cursor: 'pointer',
      width: '100%',
      overflow: 'hidden',
      minHeight: '60px',
    }}
  >
    <Stack
      direction="row"
      spacing={1}
      width="100%"
      height="100%"
      alignItems="center"
    >
      <Chip
        size="small"
        variant="soft"
        label={action?.method}
        color={METHOD_COLORS[action?.method]}
        sx={{ minWidth: 'fit-content' }}
      />
      <Stack width="100%">
        <Typography
          variant="body"
          sx={{ whiteSpace: 'normal' }}
        >
          {action?.name}
        </Typography>
        <Tooltip title={action?.description}>
          <Typography
            variant="caption"
            sx={{ whiteSpace: 'normal' }}
          >
            {truncate(action?.description || '', { length: 50 })}
          </Typography>
        </Tooltip>
      </Stack>
      <Button onClick={onSelect}>Select</Button>
    </Stack>
  </Card>
);

export default memo(ActionTypeSelectorCard);
