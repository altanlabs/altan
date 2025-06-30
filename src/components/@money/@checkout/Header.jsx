import { Box } from '@mui/material';
import { memo } from 'react';

import SettingsDrawer from '@components/settings/drawer/SettingsDrawer';

import UserPopover from '../../UserPopover';

const Header = ({ themeMode }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '32px',
      height: '64px',
      marginTop: '6px',
    }}
  >
    <img
      src={themeMode === 'dark' ? '/altan-pay-light.png' : '/altan-pay.png'}
      alt="Altan Pay"
      style={{ width: '175px' }}
    />
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <SettingsDrawer noTypography />
      <UserPopover />
    </Box>
  </Box>
);

export default memo(Header);
