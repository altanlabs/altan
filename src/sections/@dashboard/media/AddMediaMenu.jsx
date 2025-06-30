import { IconButton, Button, Drawer, Tooltip } from '@mui/material';
import React, { memo, useState, useMemo } from 'react';

// import SearchBar from './components/SearchBar';
import MediaSection from './MediaSection';
import Iconify from '../../../components/iconify';
import useResponsive from '../../../hooks/useResponsive';

const AddMediaMenu = ({
  setMedia,
  handleParentClose = null,
  mode = 'drawer',
  buttonLabel = 'Add Media',
}) => {
  const [addMediaMenuOpen, setAddMediaMenuOpen] = useState(false);
  // const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useResponsive('down', 'sm');

  const renderButton = useMemo(() => {
    if (mode === 'custom_message')
      return (
        <Tooltip
          arrow
          title="Existing media"
        >
          <IconButton onClick={() => setAddMediaMenuOpen(true)}>
            <Iconify icon="ic:twotone-perm-media" />
          </IconButton>
        </Tooltip>
      );
    return (
      <Button
        color="inherit"
        variant="outlined"
        fullWidth
        startIcon={<Iconify icon="tabler:plus" />}
        onClick={() => setAddMediaMenuOpen(true)}
      >
        {buttonLabel}
      </Button>
    );
  }, [mode, setAddMediaMenuOpen]);

  return (
    <>
      {renderButton}
      <Drawer
        open={addMediaMenuOpen}
        onClose={() => {
          if (!!handleParentClose) handleParentClose();
          setAddMediaMenuOpen(false);
        }}
        anchor="right"
        PaperProps={{
          sx: { width: 1, maxWidth: isMobile ? 350 : 600, pb: 3, zIndex: 99999 },
        }}
      >
        <MediaSection
          setMedia={setMedia}
          onClose={() => setAddMediaMenuOpen(false)}
          mode={mode}
        />
      </Drawer>
    </>
  );
};

export default memo(AddMediaMenu);
