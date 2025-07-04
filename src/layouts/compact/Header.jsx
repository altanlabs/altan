import { AppBar, Toolbar, Box, Stack, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
// @mui

// auth
import { useAuthContext } from '../../auth/useAuthContext';
// config
import { HEADER } from '../../config-global';
// utils
import { bgBlur } from '../../utils/cssStyles';

// ----------------------------------------------------------------------

Header.propTypes = {
  isOffset: PropTypes.bool,
};

export default function Header({ isOffset }) {
  const theme = useTheme();
  const history = useHistory();
  const { logout } = useAuthContext();
  return (
    <AppBar
      color="transparent"
      sx={{ boxShadow: 0 }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          height: {
            xs: HEADER.H_MOBILE,
            md: HEADER.H_MAIN_DESKTOP,
          },
          transition: theme.transitions.create(['height', 'background-color'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter,
          }),
          ...(isOffset && {
            ...bgBlur({ color: theme.palette.background.default }),
            height: {
              md: HEADER.H_MAIN_DESKTOP - 16,
            },
          }),
        }}
      >
        <Stack maxWidth={100}>
          <img
            alt="Altan Logo Header"
            onClick={() => history.replace('/')}
            style={{ cursor: 'pointer' }}
            src={
              theme.palette.mode === 'dark'
                ? '/logos/horizontalWhite.png'
                : '/logos/horizontalBlack.png'
            }
            height={17}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={2}
        >
          <Button
            variant="soft"
            color="inherit"
            onClick={() => {
              logout();
            }}
          >
            Logout
          </Button>
        </Stack>
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
