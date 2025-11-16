import { Box, Stack, Button, Popover } from '@mui/material';
import { memo, useState } from 'react';

import Iconify from '../../../../components/iconify/Iconify';
import { setNavigationActive } from '../../../../redux/slices/spaces';
import { dispatch } from '../../../../redux/store.ts';

const AddSpaceMenu = ({ currentId, createNewSpace }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleManageClose = (option) => {
    if (option === 'new') createNewSpace();
    else if (option === 'link') dispatch(setNavigationActive({ mode: 'links' }));
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        sx={{ mt: 0.5 }}
        color="inherit"
        onClick={(e) => (currentId !== 'root' ? setAnchorEl(e.currentTarget) : createNewSpace())}
        fullWidth
        startIcon={<Iconify icon="ic:baseline-auto-awesome-mosaic" />}
      >
        Add Space
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleManageClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Button
              startIcon={<Iconify icon="tabler:plus" />}
              color="inherit"
              fullWidth
              onClick={() => handleManageClose('new')}
            >
              New Space
            </Button>
            {currentId !== 'root' && (
              <Button
                startIcon={<Iconify icon="ic:baseline-auto-awesome-mosaic" />}
                color="inherit"
                fullWidth
                onClick={() => handleManageClose('link')}
              >
                Link space
              </Button>
            )}
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export default memo(AddSpaceMenu);
