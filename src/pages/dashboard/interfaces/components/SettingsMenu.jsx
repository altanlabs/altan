import { Menu, MenuItem } from '@mui/material';
import { memo } from 'react';

import Iconify from '../../../../components/iconify/Iconify.jsx';
import { updateInterfaceById } from '../../../../redux/slices/general/index.ts';
import { dispatch } from '../../../../redux/store.ts';

function SettingsMenu({
  anchorEl,
  onClose,
  onAddDomain,
  onAddCollaborator,
  isPublic,
  interfaceId,
}) {
  const handleAddDomain = () => {
    onAddDomain();
    onClose();
  };

  const handleTogglePrivacy = async () => {
    try {
      await dispatch(updateInterfaceById(interfaceId, { is_public: !isPublic }));
      onClose();
    } catch (error) {
      console.error('Failed to update privacy setting:', error);
    }
  };

  const handleAddCollaborator = () => {
    onAddCollaborator();
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        sx: { width: 220, borderRadius: 2 },
      }}
    >
      <MenuItem onClick={handleAddDomain}>
        <Iconify
          icon="mdi:web"
          sx={{ mr: 2 }}
        />
        Custom Domain
      </MenuItem>
      <MenuItem onClick={handleTogglePrivacy}>
        <Iconify
          icon={!isPublic ? 'mdi:lock' : 'mdi:lock-open'}
          sx={{ mr: 2 }}
        />
        {!isPublic ? 'Make Public' : 'Make Private'}
      </MenuItem>
      <MenuItem onClick={handleAddCollaborator}>
        <Iconify
          icon="mdi:account-plus"
          sx={{ mr: 2 }}
        />
        View on Github
      </MenuItem>
    </Menu>
  );
}

export default memo(SettingsMenu);
