// @mui
import { MenuItem, Stack } from '@mui/material';
import { useState } from 'react';

// locales
// components
import { IconButtonAnimate } from '../../../components/animate';
import Iconify from '../../../components/iconify';
import MenuPopover from '../../../components/menu-popover';
import { useLocales } from '../../../locales';

// ----------------------------------------------------------------------

export default function LanguagePopover() {
  const { allLangs, currentLang, onChangeLang } = useLocales();

  const [openPopover, setOpenPopover] = useState(null);

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleChangeLang = (newLang) => {
    onChangeLang(newLang);
    handleClosePopover();
  };

  return (
    <>
      <IconButtonAnimate
        onClick={handleOpenPopover}
        sx={{
          width: 40,
          height: 40,
          ...(openPopover && {
            bgcolor: 'action.selected',
          }),
        }}
      >
        <Iconify icon={currentLang.icon} />
      </IconButtonAnimate>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        sx={{ width: 180 }}
      >
        <Stack spacing={0.75}>
          {allLangs.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === currentLang.value}
              onClick={() => handleChangeLang(option.value)}
            >
              <Iconify icon={option.icon} />

              {option.label}
            </MenuItem>
          ))}
        </Stack>
      </MenuPopover>
    </>
  );
}
