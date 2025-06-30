import { Box, AppBar, Toolbar, Container, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useRef } from 'react';
// @mui

// hooks
import navConfig from './nav/config-navigation';
import NavMobile from './nav/mobile';
import Label from '../../components/label';
import Logo from '../../components/logo';
import { HEADER } from '../../config-global';
import NavDesktop from './nav/desktop';
import Iconify from '../../components/iconify';
import useOffSetTop from '../../hooks/useOffSetTop';
import useResponsive from '../../hooks/useResponsive';
// utils
import { PATH_AUTH } from '../../routes/paths';
import { bgBlur } from '../../utils/cssStyles';
// config
// routes
// components
//

export default function Header() {
  const carouselRef = useRef(null);

  const theme = useTheme();

  const isDesktop = useResponsive('up', 'md');

  const isOffset = useOffSetTop(HEADER.H_MAIN_DESKTOP);

  return (
    <AppBar
      ref={carouselRef}
      color="transparent"
      sx={{ boxShadow: 0 }}
    >
      <Toolbar
        disableGutters
        sx={{
          height: {
            xs: HEADER.H_MOBILE,
            md: HEADER.H_MAIN_DESKTOP,
          },
          transition: theme.transitions.create(['height', 'background-color'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter,
          }),
          ...(isOffset && {
            ...bgBlur({ color: theme.palette.background.default, opacity: 0.2 }),
            height: {
              md: HEADER.H_MAIN_DESKTOP - 16,
            },
          }),
        }}
      >
        <Container sx={{ height: 1, display: 'flex', alignItems: 'center' }}>
          <Logo />

          <Label
            color="info"
            sx={{ ml: 1 }}
          >
            {' '}
            Beta{' '}
          </Label>

          <Box sx={{ flexGrow: 1 }} />

          {isDesktop && (
            <NavDesktop
              isOffset={isOffset}
              data={navConfig}
            />
          )}

          <IconButton
            variant="contained"
            rel="noopener"
            href={PATH_AUTH.login}
          >
            <Iconify icon="solar:user-bold" />
          </IconButton>

          {/* <Button variant="contained" rel="noopener" href={PATH_AUTH.register}>
            Start Now
          </Button> */}

          {!isDesktop && (
            <NavMobile
              isOffset={isOffset}
              data={navConfig}
            />
          )}
        </Container>
      </Toolbar>

      {isOffset && <Shadow />}
    </AppBar>
  );
}

// ----------------------------------------------------------------------

Shadow.propTypes = {
  sx: PropTypes.object,
};

function Shadow({ sx, ...other }) {
  return (
    <Box
      sx={{
        left: 0,
        right: 0,
        bottom: 0,
        height: 24,
        zIndex: -1,
        m: 'auto',
        borderRadius: '50%',
        position: 'absolute',
        width: 'calc(100% - 48px)',
        boxShadow: (theme) => theme.customShadows.z8,
        ...sx,
      }}
      {...other}
    />
  );
}
