import { List, Drawer, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// @mui
// config
import NavList from './NavList';
import Iconify from '../../../../components/iconify';
import Logo from '../../../../components/logo';
import Scrollbar from '../../../../components/scrollbar';
import { NAV } from '../../../../config-global';
// components
//

// ----------------------------------------------------------------------

NavMobile.propTypes = {
  data: PropTypes.array,
  isOffset: PropTypes.bool,
};

export default function NavMobile({ isOffset, data }) {
  const { pathname } = useLocation();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          ml: 1,
          ...(isOffset && {
            color: 'text.primary',
          }),
        }}
      >
        <Iconify icon="eva:menu-2-fill" />
      </IconButton>

      <Drawer
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            pb: 5,
            width: NAV.W_BASE,
          },
        }}
      >
        <Scrollbar>
          <Logo sx={{ mx: 2.5, my: 3 }} />

          <List
            component="nav"
            disablePadding
          >
            {data.map((link) => (
              <NavList
                key={link.title}
                item={link}
              />
            ))}
          </List>
        </Scrollbar>
      </Drawer>
    </>
  );
}
