import { Badge } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo } from 'react';

const StatusBadge = styled(Badge)(({ theme, status, hidebadge = false, isuserincall = false }) => {
  const onlineStyles = {
    backgroundColor: isuserincall ? 'transparent' : '#44b700',
    color: '#44b700',
    // boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    // borderColor: 'transparent',
    '&::after': {
      position: 'absolute',
      top: isuserincall ? 1 : 0,
      left: isuserincall ? 6 : 0,
      width: isuserincall ? '70%' : '100%',
      height: isuserincall ? '70%' : '100%',
      borderRadius: '50%',
      animation: 'ripple 5s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  };

  const offlineStyles = {
    backgroundColor: '#FF0000',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  };

  return {
    '& .MuiBadge-badge': !hidebadge ? (status === 'online' ? onlineStyles : offlineStyles) : {},
  };
}, {
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
});

export default memo(StatusBadge);
