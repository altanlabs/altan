import { Drawer, Box } from '@mui/material';
import { memo } from 'react';

import { Distribution } from './settings/index.js';
import { selectCurrentAltaner } from '../../../../redux/slices/altaners.js';
import { useSelector } from '../../../../redux/store.js';

const TemplateSettings = ({ open, onClose }) => {
  const altaner = useSelector(selectCurrentAltaner);

  if (!altaner) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          height: '100%',
          overflow: 'auto',
        }}
      >
        <Distribution altaner={altaner} />
      </Box>
    </Drawer>
  );
};

export default memo(TemplateSettings);
