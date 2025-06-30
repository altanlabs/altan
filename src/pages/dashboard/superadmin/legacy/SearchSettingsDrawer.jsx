import { Drawer, Stack, Typography } from '@mui/material';
import { memo } from 'react';

const SearchSettingsDrawer = ({ isOpen, onClose, children }) => {
  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: { width: 1, maxWidth: 450, pb: 3 },
      }}
    >
      <Stack
        padding={2}
        spacing={2}
      >
        <Typography
          variant="h3"
          sx={{ pb: 2 }}
        >
          Search Settings
        </Typography>
        {children}
      </Stack>
    </Drawer>
  );
};

export default memo(SearchSettingsDrawer);
