// @mui
import { styled, alpha } from '@mui/material/styles';

// utils
import { bgGradient } from '../../utils/cssStyles';

// ----------------------------------------------------------------------

export const StyledRoot = styled('main')(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
}));

export const StyledSection = styled('div')(({ theme }) => ({
  display: 'none',
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
}));

export const StyledSectionBg = styled('div')(({ theme }) => ({
  ...bgGradient({
    color: alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.9 : 0.94),
    imgUrl: '/assets/background/overlay_2.jpg',
  }),
  top: 0,
  left: 0,
  zIndex: -1,
  width: '100%',
  height: '100%',
  position: 'absolute',
  transform: 'scaleX(-1)',
}));

export const StyledContent = styled('div')(({ theme }) => ({
  width: 480,
  margin: 'auto',
  display: 'flex',
  height: '100%',
  background: 'transparent',
  justifyContent: 'center',
  padding: theme.spacing(15, 2),
}));
