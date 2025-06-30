import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Popover, Drawer, useTheme } from '@mui/material';
import React, { memo, useCallback } from 'react';

import useResponsive from '../hooks/useResponsive';

interface EmojiPickerProps {
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  onSelect: (emoji: unknown) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  anchorEl,
  handleClose,
  onSelect,
}) => {
  const theme = useTheme();
  const isSmallScreen = useResponsive('down', 'sm');

  const handleEmojiSelect = useCallback(
    (emoji: unknown) => {
      onSelect(emoji);
      handleClose();
    },
    [onSelect, handleClose],
  );

  return (
    <>
      {isSmallScreen ? (
        <Drawer
          anchor="bottom"
          open={Boolean(anchorEl)}
          onClose={handleClose}
          sx={{
            left: 0,
            right: 0,
            zIndex: 99998,
            '& div': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
        >
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme={theme.palette.mode}
            style={{ width: 'unset' }}
          />
        </Drawer>
      ) : (
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
          transformOrigin={{ vertical: 'center', horizontal: 'center' }}
        >
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme={theme.palette.mode}
          />
        </Popover>
      )}
    </>
  );
};

export default memo(EmojiPicker);
