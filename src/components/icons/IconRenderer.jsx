import { Avatar, Box } from '@mui/material';
import React, { memo } from 'react';

import Iconify from '../iconify';
import Logo from '../logo';
import AdaptativeDotLottie from './AdaptativeDotLottie.jsx';

const IconRenderer = ({
  icon,
  size = 16,
  sx = {},
  color = 'inherit',
  className = 'icon-renderer',
}) => {
  const fullSx = {
    width: size,
    height: size,
    pointerEvents: 'none',
    ...sx,
  };
  if (!icon) {
    return null;
  }
  if (['http'].some((prefix) => icon.startsWith(prefix))) {
    return (
      <Avatar
        sx={fullSx}
        variant="rounded" // {'circular'}
        src={icon}
      />
    );
  }
  if (icon.startsWith('@lottie')) {
    if (icon.startsWith('@lottie-still')) {
      return (
        <img
          alt={`still-${icon}`}
          src={`/assets/icons/animated-stills/${icon.split(':')[1]}.svg`}
          style={fullSx}
        />
      );
    }
    return (
      <AdaptativeDotLottie
        key={icon}
        icon={icon}
        sx={fullSx}
      />
    );
  }
  if (['/assets'].some((prefix) => icon.startsWith(prefix))) {
    return (
      <img
        alt={`icon-${icon}`}
        src={icon}
        style={fullSx}
      />
    );
  }
  return (
    <Box
      className={className}
      sx={{
        minWidth: size,
        minHeight: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon === 'optimai' ? (
        <Logo
          sx={fullSx}
          disabledLink
        />
      ) : (
        <Iconify
          width={size}
          icon={icon}
          sx={{ pointerEvents: 'none', color: color, ...sx }}
        />
      )}
    </Box>
  );
};

export default memo(IconRenderer);
