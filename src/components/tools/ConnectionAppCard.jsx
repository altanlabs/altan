import { Stack, Tooltip, Typography, Card } from '@mui/material';
import React, { memo } from 'react';

import Iconify from '../iconify';
import Logo from '../logo';

const ConnectionAppCard = ({ connOrApp, theme, onClick }) => {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        p: 1.5,
        cursor: 'pointer',
        background: theme.palette.background.neutral,
      }}
      onClick={onClick}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        width="100%"
      >
        {connOrApp.icon === 'optimai' ? (
          <Logo disabledLink />
        ) : (
          <Iconify
            icon={connOrApp.icon}
            width={25}
            color={connOrApp?.meta_data?.color}
          />
        )}
        <Tooltip title={connOrApp.description}>
          <Typography
            variant="h4"
            noWrap
          >
            {connOrApp.name}
          </Typography>
        </Tooltip>
      </Stack>
      <Tooltip title={connOrApp.description}>
        <Typography
          variant="caption"
          noWrap
        >
          {connOrApp.description}
        </Typography>
      </Tooltip>
    </Card>
  );
};

export default memo(ConnectionAppCard);
