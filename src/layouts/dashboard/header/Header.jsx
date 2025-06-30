// @mui
import { Stack, AppBar, Toolbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import HeaderActions from './HeaderActions';
import { useAuthContext } from '../../../auth/useAuthContext';
import { StyledChart } from '../../../components/chart';
import { HEADER } from '../../../config-global';
import useResponsive from '../../../hooks/useResponsive';
import { selectHeaderVisible } from '../../../redux/slices/general';
import { useSelector } from '../../../redux/store';

// ----------------------------------------------------------------------

function Header() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const isDesktop = useResponsive('up', 'md');
  const navigate = useNavigate();
  const headerVisible = useSelector(selectHeaderVisible);

  if (!headerVisible) {
    return null;
  }

  return (
    <AppBar
      sx={{
        backgroundColor: 'transparent',
        boxShadow: 'none',
        height: HEADER.H_MOBILE,
        zIndex: 3,
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
      }}
    >
      <Toolbar
        variant="dense"
        sx={{
          zIndex: 5,
          height: HEADER.H_MOBILE,
          px: { lg: 5 },
          pl: { lg: 3 },
        }}
      >
        <Stack maxWidth={100}>
          <img
            alt="Altan Logo Header"
            onClick={() => navigate('/', { replace: true })}
            style={{ cursor: 'pointer' }}
            src={
              theme.palette.mode === 'dark'
                ? '/logos/horizontalWhite.png'
                : '/logos/horizontalBlack.png'
            }
            height={17}
          />
        </Stack>

        <StyledChart />
        <HeaderActions
          user={user}
          isDesktop={isDesktop}
        />
      </Toolbar>
    </AppBar>
  );
}

export default memo(Header);
