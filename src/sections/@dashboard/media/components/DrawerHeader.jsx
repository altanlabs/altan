import { IconButton, Stack, Typography } from '@mui/material';
import React, { memo } from 'react';

import Iconify from '../../../../components/iconify/Iconify';

const DrawerHeader = ({ isMobile, onUploadClick, closeDrawer }) => {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ py: 1, pl: 2.5, pr: 1, minHeight: 68 }}
    >
      <IconButton onClick={onUploadClick}>
        <Iconify
          icon="icon-park-twotone:add-one"
          width={40}
        />
      </IconButton>
      <Stack sx={{ flexGrow: 1 }}>
        <Typography variant="h6">Add Media</Typography>
        <Typography variant="caption">
          Click on the icon to select media or drag media to the grid
        </Typography>
      </Stack>
      {!!isMobile && (
        <IconButton onClick={closeDrawer}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      )}
    </Stack>
  );
};

export default memo(DrawerHeader);
